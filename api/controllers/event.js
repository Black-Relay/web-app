const mongoose = require('mongoose')
const eventsModel = require('../models/events.js')

exports.getAllEventData = (req, res) => {
  if (!eventsModel) {
    res.status(500).json({ error: 'Events model not found' })
    return
  }

  eventsModel.find()
  .then(events => res.json(events))
  .catch(err => res.status(500).json({ error: err.message }))
}