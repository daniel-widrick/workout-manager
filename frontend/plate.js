 import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
createApp({
	setup(){
		const targetWeight = ref(50)
		const barWeight = ref(45)
		const platesPerSide = ref([])
		const platesAvail = ref(
			{
				plates: {
					"45": 2,
					"25": 2,
					"10": 4,
					"5": 2,
					"2.5": 2,
				},
				list: ["45","25","10","5","2.5"],
			}
		)
		const platesAvailBck = JSON.parse(JSON.stringify(platesAvail.value))

		function targetWeightChange() {
			let curWeight = targetWeight.value - barWeight.value
			platesPerSide.value = []
			for( let i =0; i < platesAvail.value.list.length && curWeight >=0 ; i++){
				console.log("Remaining weight: " + curWeight)
				let curPlateWeight = platesAvail.value.list[i]
				let curPlateCount = platesAvail.value.plates[curPlateWeight]
				if(curPlateWeight*2 > curWeight || curPlateCount < 2){
					//Plate is too big or not enough plates to balance bar
					console.log("Plate: " + curPlateWeight + " too heavy for " + curWeight + " or not enough plates: " + curPlateCount)
					continue
				}
				console.log("Add plate:" + curPlateWeight)
				platesPerSide.value.push(curPlateWeight)
				curWeight -= curPlateWeight*2
				platesAvail.value.plates[curPlateWeight] -= 2;
				if(platesAvail.value.plates[curPlateWeight] >= 2)
				{
					i--
				}
			}
			if ( curWeight > 0 ){
				platesPerSide.value = "Weight Exceeds maximum available"
			}
			platesAvail.value = JSON.parse(JSON.stringify(platesAvailBck))
		}
		targetWeightChange()
		return { targetWeight, barWeight, platesAvail, targetWeightChange, platesPerSide }
	}
}).mount('#app')
