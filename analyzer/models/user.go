package models

import (
	"fmt"
	"sync"

	"github.com/dgrijalva/jwt-go"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

var hmacSecret = []byte("Cave all day; Party all night")

// User of the cabin intranet
type User struct {
	ID       int64  `json:"id" db:"id"`
	Name     string `json:"name" db:"name"`
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
	Type     string `json:"type" db:"type"`
	JWT      string `json:"token"`
}

// Create persists a User to our database
func (user *User) Create(db *sqlx.DB, mutex *sync.Mutex) error {
	mutex.Lock()
	statement := `INSERT INTO users (
		name,
		email,
		password,
		type
	) VALUES (?, ?, ?, ?);`
	result, err := db.Exec(statement, user.Name, user.Email, user.Password, user.Type)
	mutex.Unlock()
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

// GenerateJWT creates a new JWT for a user
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

// ValidateJWT verifies the user's provided JWT
func (user User) ValidateJWT() (bool, error) {
	// Parse takes the token string and a function for looking up the key. The latter is especially
	// useful if you use multiple keys for your application.  The standard is to use 'kid' in the
	// head of the token to identify which key to use, but the parsed token (head and claims) is provided
	// to the callback, providing flexibility.
	token, err := jwt.Parse(user.JWT, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		return hmacSecret, nil
	})

	return token.Valid, err
}

// Exists checks if a user exists in the DB and optionally returns it
func (user User) Exists(db *sqlx.DB, mutex *sync.Mutex) (User, bool) {
	mutex.Lock()
	var u User
	err := db.Get(&u, "SELECT id, name, email, password, type FROM users WHERE email = ?;", user.Email)
	mutex.Unlock()
	if err != nil {
		logrus.Errorf("Failed to pull user: %v", err)
		return u, false
	}
	return u, true
}

// HashPassword hashes the value of a Password stored in a User
func (user *User) HashPassword() {
	// Use GenerateFromPassword to hash & salt pwd.
	// MinCost is just an integer constant provided by the bcrypt
	// package along with DefaultCost & MaxCost.
	// The cost can be any value you want provided it isn't lower
	// than the MinCost (4)
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.MinCost)
	if err != nil {
		logrus.Error(err)
	}
	// GenerateFromPassword returns a byte slice so we need to
	// convert the bytes to a string and return it
	user.Password = string(hash)
}

// ValidatePassword checks the password provided by the user with the hashed version stored in our database
func (user User) ValidatePassword(db *sqlx.DB, mutex *sync.Mutex) bool {
	plainPwd := []byte(user.Password)

	mutex.Lock()
	var hashedPwd string
	err := db.Get(&hashedPwd, "SELECT password FROM users WHERE email = ?", user.Email)
	mutex.Unlock()
	if err != nil {
		logrus.Error(err)
		return false
	}

	byteHash := []byte(hashedPwd)
	err = bcrypt.CompareHashAndPassword(byteHash, plainPwd)
	if err != nil {
		logrus.Error(err)
		return false
	}

	return true
}
