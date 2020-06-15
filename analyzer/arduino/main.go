package arduino

import (
	"context"
	"fmt"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/tarm/serial"

	log "github.com/sirupsen/logrus"
)

// Holds all our serial connection information
type ArduinoConnection struct {
	Interface *serial.Port
}

/**
 * Read from the connection's serial buffer and writes to the
 * passed byte array.
 * @param  {[]byte}     buf The byte buffer to write to
 * @return {int, error}     The number of read bytes and an error, if any
 */
func (arduino ArduinoConnection) Read(buf []byte) (int, error) {
	return arduino.Interface.Read(buf)
}

/**
 * Write a string to the serial buffer.
 * @param  {string}     data The string to write to the arduino
 * @return {int, error}			 The number of written bytes and an error, if any
 */
func (arduino ArduinoConnection) Write(data string) (int, error) {
	buf := []byte(data) // Ensure our data is a byte array
	return arduino.Interface.Write(buf)
}

/**
 * Send a command to the arduino.
 * @param  {int}  command The command number to pass to the arduino
 * @return {bool} success Notifies if the command was successfully recieved
 */
func (arduino ArduinoConnection) Command(command int, ctx context.Context) (success bool) {
	log.Debugf("Sending command: %d\n", command)

	cmd := fmt.Sprintf("<%d>", command) // Format our command for serial
	done := make(chan bool, 1)          // Create an execution blocker

	// Continually listen for the command response while we send the command
	success = false
	go func() {
		err := arduino.readCommand(command, ctx)
		if err != nil {
			if strings.Contains(fmt.Sprintf("%v", err), "timed out") {
				log.Errorf("Response timed out")
				close(done)
				return
			}
			// Release execution blocker and exit the goroutine
			log.Errorf("Error executing command: %v", err)
			close(done)
			return
		}
		success = true
		close(done)
	}()

	// Send the command and await the response before returning success status
	if command != 0 {
		arduino.Write(cmd)
		<-done
		return
	}

	// The arduino doesn't always respond nicely to the first command it gets
	// so send the "Hello" command 5 times rather than once
	var i int
	for i < 5 {
		i++
		arduino.Write(cmd)
	}
	<-done
	return
}

/**
 * Reads a command response from the arduino.
 * @param  {int}   command The command that was sent
 * @return {error}         A timeout or read error
 */
func (arduino ArduinoConnection) readCommand(command int, ctx context.Context) error {
	for {
		// var buf = make([]byte, 8192)
		// nr, err := arduino.Read(buf)
		// if err == io.EOF {
		// 	return fmt.Errorf("Command response read timed out")
		// }
		//
		// // Convert returned bytes to string and trims \t, \n, ' ', etc
		// value := strings.TrimSpace(string(buf[:nr]))
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

/**
 * Creates a new arduino connection to be used elsewhere
 * @return {ArduinoConnection, error} The connection and any error
 */
func NewArduinoConnection(ctx context.Context) (ArduinoConnection, error) {
	// Discover TTYs
	matches, err := filepath.Glob("./virtual-tty")
	// matches, err := filepath.Glob("/dev/tty[A-Za-z]*")
	if err != nil {
		log.Fatalf("Failed to glob /dev/tty[A-Za-z]*")
	}

	// Attempt to connect to a discovered TTY and say hello to initialize
	var tty *serial.Port
	for _, match := range matches {
		c := &serial.Config{Name: match, Baud: 115200, ReadTimeout: 7 * time.Second}
		tty, err = serial.OpenPort(c)
		if err != nil {
			// Failed to open TTY
			continue
		}

		log.Debug("Opening", match)
		connection := ArduinoConnection{
			Interface: tty,
		}

		log.Debug("Attempting to say hello...")
		i := 0
		for i < 3 {
			success := connection.Command(0, ctx)
			if success {
				return connection, nil
			}
			i++
			log.Debugf("Attempt #%d failed", i)
		}

		return ArduinoConnection{}, fmt.Errorf("Failed to recieve hello response back")
	}

	panic("Failed to connect to any TTY")
}
