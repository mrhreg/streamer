const express = require("express");
const router = express.Router();
const seed = require("../config/seed");


router.get("/", (req, res) => {
  console.log('view')
  res.render("install/install");
});

module.exports = router;

router.get("/install", (req, res) => {
    seed()
    console.log('install')
    res.render("install/install");
  });
  
  module.exports = router;
