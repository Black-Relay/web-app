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

exports.getEventDataByTopic = (req, res) => {
  if (!eventsModel) {
    res.status(500).json({ error: 'Events model not found' })
    return
  }

  const { topic } = req.params

  if (!topic) {
    res.status(400).json({ error: 'Topic parameter is required' })
    return
  }

  eventsModel.find({ topic: topic })
    .then(events => {
      if (events.length === 0) {
        res.status(404).json({ message: 'No events found for this topic' })
        return
      }
      res.json(events)
    })
    .catch(err => res.status(500).json({ error: err.message }))
}

exports.getEventDataById = (req, res) => {
  if (!eventsModel) {
    res.status(500).json({ error: 'Events model not found' })
    return
  }

  const { eventId } = req.params

  if (!eventId) {
    res.status(400).json({ error: 'Event ID parameter is required' })
    return
  }

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ error: 'Invalid event ID format' })
    return
  }

  eventsModel.findById(eventId)
    .then(event => {
      if (!event) {
        res.status(404).json({ message: 'Event not found' })
        return
      }
      res.json(event)
    })
    .catch(err => res.status(500).json({ error: err.message }))
}

exports.getEventDataBeforeTimestamp = (req, res) => {
  if (!eventsModel) {
    res.status(500).json({ error: 'Events model not found' })
    return
  }

  const { timestamp } = req.query

  if (!timestamp) {
    res.status(400).json({ error: 'Timestamp query parameter is required' })
    return
  }

  const date = new Date(timestamp)
  if (isNaN(date.getTime())) {
    res.status(400).json({ error: 'Invalid timestamp format' })
    return
  }

  eventsModel.find({ createdAt: { $lt: date } })
    .sort({ createdAt: -1 })
    .then(events => {
      if (events.length === 0) {
        res.status(404).json({ message: 'No events found before this timestamp' })
        return
      }
      res.json(events)
    })
    .catch(err => res.status(500).json({ error: err.message }))
}

exports.getEventDataAfterTimestamp = (req, res) => {
  if (!eventsModel) {
    res.status(500).json({ error: 'Events model not found' })
    return
  }

  const { timestamp } = req.query

  if (!timestamp) {
    res.status(400).json({ error: 'Timestamp query parameter is required' })
    return
  }

  const date = new Date(timestamp)
  if (isNaN(date.getTime())) {
    res.status(400).json({ error: 'Invalid timestamp format' })
    return
  }

  eventsModel.find({ createdAt: { $gt: date } })
    .sort({ createdAt: -1 })
    .then(events => {
      if (events.length === 0) {
        res.status(404).json({ message: 'No events found after this timestamp' })
        return
      }
      res.json(events)
    })
    .catch(err => res.status(500).json({ error: err.message }))
}

exports.createNewEvent = (req, res) => {
  if (!eventsModel) {
    res.status(500).json({ error: 'Events model not found' })
    return
  }

  const { category, topic, data } = req.body

  if (!category || !topic) {
    res.status(400).json({ error: 'Category and topic are required fields' })
    return
  }

  const validCategories = ['DETECT', 'ALERT', 'ALARM', 'THREAT']
  if (!validCategories.includes(category)) {
    res.status(400).json({ error: 'Invalid event category. Must be one of: DETECT, ALERT, ALARM, THREAT' })
    return
  }

  const newEvent = new eventsModel({
    category,
    topic,
    data: data || {}
  })

  newEvent.save()
    .then(event => {
      res.status(201).json(event)
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).json({ error: 'Validation error', details: err.message })
        return
      }
      res.status(500).json({ error: err.message })
    })
}

exports.updateEventById = (req, res) => {
  if (!eventsModel) {
    res.status(500).json({ error: 'Events model not found' })
    return
  }

  const { eventId } = req.params
  const updateData = req.body

  if (!eventId) {
    res.status(400).json({ error: 'Event ID parameter is required' })
    return
  }

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ error: 'Invalid event ID format' })
    return
  }

  // Remove immutable and auto-managed fields from update data
  delete updateData.createdAt
  delete updateData._id
  delete updateData.updatedAt

  // Validate category if provided
  if (updateData.category) {
    const validCategories = ['DETECT', 'ALERT', 'ALARM', 'THREAT']
    if (!validCategories.includes(updateData.category)) {
      res.status(400).json({ error: 'Invalid event category. Must be one of: DETECT, ALERT, ALARM, THREAT' })
      return
    }
  }

  eventsModel.findByIdAndUpdate(
    eventId,
    updateData,
    { new: true, runValidators: true }
  )
    .then(event => {
      if (!event) {
        res.status(404).json({ message: 'Event not found' })
        return
      }
      res.json(event)
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).json({ error: 'Validation error', details: err.message })
        return
      }
      res.status(500).json({ error: err.message })
    })
}