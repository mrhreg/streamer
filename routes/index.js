const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const { ZabbixClient } = require("zabbix-client");

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard iframe from zabbix server
router.get('/dashboard', ensureAuthenticated, (req, res) => {

  res.cookie("zbx_sessionid", req.user.sessionid);

  res.render('dashboard', {
    name: req.user.name,
    domain: process.env.DOMAIN,
    path:'/dashboard'
  })

});



module.exports = router;