const mongoose = require('mongoose');
const { Schema, model } = mongoose;

eventsSchema = new Schema({
  category: {
    type: String,
    enum: {
      values: ["DETECT", "ALERT", "ALARM", "THREAT"],
      message: 'Invalid event category'
    },
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  data: {},
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now()
  },
  acknowledged: {
    type: Boolean,
    required: true,
    default: false
  },
}, { strict: "throw" })

const eventsModel = mongoose.model("events", eventsSchema)

module.exports = eventsModel