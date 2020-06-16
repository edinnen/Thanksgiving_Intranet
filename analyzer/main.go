package main

import (
	"context"
	"os"
	"os/signal"
	"runtime"
	"sync"
	"syscall"

	log "github.com/sirupsen/logrus"

	arduinoConnection "github.com/edinnen/Thanksgiving_Intranet/analyzer/arduino"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/database"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/events"
)

var isRaspberryPi bool

func init() {
	isRaspberryPi = runtime.GOOS == "linux" && runtime.GOARCH == "arm"
	if !isRaspberryPi {
		// Enable DEBUG logging on non Raspberry Pi hosts
		log.SetLevel(log.DebugLevel)
	}

	log.SetFormatter(&log.TextFormatter{TimestampFormat: "2006-01-02 15:04:05", FullTimestamp: true})
}

func main() {
	ctx, cancelFunc := context.WithCancel(context.Background())

	db := database.NewConnection() // Initialize our database connection
	broker := events.NewServer()   // Initialize a new server for HTTP events
	wg := &sync.WaitGroup{}        // Initialize wait group
	defer db.Close()

	wg.Add(1)
	srv := events.StartEventsServer(broker, wg)
	log.Infof("Web server listening on %s", srv.Addr)

	// log.Debug("Outputting database...")
	// var output []models.CabinReading
	// err := db.Select(&output, "SELECT * FROM readings")
	// if err != nil {
	// 	panic(err)
	// }
	// spew.Dump(output)

	arduino, err := arduinoConnection.NewArduinoConnection(ctx)
	if err != nil {
		panic(err)
	}
	log.Info("Arduino connection established and greetings exchanged")

	if isRaspberryPi {
		err := arduino.SyncSystemTime(ctx)
		if err != nil {
			log.Errorf("Failed to set RPi system time: %v", err)
		}
	}

	// log.Info("Downloading historical data...")
	// err = arduino.SendHistoricalToDB(broker.Notifier, db, ctx)
	// if err != nil {
	// 	log.Error(err)
	// }

	// Stream arduino data to our events server's event channel
	wg.Add(1)
	go arduino.StreamData(broker.Notifier, db, wg, ctx)

	termChan := make(chan os.Signal)
	signal.Notify(termChan, os.Interrupt, os.Kill, syscall.SIGINT, syscall.SIGTERM)
	<-termChan

	if err := srv.Shutdown(context.TODO()); err != nil {
		panic(err) // failure/timeout shutting down the server gracefully
	}

	log.Warn("Shutdown signal received")
	cancelFunc() // Signal cancellation to workers via context.Context
	wg.Wait()    // Block here until are workers have terminated
	log.Info("All workers done, shutting down!")
}
