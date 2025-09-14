const mongoose = require('mongoose')
const users = require('../schemas/users.js')
const faker = require('@faker-js/faker')

// TODO - output newly created users to file. STRETCH - create API endpoint that returns fake user logins
const seedUsers = (numberOfUsers) => {
  if (!numberOfUsers){
    console.error("You must provide parameter 'numberOfUsers' to function 'seedUsers'")
    return;
  }

  for (i = 0; i < numberOfUsers; i++){
    let firstName = faker.person.firstName()
    let lastName = faker.person.lastName()
    let passwordHash = bcrypt.hashSync()
    users.updateOne(
      { username: faker.internet.username({ firstName: firstName }, { lastName: lastName }) }, // filter: find by username
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          password: "apasswordhashgoeshere",
          groups: [
            { name: 'admin' },
            { name: 'S6' }
          ]
        }
      },
      { upsert: true } // Create if not exists
    )
    .then(msg => msg.upsertedId ? console.log(`New user with username ${newUserName} created. ${msg.upsertedId}`) : console.log(`User with username ${newUserName} already exists. Skipping...`))
    .catch(err => console.error(err.message))
  }
}

module.exports = seedUsers