class ImagePointDetector {
	constructor(id, modalTitle, type) {
		this.id = id
		this.modalTitle = modalTitle
		this.type = type
	}

	listenClickEvent = () => {
		let type = this.type
		let modalTitle = this.modalTitle

		// let count = 0
		// let a = []

		$(`#${this.id}`).click(function (e) {
			let bounds = this.getBoundingClientRect();
			let left = bounds.left;
			let top = bounds.top;
			let x = e.pageX - left;
			let y = e.pageY - top;
			let cw = this.clientWidth
			let ch = this.clientHeight
			let iw = this.naturalWidth
			let ih = this.naturalHeight
			let px = x / cw * iw
			let py = y / ch * ih
			// alert(px + ",          " + py);

			// count += 1
			// if (count % 2 === 0) a.push(Math.round(px))
			// else a.push(Math.round(py))
			// if (count === 4) {
			// 	console.log([...a])
			// 	count = 0
			// 	a = []
			// }

			let Kyhieu = getKyHieu(type, px, py)
			if (Kyhieu === null) return

			renderChartsModal(Kyhieu)
			$('#detailsModal').modal()
		});
	}
}

const getKyHieu = (type, x, y) => {
	let points;
	switch (type) {
		case 'ustt':
			points = {
				ST1: [190, 1028, 215, 1005], // top, right, bottom, left
				ST2: [124, 1137, 146, 1115],
				ST3: [188, 1244, 213, 1223],
				ST4: [255, 1136, 277, 1115],
				ST5: [551, 1027, 573, 1009],
				ST6: [486, 1135, 508, 1114],
				ST7: [550, 1240, 572, 1220],
				ST8: [617, 1137, 638, 1114],
				ST9: [189, 141, 215, 116],
				ST10: [122, 246, 147, 223],
				ST11: [190, 353, 214, 331],
				ST12: [256, 245, 280, 224],
				ST13: [548, 140, 571, 119],
				ST14: [485, 249, 507, 227],
				ST15: [549, 353, 570, 331],
				ST16: [615, 245, 639, 222]
			}

			break;
		case 'usmc':
			points = {
				ST17: [281, 267, 298, 245],
				ST18: [281, 498, 299, 478],
				ST19: [304, 266, 321, 246],
				ST20: [303, 498, 321, 479],
				ST21: [282, 956, 299, 935],
				ST22: [283, 1193, 302, 1171],
				ST23: [303, 956, 322, 939],
				ST24: [305, 1193, 322, 1172]
			}
			break;
		case 'luc':
			points = {
				LC1: [560, 911, 580, 888],
				LC2: [558, 840, 581, 818],
				LC3: [557, 765, 584, 742],
				LC4: [557, 691, 580, 667],
				LC5: [561, 618, 585, 593],
				LC6: [558, 550, 583, 522],
				LC7: [563, 470, 588, 446],
				LC8: [564, 398, 585, 370],
				LC9: [564, 321, 588, 296],
				LC10: [562, 250, 588, 228]
			}
		default:
			break;
	}

	for (const key in points) {
		let [top, right, bottom, left] = points[key]
		if ((x >= left && x <= right) && (y >= top && y <= bottom)) return key
	}

	return null
}

const renderChartsModal = Kyhieu => {
	let sensor = sensors.find(sensor => sensor.Kyhieu === Kyhieu)

	document.getElementById('modal-title').innerText = sensor.Vitrilapdat

	let title;

	switch (sensor.Loaicambien) {
		case 'Ứng suất':
			title = `Ứng suất - ${sensor.Kyhieu}`
			break;
		case 'Lực':
			title = `Lực - ${sensor.Kyhieu}`
		default:
			break;
	}

	createLineChart(
		'line-chart',
		'spline',
		title,
		sensor.Loaicambien,
		sensor.Donvido,
		sensor.Kyhieu
	)

	if (sensor.Loaicambien === 'Ứng suất') {
		createLineChart(
			'ndbt-line-chart',
			'spline',
			`Nhiệt độ bê tông - TC${sensor.Kyhieu.substring(2)}`,
			'Nhiệt độ',
			'°C',
			`TC${sensor.Kyhieu.substring(2)}`
		)
	}
}
