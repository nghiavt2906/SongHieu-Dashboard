const express = require('express')

const router = express.Router()

router.get('/ung-suat', (req, res) => res.render('tong-quan/ung-suat', { activeNavItem: 'tong-quan' }))
router.get('/luc', (req, res) => res.render('tong-quan/luc', { activeNavItem: 'tong-quan' }))
router.get('/nhiet-do', (req, res) => res.render('tong-quan/nhiet-do', { activeNavItem: 'tong-quan' }))
router.get('/gia-toc', (req, res) => res.render('tong-quan/gia-toc', { activeNavItem: 'tong-quan' }))
router.get('/moi-truong', (req, res) => res.render('tong-quan/moi-truong', { activeNavItem: 'tong-quan' }))

module.exports = router