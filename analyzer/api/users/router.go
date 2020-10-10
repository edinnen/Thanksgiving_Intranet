package users

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

var (
	db *sqlx.DB
)

// Load mounts the subrouter on the router and matches each path with a handler
func Load(router *mux.Router, dbConn *sqlx.DB) {
	db = dbConn
	router.HandleFunc("/users", createUser).Methods(http.MethodPost)
	router.HandleFunc("/users/login", loginUser).Methods(http.MethodPost)
	router.HandleFunc("/users/validate", validateUser).Methods(http.MethodPost)
}
