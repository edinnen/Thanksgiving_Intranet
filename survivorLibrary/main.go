package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/dustin/go-humanize"
	"github.com/gocolly/colly/v2"
	"github.com/sirupsen/logrus"
)

const baseURL = "http://www.survivorlibrary.com"

var directory string

// RESTART AT POTTERY

func main() {
	c := colly.NewCollector()

	c.OnXML("/html/body/div/div/div/main/div[2]/div[3]/center/table/tbody/tr/td/a", func(e *colly.XMLElement) {
		link := e.Attr("href")

		directoryRegexp := regexp.MustCompile(`.*category/\d+-library-(.*)`)
		directory = fmt.Sprintf("documents/%s", directoryRegexp.FindStringSubmatch(link)[1])

		if _, err := os.Stat(directory); !os.IsNotExist(err) {
			// path/to/whatever exists
			logrus.Warnf("Directory %s exists. Skipping...", directory)
			return
		}

		os.MkdirAll(directory, os.ModePerm)
		logrus.Infof("Entering directory %s", directory)

		e.Request.Visit(link)
	})

	c.OnXML("/html/body/div/div/div/main/div[2]/div[2]/table/tbody/tr//a", func(e *colly.XMLElement) {
		pdfLink := e.Attr("href")

		filenameRegexp := regexp.MustCompile("/library/(.*)")
		filename := filenameRegexp.FindStringSubmatch(pdfLink)
		logrus.Infof("Downloading %s", filename[1])
		err := DownloadFile(filename[1], pdfLink)
		if err != nil {
			panic(err)
		}
	})

	url := fmt.Sprintf("%s/library-download.html", baseURL)
	c.Visit(url)
}

// WriteCounter counts the number of bytes written to it. It implements to the io.Writer interface
// and we can pass this into io.TeeReader() which will report progress on each write cycle.
type WriteCounter struct {
	Total uint64
}

func (wc *WriteCounter) Write(p []byte) (int, error) {
	n := len(p)
	wc.Total += uint64(n)
	wc.PrintProgress()
	return n, nil
}

// PrintProgress prints our download progress
func (wc WriteCounter) PrintProgress() {
	// Clear the line by using a character return to go back to the start and remove
	// the remaining characters by filling it with spaces
	fmt.Printf("\r%s", strings.Repeat(" ", 35))

	// Return again and print current status of download
	// We use the humanize package to print the bytes in a meaningful way (e.g. 10 MB)
	fmt.Printf("\rDownloading... %s complete", humanize.Bytes(wc.Total))
}

// DownloadFile will download a url to a local file. It's efficient because it will
// write as it downloads and not load the whole file into memory. We pass an io.TeeReader
// into Copy() to report progress on the download.
func DownloadFile(path string, url string) error {
	filepath := fmt.Sprintf("%s/%s", directory, path)

	// Create the file, but give it a tmp file extension, this means we won't overwrite a
	// file until it's downloaded, but we'll remove the tmp extension once downloaded.
	out, err := os.Create(filepath + ".tmp")
	if err != nil {
		return err
	}

	// Get the data
	resp, err := http.Get(fmt.Sprintf("%s%s", baseURL, url))
	if err != nil {
		out.Close()
		return err
	}
	defer resp.Body.Close()

	// Create our progress reporter and pass it to be used alongside our writer
	counter := &WriteCounter{}
	if _, err = io.Copy(out, io.TeeReader(resp.Body, counter)); err != nil {
		out.Close()
		return err
	}

	// The progress use the same line so print a new line once it's finished downloading
	fmt.Print("\n")

	// Close the file without defer so it can happen before Rename()
	out.Close()

	if err = os.Rename(filepath+".tmp", filepath); err != nil {
		return err
	}
	return nil
}
