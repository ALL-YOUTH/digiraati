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
  $('#left_menu_title').html(data["name"]);
  $('#conclusion_input').text(data["conclusion"]);
});

$('#save_conclusion_text').click(function(){
  var data = {};
  data["council"] = council;
  data["text"] = $('#conclusion_input').val();
  socket.emit('request conclusion update', data);
  goToPage("/lobby/" + council + "/conclusion");
});

/*socket.on('update conclusion', function(text){
  $('#conclusion_input').text(text);
});*/

socket.on("login success", function(){
  socket.emit("request join council", council);
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
