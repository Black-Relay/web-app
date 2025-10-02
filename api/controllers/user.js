const mongoose = require('mongoose')
const usersModel = require('../models/users.js')
const bcrypt = require('bcrypt')

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10)
}

exports.getAllUsers = (req, res) => {
  usersModel.find()
  .then(users => res.json(users))
  .catch(err => res.status(500).json({ error: err.message }))
}

exports.getUserById = (req, res) => {
  const userId = req.params.userId

  usersModel.findById(userId)
  .then(user => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json(user)
  })
  .catch(err => res.status(500).json({ error: err.message }))
}

exports.createUser = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body required' })
  }

  const { username, password } = req.body

  if (!username || !password ) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const hashedPassword = hashPassword(password)

  if (!hashedPassword) {
    return res.status(500).json({ error: 'Error hashing password' })
  }

  const newUser = new usersModel({
    firstName: req.body.firstName || '',
    lastName: req.body.lastName || '',
    username: username,
    password: hashedPassword
  })

  newUser.save()
  .then(user => res.status(201).json(user))
  .catch(err => res.status(500).json({ error: err.message }))
}

exports.updateUser = (req, res) => {
  const userId = req.params.userId
  if (!req.body) {
    return res.status(400).json({ error: 'Request body required' })
  }

  const updateData = req.body

  if (req.body.password) {
    const hashedPassword = hashPassword(req.body.password)
    if (!hashedPassword) {
      return res.status(500).json({ error: 'Error hashing password' })
    }
    updateData.password = hashedPassword
  }

  usersModel.findByIdAndUpdate(userId, updateData, { new: true })
  .then(user => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json(user)
  })
  .catch(err => res.status(500).json({ error: err.message }))

}

exports.deleteUser = (req, res) => {
  const userId = req.params.userId

  usersModel.findByIdAndDelete(userId)
  .then(user => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ message: 'User deleted successfully' })
  })
  .catch(err => res.status(500).json({ error: err.message }))
}