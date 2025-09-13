const db = require('../db.js') // connection string
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const usersSchema = new Schema({
  firstName: String,
  lastName: String,
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now()
  },
  groups: [{ name: String }]
});

module.exports = db.model("users", usersSchema)