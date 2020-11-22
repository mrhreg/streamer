var express = require("express");
var router = express.Router();
const zapi = require("../controllers/zabbix");
const passport = require("passport");

const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //Check is required fields are field in
  if (!email || !name || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //check password mach
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  //Check pass lenght
  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    zapi.register(req).then(function(value) {
      console.log(`logged out. ${value}`);
      req.flash("success_msg", "You are now registered!");
      res.redirect("/users/login");
    });
  }
});
// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});
module.exports = router;
