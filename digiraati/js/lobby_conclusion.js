var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("check login council", council);
  socket.emit("request council data", council);
});

socket.on('council data', function(data){
  console.log(data);
  $('#left_menu_title').html(data["name"]);
  $('#conclusion_input').text(data["conclusion"]);
});

$('#save_conclusion_text').click(function(){
  var data = {};
  data["council"] = council;
  data["text"] = $('#conclusion_input').val();
  socket.emit('request conclusion update', data);
});

$('#refresh_conclusion_text').click(function(){
  socket.emit('request conclusion refresh', council);
});

$('#conclusion_input').keydown(function(e){
  var key = e.keyCode;
    if (key === 13) {
      e.preventDefault();
      document.getElementById("conclusion_input").value += "\n";
    }
    else if(key == 9){
      e.preventDefault();
      document.getElementById("conclusion_input").value += "  ";
    }
    return;
});


socket.on('update conclusion', function(){
  goToPage("/lobby/" + council + "/conclusion");
});

socket.on("login success", function(){
  var data = {};
  data["council"] = council;
  data["user"] = logged_in;
  socket.emit("request socket list", council);
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
