package utils

import (
	"fmt"
	"os/exec"
	"strconv"
	"time"
)

/**
 * Sets the system date and clock.
 * @param {time.Time} newTime The time to set the clock to
 * @return {error} Any error. 'date' binary does not exist or setting failed
 */
func SetSystemDate(newTime time.Time) error {
	_, lookErr := exec.LookPath("date")
	if lookErr != nil {
		fmt.Printf("Date binary not found, cannot set system date: %s\n", lookErr.Error())
		return lookErr
	} else {
		//dateString := newTime.Format("2006-01-2 15:4:5")
		dateString := newTime.Format("2 Jan 2006 15:04:05")
		fmt.Printf("Setting system date to: %s\n", dateString)
		args := []string{"--set", dateString}
		return exec.Command("date", args...).Run()
	}
}

/**
 * Returns a float64 from a given string
 * @param  {string}  s The string encoded float64
 * @return {float64} The parsed value
 */
func StringToFloat(s string) float64 {
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
