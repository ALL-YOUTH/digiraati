var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var last_message_sender = null;

var colors = ["aqua", "blueviolet", "chartreuse", "chocolate", "coral",
              "cyan", "darkkhaki", "darkorange", "darksalmon", "darkturquoise",
              "deepskyblue", "forestgreen", "fuchsia", "gold", "greenyellow",
              "hotpink", "khaki", "lightgreen", "lightsalmon", "lightskyblue",
              "lime", "limegreen", "mediumaquamarine", "mediumorchid",
              "mediumspringgreen", "olive", "olivedrab", "orange", "orchid",
              "palevioletred", "peachpuff", "plum", "powderblue", "sandybrown",
              "silver", "salmon", "royalblue", "red", "springgreen", "tan",
              "thistle", "tomato", "turquoise", "violet", "wheat", "yellow",
              "yellowgreen"];

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("check login council", council);
  socket.emit("request council data", council);
});

socket.on('council data', function(data){
  $('#left_menu_title').html(data["name"].toUpperCase());
  $('#chat_title').html(data["name"].toUpperCase());
  //$('#chat_description').html(data["description"]);
  $('#chat_hashtag').html("#"+data["name"].toLowerCase().replace(" ", ""));
  var h = document.getElementById('chat_content').offsetHeight +
          document.getElementById('header').offsetHeight;
  $('#chat_container').css("height", h + "px");
  for(message of data["messages"]){
    create_message(message);
  }
});

socket.on("login success", function(){
  socket.emit("request socket list", council);
});

window.onscroll = function(e){
  if ($(window).height() + $(window).scrollTop() > $(document).height() - $("#footer").height()) {
    var h = $(document).height() - $(window).height() - $(window).scrollTop() - $("#footer").height()
    $('#chat_message_input').css("bottom", Math.abs(h)+"px");
  }
  else{
    $('#chat_message_input').css("bottom", "0px");
  }
}

$("#message_input").keypress(function (e) {
  if(e.which == 13 && e.shiftKey){
    e.preventDefault();
    var position = this.selectionEnd;
    this.value = this.value.substring(0, position) + '\n' + this.value.substring(position);
    this.selectionEnd = position+1;
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
  msg["id"] = makeid();
  socket.emit('request new message', msg);
  document.getElementById('message_input').value = "";
}

function create_message(msg){
  var nm = document.createElement('div');
  nm.classList.add("chat_message");
  nm.id = msg["id"];
  if (!msg.hasOwnProperty('timestamp') || msg["timestamp"] == undefined) {var msg_timestamp = ""}
  else {var msg_timestamp = msg["timestamp"] + " "}
  if(last_message_sender != msg["sender"]){
    var pic = document.createElement('div');
    pic.textContent = msg["sender"][0].toUpperCase();
    var c = 0;
    for(var i = 0; i < msg["sender"].length; ++i){
      c += msg["sender"].charCodeAt(i);
    }
    pic.style.backgroundColor = colors[c % colors.length];
    pic.classList.add("chat_avatar_ball");
    var sender = document.createElement('a');
    // Try to fetch timestamp, if message does not have a timestamp or it is undefined, handle gracefully.
    sender.innerHTML = msg["sender"] + "-" + timestamp;
    sender.classList.add("message_list_sender_name");
    nm.appendChild(pic); nm.appendChild(sender);
  }
  else
  {
    var sender = document.createElement('a');
    // Try to fetch timestamp, if message does not have a timestamp or it is undefined, handle gracefully.
    sender.innerHTML = timestamp;
    sender.classList.add("message_list_sender_name");
    nm.appendChild(sender);
  }
  var text = document.createElement('div'); // Actual text body
  console.log(msg["content"]);
  text.textContent = msg["content"];
  text.classList.add("message_list_text");
  nm.appendChild(text);
  
  var likes_btn = document.createElement('div'); // Beginning of likes?
  likes_btn.innerHTML = msg_timestamp;
  likes_btn.classList.add("likes_btn"); likes_btn.classList.add("message_reactions"); likes_btn.classList.add("noselect");

  if(msg["likes"] == undefined){ msg["likes"] = 0; }

  var likes_number = document.createElement('div');
  likes_number.id = msg["id"] + "likes";
  likes_number.classList.add("likes_number"); likes_number.classList.add("noselect");

  likes_number.textContent = "  " + msg["likes"].length;
  nm.appendChild(likes_btn); nm.appendChild(likes_number);
  
  var reply = document.createElement('div');
  reply.classList.add("message_list_reply"); reply.classList.add("noselect");
  reply.textContent = "VASTAA";
  nm.appendChild(reply);

  var ml = document.getElementById('message_list');
  ml.appendChild(nm);
  last_message_sender = msg["sender"];
  var separator = document.createElement('div');
  separator.classList.add("separator");
  ml.appendChild(separator);
  ml.scrollTop = ml.scrollHeight;
  window.scrollTop = window.scrollHeight;
}

socket.on('new message', function(msg){
  create_message(msg);
});

$(document).on('click', '.message_reactions', function(e){
  if(logged_in.length < 1){
    alert("sinun täytyy kirjautua sisään ensin.");
    return;
  }
  data = {};
  data["council"] = council;
  data["mid"] = e.target.parentElement.id;
  data["liker"] = logged_in;
  socket.emit('request add like', data);
});

socket.on('update likes', function(mid, likes){
  var message = document.getElementById(mid+"likes");
  message.textContent = "   "+likes;
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
