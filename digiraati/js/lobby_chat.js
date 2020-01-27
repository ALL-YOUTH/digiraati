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

  var original_messages = data["messages"].filter(element => element["parent"] == "");
  
  for(message of original_messages){
    create_message(message);
    var replies = data["messages"].filter(element => element["parent"] == message["id"]);
    for (reply of replies)
    {
      create_reply(reply);
    }
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
  var msg_time = new Date();
  var msg_timestamp = msg_time.getDate() + "." + (msg_time.getMonth() + 1) + "." + msg_time.getFullYear() + " " + ("0" + msg_time.getHours()).slice(-2) + ":" + ("0" + msg_time.getMinutes()).slice(-2) + ":" + ("0" + msg_time.getSeconds()).slice(-2);
  msg["sender"] = logged_in;
  msg["council"] = council;
  msg["content"] = document.getElementById('message_input').value;
  msg["timestamp"] = msg_timestamp;
  msg["id"] = makeid();
  socket.emit('request new message', msg);
  document.getElementById('message_input').value = "";
}

function create_message(msg){
  var nm = document.createElement('div');
  nm.classList.add("chat_message");
  nm.id = msg["id"];
  if (!msg.hasOwnProperty("timestamp") || msg["timestamp"] == undefined) {var msg_timestamp = ""}
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
    sender.innerHTML = msg["sender"] + " - " + msg_timestamp;
    sender.classList.add("message_list_sender_name");
    nm.appendChild(pic); nm.appendChild(sender);
  }
  else
  {
    var sender = document.createElement('a');
    // Try to fetch timestamp, if message does not have a timestamp or it is undefined, handle gracefully.
    sender.innerHTML = msg_timestamp;
    sender.classList.add("message_list_sender_name");
    nm.appendChild(sender);
  }
  var text = document.createElement('div'); // Actual text body
  //console.log(msg["content"]);
  text.innerHTML = msg["content"];
  text.classList.add("message_list_text");
  nm.appendChild(text);
  
  var likes_btn = document.createElement('div'); // Beginning of likes?
  likes_btn.classList.add("likes_btn"); likes_btn.classList.add("message_reactions"); likes_btn.classList.add("noselect");
  likes_btn.setAttribute("aria-label", "Samaa mieltä"); likes_btn.setAttribute("title", "Samaa mieltä");

  var dislikes_btn = document.createElement('div'); 
  dislikes_btn.classList.add("dislikes_btn"); dislikes_btn.classList.add("dislike_reactions"); dislikes_btn.classList.add("noselect");
  dislikes_btn.setAttribute("aria-label", "Eri mieltä"); dislikes_btn.setAttribute("title", "Eri mieltä");

  var goodargs_btn = document.createElement('div');
  goodargs_btn.classList.add("goodargs_btn"); goodargs_btn.classList.add("goodarg_reactions"); goodargs_btn.classList.add("noselect");
  goodargs_btn.setAttribute("aria-label", "Hyvin argumentoitu"); goodargs_btn.setAttribute("title", "Hyvin argumentoitu");

  if(msg["likes"] == undefined){ msg["likes"] = 0; }
  if(msg["dislikes"] == undefined) { msg["dislikes"] = 0;}
  if(msg["goodargs"] == undefined) { msg["goodargs"] = 0;}

  var likes_number = document.createElement('div');
  likes_number.id = msg["id"] + "likes";
  likes_number.classList.add("likes_number"); likes_number.classList.add("noselect");

  var dislikes_number = document.createElement('div');
  dislikes_number.id = msg["id"] + "dislikes";
  dislikes_number.classList.add("dislikes_number"); dislikes_number.classList.add("noselect");

  var goodargs_number = document.createElement('div');
  goodargs_number.id = msg["id"] + 'goodargs';
  goodargs_number.classList.add("goodargs_number"); goodargs_number.classList.add("noselect");

  likes_number.textContent = "  " + msg["likes"].length;
  dislikes_number.textContent = "   " + msg["dislikes"].length;
  goodargs_number.textContent = "   " + msg["goodargs"].length;
  nm.appendChild(likes_btn); nm.appendChild(likes_number); nm.appendChild(dislikes_btn); nm.appendChild(dislikes_number); nm.appendChild(goodargs_btn); nm.appendChild(goodargs_number);
  
  var reply = document.createElement('div');
  reply.classList.add("message_list_reply"); reply.classList.add("noselect");
  reply.textContent = "VASTAA";
  nm.appendChild(reply);

  if (msg["sender"] == logged_in)
  {
    var deleteMessage = document.createElement('div');
    deleteMessage.classList.add("message_list_delete"); deleteMessage.classList.add("noselect");
    deleteMessage.textContent = "POISTA VIESTI";
    nm.appendChild(deleteMessage);
  }

  var ml = document.getElementById('message_list');
  ml.appendChild(nm);
  last_message_sender = msg["sender"];
  var separator = document.createElement('div');
  separator.classList.add("separator");
  ml.appendChild(separator);
  ml.scrollTop = ml.scrollHeight;
  window.scrollTop = window.scrollHeight;
}

function create_reply(msg){
  var nm = document.createElement('div');
  nm.classList.add("reply_message");
  nm.id = msg["id"];
  if (!msg.hasOwnProperty("timestamp") || msg["timestamp"] == undefined) {var msg_timestamp = ""}
  else {var msg_timestamp = msg["timestamp"] + " "}

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
  sender.innerHTML = msg["sender"] + " - " + msg_timestamp;
  sender.classList.add("message_list_sender_name");
  nm.appendChild(pic); nm.appendChild(sender);
  
  var text = document.createElement('div'); // Actual text body
  //console.log(msg["content"]);
  text.innerHTML = msg["content"];
  text.classList.add("message_list_text");
  nm.appendChild(text);
  
  var likes_btn = document.createElement('div'); // Beginning of likes?
  likes_btn.classList.add("likes_btn"); likes_btn.classList.add("message_reactions"); likes_btn.classList.add("noselect");
  likes_btn.setAttribute("aria-label", "Samaa mieltä"); likes_btn.setAttribute("title", "Samaa mieltä");

  var dislikes_btn = document.createElement('div'); 
  dislikes_btn.classList.add("dislikes_btn"); dislikes_btn.classList.add("dislike_reactions"); dislikes_btn.classList.add("noselect");
  dislikes_btn.setAttribute("aria-label", "Eri mieltä"); dislikes_btn.setAttribute("title", "Eri mieltä");

  var goodargs_btn = document.createElement('div');
  goodargs_btn.classList.add("goodargs_btn"); goodargs_btn.classList.add("goodarg_reactions"); goodargs_btn.classList.add("noselect");
  goodargs_btn.setAttribute("aria-label", "Hyvin argumentoitu"); goodargs_btn.setAttribute("title", "Hyvin argumentoitu");

  if(msg["likes"] == undefined){ msg["likes"] = 0; }
  if(msg["dislikes"] == undefined) { msg["dislikes"] = 0;}
  if(msg["goodargs"] == undefined) { msg["goodargs"] = 0;}

  var likes_number = document.createElement('div');
  likes_number.id = msg["id"] + "likes";
  likes_number.classList.add("likes_number"); likes_number.classList.add("noselect");

  var dislikes_number = document.createElement('div');
  dislikes_number.id = msg["id"] + "dislikes";
  dislikes_number.classList.add("dislikes_number"); dislikes_number.classList.add("noselect");

  var goodargs_number = document.createElement('div');
  goodargs_number.id = msg["id"] + 'goodargs';
  goodargs_number.classList.add("goodargs_number"); goodargs_number.classList.add("noselect");

  likes_number.textContent = "  " + msg["likes"].length;
  dislikes_number.textContent = "   " + msg["dislikes"].length;
  goodargs_number.textContent = "   " + msg["goodargs"].length;
  nm.appendChild(likes_btn); nm.appendChild(likes_number); nm.appendChild(dislikes_btn); nm.appendChild(dislikes_number); nm.appendChild(goodargs_btn); nm.appendChild(goodargs_number);
  
  var reply = document.createElement('div');
  reply.classList.add("message_list_reply"); reply.classList.add("noselect");
  reply.textContent = "VASTAA";
  nm.appendChild(reply);

  if (msg["sender"] == logged_in)
  {
    var deleteMessage = document.createElement('div');
    deleteMessage.classList.add("message_list_delete"); deleteMessage.classList.add("noselect");
    deleteMessage.textContent = "POISTA VIESTI";
    nm.appendChild(deleteMessage);
  }

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

socket.on('new reply', function(msg){
  create_reply(msg)
});

$(document).on('click', ".message_list_reply", function(e)
{
  var original_message = e.target.parentElement;
  var replyContainer = document.createElement('div');
  replyContainer.setAttribute('data-parent', e.target.parentElement.id);
  replyContainer.id = makeid();
  var separator = document.createElement('div');
  separator.classList.add("separator");
  replyContainer.appendChild(separator);
  var replyBox = document.createElement('TEXTAREA');
  replyBox.id = replyContainer.id + "replybox";
  console.log("Replybox id: " + replyBox.id);
  replyBox.classList.add("reply_box");
  var replyButton = document.createElement('div');
  replyButton.innerHTML = '<i class="fas fa-arrow-circle-right fa-2x"></i>';
  replyButton.classList.add("noselect"); replyButton.classList.add("reply_btn");
  replyButton.id = replyContainer.id + "replyButton";
  replyContainer.appendChild(replyBox);
  replyContainer.appendChild(replyButton);
  original_message.insertAdjacentElement('afterend', replyContainer);
});

$(document).on('click', ".reply_btn", function(e){
  var textbox = document.getElementById(e.currentTarget.parentElement.id + "replybox");
  var msg_time = new Date();
  var msg_timestamp = msg_time.getDate() + "." + (msg_time.getMonth() + 1) + "." + msg_time.getFullYear() + " " + ("0" + msg_time.getHours()).slice(-2) + ":" + ("0" + msg_time.getMinutes()).slice(-2) + ":" + ("0" + msg_time.getSeconds()).slice(-2);
  var msg = {};
  msg["sender"] = logged_in;
  msg["council"] = council;
  msg["content"] = document.getElementById(e.currentTarget.parentElement.id+"replybox").value;
  msg["timestamp"] = msg_timestamp;
  msg["id"] = makeid();
  msg["parent"] = (e.currentTarget.parentElement.getAttribute('data-parent'));
  socket.emit('request new message', msg);
  document.getElementById(e.currentTarget.parentElement.id).parentNode.removeChild(e.currentTarget.parentElement);
  window.location.reload();
});

$(document).on('click', ".message_list_delete", function(e){
  data = {}
  data["council"] = council;
  data["mid"] = e.target.parentElement.id;
  socket.emit('request delete message', data);
});

$(document).on('click', '.message_reactions', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
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

$(document).on('click', '.dislike_reactions', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
    return;
  }
  data = {};
  data["council"] = council;
  data["mid"] = e.target.parentElement.id;
  data["liker"] = logged_in;
  socket.emit('request add dislike', data);
});

socket.on('update dislikes', function(mid, dislikes){
  var message = document.getElementById(mid+"dislikes");
  message.textContent = "   "+dislikes;
});


$(document).on('click', '.goodarg_reactions', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
    return;
  }
  data = {};
  data["council"] = council;
  data["mid"] = e.target.parentElement.id;
  data["liker"] = logged_in;
  socket.emit('request add goodarg', data);
});

socket.on('update goodargs', function(mid, goodargs){
  var message = document.getElementById(mid+"goodargs");
  message.textContent = "   "+goodargs;
});

socket.on('delete message', function(mid){
  var message = document.getElementById(mid);
  console.log(message);
  var message_text = message.querySelector(".message_list_text");
  message_text.innerHTML = "<em>Käyttäjä on poistanut tämän viestin.</em>";
  //message.getElementsByClassName
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
