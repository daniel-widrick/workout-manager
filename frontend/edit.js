import { createApp, ref} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { fetchWorkout,formatLength } from '/common.js'

createApp({
	setup(){
		const workoutDate = ref(new Date())
		const workoutData = ref([])
		const workoutTypes = ref(['walk','run','interval'])
		const addWorkoutType = ref('walk')
		const addWorkoutLength = ref(30)
		const addIntervalType = ref('walk')
		const addIntervalLength = ref(30)

		const prevDate = () => {
			changeDate(-1)
		}
		const nextDate = () => {
			changeDate(1)
		}
		function changeDate(delta) {
			let d = workoutDate.value
			workoutDate.value = new Date(d.setDate(d.getDate() + delta))
			workoutFetch()
		}
		function removeSet(set) {
			workoutData.value = workoutData.value.filter((w) => w !== set)
		}
		function addSet() {
			if( addWorkoutType.value !== 'interval'){
				workoutData.value.push( { type: addWorkoutType.value, length: addWorkoutLength.value } )
			}
			else{
				const i = { type: 'interval', repeat: addWorkoutLength.value, routine: [] }
				workoutData.value.push(i)
			}
		}
		function removeIntervalSet(set,iSet) {
			set.routine = set.routine.filter((s) => s !== iSet)
		}

		const workoutFetch = async() => {
			const t = workoutDate.value.getTime() / 1000
			try{
				workoutData.value = await fetchWorkout(t)
			}
			catch(e){
				console.log("Error fetching workout:",e)
				workoutData.value = []
			}
			console.log(workoutData.value)
		}
		function addIntervalSet(set) {
			set.routine.push({type: addIntervalType.value, length: addIntervalLength.value})
		}

		workoutFetch()

	return {
		workoutDate, nextDate, prevDate, workoutData, formatLength, workoutTypes,
		removeSet, addSet, addWorkoutType, addWorkoutLength, removeIntervalSet,
		addIntervalType, addIntervalLength, addIntervalSet
	}}
}).mount('#app')
