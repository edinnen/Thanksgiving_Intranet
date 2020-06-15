package main

import (
	"context"
	"os"
	"os/signal"
	"sync"
	"syscall"

	log "github.com/sirupsen/logrus"

	arduinoConnection "github.com/edinnen/Thanksgiving_Intranet/analyzer/arduino"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/events"
)

func main() {
	arduino, err := arduinoConnection.NewArduinoConnection()
	if err != nil {
		panic(err)
	}
	log.Info("Connection established and greetings exchanged")

	log.Info("Downloading historical data...")
	// err := arduino.SendHistoricalToDB(db * sqlx.DB)
	// if err != nil {
	// 	log.Error(err)
	// }

	// Initialize wait group
	ctx, cancelFunc := context.WithCancel(context.Background())
	wg := &sync.WaitGroup{}

	broker := events.NewServer() // Initialize a new server for HTTP events
	// Stream arduino data to our events server's event channel
	wg.Add(1)
	go arduino.StreamData(broker.Notifier, wg, ctx)
	log.Info("Arduino data stream instantiated")

	wg.Add(1)
	srv := events.StartEventsServer(broker, wg)
	log.Infof("Web server listening on %s", srv.Addr)

	termChan := make(chan os.Signal)
	signal.Notify(termChan, os.Interrupt, os.Kill, syscall.SIGINT, syscall.SIGTERM)
	<-termChan

	if err := srv.Shutdown(context.TODO()); err != nil {
		panic(err) // failure/timeout shutting down the server gracefully
	}

	log.Info("Shutdown signal received")
	cancelFunc() // Signal cancellation to workers via context.Context
	wg.Wait()    // Block here until are workers have terminated
	log.Info("All workers done, shutting down!")
}
