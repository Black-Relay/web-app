const mongoose = require('mongoose')
const users = require('../schemas/users.js')


// TODO - refactor using collection.update with 'upsert' set to true to avoid duplicate collection entries
const seedUsers = () => {
  users.create({
    first_name: "Josh",
    last_name: "Noll",
    username: "joshrnoll",
    password: "apasswordhashgoeshere",
    groups:[
      { name: 'admin' },
      { name: 'S6' }
    ]
  })
}

module.exports = seedUsers