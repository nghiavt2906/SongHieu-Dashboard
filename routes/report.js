const express = require('express')

const router = express.Router()

router.get('/', (req, res) => res.render('bao-cao', { activeNavItem: 'bao-cao' }))

module.exports = router