const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const topicsSchema = new Schema({
  topicName: {
    type: String,
    required: true,
    unique: true
  },
}, { strict: "throw", timestamps: true })

const topicsModel = model('Topic', topicsSchema)

module.exports = topicsModel