const express = require('express')

const dboperations = require('../dboperations')

const router = express.Router()

router.get('/', async (req, res) => {
	const sensors = await dboperations.getGeneralTable()
	const lastestStaticSensorsRecord = (await dboperations.getLastestRecord())

	for (const sensor of sensors) {
		sensor.Kyhieu = sensor.Kyhieu ? sensor.Kyhieu.trim() : null
		sensor.Sohieucambien = sensor.Sohieucambien ? sensor.Sohieucambien.trim() : null
		sensor.Loaicambien = sensor.Loaicambien ? sensor.Loaicambien.trim() : null
		sensor.Vitrilapdat = sensor.Vitrilapdat ? sensor.Vitrilapdat.trim() : null
		sensor.Donvido = sensor.Donvido ? sensor.Donvido.trim() : null

		sensor.currentValue = lastestStaticSensorsRecord[sensor.Kyhieu]
	}

	if (req.query.format === 'json')
		return res.json(sensors)

	const latestTimestamp = lastestStaticSensorsRecord.Timestamp
	const currentTimestamp = new Date()
	currentTimestamp.setHours(currentTimestamp.getHours() + 7)

	const diffMs = (currentTimestamp - latestTimestamp);
	const diffMins = ((diffMs % 86400000) % 3600000) / 60000;

	const dataloggerInfo = {
		latestTimestamp: new Date(latestTimestamp).toLocaleString("en-GB", { timeZone: 'UTC' }).replace(/,/g, ''),
		status: diffMins <= 5 ? 'đã kết nối' : 'mất kết nối',
		isConnected: diffMins <= 5
	}

	res.render('bang-bieu', { activeNavItem: 'bang-bieu', sensors, dataloggerInfo })
})

router.get('/datalogger-info', async (req, res) => {
	const lastestStaticSensorsRecord = (await dboperations.getLastestRecord())
	const latestTimestamp = lastestStaticSensorsRecord.Timestamp
	const currentTimestamp = new Date()
	currentTimestamp.setHours(currentTimestamp.getHours() + 7)

	const diffMs = (currentTimestamp - latestTimestamp);
	const diffMins = ((diffMs % 86400000) % 3600000) / 60000;

	const data = {
		latestTimestamp: new Date(latestTimestamp).toLocaleString("en-GB", { timeZone: 'UTC' }).replace(/,/g, ''),
		status: diffMins <= 5 ? 'đã kết nối' : 'mất kết nối',
		isConnected: diffMins <= 5
	}
	res.json(data)
})

module.exports = router