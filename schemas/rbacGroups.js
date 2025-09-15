const db = require('../db.js') // connection string
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const rbacGroupsSchema = new Schema({
  rbacGroupName: {
    type: String,
    required: true,
  },
  members: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now()
  },
}, { strict: "throw" })

module.exports = db.model("rbacGroups", rbacGroupsSchema)