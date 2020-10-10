package models

import (
	"fmt"

	"github.com/dgrijalva/jwt-go"
	"github.com/jmoiron/sqlx"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

var hmacSecret = []byte("Cave all day; Party all night")

type User struct {
	ID       int64  `json:"id" db:"id"`
	Name     string `json:"name" db:"name"`
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
	Type     string `json:"type" db:"type"`
	JWT      string `json:"token"`
}

func (user *User) Create(db *sqlx.DB) error {
	statement := `INSERT INTO users (
		name,
		email,
		password,
		type
	) VALUES (?, ?, ?, ?);`
	result, err := db.Exec(statement, user.Name, user.Email, user.Password, user.Type)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	user.ID = id
	user.Password = ""
	return nil
}

func (user *User) GenerateJWT() error {
	// Create the Claims
	claims := &jwt.StandardClaims{
		Issuer: "analyzer",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	JWT, err := token.SignedString(hmacSecret)
	user.JWT = JWT
	return err
}

func (user User) ValidateJWT() (bool, error) {
	// Parse takes the token string and a function for looking up the key. The latter is especially
	// useful if you use multiple keys for your application.  The standard is to use 'kid' in the
	// head of the token to identify which key to use, but the parsed token (head and claims) is provided
	// to the callback, providing flexibility.
	token, err := jwt.Parse(user.JWT, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		return hmacSecret, nil
	})

	return token.Valid, err
}

func (user User) Exists(db *sqlx.DB) (User, bool) {
	var u User
	err := db.Get(&u, "SELECT id, name, email, password, type FROM users WHERE email = ?;", user.Email)
	if err != nil {
		log.Errorf("Failed to pull user: %v", err)
		return u, false
	}
	return u, true
}

func (user *User) HashPassword() {
	// Use GenerateFromPassword to hash & salt pwd.
	// MinCost is just an integer constant provided by the bcrypt
	// package along with DefaultCost & MaxCost.
	// The cost can be any value you want provided it isn't lower
	// than the MinCost (4)
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.MinCost)
	if err != nil {
		log.Error(err)
	}
	// GenerateFromPassword returns a byte slice so we need to
	// convert the bytes to a string and return it
	user.Password = string(hash)
}

func (user User) ValidatePassword(db *sqlx.DB) bool {
	plainPwd := []byte(user.Password)

	var hashedPwd string
	err := db.Get(&hashedPwd, "SELECT password FROM users WHERE email = ?", user.Email)
	if err != nil {
		log.Error(err)
		return false
	}

	byteHash := []byte(hashedPwd)
	err = bcrypt.CompareHashAndPassword(byteHash, plainPwd)
	if err != nil {
		log.Error(err)
		return false
	}

	return true
}
