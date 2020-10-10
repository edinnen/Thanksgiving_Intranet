package users

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
	log "github.com/sirupsen/logrus"
)

type userRequest struct {
	ID int `json:"id"`
}

// respondWithError responds with error
func respondWithError(w http.ResponseWriter, code int, err error) {
	e := fmt.Sprintf("%s", err)
	log.Error(e)
	respondWithJSON(w, code, map[string]string{"error": e})
}

// respondWithJSON responds with json formatted code
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if code != 200 {
		w.WriteHeader(code)
	}
	json.NewEncoder(w).Encode(payload)
}

func decodeUser(requestBody io.ReadCloser) (user models.User, err error) {
	decoder := json.NewDecoder(requestBody)
	err = decoder.Decode(&user)
	return
}

// samplePost - Accepts a POST request
func createUser(w http.ResponseWriter, r *http.Request) {
	user, err := decodeUser(r.Body)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err)
		return
	}

	user.Email = strings.TrimSpace(strings.ToLower(user.Email))

	user.HashPassword()
	err = user.Create(db)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
	}
	// Create JWT and return it
	user.GenerateJWT()

	respondWithJSON(w, http.StatusOK, user)
}

func loginUser(w http.ResponseWriter, r *http.Request) {
	recievedLogin, err := decodeUser(r.Body)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err)
		return
	}

	if recievedLogin.Email == "" || recievedLogin.Password == "" {
		respondWithError(w, http.StatusBadRequest, fmt.Errorf("Must supply password and email"))
		return
	}

	user, exists := recievedLogin.Exists(db)
	if !exists {
		respondWithError(w, http.StatusBadRequest, fmt.Errorf("User with email %s not found", user.Email))
		return
	}
	user.Password = recievedLogin.Password

	if !user.ValidatePassword(db) {
		respondWithError(w, http.StatusUnauthorized, fmt.Errorf("Password or email incorrect"))
		return
	}

	err = user.GenerateJWT()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	user.Password = ""
	respondWithJSON(w, http.StatusOK, user)
}

func validateUser(w http.ResponseWriter, r *http.Request) {
	user, err := decodeUser(r.Body)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err)
		return
	}

	valid, err := user.ValidateJWT()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if !valid {
		respondWithError(w, http.StatusUnauthorized, fmt.Errorf("Provided JWT was invalid"))
		return
	}

	respondWithJSON(w, http.StatusNoContent, valid)
}
