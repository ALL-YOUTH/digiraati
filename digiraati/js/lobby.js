var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("request council data", council);
});

socket.on('council data', function(data){
  $('#lobby_title').html(data["name"]);
  $('#lobby_timetable').html(data["startdate"] + " " + data["starttime"]
                        + " - " + data["enddate"] + " " + data["endtime"]);
  $('#lobby_description_title').html(data["name"]);
  $('#lobby_description').html(data["description"]);
  for(var i = 0; i < data["tags"].length; ++i){
    var tag = document.createElement('div');
    tag.classList.add("lobby_tag");
    tag.textContent = data["tags"][i];
    document.getElementById("lobby_tags").appendChild(tag);
  }
});

$('#lobby_home_btn').click(function(){
  goToPage("/lobby/" + council + "/index");
});

$('#lobby_chat_btn').click(function(){
  goToPage("/lobby/" + council + "/chat");
});

$('#lobby_document_btn').click(function(){
  goToPage("/lobby/" + council + "/material");
});
