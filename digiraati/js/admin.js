var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

var backup_file = path.join(__dirname, "backup.json");

var recover_users;
var recover_councils;

$(function(){
    socket.emit('request backup file');
}

socket.on()