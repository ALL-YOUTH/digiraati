var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var questionnaire = [];
var myAnswers = [];
var tempAnswers = [];
var allAnswers = [];
var data = {};

$(function(){
  console.log("This just happened");
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("check login council", council);
  socket.emit("request council data", council);
  $('#refresh_conclusion_text').hide();
  $('#conclusion_input').hide();
  $('#save_conclusion_text').hide();
  $('#questionnaire_container').show();
  console.log("setting up data")
  data["council_id"] = council;
  console.log("requesting questionnaire");
  socket.emit('request questionnaire', data);
  //myAnswers = socket.emit('request answers by userid', data);
});

socket.on('council data', function(data){
  $('#left_menu_title').html(data["name"]);
  $('#conclusion_input').text(data["conclusion"]);
});

$('#questionnaire_btn').click(function(){
  $('#refresh_conclusion_text').hide();
  $('#conclusion_input').hide();
  $('#save_conclusion_text').hide();
  $('#questionnaire_container').show();
  document.getElementById('questionnaire_btn').className = "active";
  document.getElementById('view_answers_btn').className = "inactive";
  document.getElementById('conclusion_btn').className = "inactive";
});

$('#view_answers_btn').click(function(){
  $('#refresh_conclusion_text').hide();
  $('#conclusion_input').hide();
  $('#save_conclusion_text').hide();
  $('#questionnaire_container').show();
  document.getElementById('questionnaire_btn').className = "inactive";
  document.getElementById('view_answers_btn').className = "active";
  document.getElementById('conclusion_btn').className = "inactive";
});

$('#conclusion_btn').click(function(){
  $('#refresh_conclusion_text').show();
  $('#conclusion_input').show();
  $('#save_conclusion_text').show();
  $('#questionnaire_container').hide();
  document.getElementById('questionnaire_btn').className = "inactive";
  document.getElementById('view_answers_btn').className = "inactive";
  document.getElementById('conclusion_btn').className = "active";
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
  return;
});

socket.on('update conclusion', function(){
  goToPage("/lobby/" + council + "/conclusion");
});

socket.on("userid request response", function(user_id){
  data["user_id"] = user_id;
  console.log("Received user_id " + user_id);
})

socket.on("questionnaire request response", function(response)
{
  data["questions"] = response;
  console.log("received questions " + response);
});

socket.on("login success", function(response){
  console.log("I received this in return: " + response);
  data["username"] = response;
  socket.emit("request userid by username", response);
  socket.emit("request socket list", council);
});

function add_question(question)
{
  var qv = document.getElementById("#questionnaire_viewer")
}


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
