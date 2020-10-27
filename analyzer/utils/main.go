// Package utils holds generic utility functions.
package utils

import (
	"fmt"
	"os/exec"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"
)

// SetSystemDate sets the system date and clock.
func SetSystemDate(newTime time.Time) error {
	dateString := newTime.Format("2006-01-2 15:04:05")
	log.Infof("Setting system date to: %s\n", dateString)
	cmd := exec.Command("sudo", "date", "-s", fmt.Sprintf("%s", dateString))
	return cmd.Run()
}

// StringToFloat returns a float64 from a given string.
func StringToFloat(s string) float64 {
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return val
	}
	return val
}
