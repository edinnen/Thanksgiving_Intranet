package models

import (
	"sync"
	"time"

	"github.com/jmoiron/sqlx"
)

// Device holds a Bluetooth device's information
type Device struct {
	ID   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

// DeviceSeen defines when a given Bluetooth device
// ID was last seen
type DeviceSeen struct {
	ID   string    `json:"id" db:"id"`
	Seen time.Time `json:"seen" db:"seen"`
}

// Add inserts a Bluetooth device into the provided database
// if it does not already exists. Adds an additional entry
// to the devices_seen table to mark the device as last
// seen at the time of execution of this function.
func (device *Device) Add(db *sqlx.DB, mutex *sync.Mutex) error {
	mutex.Lock()

	insertDevice := `INSERT OR IGNORE INTO devices (id, name) VALUES (?, ?);`
	_, err := db.Exec(insertDevice, device.ID, device.Name)
	if err != nil {
		return err
	}

	insertSeen := `INSERT INTO devices_seen (id, seen) VALUES (?, ?);`
	_, err = db.Exec(insertSeen, device.ID, time.Now().String())
	if err != nil {
		return err
	}

	mutex.Unlock()
	return nil
}
