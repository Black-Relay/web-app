const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { getRandomNumber } = require('../utils/helpers.js')
const rbacGroupsModel = require('../models/rbacGroups.js')
const usersModel = require('../models/users.js')
const { faker } = require('@faker-js/faker')

// TODO - output newly created users to file. STRETCH - create API endpoint that returns fake user logins
const seedUsers = (numberOfUsers) => {
  if (!numberOfUsers){
    console.error("You must provide parameter 'numberOfUsers' to the function 'seedUsers'")
    return;
  }

  return rbacGroupsModel.find().exec()
  .then((allRbacGroups) => {

    if(allRbacGroups.length === 0){
      console.error('No RBAC groups created. Cancelling user creation...')
      return
    }

    const promises = [];

    for (i = 0; i < numberOfUsers; i++){
      let getRandomGroups = () => {
        let groupsUserIsAddedTo = []
        for (j = 0; j < getRandomNumber(0, 2); j++){
          groupsUserIsAddedTo.push(allRbacGroups[j]._id)
        }
        return groupsUserIsAddedTo
      };

      let groups = getRandomGroups()
      let firstName = faker.person.firstName()
      let lastName = faker.person.lastName()
      let username = faker.internet.username({ firstName: firstName, lastName: lastName})
      let password = faker.internet.password({ length: 12, memorable: true })
      let passwordHash = bcrypt.hashSync(password, 10) // Hash password with 10 salt rounds

      // Update user / create if not exists
      let promise = usersModel.updateOne(
        { username: username }, // filter: find by username
        {
          $set: {
            firstName: firstName,
            lastName: lastName,
            password: passwordHash,
            groups: groups,
          }
        },
        { upsert: true } // Create if not exists
      )
      .then(msg => msg.upsertedId ? console.log(`New user with username ${username} created. ${msg.upsertedId}`) : console.log(`User with username ${username} already exists. Skipping...`))
      .catch(err => console.error(err.message))

      promises.push(promise)
    }
    return Promise.all(promises)
  })
}

module.exports = seedUsers