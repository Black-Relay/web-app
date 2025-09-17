const seedUsers = require('./seeds/users.js')
const seedRbacGroups = require('./seeds/rbacGroups.js')

seedRbacGroups().then(() => {
  seedUsers(5)
})