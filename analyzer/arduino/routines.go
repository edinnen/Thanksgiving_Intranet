package arduino

import (
	"context"
	"fmt"
	"io"
	"regexp"
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
 * @param  {chan bool} done The channel to detect a stream cancel on
 * @return {void}
 */
func (arduino ArduinoConnection) StreamData(dataStream chan models.CabinReading, db *sqlx.DB, wg *sync.WaitGroup, ctx context.Context) {
	defer wg.Done()

	// Command the arduino to start streaming
	success := arduino.Command(4, ctx)
	if !success {
		panic("Failed to initialize stream")
	}

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
			reading, err := utils.ParseReading(line)
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
 * @param  {*sqlx.DB} db  The database object
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
					reading, err := utils.ParseReading(line)
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
 * Reads a single line, delimeted by < and >, from the arduino.
 * @param  {context.Context} ctx 			  The application context
 * @return {string, error}   line, err  The read line and any error
 */
func (arduino ArduinoConnection) ReadLine(ctx context.Context, enableTimeout bool) (line string, err error) {
	capturing := false
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

			value := strings.TrimSpace(string(buf[:nr]))

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
				capturing = true

				// Ensure the line is empty as this is a new start delimiter
				if line != "" {
					line = ""
				}
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
				line = line + value
			}
		}
	}
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
	for i < 1000 {
		i++

		var buf = make([]byte, 8192)
		nr, _ := arduino.Read(buf)
		line := strings.TrimSpace(string(buf[:nr]))

		if strings.Contains(line, ".ON") || strings.Contains(line, ".OFF") {
			contents = append(contents, line)
		}

		if strings.Contains(line, "<>") {
			return
		}
	}
	err = fmt.Errorf("Failed to reach end of listRootDirectory read")
	return
}
