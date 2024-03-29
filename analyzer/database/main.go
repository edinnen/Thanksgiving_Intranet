// Package database provides an sqlx DB connection to execute SQL commands on
// an SQLite3 database named "cabin.db".
package database

import (
	"database/sql"
	"fmt"
	"sync"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3" // sqlite3 driver
	"github.com/sirupsen/logrus"
)

// NewConnection opens the SQLite3 database and creates our table if necessary.
func NewConnection(databasePath *string) (db *sqlx.DB, mutex *sync.Mutex) {
	mutex = &sync.Mutex{}
	db, err := sqlx.Open("sqlite3", ":memory:")
	if err != nil {
		panic(err)
	}

	connString := fmt.Sprintf("file:%s?&mode=rwc", *databasePath)
	sqlite, err := sql.Open("sqlite3", connString)
	if err != nil {
		panic(err)
	}
	db = sqlx.NewDb(sqlite, "sqlite3")

	enableForeignKeys(db)

	logrus.Info("Ensuring database tables exist...")
	ensureReadingsTable(db)
	ensureUsersTable(db)
	ensureAnomaliesTable(db)
	ensureAnomaliesUsersTable(db)
	ensureHistoricalTable(db)
	ensureLogbookTable(db)
	return
}

func enableForeignKeys(db *sqlx.DB) {
	logrus.Info("Enabling database foreign keys...")
	foreignKeySchema := `PRAGMA foreign_keys = ON;`
	_, err := db.Exec(foreignKeySchema)
	if err != nil {
		panic(err)
	}
}

func ensureLogbookTable(db *sqlx.DB) {
	schema := `CREATE TABLE IF NOT EXISTS logbook (author TEXT, body TEXT, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
	_, err := db.Exec(schema)
	if err != nil {
		panic(err)
	}
}

func ensureHistoricalTable(db *sqlx.DB) {
	schema := `CREATE TABLE IF NOT EXISTS historical_files (name TEXT);
	CREATE INDEX IF NOT EXISTS idx_name ON historical_files (name);`

	_, err := db.Exec(schema)
	if err != nil {
		panic(err)
	}
}

// ensureReadingsTable checks for the readings table. Creates it if necessary.
func ensureReadingsTable(db *sqlx.DB) {
	schema := `CREATE TABLE IF NOT EXISTS readings (
		timestamp         TIMESTAMP,
		unix              INTEGER,
		battery_voltage   FLOAT64,
		solar_voltage     FLOAT64,
		battery_amperage  FLOAT64,
		load_amperage     FLOAT64,
		solar_amperage 	  FLOAT64,
		avg_load_power    FLOAT64,
		avg_solar_power   FLOAT64,
		avg_hydro_power   FLOAT64,
		outside_temp      FLOAT64,
		cabin_temp        FLOAT64,
		battery_temp      FLOAT64
		);
		CREATE INDEX IF NOT EXISTS idx_unix_readings
		ON readings (unix);`

	// execute a query on the server
	_, err := db.Exec(schema)
	if err != nil {
		panic(err)
	}
}

func ensureAnomaliesTable(db *sqlx.DB) {
	schema := `CREATE TABLE IF NOT EXISTS anomalies (
		id			  	  INTEGER NOT NULL,
		name			  TEXT,
		timestamp         TIMESTAMP,
		unix              INTEGER,
		battery_voltage   FLOAT64,
		solar_voltage     FLOAT64,
		battery_amperage  FLOAT64,
		load_amperage     FLOAT64,
		solar_amperage 	  FLOAT64,
		avg_load_power    FLOAT64,
		avg_solar_power   FLOAT64,
		avg_hydro_power   FLOAT64,
		outside_temp      FLOAT64,
		cabin_temp        FLOAT64,
		battery_temp      FLOAT64,
		PRIMARY KEY(id)
	);
	CREATE INDEX IF NOT EXISTS idx_unix_anomalies ON anomalies (unix);
	CREATE INDEX IF NOT EXISTS idx_name_anomalies ON anomalies (name);`

	_, err := db.Exec(schema)
	if err != nil {
		panic(err)
	}
}

func ensureAnomaliesUsersTable(db *sqlx.DB) {
	schema := `CREATE TABLE IF NOT EXISTS anomalies_users (
		user_id    INTEGER,
		anomaly_id INTEGER,
		FOREIGN KEY (user_id) REFERENCES users(id),
		FOREIGN KEY (anomaly_id) REFERENCES anomalies(id),
		UNIQUE(user_id, anomaly_id)
	);
	CREATE INDEX IF NOT EXISTS idx_user_anomaliesusers ON anomalies_users (user_id);
	CREATE INDEX IF NOT EXISTS idx_anomaly_anomaliesusers ON anomalies_users (anomaly_id);`

	_, err := db.Exec(schema)
	if err != nil {
		panic(err)
	}
}

// ensureUsersTable checks for the users table. Creates it if necessary
func ensureUsersTable(db *sqlx.DB) {
	schema := `CREATE TABLE IF NOT EXISTS users (
		id		 INTEGER PRIMARY KEY,
		name 	 TEXT,
		email 	 TEXT UNIQUE,
		password TEXT,
		type     TEXT
	);
	CREATE INDEX IF NOT EXISTS idx_email_users ON users (email);`

	_, err := db.Exec(schema)
	if err != nil {
		panic(err)
	}
}
