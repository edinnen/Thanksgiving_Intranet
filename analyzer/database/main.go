package database

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
)

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

	// Check if our db table exists
	_, err = db.Query("SELECT * FROM readings;")
	if err != nil {
		log.Info("Database table does not exist. Creating one...")
		schema := `CREATE TABLE readings (
      timestamp TIMESTAMP,
      unix INTEGER,
      battery_voltage FLOAT64,
      solar_voltage FLOAT64,
      battery_amperage FLOAT64,
      load_amperage FLOAT64,
      battery_percent FLOAT64,
      avg_battery_power FLOAT64,
      avg_load_power FLOAT64,
      outside_temp FLOAT64,
      cabin_temp FLOAT64,
      battery_temp FLOAT64,
      loads_connected INTEGER
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

	return
}
