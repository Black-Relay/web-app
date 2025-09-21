const mongoose = require('mongoose')
const rbacGroupsModel = require('../models/rbacGroups.js')
const { faker } = require('@faker-js/faker')

const groupNames = ['user', 'admin', 'analyst']

const seedRbacGroups = () => {

  // Delete any previous seed data
  return rbacGroupsModel.deleteMany({})
  .then(() => {
    console.log('Deleted previous rbac groups. Running seeds...')
    const promises = groupNames.map((rbacGroupName) => {
      return rbacGroupsModel.updateOne(
        { rbacGroupName },
        {
          $set: { rbacGroupName }
        },
        { upsert: true}
      )
      .then(msg => msg.upsertedId ? console.log(`New RBAC Group with name ${rbacGroupName} created. ${msg.upsertedId}`) : console.log(`Group with name ${rbacGroupName} already exists. Skipping...`))
      .catch(err => console.error(err.message))
    })
    return Promise.all(promises)
  })
}

module.exports = seedRbacGroups