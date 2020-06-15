package models

import (
	"time"

	"github.com/jmoiron/sqlx"
)

type CabinReading struct {
	Timestamp       time.Time `json:"timestamp" db:"timestamp"`
	Unix            int64     `json:"unix" db:"unix"`
	BatteryVoltage  float64   `json:"battery_voltage" db:"battery_voltage"`
	SolarVoltage    float64   `json:"solar_voltage" db:"solar_voltage"`
	BatteryAmperage float64   `json:"battery_amperage" db:"battery_amperage"`
	LoadAmperage    float64   `json:"load_amperage" db:"load_amperage"`
	BatteryPercent  float64   `json:"battery_percent" db:"battery_percent"`
	AvgBatteryPower float64   `json:"avg_battery_power" db:"avg_battery_power"`
	AvgLoadPower    float64   `json:"avg_load_power" db:"avg_load_power"`
	OutsideTemp     float64   `json:"outside_temp" db:"outside_temp"`
	CabinTemp       float64   `json:"cabin_temp" db:"cabin_temp"`
	BatteryTemp     float64   `json:"battery_temp" db:"battery_temp"`
	LoadsConnected  int       `json:"loads_connected" db:"loads_connected"`
}

func (reading CabinReading) SendToDB(db *sqlx.DB) error {
	_, err := db.Exec(`
		INSERT INTO readings (
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
			battery_temp,
			loads_connected
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
	`,
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
		reading.LoadsConnected,
	)
	return err
}
