// Package events handles the creation and management of a Server Sent Events
// broker. TODO: Look into using https://github.com/subchord/go-sse
package events

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	log "github.com/sirupsen/logrus"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
)

// Broker for Server Sent Events
type Broker struct {
	Notifier       chan models.CabinReading // Events are pushed by main events-gathering routine
	newClients     chan chan []byte         // New client connections
	closingClients chan chan []byte         // Closed client connections
	clients        map[chan []byte]bool     // Client connections registry
}

// NewServer initializes a new SSE server.
func NewServer() (broker *Broker) {
	// Instantiate a broker
	broker = &Broker{
		Notifier:       make(chan models.CabinReading, 1),
		newClients:     make(chan chan []byte),
		closingClients: make(chan chan []byte),
		clients:        make(map[chan []byte]bool),
	}

	// Set it running - listening and broadcasting events
	go broker.listen()
	return
}

// listen for new clients, closing clients, and events to send to clients.
func (broker *Broker) listen() {
	for {
		select {
		case s := <-broker.newClients:
			// A new client has connected.
			// Register their message channel
			broker.clients[s] = true
			log.Infof("Client added. %d registered clients", len(broker.clients))

		case s := <-broker.closingClients:
			// A client has dettached and we want to
			// stop sending them messages.
			delete(broker.clients, s)
			log.Infof("Removed client. %d registered clients", len(broker.clients))

		case event := <-broker.Notifier:
			data, _ := json.Marshal(event)
			// We got a new event from the outside!
			// Send event to all connected clients
			for clientMessageChan, _ := range broker.clients {
				clientMessageChan <- data
			}
		}
	}
}

// ServeHTTP handles http requests for our broker.
func (broker *Broker) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	// Make sure that the writer supports flushing.
	flusher, ok := rw.(http.Flusher)

	if !ok {
		http.Error(rw, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	// Set headers for streaming
	rw.Header().Set("Content-Type", "text/event-stream")
	rw.Header().Set("Cache-Control", "no-cache")
	rw.Header().Set("Connection", "keep-alive")
	rw.Header().Set("Access-Control-Allow-Origin", "*")

	// Each connection registers its own message channel with the Broker's connections registry
	messageChan := make(chan []byte)

	// Signal the broker that we have a new connection
	broker.newClients <- messageChan

	// Remove this client from the map of connected clients
	// when this handler exits.
	defer func() {
		broker.closingClients <- messageChan
	}()

	// Listen to connection close and un-register messageChan
	// notify := rw.(http.CloseNotifier).CloseNotify()
	notify := req.Context().Done()

	go func() {
		<-notify
		broker.closingClients <- messageChan
	}()

	for {
		// Write to the ResponseWriter
		// Server Sent Events compatible
		fmt.Fprintf(rw, "data: %s\n\n", <-messageChan)

		// Flush the data immediatly instead of buffering it for later.
		flusher.Flush()
	}

}

// StartEventsServer starts the SSE server as a background process
func StartEventsServer(broker *Broker, wg *sync.WaitGroup) *http.Server {
	srv := &http.Server{Addr: ":3030", Handler: broker}

	// Run the server in the background
	go func() {
		// Defer notifying the wait group that the server is closed until
		// after srv.Shutdown() has been called and completed
		defer wg.Done()

		// ErrServerClosed returned on graceful server shutdown
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			// Unexpected error. Port in use?
			log.Fatalf("ListenAndServe(): %v", err)
		}
	}()

	// Returning reference so caller can call Shutdown()
	return srv
}
