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
  data: {
    type: Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now()
  },
}, { strict: "throw" })

const eventsModel = mongoose.model("events", eventsSchema)

module.exports = eventsModel