package anomalous

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/utils"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
	"github.com/gorilla/mux"
)

func decodeAnomalyUser(requestBody io.ReadCloser) (anomalyUser models.AnomalyUser, err error) {
	decoder := json.NewDecoder(requestBody)
	err = decoder.Decode(&anomalyUser)
	return
}

func getAnomalous(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user, err := strconv.Atoi(vars["user"])
	var anomalies []models.Anomaly
	statement := `SELECT a.rowid as id, a.*, 0 as read FROM anomalies a LEFT JOIN anomalies_users au ON a.rowid = au.anomaly_id WHERE au.user_id IS NULL UNION SELECT a.rowid as id, a.*, CASE WHEN au.user_id IS NULL THEN 0 ELSE 1 END as read FROM anomalies a LEFT JOIN anomalies_users au ON a.rowid = au.anomaly_id WHERE au.user_id = ?;`
	mutex.Lock()
	err = db.Select(&anomalies, statement, user)
	mutex.Unlock()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, anomalies)
}

func markRead(w http.ResponseWriter, r *http.Request) {
	anomalyUser, err := decodeAnomalyUser(r.Body)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	err = anomalyUser.MarkRead(db, mutex)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, nil)
}
