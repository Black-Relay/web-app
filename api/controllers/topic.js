const mongoose = require('mongoose')
const { mongooseConn, db_url } = require('../db.js')

exports.getAllTopicData = (req, res) => {
  try {
    let Model = mongoose.model(req.params.topic)
    Model.find()
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err))
  }
  catch{
    res.status(500).send(`Unable to get data from topic ${req.params.topic}. Has it been subscribed to?`)
  }
}