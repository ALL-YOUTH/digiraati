var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var logged_in = "";

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("request council data", council);
});

socket.on('login success', function(name){
  logged_in = name;
  socket.emit("request council data", council);
});

socket.on('council data', function(data){
  $('#lobby_title').text(data["name"].toUpperCase());
  $('#lobby_starttime').text("Alkaa: " + data["startdate"] + " " + data["starttime"]);
  $('#lobby_endtime').text('Loppuu: ' + data["enddate"] + " " + data["endtime"]);
  $('#lobby_description_title').html(data["name"]);
  $('#lobby_description').html(data["description"]);
  for(var i = 0; i < data["tags"].length; ++i){
    if(data["tags"][i] == ""){
      continue;
    }
    var tag = document.createElement('div');
    tag.classList.add("lobby_tag");
    tag.textContent = data["tags"][i];
    document.getElementById("lobby_tags").appendChild(tag);
  }
  $("#leave_council_btn").css("display", "none");
  $("#join_council_btn").css("display", "none");
  if(logged_in != ""){
    $("#leave_council_btn").css("display", "none");
    $("#join_council_btn").css("display", "block");
    for(var j = 0; j < data["users"].length; ++j){
      if(logged_in == data["users"][j]){
        $("#leave_council_btn").css("display", "block");
        $("#join_council_btn").css("display", "none");
        $("#lobby_document_btn").removeClass("disabled");
        $("#lobby_chat_btn").removeClass("disabled");
        $("#lobby_conclusion_btn").removeClass("disabled");
        break;
      }
    }

  }
});

$('#join_council_btn').click(function(){
  var data = {};
  data["council"] = council;
  data["user"] = logged_in;
  socket.emit('request join council', data);
});

$('#leave_council_btn').click(function(){
  var data = {};
  data["council"] = council;
  data["user"] = logged_in;
  socket.emit('request leave council', data);
});

socket.on('join success', function(){
  location.reload();
});

socket.on('leave success', function(){
  location.reload();
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

$('#lobby_conclusion_btn').click(function(){
  goToPage("/lobby/" + council + "/conclusion");
});
