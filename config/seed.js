const Zabbix = require('zabbix-promise');

const scripts = [{
    name: "streamon",
    command: `docker run -d --restart unless-stopped  --name {HOST.HOST} linuxserver/ffmpeg -f lavfi -i anullsrc -rtsp_transport tcp -i "{HOST.NAME}" -tune zerolatency -vcodec libx264 -pix_fmt + -c:v copy -c:a aac -strict experimental -f flv "rtmp://a.rtmp.youtube.com/live2/{HOST.HOST}" &`
},
{
    name: "isRunning",
    command: `docker ps -qf "name={HOST.HOST}"`
},
{
    name: "streamoff",
    command: `docker rm $(docker kill {HOST.HOST}) &`
}
];


const templates = [
    {
        name: 'Camera',
        groups: {
            "groupid": 1
        }
    }
];

function seed() {
    scripts.forEach((script) => {
        seedScripts("Admin", "zabbix", script);
    });
    seedItems("Admin", "zabbix");
    // seedTriggers("Admin", "zabbix");
}

function seedTriggers(user, password, templateid){
    const zabbix = new Zabbix({
        url: process.env.ZABBIXURL,
        user: user,
        password: password
    })
    console.log("TeplateID", templateid)
    zabbix.login().then(function (value) {
        console.log("Logging in:",value);
        console.log("Logging in:",typeof(value));

        const triggers = [
            {
                description: "Frames per second is low",
                expression: "{Camera template:logs[{HOST.HOST}].last()}<8",
                recovery_mode:1,
                recovery_expression : "{Camera template:logs[{HOST.HOST}].last()}>8",
                comments: "You may experiance lag on the video"
            },
            {
                description: "Streaming traffic is low",
                expression: "{Camera template:docker.containers[{HOST.HOST}, netin].last()}<50000",
                recovery_mode:1,
                recovery_expression : "{Camera template:docker.containers[{HOST.HOST}, netin].last()}>50000",
                comments: "Posible streaming issue due to network ineffitionsy"
            }
        ];


        const items = zabbix.request('trigger.create', triggers);
        console.log(items);
        return items;
    }).then(function (value) {
        console.log("Triggers", value)
        console.log("GetScript Logout:", zabbix.logout().then(function (value) {
            console.log('Loged out: ', value);
            return value;
        }));
    }).catch(function (err) {
        console.log(err);
    })



}


// Script Object
// https://www.zabbix.com/documentation/current/manual/api/reference/script/object#script

function seedScripts(user, password, script) {
    console.log('script', script)
    const zabbix = new Zabbix({
        url: process.env.ZABBIXURL,
        user: user,
        password: password
    })
    zabbix.login().then(function (value) {

        const scripts = zabbix.request('script.create', {
            name: script.name,
            command: script.command,
            host_access: 2,
            execute_on: 0
        })
        console.log(JSON.stringify(scripts, null, 2))


        return scripts
    }).then(function (value) {
        console.log("IDS", value)
        console.log("GetScript Logout:", zabbix.logout().then(function (value) {
            console.log('Loged out: ', value);
            return value;
        }));
    }).catch(function (err) {
        console.log(err);
    })

}


function seedFlag() {
    
    const zabbix = new Zabbix({
        url: process.env.ZABBIXURL,
        user: 'Admin',
        password: 'zabbix'
    })
    zabbix.login().then(function (value) {

       

        return true
    }).catch(function (err) {
       return false
    })

}



function seedItems(user, password) {
    const zabbix = new Zabbix({
        url: process.env.ZABBIXURL,
        user: user,
        password: password
    })
    zabbix.login().then(function (value) {

        const templates = zabbix.request('template.create', {
            host: 'Camera template',
            groups: {
                "groupid": 1
            }
        })
        console.log(JSON.stringify(templates, null, 2))


        return templates
    }).then(function (templates) {
        console.log("Templates:",templates);
        seedTriggers("Admin", "zabbix", templates.templateids[0]);
        
        const items1 = [
            {
                name: "isSreaming",
                key_: "ffmpegrunning[{HOST.HOST}]",
                hostid: templates.templateids[0],
                type: 0,
                value_type: 2,
        
                delay: "5s"
            },
            {
                name: "Traffic Send",
                key_: "docker.containers[{HOST.HOST}, netout]",
                hostid: templates.templateids[0],
                type: 0,
                value_type: 0,
                units: "B/s",
                delay: "15s"
            },
            {
                name: "Traffic Received",
                key_: "docker.containers[{HOST.HOST}, netin]",
                hostid: templates.templateids[0],
                type: 0,
                value_type: 0,
                units: "B/s",
                delay: "15s"
            },
            {
                name: "Camera ping",
                key_: "aping[{HOST.DNS}]",
                hostid: templates.templateids[0],
                type: 0,
                value_type: 2,
                delay: "5s"
            },
            {
                name: "logs",
                key_: "logs[{HOST.HOST}]",
                type: 0,
                value_type: 3,
                hostid: templates.templateids[0],
                delay: "15s",
                preprocessing: [
                {
                    error_handler:0,
                    error_handler_params:null,
                    type:21,
                    params:`var floatValues =  /[f][p][s][=][ ]{0,1}[\\d]*[.]{0,1}[\\d]+/g;
                    if (value!=null) {
                     var match = value.match(floatValues)
                     return match[match.length-1].slice(4)
                    }else{
                    return -1}` 
                }]

            }
        ];


        const items = zabbix.request('item.create', items1);
        console.log(items);
        return items;
    }).then(function (value) {
        console.log("IDS", value)
        console.log("GetScript Logout:", zabbix.logout().then(function (value) {
            console.log('Loged out: ', value);
            return value;
        }));
    }).catch(function (err) {
        console.log(err);
    })


    
}

module.exports = seed;
module.exports.seedFlag = seedFlag;