const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const zapi = require("../controllers/zabbix");
const node = require("../models/node");

router.get("/", ensureAuthenticated, function(req, res) {
  node.fetchAll(req.user.alias, req.user.password).then(nodes => {
    res.render("node/nodes", { nodes: nodes, path: "/nodes" });
  });
});

router.post("/", function(req, res) {
  var name = req.body.name;
  var hostname = req.body.ip;
  var ip = req.body.ip;
  node
    .add(req.user.alias, req.user.password, hostname, ip, name)
    .then(value => {
      req.flash("success_msg", `Node with ${value.hostids[0]} id was created!`);
      res.redirect("/nodes");
    })
    .catch(err => {
      console.log(err);
    });
});

router.get("/newnode", function(req, res) {
  res.render("node/newnode.ejs", { path: "/nodes" });
});

router.post("/delnode", ensureAuthenticated, function(req, res) {
  node
    .remove(req.user.alias, req.user.password, req.body.hostid)
    .then(value => {
      req.flash("success_msg", `Node with ${value.hostids[0]} id was created!`);
      res.redirect("/nodes");
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;
