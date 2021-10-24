package main

import (
	"context"
	"flag"
	"os"
	"os/signal"
	"runtime"
	"sync"
	"syscall"
	"time"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/arduino"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/database"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/events"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/statistics"
	"github.com/sirupsen/logrus"
)

var isRaspberryPi bool

var debug = flag.Bool("debug", false, "Should log debug messages")
var toFile = flag.Bool("toFile", true, "Should log to a file analyzer.log")
var db = flag.String("db", "cabin.db", "Path to the database file (created if does not exist)")
var output = flag.String("output", "analyzer.log", "Path to the log file (created if does not exist)")

func init() {
	flag.Parse()
	isRaspberryPi = runtime.GOOS == "linux" && runtime.GOARCH == "arm"
	if *debug || !isRaspberryPi {
		// Enable DEBUG logging on non Raspberry Pi hosts
		logrus.Info("Enabling DEBUG logs")
		logrus.SetLevel(logrus.DebugLevel)
	}

	if *toFile {
		logrus.SetFormatter(&logrus.TextFormatter{TimestampFormat: "2006-01-02 15:04:05", FullTimestamp: true})
		file, err := os.OpenFile(*output, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err == nil {
			logrus.SetOutput(file)
		} else {
			logrus.Warn("Failed to log to file, using default stderr")
		}
	}
}

func main() {
	ctx, cancelFunc := context.WithCancel(context.Background())

	db, mutex := database.NewConnection(db) // Initialize our database connection
	broker := events.NewServer()            // Initialize a new server for HTTP events
	wg := &sync.WaitGroup{}                 // Initialize wait group
	defer db.Close()

	go api.Start(db, mutex)

	wg.Add(1)
	srv := events.StartEventsServer(broker, wg)

	powerMonitor, err := arduino.NewConnection(ctx, db, mutex)
	if err != nil {
		panic(err)
	}
	logrus.Info("Arduino connection established and greetings exchanged")

	if isRaspberryPi {
		err := powerMonitor.SyncSystemTime(ctx)
		if err != nil {
			logrus.Errorf("Failed to set RPi system time: %v", err)
		}

		logrus.Info("Downloading historical data...")
		err = powerMonitor.SendHistoricalToDB(ctx, broker.Notifier)
		if err != nil {
			logrus.Error(err)
		}
	}

	// Stream arduino data to our events server's event channel
	wg.Add(1)
	go powerMonitor.StreamData(ctx, broker.Notifier, wg)

	statisticsEngine := statistics.NewClient(db, mutex)
	go statisticsEngine.DetectStreamAnomalies()

	termChan := make(chan os.Signal)
	signal.Notify(termChan, os.Interrupt, os.Kill, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL)
	<-termChan

	logrus.Warn("Shutdown signal received")

	cancelFunc() // Signal cancellation to workers via context.Context
	ctx2, cancelTimeout := context.WithTimeout(context.Background(), 10*time.Second)
	srv.Shutdown(ctx2)
	wg.Wait() // Block here until are workers have terminated
	cancelTimeout()
	logrus.Info("All workers done, shutting down!")
}
