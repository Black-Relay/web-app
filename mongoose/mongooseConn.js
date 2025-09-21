const mongoose = require('mongoose');
const mongo_host = process.env.MONGO_HOST || 'localhost'
const db = process.env.DB_NAME || 'black-relay'
const mongo_user = process.env.MONGO_USER || 'admin'
const mongo_pass = process.env.MONGO_PASS || 'password'
const db_url = `mongodb://${mongo_user}:${mongo_pass}@${mongo_host}:27017/${db}?authSource=admin`
const mongooseConn = mongoose.connect(db_url)
.then(() => console.log(`Connected to MongoDB at ${db_url}`))
.catch(err => console.error(`Unable to connect to MongoDB:\n${err}`))

module.exports = {
  db_url,
  mongooseConn
}