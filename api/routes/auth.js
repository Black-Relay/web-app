const express = require("express")
const router = express.Router()
const authCtl = require('../controllers/auth.js')

router.post('/login', authCtl.userLogin)
router.get('/logout', authCtl.userLogout)

module.exports = router
