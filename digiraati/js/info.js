var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
});


