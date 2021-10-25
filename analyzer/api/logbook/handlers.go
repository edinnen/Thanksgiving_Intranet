package logbook

import (
	"net/http"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/utils"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
)

func getLogs(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	var entries []models.LogEntry
	statement := `SELECT * FROM logbook LIMIT 500;`
	err := db.Select(&entries, statement)
	mutex.Unlock()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, entries)
}

func addEntry(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	statement := `INSERT INTO logbook (author, body) VALUES (?, ?);`
	_, err := db.Exec(statement)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, nil)
}
