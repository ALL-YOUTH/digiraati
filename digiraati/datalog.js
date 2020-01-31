var fs = require('fs');
var log_name = __dirname + '/logs/' + new Date().toISOString().slice(-24).replace(/\D/g,'').slice(0, 14) + "-data" + ".log";
var logs_to_parse = [];
var update_loop = setInterval(ParseLogs, 1000);

class Datalog{
    
    constructor(eventid, userid, timestamp, info = "")
    {
        log_json = {};
        log_json["id"] = makeid;
        log_json["eventid"] = eventid;
        log_json["userid"] = userid;
        log_json["timestamp"] = timestamp;
        log_json["additional_info"] = info;
        logs_to_parse.push(log_json);
    }

}

    module.exports = class Logger{
        constructor(){
            this.logs_to_parse = [];
            ParseLogs();
        }

        AppendLog(eventid, userid, timestamp, info = "")
    {
        var log_json = {};
        log_json["id"] = makeid;
        log_json["eventid"] = eventid;
        log_json["userid"] = userid;
        log_json["timestamp"] = timestamp;
        log_json["additional_info"] = info;
        logs_to_parse.push(log_json);
    }
    }

    function makeid() {
        id = "";
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        while(id.length < 12){
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    function ParseLogs()
    {
        if(logs_to_parse.length > 0)
        {
            log_to_parse = JSON.stringify(logs_to_parse.shift());
            var stream = fs.createWriteStream(log_name, {flags:'a'});
            stream.write(log_to_parse + "\n");
            stream.end();
        }
    }