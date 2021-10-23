package utils

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/sirupsen/logrus"
)

// RespondWithError responds with error
func RespondWithError(w http.ResponseWriter, code int, err error) {
	e := fmt.Sprintf("%s", err)
	logrus.Error(e)
	RespondWithJSON(w, code, map[string]string{"error": e})
}

// RespondWithJSON responds with json formatted code
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if code != 200 {
		w.WriteHeader(code)
	}
	json.NewEncoder(w).Encode(payload)
}
