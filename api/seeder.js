const { mongooseConn } = require('./db.js')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const seedUsers = require('./seeds/users.js')
const seedRbacGroups = require('./seeds/rbacGroups.js')
const rbacGroupsModel = require('./models/rbacGroups.js')
const usersModel = require('./models/users.js')

adminUser = {
  username: "admin",
  password: "admin",

}

mongooseConn
.then(() => {
  return seedRbacGroups()
  .then(() => {
    // Create admin user
    let passwordHash = bcrypt.hashSync("admin", 10)
    rbacGroupsModel.findOne({ rbacGroupName: "admin" }, "_id").exec()
    .then((adminGroupObj) => {
      usersModel.updateOne(
        { username: "admin" }, // filter: find by username
        {
          $set: {
            username: "admin",
            firstName: "br-admin",
            lastName: "br-admin",
            password: passwordHash,
            groups: [adminGroupObj._id],
          }
        },
        { upsert: true } // Create if not exists
      )
      .then(msg => msg.upsertedId ? console.log(`New default admin user created. ${msg.upsertedId}`) : console.log(`Default admin user already exists. Skipping...`))
      .catch(err => console.error(err.message))
    })
  })
  .then(() => seedUsers(5))
})
.finally(() => {
  mongoose.connection.close()
  .then(() => console.log('Seeding complete. Mongoose connection closed.'))
  .catch(err => console.error(`Error closing MongoDB connection:\n ${err}`))
})
