package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"runtime"
	"sync"
	"syscall"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/arduino"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/database"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/events"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/statistics"
)

var isRaspberryPi bool

func init() {
	isRaspberryPi = runtime.GOOS == "linux" && runtime.GOARCH == "arm"
	if !isRaspberryPi {
		// Enable DEBUG logging on non Raspberry Pi hosts
		log.SetLevel(log.DebugLevel)
	}
	// TODO: Remove this
	// log.SetLevel(log.DebugLevel)

	log.SetFormatter(&log.TextFormatter{TimestampFormat: "2006-01-02 15:04:05", FullTimestamp: true})
}

func main() {
	fmt.Print("\n\n")
	fmt.Println(`
████████ ██   ██  █████  ███    ██ ██   ██ ███████  ██████  ██ ██    ██ ██ ███    ██  ██████       ██████  █████  ██████  ██ ███    ██ 
   ██    ██   ██ ██   ██ ████   ██ ██  ██  ██      ██       ██ ██    ██ ██ ████   ██ ██           ██      ██   ██ ██   ██ ██ ████   ██ 
   ██    ███████ ███████ ██ ██  ██ █████   ███████ ██   ███ ██ ██    ██ ██ ██ ██  ██ ██   ███     ██      ███████ ██████  ██ ██ ██  ██ 
   ██    ██   ██ ██   ██ ██  ██ ██ ██  ██       ██ ██    ██ ██  ██  ██  ██ ██  ██ ██ ██    ██     ██      ██   ██ ██   ██ ██ ██  ██ ██ 
   ██    ██   ██ ██   ██ ██   ████ ██   ██ ███████  ██████  ██   ████   ██ ██   ████  ██████       ██████ ██   ██ ██████  ██ ██   ████ `)
	fmt.Print("\n\n")
	fmt.Println(`
              /\                           (
        .    /%%\                           )        /\
       /"\  /%%%%\                         (__      /""\
      /"""\ /%%%%\                ,       |_I_|    /""""\
 /\   /"-"\/%%%___\______________/ \______|I_I|____/""""\/\
/%%\ /"""""\%%/\'.__.'.__.'.__.'/\/=\'.__.'.__.'.__\""""/%%\
%%%%/_"""""_\/!!\_.'.__.'.__.'./\/_=_\_.'.__.'.__.'.\""/%%%%\    .
%%%%/-"-"-"-/!!!!\.__.'.__.'._/\/|_|_|\.__.'.__.'.__.\"/%%%%\   /"\
%%%/""""""""/!!!!\_.'.__.'.__.\/=|_|_|=\'.__.'.__.'.__\%%%%%%\ /"""\
%%/_"""""""/!!!!!!\____________________________________\.'.%%\ /"-"\
%%/ "-"-"-/!!!!!!!!\]== _ _ _ ============______======.'   '.%/"""""\
%/""""""""/!!!!!!!/\]==|_|_|_|============|////|====.'       '."""""_\
/_"""""""/!!!!!!!/%%\==|_|_|_|============|////|==='._.'._.'._.'-"-"-\
 "-"-"-"/!!!!!!!/%%%%\====================|&///|====.'       '."""""""\
   _-   /!!!!!!!/%%%%\====================|////|==.'           '.""""""\
       /!!!!!!!/%%%%%%\===================|////|='._.'._.'._.'._.'-"-"-"
       /lc!!!!!/%%%%%%\"""""""""""""""""""'===='"".'           '.  - _
       ^^^^^^^/%%%%%%%%\   _ -            _-    .'               '.
              ^^^^^^^^^^                       '._.'._.'._.'._.'._.'
  _-                               _-           .'               '.  _ -
                   _-                         .'                   '.
       _-                                    '._.'._.'._.'._.'._.'._.'
                                             ~"^"~"^~"^"~"^"~"^"~"^"~"`)
	fmt.Print("\n\n")

	ctx, cancelFunc := context.WithCancel(context.Background())

	db, mutex := database.NewConnection() // Initialize our database connection
	broker := events.NewServer()          // Initialize a new server for HTTP events
	wg := &sync.WaitGroup{}               // Initialize wait group
	defer db.Close()

	go api.Start(db, mutex)

	wg.Add(1)
	srv := events.StartEventsServer(broker, wg)

	powerMonitor, err := arduino.NewConnection(ctx, db, mutex)
	if err != nil {
		panic(err)
	}
	log.Info("Arduino connection established and greetings exchanged")

	if isRaspberryPi {
		err := powerMonitor.SyncSystemTime(ctx)
		if err != nil {
			log.Errorf("Failed to set RPi system time: %v", err)
		}
	}

	log.Info("Downloading historical data...")
	err = powerMonitor.SendHistoricalToDB(ctx, broker.Notifier)
	if err != nil {
		log.Error(err)
	}

	// Stream arduino data to our events server's event channel
	wg.Add(1)
	go powerMonitor.StreamData(ctx, broker.Notifier, wg)

	statisticsEngine := statistics.NewClient(db, mutex)
	go statisticsEngine.DetectStreamAnomalies()

	termChan := make(chan os.Signal)
	signal.Notify(termChan, os.Interrupt, os.Kill, syscall.SIGINT, syscall.SIGTERM)
	<-termChan

	log.Warn("Shutdown signal received")

	cancelFunc() // Signal cancellation to workers via context.Context
	ctx2, cancelTimeout := context.WithTimeout(context.Background(), 10*time.Second)
	srv.Shutdown(ctx2)
	wg.Wait() // Block here until are workers have terminated
	cancelTimeout()
	log.Info("All workers done, shutting down!")
}
