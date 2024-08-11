let currentSet = {}

export const processRoutine = async function(routine){
	console.log(routine)
	for(let set of routine){
		if(set.type === 'interval'){
			await handleInterval(set)
		} else {
			currentSet = JSON.parse(JSON.stringify(set))
			await handleSet(set)
			set.state = "done"
		}
	}
}

async function handleSet(set){
	return new Promise(resolve => {
		const interval = setInterval(() => {
			console.log(`${set.type}: ${set.length} seconds remaining`)
			set.length--
			if(set.length <= 0) {
				clearInterval(interval)
				set.length = currentSet.length
				resolve()
			}
		}, 1000)
	})
}

async function handleInterval(interval){
	//console.log("Interval: ",interval)
	for(let i = 0; i < interval.repeat; interval.repeat--){
		console.log("---Interval Start---")
		for(let set of interval.routine){
			currentSet = JSON.parse(JSON.stringify(set))
			await handleSet(set)
		}
		console.log("---Interval End---")
	}
}
