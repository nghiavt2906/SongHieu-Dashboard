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

	if (subs[1] === 'tong-quan') {
		sensors = await getSensors()

		switch (subs[2]) {
			case 'ung-suat':
				let usttImgPointer = new ImagePointDetector("ustt-img", "Ứng suất trụ tháp", "ustt")
				let usmcImgPointer = new ImagePointDetector("usmc-img", "Ứng suất mặt cầu", "usmc")
				usttImgPointer.listenClickEvent()
				usmcImgPointer.listenClickEvent()
				break;
			case 'luc':
				let lucImgPointer = new ImagePointDetector("luc-img", "Lực", "luc")
				lucImgPointer.listenClickEvent()
				break;
			default:
				break;
		}

	}
	else if (subs[1] === 'bieu-do-cam-bien') {
		sensors = await getSensors()

		switch (subs[2]) {
			case 'ung-suat':
				renderUSCharts();
				break;
			case 'luc':
				renderTensionChart();
				break;
			case 'nhiet-do':
				renderTemperatureCharts();
				break;
			default:
				break;
		}
	}
	else if (subs[1] === 'bang-bieu') {
		setInterval(async () => {
			const latestSensorRecords = await getSensors()

			for (const sensorRecord of latestSensorRecords) {
				if (sensorRecord.currentValue === undefined) sensorRecord.currentValue = null
				document.getElementById(`${sensorRecord.Kyhieu}-current-value`).innerText = sensorRecord.currentValue

				let statusCol = document.getElementById(`${sensorRecord.Kyhieu}-status`)

				if (sensorRecord.currentValue === null) {
					statusCol.innerText = 'Không hoạt động'
					statusCol.style.color = '#777'
				}
				else if ((sensorRecord.Gioihantren !== null && sensorRecord.currentValue > sensorRecord.Gioihantren) ||
					(sensorRecord.Gioihanduoi !== null && sensorRecord.currentValue < sensorRecord.Gioihanduoi)) {
					statusCol.innerText = 'Cảnh báo!!!'
					statusCol.style.color = 'red'
				}
				else {
					statusCol.innerText = 'Bình thường'
					statusCol.style.color = '#238636'
				}
			}
		}, 15 * 1000)
	}
	else if (subs[1] === 'bao-cao') {
		let currentDateOption = 'day'

		const fromDate = document.getElementById('fromDate')
		const toDate = document.getElementById('toDate')
		const fromDateLabel = document.getElementById('fromDateLabel')
		const toDateLabel = document.getElementById('toDateLabel')

		$('input[type="radio"]').on('change', e => {
			const selectedDateOption = e.target.value

			if (selectedDateOption === currentDateOption) return

			switch (selectedDateOption) {
				case 'day':
					fromDate.type = 'date'
					fromDateLabel.innerText = 'Ngày'
					toDate.style.visibility = 'hidden'
					toDateLabel.style.visibility = 'hidden'
					break;
				case 'month':
					fromDate.type = 'month'
					fromDateLabel.innerText = 'Tháng'
					toDate.style.visibility = 'hidden'
					toDateLabel.style.visibility = 'hidden'
					break;
				case 'customDateRange':
					fromDate.type = 'date'
					fromDateLabel.innerText = 'Từ ngày'
					toDate.style.visibility = 'visible'
					toDateLabel.style.visibility = 'visible'
					break;
			}

			currentDateOption = selectedDateOption
		});

		$('#exportBtn').on('click', async e => {
			const exportBtn = document.getElementById('exportBtn')
			exportBtn.innerHTML = 'Đang xuất báo cáo...'
			exportBtn.disabled = true

			switch (currentDateOption) {
				case 'day': {
					if (!fromDate.value) break;
					const res = await fetch(`/bao-cao/export?exportType=Day&day=${fromDate.value}`)
					downloadFile(res);
					break;
				}
				case 'month': {
					if (!fromDate.value) break;
					const res = await fetch(`/bao-cao/export?exportType=Month&yearAndMonth=${fromDate.value}`)
					downloadFile(res);
					break;
				}
				case 'customDateRange': {
					if (!fromDate.value || !toDate.value) break;
					const res = await fetch(`/bao-cao/export?exportType=CustomRange&fromDate=${fromDate.value}&toDate=${toDate.value}`)
					downloadFile(res);
					break;
				}
			}

			exportBtn.innerHTML = '<i class="material-icons" style="font-size: 1.4rem">print</i> Xuất báo cáo'
			exportBtn.disabled = false
		})
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

async function downloadFile(fetchResult) {
	let filename = fetchResult.headers.get('content-disposition').split('filename=')[1];
	let data = await fetchResult.blob();
	// It is necessary to create a new blob object with mime-type explicitly set
	// otherwise only Chrome works like it should
	const blob = new Blob([data], { type: data.type || 'application/octet-stream' });
	if (typeof window.navigator.msSaveBlob !== 'undefined') {
		// IE doesn't allow using a blob object directly as link href.
		// Workaround for "HTML7007: One or more blob URLs were
		// revoked by closing the blob for which they were created.
		// These URLs will no longer resolve as the data backing
		// the URL has been freed."
		window.navigator.msSaveBlob(blob, filename);
		return;
	}
	// Other browsers
	// Create a link pointing to the ObjectURL containing the blob
	const blobURL = window.URL.createObjectURL(blob);
	const tempLink = document.createElement('a');
	tempLink.style.display = 'none';
	tempLink.href = blobURL;
	tempLink.setAttribute('download', filename);
	// Safari thinks _blank anchor are pop ups. We only want to set _blank
	// target if the browser does not support the HTML5 download attribute.
	// This allows you to download files in desktop safari if pop up blocking
	// is enabled.
	if (typeof tempLink.download === 'undefined') {
		tempLink.setAttribute('target', '_blank');
	}
	document.body.appendChild(tempLink);
	tempLink.click();
	document.body.removeChild(tempLink);
	setTimeout(() => {
		// For Firefox it is necessary to delay revoking the ObjectURL
		window.URL.revokeObjectURL(blobURL);
	}, 100);
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
	let tensionSensor = sensors.find(sensor => sensor.Kyhieu === 'LC1')
	let tensionChart = createLineChart(
		'luc-line-chart',
		'spline',
		tensionSensor.Vitrilapdat,
		tensionSensor.Loaicambien,
		tensionSensor.Donvido,
		'LC1'
	)

	for (let idx = 1; idx <= 10; idx++) {
		const navItem = document.getElementById(`nav-item-LC${idx}`)
		navItem.addEventListener('click', e => {
			if (navItem.children[0].classList.length === 1) {
				let tensionSensor = sensors.find(sensor => sensor.Kyhieu === `LC${idx}`)
				tensionChart.destroy()
				tensionChart = createLineChart(
					'luc-line-chart',
					'spline',
					tensionSensor.Vitrilapdat,
					tensionSensor.Loaicambien,
					tensionSensor.Donvido,
					`LC${idx}`
				)
			}
		})
	}
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