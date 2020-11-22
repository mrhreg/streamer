const LocalStrategy = require("passport-local").Strategy;
const { ZabbixClient } = require("zabbix-client");

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      try {
        const client = new ZabbixClient(process.env.ZABBIXURL);

        // To enable relogin: client.login("theusername", "thepassword", true);
        client.login(email, password, true).then(api => {
          api
            .method("user.get")
            .call({ filter: { alias: [email] } })
            .then(user => {
              user[0].password = password;
              user[0].sessionid = api["socket"]["token"];

              // zabbix.logout();
              return done(null, user[0]);
              //mach user
            });
        });
      } catch {
        err => {
          return done(null, false, { message: JSON.parse(err).error.data });
        };
      }
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  
};
