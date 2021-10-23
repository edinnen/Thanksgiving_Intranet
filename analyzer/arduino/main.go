// Package arduino provides an interface for sending commands
// and recieving data via a TTY connected Arduino.
package arduino

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	"github.com/tarm/serial"
)

// Connection to an Arduino via TTY
type Connection struct {
	Interface *serial.Port
	DB        *sqlx.DB
	Mutex     *sync.Mutex
}

// NewConnection wakes up and establishes a connection with an Arduino
func NewConnection(ctx context.Context, db *sqlx.DB, mutex *sync.Mutex) (Connection, error) {
	// Discover TTYs
	matches, err := filepath.Glob("/dev/cu.usb*")
	if err != nil {
		logrus.Fatalf("Failed to glob /dev/tty[A-Za-z]*")
	}

	usbMatches, err := filepath.Glob("/dev/ttyUSB*")
	if err != nil {
		logrus.Fatalf("Failed to glob /dev/tty[A-Za-z]*")
	}

	acmMatches, err := filepath.Glob("/dev/ttyACM*")
	if err != nil {
		logrus.Fatalf("Failed to glob /dev/tty[A-Za-z]*")
	}

	matches = append(matches, usbMatches...)
	matches = append(matches, acmMatches...)

	// Attempt to connect to a discovered TTY and say hello to initialize
	var tty *serial.Port
	for _, match := range matches {
		c := &serial.Config{Name: match, Baud: 115200, ReadTimeout: 7 * time.Second}
		tty, err = serial.OpenPort(c)
		if err != nil {
			// Failed to open TTY
			logrus.Fatal(err.Error())
		}

		logrus.Debug("Opening", match)
		connection := Connection{
			Interface: tty,
			DB:        db,
			Mutex:     mutex,
		}

		logrus.Info("Waking up arduino...")
		attempt1 := connection.Command(ctx, 0)
		if attempt1 {
			return connection, nil
		}
		time.Sleep(100 * time.Millisecond)
		attempt2 := connection.Command(ctx, 0)
		if attempt2 {
			return connection, nil
		}

		return Connection{}, fmt.Errorf("Failed to recieve hello response back")
	}

	panic("Failed to connect to any TTY")
}

// Read from the connection's serial buffer and writes to the passed byte array.
func (arduino Connection) Read(buf []byte) (int, error) {
	return arduino.Interface.Read(buf)
}

// Write a string to the serial buffer.
func (arduino Connection) Write(data string) (int, error) {
	buf := []byte(data) // Ensure our data is a byte array
	return arduino.Interface.Write(buf)
}

// Command sends a command to the Arduino.
func (arduino Connection) Command(ctx context.Context, command int) (success bool) {
	logrus.Debugf("Sending command: %d\n", command)

	cmd := fmt.Sprintf("<%d>", command) // Format our command for serial
	done := make(chan bool, 1)          // Create an execution blocker

	// Continually listen for the command response while we send the command
	success = false
	go func() {
		err := arduino.readCommand(ctx, command)
		if err != nil {
			if strings.Contains(fmt.Sprintf("%v", err), "timed out") {
				msg := fmt.Sprintf("Timed out listening for response to command <%d>", command)
				if command == 0 {
					logrus.Debug(msg)
				} else {
					logrus.Error(msg)
				}
				close(done)
				return
			}
			// Release execution blocker and exit the goroutine
			logrus.Errorf("Error executing command: %v", err)
			close(done)
			return
		}
		success = true
		close(done)
	}()

	// Send the command and await the response before returning success status
	arduino.Write(cmd)
	<-done
	return
}

// readCommand reads a command response from the arduino.
func (arduino Connection) readCommand(ctx context.Context, command int) error {
	for {
		value, err := arduino.ReadLine(ctx, true)
		if err != nil {
			return err
		}

		// Command response not in read buffer
		re := regexp.MustCompile(`^\d+$`)
		if !re.MatchString(value) {
			continue
		}

		// The recieved response is for the requested command
		if strings.Contains(value, strconv.Itoa(command)) {
			return nil
		}

		return fmt.Errorf("Failed to read command response")
	}
}

func prepareLine(buf []byte, nr int) string {
	return strings.ReplaceAll(strings.ReplaceAll(strings.TrimSpace(string(buf[:nr])), "\n", ""), "\r", "")
}

// ReadLine reads a single line, delimited by < and >, from the arduino.
func (arduino Connection) ReadLine(ctx context.Context, enableTimeout bool) (line string, err error) {
	capturing := false
	capturingErr := false
	var timer time.Time
	if enableTimeout {
		timer = time.Now().Add(3 * time.Second)
	}
	for {
		select {
		case <-ctx.Done():
			line = ""
			err = fmt.Errorf("Read terminated for shutdown")
			return
		default:
			if enableTimeout && time.Now().After(timer) {
				return "", fmt.Errorf("Request timed out")
			}
			// Read from the serial buffer
			var buf = make([]byte, 8192)
			var nr int
			nr, err = arduino.Read(buf)
			if err == io.EOF {
				// Read timeout occurred, but we don't care; keep looping
				continue
			}

			value := prepareLine(buf, nr)
			logrus.Debugf("Read: %s", value)

			wholeError := regexp.MustCompile(`.*\$\$(.*?)\$\$.*`)
			if wholeError.MatchString(value) {
				line = ""
				err = fmt.Errorf("Error from Arduino: %s", strings.TrimSpace(wholeError.FindStringSubmatch(value)[1]))
				return
			}

			errorStart := regexp.MustCompile(`.*\$\$(.*)`)
			if errorStart.MatchString(value) {
				line = ""
				capturing = true
				capturingErr = true

				line = errorStart.FindStringSubmatch(value)[1]
				continue
			}

			errorEnd := regexp.MustCompile(`(.*?)\$\$.*`)
			if capturingErr && errorEnd.MatchString(value) {
				capturingErr = false
				err = fmt.Errorf("Error from Arduino: %s", strings.TrimSpace(line+errorEnd.FindStringSubmatch(value)[1]))
				line = ""
				return
			}

			// Handle lines that contain a whole data point like:
			// <0,1,2,3>
			wholeSequence := regexp.MustCompile(".*<(.*?)>.*")
			if wholeSequence.MatchString(value) {
				// Retrieve the group between the <> delimiters
				line = wholeSequence.FindStringSubmatch(value)[1]
				// Send an EOF error if we recieve "<>"
				if line == "" {
					err = io.EOF
				}
				return
			}

			// Handle lines that have a start delimiter and optional following text
			startSequence := regexp.MustCompile(".*<(.*)")
			if startSequence.MatchString(value) {
				// Ensure the line is empty as this is a new start delimiter
				line = ""
				capturing = true

				line = startSequence.FindStringSubmatch(value)[1]
				continue
			}

			// Handle lines that have end delimiter and preceeding text
			endSequenceText := regexp.MustCompile("(.*?)>.*")
			if capturing && endSequenceText.MatchString(value) {
				capturing = false
				line = line + endSequenceText.FindStringSubmatch(value)[1]
				if line == "" {
					err = io.EOF
				}
				return
			}

			// Handle lines that have an end delimiter only
			endSequence := regexp.MustCompile(">")
			if capturing && endSequence.MatchString(value) {
				if line == "" {
					err = io.EOF
				}
				return
			}

			// Handle lines with no delimiters if we've already seen a start delimiter
			if capturing {
				line = line + strings.TrimSuffix(value, "\r")
			}
		}
	}
}
