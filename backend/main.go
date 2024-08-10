package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

type Workout struct {
	Id	int
	Date int64
	//Data json.RawMessage `json:"data"`
	Data interface{} `json:"data"`
}

func main(){
	initDB()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /hello", func(w http.ResponseWriter, r *http.Request){
		fmt.Fprintf(w, "Hello World\n")
	})

	mux.HandleFunc("PUT /workout",putWorkout)

	http.ListenAndServe("0.0.0.0:8040", mux)
}

func putWorkout(w http.ResponseWriter, r *http.Request){
	var workout Workout
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&workout)
	
	if checkHTTPErr(err, w, r.RemoteAddr){
		return
	}
	dataJSON, err := json.Marshal(workout.Data)

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
