var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
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
  data["username"] = logged_in;
  data["pw1"] = $('#pw1_input').val();
  data["pw2"] = $('#pw2_input').val();
  if(data["pw1"] != data["pw2"]){
    alert("Salasanat eivät täsmää");
    $('#pw1_input').val("");
    $('#pw2_input').val("");
    return;
  }
  socket.emit("request update password", data);
});

socket.on('password update success', function(){
  goToPage("profile");
});
