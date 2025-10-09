const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const newEventsSchema = (topic) => {
  const eventsSchema = new Schema({
    category: {
      type: String,
      enum: {
        values: ["DETECT", "ALERT", "ALARM", "THREAT"],
        message: 'Invalid event category'
      },
      required: true
    },
    data: {
      type: Schema.Types.ObjectId,
      ref: topic,
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      immutable: true,
      default: () => Date.now()
    },
  }, { strict: "throw" })
}

const eventsModel = (topic) => {
  return mongoose.model('events', newEventsSchema(topic))
}

module.exports = eventsModel