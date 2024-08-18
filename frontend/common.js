export const fetchWorkout = async(d) => {
	return new Promise((resolve, reject) => {
		const t = Math.floor(d)
		fetch("/workout/"+t).then((response) => {
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

export const putWorkout = async(workout) => {
	console.log("Updating Workout:",workout)
	console.log(JSON.stringify(workout))
	return new Promise((resolve, reject) => {
		fetch("/workout",{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(workout),
		}).then(response => {
			if(!response.ok) {
				reject(`Put error: ${response.status}`)
			}
			else{
				resolve(workout)
			}
		}).catch((error) => {
			reject(`Fetch error: ${error.message}`)
		})
	})
}

export function formatLength(len){
	console.log("New Len:",len)
	return new Date(len * 1000).toISOString().slice(11,19)
}
