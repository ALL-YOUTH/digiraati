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
  $('#profile_real_name').text(data["fname"] + " " + data["lname"]);
  $('#profile_username').text(data["username"]);
  $('#profile_description').text(data["description"]);
  $('#profile_hometown').text(data["location"]);
  $('#profile_avatar').text(data["picture"]);
});

$('#edit_profile').click(function(){
  goToPage('editprofile');
});
