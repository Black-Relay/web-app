const express = require("express")
const router = express.Router()
const subscribeCtl = require('../controllers/subscribe.js')

router.get('/:topic', subscribeCtl.subscribeToTopic)

module.exports = router