package api

import (
	"net/http"
	"sync"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/frontend"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/anomalous"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/historical"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/users"
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	"github.com/rs/cors"
	log "github.com/sirupsen/logrus"
)

// Start our API attached to the given database
func Start(db *sqlx.DB, mutex *sync.Mutex) {
	// Setup our router
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		// Enable Debugging for testing, consider disabling in production
		// Debug: true,
	})

	main := mux.NewRouter()

	apiSubrouterPath := "/api"
	routerAPI := main.PathPrefix(apiSubrouterPath).Subrouter()

	// Load our endpoints
	users.Load(routerAPI, db, mutex)
	historical.Load(routerAPI, db, mutex)
	anomalous.Load(routerAPI, db, mutex)

	// Serve react app and any files
	frontend.Load(main)

	server := &http.Server{Handler: c.Handler(main)}

	log.Info("API started on port :80")

	// Prevents memory leak
	server.SetKeepAlivesEnabled(false)
	server.ListenAndServe()
}
