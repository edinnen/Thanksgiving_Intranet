// Package database provides an sqlx DB connection to execute SQL commands on
// an SQLite3 database named "cabin.db".
package database

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3" // sqlite3 driver
	log "github.com/sirupsen/logrus"
)

// NewConnection opens the SQLite3 database and creates our table if necessary.
func NewConnection() (db *sqlx.DB) {
	db, err := sqlx.Open("sqlite3", ":memory:")
	if err != nil {
		panic(err)
	}

	sqlite, err := sql.Open("sqlite3", "file:cabin.db?cache=shared&mode=rwc")
	if err != nil {
		panic(err)
	}
	db = sqlx.NewDb(sqlite, "sqlite3")

	ensureReadingsTable(db)
	ensureUsersTable(db)
	return
}

// ensureReadingsTable checks for the readings table. Creates it if necessary.
func ensureReadingsTable(db *sqlx.DB) {
	_, err := db.Query("SELECT * FROM readings;")
	if err != nil {
		log.Info("Readings table does not exist. Creating...")
		schema := `CREATE TABLE readings (
			timestamp         TIMESTAMP,
			unix              INTEGER,
			battery_voltage   FLOAT64,
			solar_voltage     FLOAT64,
			battery_amperage  FLOAT64,
			load_amperage     FLOAT64,
			battery_percent   FLOAT64,
			avg_battery_power FLOAT64,
			avg_load_power    FLOAT64,
			outside_temp      FLOAT64,
			cabin_temp        FLOAT64,
			battery_temp      FLOAT64
			);
			CREATE INDEX idx_timestamp_readings
			ON readings (timestamp);
			CREATE INDEX idx_outside_temp_readings
			ON readings (outside_temp);`

		// execute a query on the server
		_, err = db.Exec(schema)
		if err != nil {
			panic(err)
		}
	}
}

// ensureUsersTable checks for the users table. Creates it if necessary
func ensureUsersTable(db *sqlx.DB) {
	_, err := db.Query("SELECT * FROM users;")
	if err != nil {
		log.Info("Users table does not exist. Creating...")
		schema := `CREATE TABLE users (
			id		 INTEGER PRIMARY KEY,
			name 	 TEXT,
			email 	 TEXT UNIQUE,
			password TEXT,
			type     TEXT
		);
		CREATE INDEX idx_email_users ON users (email);`

		_, err = db.Exec(schema)
		if err != nil {
			panic(err)
		}
	}
}
