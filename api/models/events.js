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
  acknowledged: {
    type: Boolean,
    required: true,
    default: false
  }
}, { strict: "throw", timestamps: true })

const eventsModel = mongoose.model("events", eventsSchema)

module.exports = eventsModel