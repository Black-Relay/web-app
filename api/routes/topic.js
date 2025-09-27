const express = require("express")
const router = express.Router()
const topicCtl = require('../controllers/topic.js')

router.get('/:topic', topicCtl.getAllTopicData)

module.exports = router