var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");
  socket.emit('check login');
  socket.emit('request user data');
});

socket.on("not logged", function(){
  goToPage("/");
});

$('#create_new_council').click(function(){
  goToPage("/create");
});

socket.on('user data', function(data){
  $("#username_input").val(data["username"]);
  $("#fname_input").val(data["fname"]);
  $("#lname_input").val(data["lname"]);
  $("#email_input").val(data["email"]);
  $("#description_input").val(data["description"]);
  $("#hometown_input").val(data["location"]);
});

function clear_error(){

}

function mark_errors(err){

}


$('#update_profile_info').click(function(){
  var data = {};
  data["username"] = $('#username_input').val();
  data["fname"] = $('#fname_input').val();
  data["lname"] = $('#lname_input').val();
  data["email"] = $('#email_input').val();
  data["description"] = $('#description_input').val();
  data["location"] = $('#hometown_input').val();
  socket.emit('request update info', data);
});

socket.on('info update success', function(){
  goToPage("profile");
});

$('#update_pw').click(function(){
  data = {};
  data["pw1"] = $('#pw1_input').val();
  data["pw2"] = $('#pw2_input').val();
  socket.emit("request update password", data);
});
