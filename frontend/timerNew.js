import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { fetchWorkout } from '/timerFetch.js'
import { processRoutine } from '/timerRun.js'

createApp({
	setup() {
		const message = ref('Hello World!')
		const workoutData = ref(null)
		const isLoading = ref(true)

		const workoutFetch = async() => {
			workoutData.value = await fetchWorkout()
			console.log("Data Fetched:", workoutData.value)
			//processRoutine(workoutData.value)
			isLoading.value = false
		}
		const start = async() => {
			await processRoutine(workoutData.value)
		}

		workoutFetch()
		return {
			message, workoutData, isLoading, start
		}
	}
}).mount('#app')
