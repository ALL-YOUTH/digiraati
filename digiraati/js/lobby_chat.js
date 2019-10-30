var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var last_message_sender = null;

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("check login council", council);
  socket.emit("request council data", council);
});

socket.on('council data', function(data){
  $('#left_menu_title').html(data["name"]);
  $('#chat_title').html(data["name"]);
  $('#chat_timetable').html("Käynnissä:", data["startdate"], data["starttime"], " - ", data["enddate"], data["endtime"]);
  $('#chat_description').html(data["description"]);
  $('#chat_hashtag').html("#"+data["name"].toLowerCase());
  var h = document.getElementById('chat_content').offsetHeight +
          document.getElementById('header').offsetHeight;
  $('#chat_container').css("height", h + "px");
  for(message of data["messages"]){
    create_message(message);
  }
});

window.onscroll = function(e){
  var h = window.scrollY + screen.height - $(document).height() - $('#footer').height();
  if (h > -200) {
    h = 200 + h;
    $('#chat_message_input').css("bottom", Math.abs(h)+"px");
  }
  else{
    $('#chat_message_input').css("bottom", "0px");
  }
}

$("#message_input").keypress(function (e) {
  if(e.which == 13 && e.shiftKey){
    return;
  }
  else if(e.which == 13) {
    e.preventDefault();
    send_message();
  }
});

$('#send_btn').click(function(e){
  e.preventDefault();
  send_message();
});

function send_message(){
  if(document.getElementById('message_input').value.length < 1){
    return;
  }
  var msg = {};
  if(logged_in == ""){
    alert("Et ole kirjautuneena sisään. Jotta voit lähettää viestin, sinun täytyy olla kirjautunut.");
    return;
  }
  msg["sender"] = logged_in;
  msg["council"] = council;
  msg["content"] = document.getElementById('message_input').value;
  socket.emit('request new message', msg);
  document.getElementById('message_input').value = "";
}

function create_message(msg){
  var nm = document.createElement('div');
  nm.classList.add("chat_message");
  if(last_message_sender != msg["sender"]){
    var pic = document.createElement('img');
    pic.src = "/res/avatar.png";
    var sender = document.createElement('a');
    sender.innerHTML = msg["sender"];
    nm.appendChild(pic); nm.appendChild(sender);
  }
  var text = document.createElement('div');
  text.innerHTML = msg["content"];
  nm.appendChild(text);
  var ml = document.getElementById('message_list');
  ml.appendChild(nm);
  last_message_sender = msg["sender"];
  ml.appendChild(document.createElement('hr'));
  ml.scrollTop = ml.scrollHeight;
}

socket.on('new message', function(msg){
  create_message(msg);
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
