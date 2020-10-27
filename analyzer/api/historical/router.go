package historical

import (
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

var (
	db    *sqlx.DB
	mutex *sync.Mutex
)

// Load mounts the subrouter on the router and matches each path with a handler
func Load(router *mux.Router, dbConn *sqlx.DB, mux *sync.Mutex) {
	db = dbConn
	mutex = mux
	router.HandleFunc("/historical", getHistorical).Methods(http.MethodGet)
}
