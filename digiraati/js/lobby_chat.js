var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  var id = window.location.href.split("/").slice(-2)[0];
  socket.emit("request council data", id);
});

function uniqId() {
  return Math.round(new Date().getTime() + (Math.random() * 100));
}

socket.on('council data', function(data){

});
