function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

const createLineChart = (chartId, type, title, yAxis_title, valueSuffix, sensorId) => {
	return Highcharts.chart(chartId, {
		chart: {
			type: type,
			animation: Highcharts.svg, // don't animate in old IE
			marginRight: 10,
			events: {
				load: async function () {
					this.showLoading('')
					let series = this.series[0]

					const res = await fetch(`/bieu-do-cam-bien/records/${sensorId}?num=350`)
					const records = await res.json()
					let currentTimestamp = records[0].Timestamp
					const data = []
					for (const record of records) {
						data.push([
							(new Date(record.Timestamp)).getTime(),
							record[sensorId]
						])
					}

					series.setData(data)
					this.hideLoading()

					let updateData = setInterval(async () => {
						if (series.data === undefined)
							return clearInterval(updateData)

						const res = await fetch(`/bieu-do-cam-bien/records/${sensorId}?num=1`)
						const records = await res.json()

						if (records.length === 0) return

						const record = records[0]

						if (currentTimestamp < record.Timestamp) {
							series.addPoint([
								(new Date(record.Timestamp)).getTime(), record[sensorId]
							], true, true)
							currentTimestamp = record.Timestamp
						}
					}, 15 * 1000);
				}
			}
		},
		time: {
			useUTC: true
		},
		title: {
			text: title,
			x: -20 //center
		},
		subtitle: {
			text: '',
			x: -20
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: {
				second: '%d-%m-%Y<br/>%H:%M:%S',
				minute: '%d-%m-%Y<br/>%H:%M',
				hour: '%d-%m-%Y<br/>%H:%M',
				day: '%d-%m-%Y'
			}
		},
		yAxis: {
			title: {
				text: yAxis_title + ' (' + valueSuffix + ')'
			},
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}]
		},
		tooltip: {
			xDateFormat: '%d-%m-%Y %H:%M:%S',
			valueSuffix: ' ' + valueSuffix
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle',
			borderWidth: 0
		},
		series: [
			{
				name: yAxis_title,
				data: [],
				showInLegend: false,
				// boostThreshold: 1000,
			},
			{
				name: "test",
				data: [],
				showInLegend: false,
				// boostThreshold: 1000,
			},
		],
		// boost: {
		// 	useGPUTranslations: true,
		// 	// Chart-level boost when there are more than 5 series in the chart
		// 	// seriesThreshold: 1
		// },
	})
}

const getSensors = async () => await (await fetch('/bang-bieu?format=json')).json()
let sensors;

const main = async () => {
	const subs = window.location.pathname.split('/')

	if (subs[1] === 'bieu-do-cam-bien') {
		sensors = await getSensors()

		switch (subs[2]) {
			case 'ung-suat':
				renderUSCharts();
				break;
			case 'luc':
				// renderTensionCharts();
				break;
			case 'nhiet-do':
				renderTemperatureCharts();
				break;
			default:
				break;
		}
	}
	else if (subs[1] === 'bao-cao') {
		// let reportChart = createLineChart(
		// 	'report-chart',
		// 	'spline',
		// 	'Mặt cắt 6-6 - Thượng lưu',
		// 	'Lực',
		// 	'N',
		// 	'Ungsuat_1'
		// )
	}
}

const renderUSCharts = () => {
	let usttSensor = sensors.find(sensor => sensor.Kyhieu === 'ST1')
	let usttChart = createLineChart(
		'ustt-line-chart',
		'spline',
		usttSensor.Vitrilapdat,
		usttSensor.Loaicambien,
		usttSensor.Donvido,
		'ST1'
	)

	let usmcSensor = sensors.find(sensor => sensor.Kyhieu === 'ST17')
	let usmcChart = createLineChart(
		'usmc-line-chart',
		'spline',
		usmcSensor.Vitrilapdat,
		usmcSensor.Loaicambien,
		usmcSensor.Donvido,
		'ST17'
	)

	for (let idx = 1; idx <= 24; idx++) {
		const navItem = document.getElementById(`nav-item-ST${idx}`)

		if (idx <= 16)
			navItem.addEventListener('click', e => {
				if (navItem.children[0].classList.length === 1) {
					let usttSensor = sensors.find(sensor => sensor.Kyhieu === `ST${idx}`)
					usttChart.destroy()
					usttChart = createLineChart(
						'ustt-line-chart',
						'spline',
						usttSensor.Vitrilapdat,
						usttSensor.Loaicambien,
						usttSensor.Donvido,
						`ST${idx}`
					)
				}
			})
		else
			navItem.addEventListener('click', e => {
				if (navItem.children[0].classList.length === 1) {
					let usmcSensor = sensors.find(sensor => sensor.Kyhieu === `ST${idx}`)
					usmcChart.destroy()
					usmcChart = createLineChart(
						'usmc-line-chart',
						'spline',
						usmcSensor.Vitrilapdat,
						usmcSensor.Loaicambien,
						usmcSensor.Donvido,
						`ST${idx}`
					)
				}
			})
	}
}

const renderTensionChart = () => {
	let tensionChart = createLineChart(
		'luc-line-chart',
		'spline',
		'Mặt cắt 6-6 - Thượng lưu',
		'Lực',
		'N',
		'Ungsuat_1'
	)
}

const renderTemperatureCharts = () => {
	let ndbtSensor = sensors.find(sensor => sensor.Kyhieu === 'TC1')
	let ndbtChart = createLineChart(
		'ndbt-line-chart',
		'spline',
		ndbtSensor.Vitrilapdat,
		ndbtSensor.Loaicambien,
		ndbtSensor.Donvido,
		'TC1'
	)

	for (let idx = 1; idx <= 24; idx++) {
		const navItem = document.getElementById(`nav-item-TC${idx}`)
		navItem.addEventListener('click', e => {
			if (navItem.children[0].classList.length === 1) {
				let ndbtSensor = sensors.find(sensor => sensor.Kyhieu === `TC${idx}`)
				ndbtChart.destroy()
				ndbtChart = createLineChart(
					'ndbt-line-chart',
					'spline',
					ndbtSensor.Vitrilapdat,
					ndbtSensor.Loaicambien,
					ndbtSensor.Donvido,
					`TC${idx}`
				)
			}
		})
	}
}

main()