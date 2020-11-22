const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const camera = require("../models/camera");
const node = require("../models/node");

router.get("/", ensureAuthenticated, (req, res) => {
  camera
    .fetchAll(req.user.alias, req.user.password)
    .then(cameras => {
      // console.log(cameras[0].items);
      res.render("camera/cameras", { cameras: cameras, path: "/cameras" });
    })
    .catch(err => {
      console.log(err);
    });
});

router.post("/", ensureAuthenticated, function(req, res) {
  // res.send("post cameras")
  var name = req.body.name;
  var input = req.body.input;
  var output = req.body.output;
  var agent = req.body.agents;
  camera
    .add(req.user.alias, req.user.password, name, input, output, agent)
    .then(value => {
      res.redirect("/cameras");
    });
});

router.post("/delcamera", ensureAuthenticated, function(req, res) {
  camera
    .remove(req.user.alias, req.user.password, req.body.hostid)
    .then(value => {
      req.flash("success_msg", `Node with ${value.hostids[0]} id was created!`);
      res.redirect("/cameras");
      console.log("camera deleted" + req.body.hostid);
    });
});

router.post("/runstream", ensureAuthenticated, function(req, res) {
  camera
    .stream(req.user.alias, req.user.password, req.body.hostid, "start")
    .then(function(value) {
      console.log(value.value);
      var data = value.value;
      if (value.response === "success") {
        if (value.value.includes("rror")) {
          req.flash("error_msg", value.value);
          return value;
        } else {
          req.flash(
            "success_msg",
            `Container with id ${value.value} has started`
          );
          return value;
        }
      } else {
        req.flash("error_msg", value.value);
        return value;
      }
    })
    .then(value => {
      const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
      wait(5 * 1000)
        .then(() => {
          console.log("waited for 5 seconds");
          res.redirect("/cameras");
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => console.log(err));
  console.log("camera stream" + req.body.hostid);
});

router.post("/stopstream", ensureAuthenticated, function(req, res) {
  camera
    .stream(req.user.alias, req.user.password, req.body.hostid, "stop")
    .then(function(value) {
      if (value.response === "success") {
        if (value.value.includes("rror")) {
          req.flash("error_msg", value.value);
        } else {
          req.flash(
            "success_msg",
            `Container with id ${value.value} has been killed and deleted`
          );
        }
      } else {
        req.flash("error_msg", value.value);
      }
      const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
      wait(5 * 1000)
        .then(() => {
          console.log("waited for 5 seconds");
          res.redirect("/cameras");
        })
        .catch(err => {
          console.log(err);
        });
    });
  console.log("camera stream" + req.body.hostid);
});

router.get("/newcamera", ensureAuthenticated, function(req, res) {
  node.fetchAll(req.user.alias, req.user.password).then(value => {
    res.render("camera/newcamera", { nodes: value, path: "/cameras" });
  });
});

module.exports = router;
