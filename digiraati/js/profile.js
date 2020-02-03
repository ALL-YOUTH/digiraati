var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var selected_avatar = "";
var active_username = "";

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");
  socket.emit('check login');
  socket.emit('request user data');
  $("avatar_container").hide();
});

socket.on("not logged", function(){
  goToPage("/");
});

$('#profile_avatar').click(function(){
  document.getElementById('avatar_container').style.display = "block";
});

$('#cancel_btn').click(function(){
  document.getElementById('avatar_container').style.display = "none";
});

$('save_btn').click(function(){
  if (selected_avatar != "")
  {
    var av_data = {};
    av_data["username"] = active_username;
    av_data["avatar"] = selected_avatar;
    socket.on('request avatar change', av_data);
  }
});

$('#create_new_council').click(function(){
  document.getElementById('my_councils').className = "inactive";
  document.getElementById('all_councils').className = "inactive";
  document.getElementById('followed_councils').className = "inactive";
  document.getElementById('my_activity').className = "inactive";
  document.getElementById('tags').className = "inactive";
  document.getElementById('create_new_council').className = "active";
  goToPage("/create");
});

$('#my_councils').click(function(){
  document.getElementById('my_councils').className = "active";
  document.getElementById('all_councils').className = "inactive";
  document.getElementById('followed_councils').className = "inactive";
  document.getElementById('my_activity').className = "inactive";
  document.getElementById('tags').className = "inactive";
  document.getElementById('create_new_council').className = "inactive";
});

$('#all_councils').click(function(){
  document.getElementById('my_councils').className = "inactive";
  document.getElementById('all_councils').className = "active";
  document.getElementById('followed_councils').className = "inactive";
  document.getElementById('my_activity').className = "inactive";
  document.getElementById('tags').className = "inactive";
  document.getElementById('create_new_council').className = "inactive";
});

$('#followed_councils').click(function(){
  document.getElementById('my_councils').className = "inactive";
  document.getElementById('all_councils').className = "inactive";
  document.getElementById('followed_councils').className = "active";
  document.getElementById('my_activity').className = "inactive";
  document.getElementById('tags').className = "inactive";
  document.getElementById('create_new_council').className = "inactive";
});

$('#my_activity').click(function(){
  document.getElementById('my_councils').className = "inactive";
  document.getElementById('all_councils').className = "inactive";
  document.getElementById('followed_councils').className = "inactive";
  document.getElementById('my_activity').className = "active";
  document.getElementById('tags').className = "inactive";
  document.getElementById('create_new_council').className = "inactive";
});

$('#tags').click(function(){
  document.getElementById('my_councils').className = "inactive";
  document.getElementById('all_councils').className = "bactive";
  document.getElementById('followed_councils').className = "inactive";
  document.getElementById('my_activity').className = "inactive";
  document.getElementById('tags').className = "active";
  document.getElementById('create_new_council').className = "inactive";
});

socket.on('user data', function(data){
  $('#profile_real_name').text(data["fname"] + " " + data["lname"]);
  $('#profile_username').text(data["username"]);
  $('#profile_description').text(data["description"]);
  $('#profile_hometown').text(data["location"]);
  $('#profile_avatar').text(data["picture"]);
  active_username = data["username"];
});

$('#edit_profile').click(function(){
  goToPage('editprofile');
});
