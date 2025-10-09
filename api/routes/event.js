const express = require("express")
const router = express.Router()
const eventCtl = require('../controllers/event.js')

router.get('/', eventCtl.getAllEventData)
// router.get('/:eventId', eventCtl.getEventById)

module.exports = router