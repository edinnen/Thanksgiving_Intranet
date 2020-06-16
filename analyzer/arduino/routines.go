package arduino

import (
	"context"
	"fmt"
	"io"
	"strings"
	"sync"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/jmoiron/sqlx"
	log "github.com/sirupsen/logrus"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/utils"
)

/**
 * Begins streaming readings from the arduino.
 * @param  {chan CabinReading} dataStream The channel to send CabinReadings to
 * @param  {*sqlx.DB}          db The database connection
 * @param  {*sync.WaitGroup}   wg The wait group the call is a member of
 * @param  {context.Context}   ctx The application context
 * @return {void}
 */
func (arduino ArduinoConnection) StreamData(dataStream chan models.CabinReading, db *sqlx.DB, wg *sync.WaitGroup, ctx context.Context) {
	defer wg.Done()

	// Command the arduino to start streaming
	success := arduino.Command(4, ctx)
	if !success {
		// TODO: Try again a few times and don't panic?
		panic("Failed to initialize stream")
	}
	log.Info("Arduino data stream instantiated")

	// Loop until done
	for {
		select {
		case <-ctx.Done():
			// TODO: Send a command to stop the streaming on the arduino?
			log.Info("Data streaming stopped!")
			return
		default:
			line, err := arduino.ReadLine(ctx, false)
			if err != nil {
				if !strings.Contains(fmt.Sprint(err), "shutdown") {
					log.Error(err)
					continue
				}
				continue
			}
			// Parse into a CabinReading struct
			reading, err := models.ParseCabinReading(line)
			if err != nil {
				log.Error("Failed to parse line")
				line = ""
				continue
			}

			spew.Dump(reading)    // TODO: Debug output. Remove or handle debug env
			reading.SendToDB(db)  // Insert the datapoint to our database
			dataStream <- reading // Pass CabinReading to the channel
			continue
		}
	}
}

/**
 * Requests historical data to be streamed to us via serial.
 * When a data point is read it is sent to the database.
 * All historical files are commanded to be deleted off of
 * the Arduino upon stream completion.
 * @param  {chan CabinReading} dataStream The channel to send CabinReadings to
 * @param  {*sqlx.DB}          db The database connection
 * @param  {context.Context}   ctx The application context
 * @return {error}        An error, if any
 */
func (arduino ArduinoConnection) SendHistoricalToDB(dataStream chan models.CabinReading, db *sqlx.DB, ctx context.Context) error {
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
			err := arduino.readCommand(1, ctx)
			if err != nil {
				// Release execution blocker and exit the goroutine
				log.Errorf("Error executing command: %v", err)
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

			for {
				select {
				case <-ctx.Done():
					log.Debugf("Cancelling historical stream of %s due to shutdown", file)
					close(done)
					return
				default:
					line, err := arduino.ReadLine(ctx, false)
					if err != nil {
						if err == io.EOF {
							close(done)
							return
						}
						log.Error(err)
						continue
					}
					// Parse into a CabinReading struct
					reading, err := models.ParseCabinReading(line)
					if err != nil {
						log.Error("Failed to parse line")
						line = ""
						continue
					}

					spew.Dump(reading)    // TODO: Debug output. Remove or handle debug env
					reading.SendToDB(db)  // Insert the datapoint to our database
					dataStream <- reading // Pass CabinReading to the channel
				}
			}
		}()

		arduino.Write("<" + file + ">")
		<-done
	}
	return err
}

/**
 * Synchronizes the RPi's system time with the Arduino.
 * @param {context.Context} ctx The application context
 */
func (arduino ArduinoConnection) SyncSystemTime(ctx context.Context) error {
	success := arduino.Command(5, ctx)
	if !success {
		return fmt.Errorf("Failed to obtain response from command <5>")
	}

	line, err := arduino.ReadLine(ctx, true)
	if err != nil {
		return err
	}

	timeFormat := "2006-01-02 15:04:05"
	arduinoTime, err := time.Parse(timeFormat, line)
	if err != nil {
		return err
	}

	err = utils.SetSystemDate(arduinoTime)
	if err != nil {
		return err
	}

	return nil
}

/**
 * Retrieves an array containing the filepaths to log files on the arduino.
 * @param  {context.Context} ctx 					  The application context
 * @return {[]string, error} contents, err  The list of filepaths and any error
 */
func (arduino ArduinoConnection) listRootDirectory(ctx context.Context) (contents []string, err error) {
	// TODO: Maybe enclose individual filepath lines from arduino with angle delimiters to make this more accurate

	if !arduino.Command(2, ctx) {
		err = fmt.Errorf("Command failed")
		return
	}

	log.Debug("Command succeeded")

	i := 0
	for i < 10000 { // Read in at most 10,000 lines
		i++
		// Read in a <> encolsed line
		line, err := arduino.ReadLine(ctx, false)

		if err != nil {
			switch err {
			case io.EOF: // We've reached the end of the file, return contents
				return contents, nil
			default:
				return contents, err // Some other error, return it
			}
		}
		if err == io.EOF {
			return contents, nil
		} else if err != nil {
			return contents, err
		}

		// Select only .ON or .OFF log files
		if strings.Contains(line, ".ON") || strings.Contains(line, ".OFF") {
			contents = append(contents, line)
		}
	}
	err = fmt.Errorf("Failed to reach end of listRootDirectory read")
	return
}
