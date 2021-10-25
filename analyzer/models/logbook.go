package models

import "time"

type LogEntry struct {
	Author  string    `json:"author" db:"author"`
	Body    string    `json:"body" db:"body"`
	Created time.Time `json:"created" db:"created"`
}
