package anomalous

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

func Load(router *mux.Router, dbConn *sqlx.DB, mux *sync.Mutex) {
	db = dbConn
	mutex = mux
	router.HandleFunc("/anomalous", markRead).Methods(http.MethodPost)
	router.HandleFunc("/anomalous/{user}", getAnomalous).Methods(http.MethodGet)
}
