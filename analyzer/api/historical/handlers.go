package historical

import (
	"net/http"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/utils"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
)

func getHistorical(w http.ResponseWriter, r *http.Request) {
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")

	mutex.Lock()
	var readings []models.CabinReading
	statement := `SELECT * FROM readings WHERE unix >= ? AND unix <= ? LIMIT 500;`
	err := db.Select(&readings, statement, from, to)
	mutex.Unlock()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, readings)
}
