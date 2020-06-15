package arduino

import (
	"context"
	"fmt"
	"io"
	"regexp"
	"strings"
	"sync"

	"github.com/jmoiron/sqlx"
	log "github.com/sirupsen/logrus"

	"github.com/davecgh/go-spew/spew"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/utils"
)

/**
 * Begins streaming readings from the arduino
 * @param  {chan CabinReading} dataStream The channel to send CabinReadings to
 * @param  {chan bool} done The channel to detect a stream cancel on
 * @return {void}
 */
func (arduino ArduinoConnection) StreamData(dataStream chan models.CabinReading, wg *sync.WaitGroup, ctx context.Context) {
	defer wg.Done()

	// Command the arduino to start streaming
	success := arduino.Command(4)
	if !success {
		panic("Failed to initialize stream")
	}

	line := ""
	capturing := false

	// Loop until done
	for {
		select {
		case <-ctx.Done():
			// TODO: Send a command to stop the streaming on the arduino?
			log.Info("Data streaming stopped!")
			return
		default:
			// Read from the serial buffer
			var buf = make([]byte, 8192)
			nr, err := arduino.Read(buf)
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

				// Parse into a CabinReading struct
				reading, err := utils.ParseReading(line)
				if err != nil {
					log.Error("Failed to parse line")
					line = ""
					continue
				}

				spew.Dump(reading)    // TODO: Debug output. Remove or handle debug env
				dataStream <- reading // Pass CabinReading to the channel

				// Reset line and keep reading
				line = ""
				capturing = false
				continue
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

				reading, err := utils.ParseReading(line)
				if err != nil {
					log.Error("Failed to parse line")
					line = ""
					continue
				}

				spew.Dump(reading)
				dataStream <- reading

				line = ""
				capturing = false
				continue
			}

			// Handle lines that have an end delimiter only
			endSequence := regexp.MustCompile(">")
			if capturing && endSequence.MatchString(value) {
				reading, err := utils.ParseReading(line)
				if err != nil {
					log.Error("Failed to parse line")
					line = ""
					continue
				}

				spew.Dump(reading)
				dataStream <- reading

				line = ""
				capturing = false
				continue
			}

			// Handle lines with no delimiters if we've already seen a start delimiter
			if capturing {
				line = line + value
			}
		}
	}
}

/**
 * Requests historical data to be streamed to us via serial.
 * When a data point is read it is sent to the database.
 * All historical files are commanded to be deleted off of
 * the Arduino upon stream completion.
 * @param  {*sqlx.DB} db The database object
 * @return {[type]}         [description]
 */
func (arduino ArduinoConnection) SendHistoricalToDB(db *sqlx.DB) error {
	return nil
}

func (arduino ArduinoConnection) ReadLine() (output string, err error) {
	recieving := false
	var buf = make([]byte, 8192)
	for {
		var nr int
		nr, _ = arduino.Read(buf)

		data := strings.TrimSuffix(string(buf[:nr]), "\n")
		log.Infof("ReadLine: %s\n", data)
		if recieving {
			if data != ">" {
				output = output + data
			} else {
				output = strings.TrimSpace(output)
				return
			}
		}

		if data == "<" {
			recieving = true
			continue
		}
	}
}

func (arduino ArduinoConnection) listRootDirectory() (contents []string, err error) {
	if !arduino.Command(2) {
		err = fmt.Errorf("Command failed")
		return
	}

	log.Info("Command succeeded")

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

func (arduino ArduinoConnection) DownloadAllFiles() {
	directory, _ := arduino.listRootDirectory()
	log.Info(directory)
}

func (arduino ArduinoConnection) GetOfflineData() {
	done := make(chan bool, 1)

	go func() {
		// var buf = make([]byte, 8192)
		for {
			select {
			case <-done:
				log.Info("Quit!")
				return
			default:
				line, _ := arduino.ReadLine()
				log.Infof("Read: %s\n", line)
				if line == "<>" {
					close(done)
				}
			}
		}
	}()

	log.Info("Ctrl+C to quit")
	<-done
	log.Info("exiting")
}
