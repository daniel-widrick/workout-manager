import { createApp, ref, onMounted, onUnmounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
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
		const start = async(event) => {
			event.stopPropagation()
			window.TimerRun=true
			await processRoutine(workoutData.value)
		}
		const pauseToggle = async() => {
			window.TimerRun=(!window.TimerRun)
		}

		//Fetch Workout Data
		workoutFetch()

		//Clicking on body toggles timer pause
		onMounted(() => {
			document.body.addEventListener('click',pauseToggle)
		})
		onUnmounted(() => {
			document.body.removeEventListener('click',pauseToggle)
		})

		//export
		return {
			message, workoutData, isLoading, start
		}
		
	}
}).mount('#app')
