import { createApp, ref, onMounted, onUnmounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { fetchWorkout,formatLength } from '/common.js'
import { processRoutine } from '/timerRun.js'


createApp({
	setup() {
		const message = ref('Hello World!')
		const workoutData = ref(null)
		const isLoading = ref(true)
		const startEnabled = ref(true)
		const statusMessage = ref("")

		window.statusMessage = statusMessage
		let workoutDataReset = {}
		let oldMessage = ""

		const workoutFetch = async() => {
			workoutData.value = await fetchWorkout()
			console.log("Data Fetched:", workoutData.value)
			//processRoutine(workoutData.value)
			isLoading.value = false
			workoutDataReset = JSON.parse(JSON.stringify(workoutData.value))
		}
		const start = async(event) => {
			event.stopPropagation()
			window.TimerRun=true
			startEnabled.value=false
			await processRoutine(workoutData.value)
			startEnabled.value=true
			workoutData.value = JSON.parse(JSON.stringify(workoutDataReset))
			window.statusMessage.value = "COMPLETE!"
		}
		const pauseToggle = async() => {
			window.TimerRun=(!window.TimerRun)
			if(!window.TimerRun){
				oldMessage = statusMessage.value
				statusMessage.value = "PAUSED"
			} else {
				statusMessage.value = oldMessage
			}
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
			message, workoutData, isLoading, start, startEnabled, statusMessage, formatLength
		}
		
	}
}).mount('#app')
