const Zabbix = require("zabbix-promise");

function zabbix1(user, password) {
  const zabbix = new Zabbix({
    url: process.env.ZABBIXURL,
    user: user,
    password: password
  });
  return zabbix;
}

//register need admin access (from env)
module.exports.register = async function register(req) {
  try {
    const zabbix = new Zabbix({
      url: process.env.ZABBIXURL,
      user: process.env.ZABBIXADMINUSER,
      password: process.env.ZABBIXADMINPASS
    });
    console.log(zabbix);
    console.log(req.body);
    const { name, email, password, password2 } = req.body;

    zabbix
      .login()
      .then(r => {
        console.log(r);
        console.log("Successfully logged in. Getting triggers...");
        return zabbix.request("user.get", { filter: { alias: [email] } });
      })
      .then(r => {
        console.log(r);
        console.log("Number of users: " + r.length);
        if (r.length > 0) {
          console.log("User exists");
          errors.push({ msg: "User already exists" });
        } else {
          //usergroup create
          return zabbix.request("hostgroup.create", {
            name: email
          });
        }
      })
      .then(r => {
        console.log(r);
        //usergroup create
        return zabbix.request("usergroup.create", {
          name: email,
          rights: [
            {
              permission: 3,
              id: r["groupids"][0]
            },
            {
              permission: 2,
              id: 10
            },
            {
              permission: 2,
              id: 1
            }
          ]
        });
      })
      //user create
      .then(r => {
        console.log("group");
        console.log(r["usrgrpids"][0]);
        return zabbix.request("user.create", {
          alias: email,
          name: name,
          passwd: password,
          type: 2,
          usrgrps: [
            {
              usrgrpid: r["usrgrpids"][0]
            }
          ],
          user_medias: [
            {
              mediatypeid: "1",
              sendto: [email],
              active: 0,
              severity: 63,
              period: "1-7,00:00-24:00"
            }
          ]
        });
      })
      .then(r => {
        console.log(r);
        return zabbix.logout();
      })
      .catch(err => console.log(`Errrrorrr: ${err}`));
  } catch (error) {
    console.error(error);
  }
};

module.exports.getscripts = function(user, password, Zabbix) {
  const zabbix = zabbix1(user, password);

  zabbix
    .login()
    .then(function(value) {
      const hosts = zabbix.request("script.get", {
        output: "extend"
      });
      console.log(JSON.stringify(hosts, null, 2));

      return hosts;
    })
    .then(function(hosts) {
      hosts.forEach(host => {
        if (host["name"] == "docker") {
          console.log("Urarararrararaaaaaaaaaaa");
        }
      });
      console.log("GetScript Logout:", zabbix.logout());
    })
    .catch(function(err) {
      console.log(err);
    });
};

//delete dashboard by name
module.exports.delDashByName = async function delDashByName(
  user,
  password,
  dashboardName
) {
  console.log("DDD", dashboardName);
  const zabbix = zabbix1(user, password);
  zabbix
    .login()
    .then(r => {
      const dashboard = zabbix.request("dashboard.get", {
        search: { name: dashboardName }
      });
      return dashboard;
    })
    .then(r => {
      console.log(r);
      zabbix.request("dashboard.delete", [r[0].dashboardid]).then(r => {
        console.log("Dashboard:", r);
        zabbix.logout();
        return r;
      });
    })
    .catch(err => {
      console.log(err);
    });
};
module.exports.dashboard = function createDashboard(user, password, dashName) {
  console.log(user + " " + password);
  const zabbix = zabbix1(user, password);
  console.log(zabbix);

  zabbix
    .login()
    .then(r => {
      return zabbix.request("dashboard.create", {
        name: dashName,
        widgets: [
          {
            type: "problems",
            x: 0,
            y: 6,
            width: 24,
            height: 6,
            view_mode: 0
          }
        ],
        userGroups: [
          {
            usrgrpid: "13",
            permission: 2
          }
        ]
      });
    })
    .then(value => {
      console.log(value);
      return zabbix.logout();
    })
    .catch(err => {
      console.log(err);
    });
};