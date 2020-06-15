package utils

import (
	"strconv"
	"strings"
	"time"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
)

/**
 * Parse a line of comma seperated data into a CabinReading struct
 * @param  {string}               line            The csv line to parse
 * @return {CabinReading, error} [reading, error] The struct and any error
 */
func ParseReading(line string) (reading models.CabinReading, err error) {
	data := strings.Split(line, ",")

	// Ensure we parse the non RFC 3339 timestamp from the arduino properly
	timeFormat := "2006-01-02 15:04:05"
	timestamp, err := time.Parse(timeFormat, data[0])
	if err != nil {
		return
	}

	// Parse the unix timestamp properly
	unix := int32(stringToFloat(data[1]))

	// Remove any newline from the trailing data point
	loads, err := strconv.Atoi(strings.TrimSpace(data[12]))
	if err != nil {
		return
	}

	reading = models.CabinReading{
		Timestamp:       timestamp,
		Unix:            unix,
		BatteryVoltage:  stringToFloat(data[2]),
		SolarVoltage:    stringToFloat(data[3]),
		BatteryAmperage: stringToFloat(data[4]),
		LoadAmperage:    stringToFloat(data[5]),
		BatteryPercent:  stringToFloat(data[6]),
		AvgBatteryPower: stringToFloat(data[7]),
		AvgLoadPower:    stringToFloat(data[8]),
		OutsideTemp:     stringToFloat(data[9]),
		CabinTemp:       stringToFloat(data[10]),
		BatteryTemp:     stringToFloat(data[11]),
		LoadsConnected:  loads,
	}
	return
}

/**
 * Returns a float64 from a given string
 * @param  {string}  s The string encoded float64
 * @return {float64} The parsed value
 */
func stringToFloat(s string) float64 {
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0.0
	}
	return val
}

// var lastLineSeen int64
//
// func ReadFromCabinometers(lines int32) (data []models.CabinReading, err error) {
// 	data, err = parseCsv("cabin_data_dump.csv", lines)
// 	return
// }
//
// // func StreamFromCabinometers() {
// // 	StreamCsv("cabin_data_dump.csv")
// // }
//
// // lineCounter is a super memory efficient line counting function as
// // it removes extra logic and buffering required to return whole
// // lines, and takes advantage of some assembly optimized functions
// // offered by the bytes package to search characters in a byte slice.
// func lineCounter(r io.Reader) (int32, error) {
// 	var count int32
// 	const lineBreak = '\n'
//
// 	buf := make([]byte, bufio.MaxScanTokenSize)
//
// 	for {
// 		bufferSize, err := r.Read(buf)
// 		if err != nil && err != io.EOF {
// 			return 0, err
// 		}
//
// 		var buffPosition int
// 		for {
// 			i := bytes.IndexByte(buf[buffPosition:], lineBreak)
// 			if i == -1 || bufferSize == buffPosition {
// 				break
// 			}
// 			buffPosition += i + 1
// 			count++
// 		}
// 		if err == io.EOF {
// 			break
// 		}
// 	}
//
// 	return count, nil
// }
//
// func StreamCsv(file string, notifier chan []byte) {
// 	t, err := follower.New(file, follower.Config{
// 		Whence: io.SeekEnd,
// 		Offset: 0,
// 		Reopen: true,
// 	})
//
// 	for line := range t.Lines() {
// 		if lastLineSeen == 0 {
// 			lastLineSeen += 1
// 			continue
// 		}
// 		var reading models.CabinReading
// 		reading, err = ParseReading(strings.Split(line.String(), ","))
// 		if err != nil {
// 			log.Println("Failed to parse line")
// 			// return
// 		}
// 		spew.Dump(reading)
// 		data, _ := json.Marshal(reading)
// 		notifier <- data
// 		lastLineSeen += 1
// 	}
//
// 	if t.Err() != nil {
// 		fmt.Fprintln(os.Stderr, t.Err())
// 	}
// }
//
// // parseCsv accepts a file and returns the last n lines of the file
// func parseCsv(filename string, lines int32) (readings []models.CabinReading, err error) {
// 	// Open CSV file
// 	f, err := os.Open(filename)
// 	if err != nil {
// 		return
// 	}
//
// 	length, err := lineCounter(f)
// 	if err != nil {
// 		return
// 	}
// 	f.Close()
// 	start := length - lines
// 	log.Println("Length: ", length)
// 	log.Println("Start: ", start)
//
// 	csvFile, err := os.Open(filename)
// 	if err != nil {
// 		return
// 	}
// 	defer csvFile.Close()
//
// 	var i int32
// 	rd := bufio.NewReader(csvFile)
// 	for {
// 		var line string
// 		line, err = rd.ReadString('\n')
// 		if err != nil {
// 			if err == io.EOF {
// 				break
// 			}
//
// 			log.Fatalf("read file line error: %v", err)
// 			return
// 		}
//
// 		if i == 0 || i < start {
// 			i++
// 			continue
// 		}
//
// 		var reading models.CabinReading
// 		reading, err = ParseReading(strings.Split(line, ","))
// 		if err != nil {
// 			log.Println("Failed to parse line")
// 			return
// 		}
// 		spew.Dump(reading)
// 		readings = append(readings, reading)
// 		i += 1
// 	}
// 	err = nil
// 	return
// }
