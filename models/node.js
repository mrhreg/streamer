const Zabbix = require("zabbix-promise");

function zabbix1(user, password) {
  const zabbix = new Zabbix({
    url: process.env.ZABBIXURL,
    user: user,
    password: password
  });
  return zabbix;
}
module.exports = class Node {
  constructor(Name, Input, Output) {
    this.name = Name;
    this.input = Input;
    this.output = Output;
  }

  static async fetchAll(user, password) {
    try {
        const zabbix = zabbix1(user, password);
        await zabbix.login()
        const nodes = await zabbix.request('host.get', {
          selectInterfaces: 'extend',
          selectGroups: 'extend',
          selectInventory: 'extend',
          selectTags: "extend",
          tags: [
            {
              "tag": "type",
              "value": "agent"
            }
          ]
        })
        // console.log(JSON.stringify(hosts, null, 2))
    
        zabbix.logout()
        return nodes
      } catch (error) {
        console.error(error)
      }
  }

  static async add(user, password, hostname, ip, name) {
    try {

        const zabbix = zabbix1(user, password);
        await zabbix.login()
        const groups = await zabbix.request('hostgroup.get', {})
        const groupId = groups[groups.length - 1].groupid
        const host = await zabbix.request('host.create', {
          name: name,
          host: hostname,
          groups: [{ groupid: groupId }],
          tags: [
            {
              "tag": "type",
              "value": "agent"
            }
          ],
          templates: [
            {
              "templateid": "10001"
            }
          ],
          interfaces: [{
            type: 1,
            main: 1,
            useip: 1,
            ip: ip,
            dns: '',
            port: '10050'
          }]
        })
        console.log(host)
        zabbix.logout()
        return host
      } catch (error) {
        console.error(error)
      }
  }

  static async remove(user, password, hostid){
    try {
      const zabbix = zabbix1(user, password);
      await zabbix.login();
      const host = await zabbix.request('host.delete',
        [hostid]
      );
      console.log(host);
      zabbix.logout();
      return host
    } catch (error) {
      console.error(error)
  
    }
  }



};
