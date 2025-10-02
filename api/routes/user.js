const express = require("express")
const router = express.Router()
const userCtl = require('../controllers/user.js')

router.get('/', userCtl.getAllUsers)
router.get('/:userId', userCtl.getUserById)
router.post('/', userCtl.createUser)
router.patch('/:userId', userCtl.updateUser)
router.delete('/:userId', userCtl.deleteUser)

module.exports = router