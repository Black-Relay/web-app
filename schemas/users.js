const mongoose = require('mongoose');
// const { mongooseConn } = require('../db.js') // connection string
const { Schema, model } = mongoose;

const usersSchema = new Schema({
  firstName: String,
  lastName: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'rbacGroups'
  }],
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now()
  }
}, { strict: "throw" }); // Setting to "throw" will cause an error if fields outside of the schema are saved

const usersModel = mongoose.model("users", usersSchema)

module.exports = usersModel