var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
  $('#header').load(host + "/html/2.0/header.html");
  $('#footer').load(host + "/html/2.0/footer.html");

  var id = window.location.href.split("/").slice(-2)[0];
  socket.emit("request council data", id);
});

function uniqId() {
  return Math.round(new Date().getTime() + (Math.random() * 100));
}

socket.on('council data', function(data){
  console.log(data);
  $('#lobby_title').html(data["title"]);
  $('#lobby_timetable').html(data["startdate"] + " " + data["starttime"]
                        + " - " + data["enddate"] + " " + data["endtime"]);
  $('#lobby_description_title').html(data["name"]);
  $('#lobby_description').html(data["description"]);
  for(var i = 0; i < data["tags"].length; ++i){
    var tag = document.createElement('div');
    tag.classList.add("lobby_tag");
    tag.innerHTML = data["tags"][i];
    document.getElementById("lobby_tags").appendChild(tag);
  }
});
