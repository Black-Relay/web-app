const express = require("express")
const router = express.Router()
const topicCtl = require('../controllers/topic.js')

router.get('/', topicCtl.getAllSubscribedTopics)

router.get('/:topic/check', topicCtl.checkSubscribedTopic)

router.get('/:topic/subscribe', topicCtl.subscribeToTopic)

module.exports = router