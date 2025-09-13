const express = require("express")
const router = express.Router()
const authCtl = require('../controllers/auth.js')

router.get('/login', subscribeCtl.userLogin)
router.get('/login', subscribeCtl.userLogout)

module.exports = router