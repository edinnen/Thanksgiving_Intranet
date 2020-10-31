package users

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/utils"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
)

func decodeUser(requestBody io.ReadCloser) (user models.User, err error) {
	decoder := json.NewDecoder(requestBody)
	err = decoder.Decode(&user)
	return
}

func createUser(w http.ResponseWriter, r *http.Request) {
	user, err := decodeUser(r.Body)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	user.Email = strings.TrimSpace(strings.ToLower(user.Email))

	user.HashPassword()
	err = user.Create(db, mutex)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	// Create JWT and return it
	user.GenerateJWT()

	utils.RespondWithJSON(w, http.StatusOK, user)
}

func loginUser(w http.ResponseWriter, r *http.Request) {
	recievedLogin, err := decodeUser(r.Body)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	if recievedLogin.Email == "" || recievedLogin.Password == "" {
		utils.RespondWithError(w, http.StatusBadRequest, fmt.Errorf("Must supply password and email"))
		return
	}

	user, exists := recievedLogin.Exists(db, mutex)
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, fmt.Errorf("User with email %s not found", user.Email))
		return
	}
	user.Password = recievedLogin.Password

	if !user.ValidatePassword(db, mutex) {
		utils.RespondWithError(w, http.StatusUnauthorized, fmt.Errorf("Password or email incorrect"))
		return
	}

	err = user.GenerateJWT()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	user.Password = ""
	utils.RespondWithJSON(w, http.StatusOK, user)
}

func validateUser(w http.ResponseWriter, r *http.Request) {
	user, err := decodeUser(r.Body)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	valid, err := user.ValidateJWT()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if !valid {
		utils.RespondWithError(w, http.StatusUnauthorized, fmt.Errorf("Provided JWT was invalid"))
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, valid)
}
