const express = require('express')

const dboperations = require('../dboperations')

const router = express.Router()

router.get('/ung-suat', (req, res) => {
	const usttLabels = Array.from({ length: 16 }, (_, i) => `ST${i + 1}`)
	const usmcLabels = Array.from({ length: 8 }, (_, i) => `ST${i + 17}`)

	res.render('bieu-do-cam-bien/ung-suat', {
		activeNavItem: 'bieu-do-cam-bien',
		usttLabels,
		usmcLabels
	})
})

router.get('/luc', (req, res) => {
	const labels = Array.from({ length: 10 }, (_, i) => `LC${i + 1}`)

	res.render('bieu-do-cam-bien/luc', {
		activeNavItem: 'bieu-do-cam-bien',
		labels
	})
})

router.get('/nhiet-do', (req, res) => {
	const ndbtLabels = Array.from({ length: 24 }, (_, i) => `TC${i + 1}`)
	const nddvLabels = ['TS1', 'TS2']

	res.render('bieu-do-cam-bien/nhiet-do', {
		activeNavItem: 'bieu-do-cam-bien',
		ndbtLabels,
		nddvLabels
	})
})

router.get('/gia-toc', (req, res) => {
	const gt1pLabels = Array.from({ length: 4 }, (_, i) => `AC1D-${i + 1}`)
	const gt2pLabels = Array.from({ length: 2 }, (_, i) => `AC2D-${i + 1}`)

	res.render('bieu-do-cam-bien/gia-toc', {
		activeNavItem: 'bieu-do-cam-bien',
		gt1pLabels,
		gt2pLabels
	})
})

router.get('/moi-truong', (req, res) => {
	res.render('bieu-do-cam-bien/moi-truong', {
		activeNavItem: 'bieu-do-cam-bien',
		nddakkLabels: ['AT&RH'],
		lmLabels: ['RG'],
		gioLabels: ['AM']
	})
})

router.get('/records/:sensorId', async (req, res) => {
	const sensorId = req.params.sensorId
	const num = req.query.num

	let records = await dboperations.getRecordsBySensorId(sensorId, num)

	if (records === undefined)
		return res.json([])

	records = records.reverse()
	res.json(records)
})

module.exports = router