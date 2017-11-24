package main

import (
	"database"
	"encoding/json"
	"fmt"
	"github.com/julienschmidt/httprouter"
	"log"
	"net/http"
	"os"
	"io/ioutil"
	"os/exec"
	"io"
	"bufio"
)

type PowerData struct {
	Solar float64 `json:"solar"`
	Pelton float64 `json:"pelton"`
	Battery float64 `json:"battery"`
}


func fetchPowerStats(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// That's SO fetch
	setCors(w)
	cmd := exec.Command("python3", "scripts/powerData.py")
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	err = cmd.Start()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	go copyOutput(stdout)
	go copyOutput(stderr)
	cmd.Wait()
}

func copyOutput(r io.Reader) {
    scanner := bufio.NewScanner(r)
    for scanner.Scan() {
        fmt.Println(scanner.Text())
    }
}

func toJson(p interface{}) []byte {
	bytes, err := json.Marshal(p)
	if err != nil {
		os.Exit(1)
	}

	return bytes
}

func readPowerStats(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	setCors(w)
	raw, err := ioutil.ReadFile("./scripts/data.json")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var powerData []PowerData
	json.Unmarshal(raw, &powerData)
	res := toJson(powerData)
	if res == nil {
		http.Error(w, "Error in json marshalling", 500)
		return
	}
	w.Write(res)
}

// CRUD Route Handlers
func createPostHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	setCors(w)
	decoder := json.NewDecoder(r.Body)
	var newPost database.Post
	if err := decoder.Decode(&newPost); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	database.DB.Create(&newPost)
	res, err := json.Marshal(newPost)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Write(res)
}

func deletePostHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	setCors(w)
	var deletedPost database.Post
	database.DB.Where("ID = ?", ps.ByName("postId")).Delete(&deletedPost) // write now this returns a blank item not the deleted item
	res, err := json.Marshal(deletedPost)
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

	w.Write(res)
}

func updatePostHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	setCors(w)
	type body struct {
		Members  string
		Entry string
		Files string
		Datetime string
	}
	var updates body
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&updates); err != nil {
		http.Error(w, err.Error(), 400)
	}

	var updatedPost database.Post
	database.DB.Where("ID = ?", ps.ByName("postId")).First(&updatedPost)
	updatedPost.Members = updates.Members
	updatedPost.Entry = updates.Entry
	updatedPost.Files = updates.Files
	updatedPost.Datetime = updates.Datetime
	database.DB.Save(&updatedPost)
	res, err := json.Marshal(updatedPost)
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

	w.Write(res)
}

func showPostHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	setCors(w)
	var post database.Post
	database.DB.Where("ID = ?", ps.ByName("postId")).First(&post)
	res, err := json.Marshal(post)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Write(res)
}

func indexPostHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	setCors(w)
	var posts []database.Post
	database.DB.Find(&posts)
	res, err := json.Marshal(posts)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Write(res)
}

func indexHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	setCors(w)
	fmt.Fprintf(w, "This is the RESTful api")
}

// used for COR preflight checks
func corsHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	setCors(w)
}

// util
func getFrontendUrl() string {
	if os.Getenv("APP_ENV") == "production" {
		return "http://localhost:3000" // change this to production domain
	} else {
		return "http://localhost:3000"
	}
}

func setCors(w http.ResponseWriter) {
	frontendUrl := getFrontendUrl()
	w.Header().Set("Access-Control-Allow-Origin", frontendUrl)
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS, POST, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// Temporary Canary test to make sure Travis-CI is working
func Canary(word string) string {
	return word
}

func main() {
	defer database.DB.Close()

	// add router and routes
	router := httprouter.New()
	router.GET("/", indexHandler)
	router.POST("/posts", createPostHandler)
	router.GET("/posts/:postId", showPostHandler)
	router.DELETE("/posts/:postId", deletePostHandler)
	router.PUT("/posts/:postId", updatePostHandler)
	router.GET("/posts", indexPostHandler)
	router.OPTIONS("/*any", corsHandler)
	router.GET("/powerData", readPowerStats)
	router.POST("/fetch", fetchPowerStats)

	// add database
	_, err := database.Init()
	if err != nil {
		log.Println("connection to DB failed, aborting...")
		log.Fatal(err)
	}

	log.Println("connected to DB")

	// print env
	env := os.Getenv("APP_ENV")
	if env == "production" {
		log.Println("Running api server in production mode")
	} else {
		log.Println("Running api server in dev mode")
	}

	http.ListenAndServe(":8080", router)
}
