package arduino

import (
	"context"
	"fmt"
	"io"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/utils"
	"github.com/sirupsen/logrus"
)

// StreamData begins streaming readings from the arduino.
// Data will be read from the arduino, sent to the database,
// and pushed as a sever sent event.
func (arduino Connection) StreamData(ctx context.Context, dataStream chan models.CabinReading, wg *sync.WaitGroup) {
	var streaming bool
	defer wg.Done()

	// Command the arduino to start streaming
	success := arduino.Command(ctx, 4)
	if !success {
		// TODO: Try again a few times and don't panic?
		panic("Failed to initialize stream")
	}
	streaming = true
	logrus.Info("Arduino data stream instantiated")

	// Loop until done
	for {
		select {
		case <-ctx.Done():
			if streaming {
				arduino.CancelStreaming(ctx)
			}
			logrus.Info("Data streaming stopped!")
			return
		default:
			line, err := arduino.ReadLine(ctx, false)
			if err != nil {
				if !strings.Contains(fmt.Sprint(err), "shutdown") {
					logrus.Error(err)
					continue
				}
				continue
			}

			// Parse into a CabinReading struct
			reading, err := models.ParseCabinReading(line)
			if err != nil {
				logrus.Error("Failed to parse line")
				logrus.Error(err)
				continue
			}

			reading.SendToDB(arduino.DB, arduino.Mutex) // Insert the datapoint to our database
			dataStream <- reading                       // Pass CabinReading to the channel
			continue
		}
	}
}

// CancelStreaming sends a <8> command to the Arduino
// and disregards the response to toggle data streaming before shutdown.
func (arduino Connection) CancelStreaming(ctx context.Context) {
	cmd := fmt.Sprintf("<8>") // Format our command for serial
	arduino.Write(cmd)
}

// SendHistoricalToDB requests historical data to be streamed to us via serial.
// When a data point is read it is sent to the database.
// All historical files are commanded to be deleted off of
// the Arduino upon stream completion.
func (arduino Connection) SendHistoricalToDB(ctx context.Context, dataStream chan models.CabinReading) error {
	// Get file locations from arduino
	files, err := arduino.listRootDirectory(ctx)
	if err != nil {
		return err
	}
	// loop over files
	for _, file := range files {
		success := make(chan bool, 1) // Create an execution blocker
		done := make(chan bool, 1)

		// Continually listen for the command response while we send the command
		go func() {
			err := arduino.readCommand(ctx, 1)
			if err != nil {
				// Release execution blocker and exit the goroutine
				logrus.Errorf("Error executing command: %v", err)
				success <- false
				close(success)
				return
			}
			success <- true
			close(success)
		}()

		// Read out lines of a file and send them to the database and events service
		go func() {
			// Wait for command success/fail notification
			shouldProgress := <-success
			if !shouldProgress {
				err = fmt.Errorf("Command for file %s failed", file)
				close(done)
				return
			}

			var file string

			//Label this loop so we can break it from within the for select statement
		readLoop:
			for {
				select {
				case <-ctx.Done():
					logrus.Debugf("Cancelling historical stream of %s due to shutdown", file)
					close(done)
					return
				default:
					var nr int
					buf := make([]byte, 8192)
					nr, err = arduino.Read(buf)
					if err != nil {
						logrus.Error(err)
						return
					}
					if err != nil {
						if err == io.EOF {
							break
						}
					}

					stringBuf := string(buf[:nr])
					file += stringBuf
					endSequence := regexp.MustCompile("<")
					if endSequence.MatchString(stringBuf) {
						break readLoop
					}
				}
			}

			lines := strings.Split(file, "\n")
			for _, line := range lines {
				if strings.Contains(line, "#") {
					continue
				}

				// Parse into a CabinReading struct
				reading, err := models.ParseCabinReading(line)
				if err != nil {
					if strings.Contains(line, "<") || line == "" {
						continue
					}
					logrus.Error("Failed to parse line:", line)
					continue
				}

				reading.SendToDB(arduino.DB, arduino.Mutex) // Insert the datapoint to our database
				dataStream <- reading                       // Pass CabinReading to the channel
			}
			close(done)
		}()

		logrus.Debugf("Requesting %s", file)
		arduino.Write("<" + file + ">")
		<-done
		logrus.Info(file, " loaded into database")
	}
	return err
}

// SyncSystemTime synchronizes the RPi's system time with the Arduino.
func (arduino Connection) SyncSystemTime(ctx context.Context) error {
	success := arduino.Command(ctx, 5)
	if !success {
		return fmt.Errorf("Failed to obtain response from command <5>")
	}

	line, err := arduino.ReadLine(ctx, true)
	if err != nil {
		return err
	}

	unix, err := strconv.ParseInt(line, 10, 64)
	if err != nil {
		return err
	}

	arduinoTime := time.Unix(unix, 0)
	err = utils.SetSystemDate(arduinoTime)
	if err != nil {
		return err
	}

	return nil
}

// listRootDirectory retrieves an array containing the filepaths to log files on the arduino.
func (arduino Connection) listRootDirectory(ctx context.Context) (filenames []string, err error) {
	if !arduino.Command(ctx, 2) {
		err = fmt.Errorf("Command failed")
		return
	}

	var data string
	for {
		var nr int
		buf := make([]byte, 8192)
		nr, err = arduino.Read(buf)
		if err != nil {
			logrus.Error(err)
			continue
		}
		stringBuf := string(buf[:nr])
		endSequence := regexp.MustCompile("<>")
		data += stringBuf
		if endSequence.MatchString(stringBuf) {
			break
		}
	}

	filenameRegex := regexp.MustCompile(`(?i)<(.*?\.csv)>`)
	matches := filenameRegex.FindAllStringSubmatch(data, -1)

	for _, match := range matches {
		filenames = append(filenames, match[1])
	}

	return
}
