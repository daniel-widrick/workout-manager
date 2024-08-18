package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Workout struct {
	Id	int
	Date int64
	//Data json.RawMessage `json:"data"`
	//Routine interface{} `json:"routine"`
	Routine json.RawMessage `json:"routine"`
}

func main(){
	fmt.Println("Initializing")
	initDB()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /hello/", func(w http.ResponseWriter, r *http.Request){
		fmt.Fprintf(w, "Hello World\n")
	})

	mux.HandleFunc("GET /workout/{date}",getWorkout)
	mux.HandleFunc("GET /workout/",getWorkout)
	mux.HandleFunc("PUT /workout",putWorkout)
	mux.HandleFunc("GET /timer",getStatic)
	mux.HandleFunc("GET /timer.js",getStatic)
	mux.HandleFunc("GET /timer.html",getStatic)
	mux.HandleFunc("GET /style.css",getStatic)
	mux.HandleFunc("GET /common.js",getStatic)
	mux.HandleFunc("GET /timerRun.js",getStatic)
	mux.HandleFunc("GET /edit",getStatic)
	mux.HandleFunc("GET /edit.js",getStatic)

	http.ListenAndServe("0.0.0.0:8040", mux)
}


func getStatic(w http.ResponseWriter, r *http.Request){
	var requestFile = ""
	var contentType = "text/html"

	switch r.URL.Path {
		case "/timer":
			requestFile = "../frontend/timer.html"
		case "/timer.js":
			requestFile = "../frontend/timer.js"
			contentType = "application/javascript"
		case "/style.css":
			requestFile = "../frontend/style.css"
		case "/common.js":
			requestFile = "../frontend/common.js"
			contentType = "application/javascript"
		case "/timerRun.js":
			requestFile = "../frontend/timerRun.js"
			contentType = "application/javascript"
		case "/edit":
			requestFile = "../frontend/edit.html"
		case "/edit.js":
			requestFile = "../frontend/edit.js"
			contentType = "application/javascript"
	}


	filePath := filepath.Clean(requestFile)
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, "Error: File not Found",http.StatusNotFound)
		return
	}
	defer file.Close()

	fileInfo, err := os.Stat(filePath)
	if err != nil {
		http.Error(w, "Error: File not Found",http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", contentType)
	http.ServeContent(w, r, "timer.html", fileInfo.ModTime(), file)
}
func getWorkout(w http.ResponseWriter, r *http.Request){
	//TODO DB lookup
	date := r.PathValue("date")
	var datestamp int64
	if date == "" {
		datestamp = time.Now().Unix()
		fmt.Println("Empty Date field.. using today")
	} else {
		v, err := strconv.ParseInt(date,10,64)
		if err != nil {
			fmt.Println("Couldn't parse datestamp from url:",date,err)
			datestamp = time.Now().Unix()
		} else {
			datestamp = v
			fmt.Println("Parsed date:",datestamp)
		}
	}
	noonTime := validateDate(datestamp)
	fmt.Println("Noon:",noonTime)

	db, err := sql.Open("sqlite3","./data/workout.db")
	if err != nil {
		http.Error(w, "Error: Unable to open Database", http.StatusInternalServerError)
		return
	}
	defer db.Close()
	sql := `SELECT id, Date, Data FROM workouts where Date >= ? AND Date <= ?`
	stmt, err := db.Prepare(sql)
	if err != nil {
		http.Error(w, "Error: Unable to prepare sql statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	rows, err := stmt.Query(noonTime - 3600, noonTime + 3600)
	fmt.Printf("SELECT id, Date, Data FROM workouts WHERE Date >= %s AND Date <= %s\n",
		fmt.Sprint(noonTime-3600),fmt.Sprint(noonTime+3600))
	if err != nil {
		errText := "Error: Unable to retrieve rows for requested date"
		http.Error(w, errText, http.StatusInternalServerError)
		return
	}
	if !rows.Next() || rows.Err() != nil {
		http.Error(w, "Error: Unable to retrieve row", http.StatusInternalServerError)
		fmt.Println(rows.Err())
		return
	}

	var workout Workout;
	if err := rows.Scan(&workout.Id, &workout.Date, &workout.Routine); err != nil {
		http.Error(w, "Error reading row", http.StatusInternalServerError)
		log.Println(err)
		return
	}
	defer rows.Close()

	//dataString := string(workout.Routine.([]byte))
	//workout.Routine = dataString
	workoutOutput, err := json.Marshal(workout)
	if err != nil {
		http.Error(w, "Error: Unable to encode workout", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type","application/json")
	fmt.Fprintf(w, "%s", string(workoutOutput))
	fmt.Println(string(workoutOutput))
}

func putWorkout(w http.ResponseWriter, r *http.Request){
	fmt.Println("GOT PUT REQUEST!!")
	var workout Workout
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&workout)
	
	if checkHTTPErr(err, w, r.RemoteAddr){
		return
	}
	workout.Date = validateDate(workout.Date)
	dataJSON, err := json.Marshal(workout.Routine)

	db, err := sql.Open("sqlite3","./data/workout.db")
	defer db.Close()
	if err != nil {
		http.Error(w, "Error: Unable to open Database", http.StatusInternalServerError)
		return
	}
	fmt.Println("database open")

	sql := `INSERT INTO workouts(id, date, data) values(null, ?, ?)
		ON CONFLICT(date) DO UPDATE SET data=excluded.data`
	stmt, err := db.Prepare(sql)
	defer stmt.Close()
	if err != nil {
		http.Error(w, "Error: SQL Syntax" + err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println("Insert statement prepared")
	_, err = stmt.Exec(workout.Date, dataJSON)
	fmt.Println(dataJSON)
	if err != nil {
		http.Error(w, "Error: SQL Statement Execution failed", http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "Workout added")
}

func initDB(){
	os.MkdirAll("./data/",0755)
	db, err := sql.Open("sqlite3","./data/workout.db")
	checkErr(err)
	defer db.Close()

	sql := `CREATE TABLE IF NOT EXISTS 'workouts' (
		'id' INTEGER PRIMARY KEY AUTOINCREMENT,
		'date' INTEGER NOT NULL UNIQUE,
		'data' TEXT)`
	stmt, err := db.Prepare(sql)
	defer stmt.Close()
	checkErr(err)
	_, err = stmt.Exec()
	checkErr(err)

	sql = "CREATE INDEX IF NOT EXISTS idx_workout_data ON workouts(date)"
	idx_stmt, err := db.Prepare(sql)
	defer stmt.Close()
	checkErr(err)
	_, err = idx_stmt.Exec()
	checkErr(err)
}

	

func checkHTTPErr(err error, w http.ResponseWriter, r string) bool {
	if err != nil {
		log.Printf("%s :: %s\n", r, err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return true
	}
	return false
}
func checkErr(err error){
	//Dirty function to clean up syntax
	if err != nil {
		log.Fatal(err)
	}
}
func validateDate(date int64) int64 {
	t := time.Unix(date, 0)
	noonTime := time.Date(t.Year(), t.Month(), t.Day(), 12, 0, 0, 0, t.Location())
	newTimeStamp := noonTime.Unix()
	return newTimeStamp
}
