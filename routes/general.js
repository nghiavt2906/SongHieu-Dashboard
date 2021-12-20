const express = require('express')

const dboperations = require('../dboperations')

const router = express.Router()

router.get('/', async (req, res) => {
	const sensors = await dboperations.getGeneralTable()

	for (const sensor of sensors) {
		sensor.Kyhieu = sensor.Kyhieu ? sensor.Kyhieu.trim() : null
		sensor.Sohieucambien = sensor.Sohieucambien ? sensor.Sohieucambien.trim() : null
		sensor.Loaicambien = sensor.Loaicambien ? sensor.Loaicambien.trim() : null
		sensor.Vitrilapdat = sensor.Vitrilapdat ? sensor.Vitrilapdat.trim() : null
		sensor.Donvido = sensor.Donvido ? sensor.Donvido.trim() : null
	}

	if (req.query.format === 'json')
		return res.json(sensors)

	res.render('bang-bieu', { activeNavItem: 'bang-bieu', sensors })
})

module.exports = router