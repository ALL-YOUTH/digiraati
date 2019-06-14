var socket = io();
var council_data = {};
var council_id = {};

$(function () {
  council_id = getUrlVars()["lobby"];
  socket.emit('request council data', council_id);
});


//council_data is in a format
//council_data["title"]
//council_data["description"]
//council_data["creator"]
//council_data["starttime"]
//council_data["endtime"]
socket.on('council data', function(data){
  council_data = data;
  document.getElementById('lobby-title').innerHTML = data["title"];
});

function open_chat(){
  var url = "/chat?chat=" + council_id;
  goToPage(url);
}

function open_material(){
  var url = "/material?material=" + council_id;
  goToPage("/lakiteksti");
}
