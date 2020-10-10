package api

import (
	"net/http"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/users"
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	"github.com/rs/cors"
	log "github.com/sirupsen/logrus"
)

func Start(db *sqlx.DB) {
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
	users.Load(routerAPI, db)

	server := &http.Server{Addr: ":8080", Handler: c.Handler(main)}

	log.Info("API started on port :8080")

	// Prevents memory leak
	server.SetKeepAlivesEnabled(false)
	server.ListenAndServe()
}
