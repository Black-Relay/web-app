const mongoose = require('mongoose');
// const { mongooseConn } = require('../db.js') // connection string
const { Schema, model } = mongoose;

const rbacGroupsSchema = new Schema({
  rbacGroupName: {
    type: String,
    required: true,
    unique: true
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

const rbacGroupsModel = mongoose.model("rbacGroups", rbacGroupsSchema)

module.exports = rbacGroupsModel