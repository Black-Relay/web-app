const { mongooseConn } = require('./db.js')
const mongoose = require('mongoose')
const seedUsers = require('./seeds/users.js')
const seedRbacGroups = require('./seeds/rbacGroups.js')

mongooseConn
.then(() => {
  return seedRbacGroups()
  .then(() => seedUsers(5))
})
.finally(() => {
  mongoose.connection.close()
  .then(() => console.log('Seeding complete. Mongoose connection closed.'))
  .catch(err => console.error(`Error closing MongoDB connection:\n ${err}`))
})
