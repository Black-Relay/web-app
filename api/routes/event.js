const express = require("express")
const router = express.Router()
const eventCtl = require('../controllers/event.js')

router.get('/', eventCtl.getAllEventData)

router.get('/id/:eventId', eventCtl.getEventDataById)

router.get('/topic/:topic', eventCtl.getEventDataByTopic)

router.get('/before', eventCtl.getEventDataBeforeTimestamp)

router.get('/after', eventCtl.getEventDataAfterTimestamp)

router.post('/', eventCtl.createNewEvent)

router.patch('/id/:eventId', eventCtl.updateEventById)

module.exports = router