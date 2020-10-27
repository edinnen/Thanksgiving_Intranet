package models

import (
	"sync"

	"github.com/jmoiron/sqlx"
)

// Anomalies holds anomalous data readings
type Anomalies struct {
	Name     string         `json:"name"`
	Readings []CabinReading `json:"readings"`
}

// SendToDB sends an anomaly group to the SQL database.
func (anomalies Anomalies) SendToDB(db *sqlx.DB, mutex *sync.Mutex) error {
	if len(anomalies.Readings) == 0 {
		return nil
	}
	for _, reading := range anomalies.Readings {
		mutex.Lock()
		_, err := db.Exec(`
			INSERT INTO anomalies (
				name,
				timestamp,
				unix,
				battery_voltage,
				solar_voltage,
				battery_amperage,
				load_amperage,
				battery_percent,
				avg_battery_power,
				avg_load_power,
				outside_temp,
				cabin_temp,
				battery_temp
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
		`,
			anomalies.Name,
			reading.Timestamp,
			reading.Unix,
			reading.BatteryVoltage,
			reading.SolarVoltage,
			reading.BatteryAmperage,
			reading.LoadAmperage,
			reading.BatteryPercent,
			reading.AvgBatteryPower,
			reading.AvgLoadPower,
			reading.OutsideTemp,
			reading.CabinTemp,
			reading.BatteryTemp,
		)
		mutex.Unlock()
		if err != nil {
			return err
		}
	}
	return nil
}

// AnomaliesUsers holds a row from the anomalies_users table
type AnomaliesUsers struct {
	UserID    int `json:"user_id" db:"user_id"`
	AnomalyID int `json:"anomaly_id" db:"anomaly_id"`
}

// SendToDB sends an AnomaliesUsers value to the SQL database
func (anomaliesUsers AnomaliesUsers) SendToDB(db *sqlx.DB, mutex *sync.Mutex) error {
	mutex.Lock()
	_, err := db.Exec(`
		INSERT INTO anomalies_users (
			user_id,
			anomaly_id
		) VALUES (?, ?);
	`,
		anomaliesUsers.UserID,
		anomaliesUsers.AnomalyID,
	)
	mutex.Unlock()
	if err != nil {
		return err
	}
	return nil
}
