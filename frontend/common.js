export const fetchWorkout = async(d) => {
	return new Promise((resolve, reject) => {
		const t = Math.floor(d)
		console.log("Fetching: /workout/",t)
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

export function formatLength(len){
	console.log("New Len:",len)
	return new Date(len * 1000).toISOString().slice(11,19)
}
