package models

import "time"

type CabinReading struct {
	Timestamp       time.Time `json:"timestamp"`
	Unix            int32     `json:"unix"`
	BatteryVoltage  float64   `json:"battery_voltage"`
	SolarVoltage    float64   `json:"solar_voltage"`
	BatteryAmperage float64   `json:"battery_amperage"`
	LoadAmperage    float64   `json:"load_amperage"`
	BatteryPercent  float64   `json:"battery_percent"`
	AvgBatteryPower float64   `json:"avg_battery_power"`
	AvgLoadPower    float64   `json:"avg_load_power"`
	OutsideTemp     float64   `json:"outside_temp"`
	CabinTemp       float64   `json:"cabin_temp"`
	BatteryTemp     float64   `json:"battery_temp"`
	LoadsConnected  int       `json:"loads_connected"`
}
