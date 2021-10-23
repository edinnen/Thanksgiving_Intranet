// Package models holds data structs and their related functions.
package models

import (
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/utils"
	"github.com/jmoiron/sqlx"
	log "github.com/sirupsen/logrus"
)

// CabinReading holds data from readings recieved via the Arduino.
type CabinReading struct {
	ID              int64     `json:"id" db:"id"`
	Timestamp       time.Time `json:"timestamp" db:"timestamp"`
	Unix            int64     `json:"unix" db:"unix"`
	BatteryVoltage  float64   `json:"battery_voltage" db:"battery_voltage"`
	SolarVoltage    float64   `json:"solar_voltage" db:"solar_voltage"`
	LoadAmperage    float64   `json:"load_amperage" db:"load_amperage"`
	BatteryAmperage float64   `json:"battery_amperage" db:"battery_amperage"`
	SolarAmperage   float64   `json:"solar_amperage" db:"solar_amperage"`
	AvgLoadPower    float64   `json:"avg_load_power" db:"avg_load_power"`
	AvgSolarPower   float64   `json:"avg_solar_power" db:"avg_solar_power"`
	AvgHydroPower   float64   `json:"avg_hydro_power" db:"avg_hydro_power"`
	OutsideTemp     float64   `json:"outside_temp" db:"outside_temp"`
	CabinTemp       float64   `json:"cabin_temp" db:"cabin_temp"`
	BatteryTemp     float64   `json:"battery_temp" db:"battery_temp"`
}

// SendToDB sends a CabinReading to the SQL database.
func (reading CabinReading) SendToDB(db *sqlx.DB, mutex *sync.Mutex) error {
	mutex.Lock()
	_, err := db.Exec(`
		INSERT INTO readings (
			timestamp,
			unix,
			battery_voltage,
			solar_voltage,
			battery_amperage,
			load_amperage,
			solar_amperage
			avg_load_power,
			avg_solar_power,
			avg_hydro_power,
			outside_temp,
			cabin_temp,
			battery_temp
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
	`,
		reading.Timestamp,
		reading.Unix,
		reading.BatteryVoltage,
		reading.SolarVoltage,
		reading.BatteryAmperage,
		reading.LoadAmperage,
		reading.SolarAmperage,
		reading.AvgLoadPower,
		reading.AvgSolarPower,
		reading.AvgHydroPower,
		reading.OutsideTemp,
		reading.CabinTemp,
		reading.BatteryTemp,
	)
	mutex.Unlock()
	if err != nil {
		log.Error(err)
	}
	return err
}

// ParseCabinReading decodes a power reading CSV line into a CabinReading.
func ParseCabinReading(line string) (reading CabinReading, err error) {
	defer func() {
		if r := recover(); r != nil {
			log.Error("Cabin reading failed to parse", r)
		}
	}()
	data := strings.Split(line, ",")

	// Parse the unix timestamp properly
	// Unix time here is GMT -7
	unix, err := strconv.ParseInt(data[0], 10, 64)
	if err != nil {
		return
	}
	timestamp := time.Unix(unix, 0)

	reading = CabinReading{
		Timestamp:       timestamp,
		Unix:            unix,
		BatteryVoltage:  utils.StringToFloat(data[1]),
		SolarVoltage:    utils.StringToFloat(data[2]),
		LoadAmperage:    utils.StringToFloat(data[3]),
		BatteryAmperage: utils.StringToFloat(data[4]),
		SolarAmperage:   utils.StringToFloat(data[5]),
		AvgLoadPower:    utils.StringToFloat(data[6]),
		AvgSolarPower:   utils.StringToFloat(data[7]),
		AvgHydroPower:   utils.StringToFloat(data[8]),
		OutsideTemp:     utils.StringToFloat(data[9]),
		CabinTemp:       utils.StringToFloat(data[10]),
		BatteryTemp:     utils.StringToFloat(strings.TrimSpace(data[11])), // Trim \n
	}
	return
}
