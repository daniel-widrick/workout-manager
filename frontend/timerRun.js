let currentSet = {}
window.TimerRun = true

export const processRoutine = async function(routine){
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
			set.active="active"
			if(!window.TimerRun){
				return
			}
			set.length--
			window.statusMessage.value = `${set.type} for ${ new Date(set.length * 1000).toISOString().slice(11, 19)}`
			if(set.length <= 0) {
				clearInterval(interval)
				set.length = currentSet.length
				set.active="done"
				resolve()
			}
		}, 1000)
	})
}

async function handleInterval(interval){
	//console.log("Interval: ",interval)
	interval.active="intervalActive"
	for(let i = 0; i < interval.repeat; interval.repeat--){
		//Reset sets to not done
		for(let set of interval.routine){
			set.active=""
		}
		for(let set of interval.routine){
			currentSet = JSON.parse(JSON.stringify(set))
			await handleSet(set)
		}
	}
	interval.active="done"
}
