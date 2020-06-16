package models

import (
	"strconv"
	"strings"
	"time"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/utils"
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

/**
 * Parse a line of comma seperated data into a CabinReading struct
 * @param  {string}               line            The csv line to parse
 * @return {CabinReading, error} [reading, error] The struct and any error
 */
func ParseCabinReading(line string) (reading CabinReading, err error) {
	data := strings.Split(line, ",")

	// Ensure we parse the non RFC 3339 timestamp from the arduino properly
	timeFormat := "2006-01-02 15:04:05"
	timestamp, err := time.Parse(timeFormat, data[0])
	if err != nil {
		return
	}

	// Parse the unix timestamp properly
	unix := int64(utils.StringToFloat(data[1]))

	// Remove any newline from the trailing data point
	loads, err := strconv.Atoi(strings.TrimSpace(data[12]))
	if err != nil {
		return
	}

	reading = CabinReading{
		Timestamp:       timestamp,
		Unix:            unix,
		BatteryVoltage:  utils.StringToFloat(data[2]),
		SolarVoltage:    utils.StringToFloat(data[3]),
		BatteryAmperage: utils.StringToFloat(data[4]),
		LoadAmperage:    utils.StringToFloat(data[5]),
		BatteryPercent:  utils.StringToFloat(data[6]),
		AvgBatteryPower: utils.StringToFloat(data[7]),
		AvgLoadPower:    utils.StringToFloat(data[8]),
		OutsideTemp:     utils.StringToFloat(data[9]),
		CabinTemp:       utils.StringToFloat(data[10]),
		BatteryTemp:     utils.StringToFloat(data[11]),
		LoadsConnected:  loads,
	}
	return
}
