export const fetchWorkout = async() => {
	return new Promise((resolve, reject) => {
		fetch("/workout.json").then((response) => {
			if(!response.ok) {
				reject(`HTTP error: ${response.status}`);
			} else {
				return response.json()
			}
		}).then((data) => {
			let workoutData = data.routine
			resolve(workoutData)
		}).catch((error) => {
			reject(`Fetch error: ${error.message}`)
		})
	})
}
