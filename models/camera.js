const Zabbix = require("zabbix-promise");

function zabbix1(user, password) {
  const zabbix = new Zabbix({
    url: process.env.ZABBIXURL,
    user: user,
    password: password
  });
  return zabbix;
}
module.exports = class Camera {
  constructor(Name, Input, Output) {
    this.name = Name;
    this.input = Input;
    this.output = Output;
  }

  static async fetchAll(user, password) {
    const zabbix = zabbix1(user, password);
    var abv = await zabbix.login();
    const cameras = await zabbix.request("host.get", {
      selectInterfaces: "extend",
      selectGroups: "extend",
      selectInventory: "extend",
      selectItems: "extend",
      selectTags: "extend",
      tags: [
        {
          tag: "type",
          value: "camera"
        }
      ]
    });
    zabbix.logout();
    return cameras;
  }

  static async add(user, password, name, input, output, agent) {
    try {
      const zabbix = zabbix1(user, password);

      var url = input;
      var ip = url.split("/")[2].split(":")[1].split("@")[1];
      var port = url.split("/")[2].split(":")[1];
      await zabbix.login();
      const templates = await zabbix.request("template.get", {
        output: "extend",
        filter: {
          host: ["Camera template"]
        }
      });
      console.log("Templates:", templates);
      const groups = await zabbix.request("hostgroup.get", {});
      const groupId = groups[groups.length - 1].groupid;
      const host = await zabbix.request("host.create", {
        name: input,
        host: output,
        description: name,
        groups: [{ groupid: groupId }],
        tags: [
          {
            tag: "type",
            value: "camera"
          }
        ],
        templates: [
          {
            templateid: templates[0].templateid
          }
        ],
        interfaces: [
          {
            type: 1,
            main: 1,
            useip: 1,
            ip: agent,
            dns: ip,
            port: "10050"
          }
        ]
      });
      console.log(host);
      zabbix.logout();
    } catch (error) {
      console.error(error);
    }
  }

  static async remove(user, password, hostid) {
    try {
      const zabbix = zabbix1(user, password);
      await zabbix.login();
      const host = await zabbix.request("host.delete", [hostid]);
      console.log(host);
      zabbix.logout();
      return host;
    } catch (error) {
      console.error(error);
    }
  }

  static async ping(user, password) {
    try {
      const zabbix = zabbix1(user, password);
      var abv = await zabbix.login();
      const hosts = await zabbix.request("item.get", {
        output: "extend",
        selectHosts: "extend",
        selectGroups: "extend",
        search: {
          key_: "aping"
        },
        tags: [
          {
            tag: "type",
            value: "camera"
          }
        ]
      });
      console.log(JSON.stringify(hosts, null, 2));

      zabbix.logout();
      console.log(hosts);
      return hosts;
    } catch (error) {
      console.error(error);
    }
  }

  static async stream(user, password, id, command) {
    try {
      const zabbix = zabbix1(user, password);
      await zabbix.login();
      if (command.includes("start")) {
        const sid = await zabbix.request("script.get", {
          output: "extend",
          filter: {
            name: ["streamon"]
          }
        });
        const host = await zabbix.request("script.execute", {
          hostid: id,
          scriptid: sid[0].scriptid
        });
        zabbix.logout();
        return host;
      }
      if (command.includes("stop")) {
        const sid = await zabbix.request("script.get", {
          output: "extend",
          filter: {
            name: ["streamoff"]
          }
        });
        const host = await zabbix.request("script.execute", {
          hostid: id,
          scriptid: sid[0].scriptid
        });

        zabbix.logout();
        return host;
      }
      zabbix.logout();
      return host;
    } catch (error) {
      console.error(error);
    }
  }
};
