var socket = io();
var council_data = {};
var council_id = {};

$(function () {
  council_id = getUrlVars()["lobby"];
  socket.emit('request council data', council_id);
  socket.emit('check joined', )
});


socket.on('council data', function(data){
  council_data = data;
  document.getElementById('lobby-title').innerHTML = data["title"];
  document.getElementById('lobby-keywords').innerHTML = data["tags"];
  document.getElementById('lobby-description-text').innerHTML = data["description"];
  document.getElementById('lobby-startdatetime-text').innerHTML = data["startdate"] + " " + data["starttime"];
  document.getElementById('lobby-enddatetime-text').innerHTML = data["enddate"] + " " + data["endtime"];
});

function open_chat(){
  var url = "/chat?chat=" + council_id;
  goToPage(url);
}

function open_material(){
  var url = "/material?material=" + council_id;
  goToPage("/lakiteksti");
}
