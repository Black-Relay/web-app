const mongoose = require('mongoose')
const usersModel = require('../schemas/users.js')
const faker = require('@faker-js/faker')

function getRandomNumber(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

// TODO - output newly created users to file. STRETCH - create API endpoint that returns fake user logins
const seedUsers = (numberOfUsers) => {
  if (!numberOfUsers){
    console.error("You must provide parameter 'numberOfUsers' to function 'seedUsers'")
    return;
  }

  for (i = 0; i < numberOfUsers; i++){
    let firstName = faker.person.firstName()
    let lastName = faker.person.lastName()
    let password = faker.internet.password({ length: 12, memorable: true })
    let groups = () => {

      for (i = 0; i < getRandomNumber(0, 3); i++){

      }
    }
    usersModel.updateOne(
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