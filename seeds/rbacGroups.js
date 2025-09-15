const mongoose = require('mongoose')
const rbacGroupsModel = require('../schemas/rbacGroups.js')
const { faker } = require('@faker-js/faker')

const seedRbacGroups = (numberOfRbacGroups) => {
  for (i = 0; i < numberOfRbacGroups; i++){
    let rbacGroupName = faker.hacker.noun()
    rbacGroupsModel.updateOne(
      { rbacGroupName: rbacGroupName },
      {
        $set: {
          rbacGroupName: rbacGroupName
        }
      },
      { uspert: true}
    )
  }
}

module.exports = seedRbacGroups