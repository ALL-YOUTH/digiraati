<script type="text/javascript">
$(function(){
console.log("initiated login");
//When submit is pressed
$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

//Quit pressed
$('#exit').click(function(){
  socket.emit('user logout');
  window.location = "/";
});
socket.on('new user', function(){
  var txt;
  var person = prompt("Hello new user. \nPlease enter your name:", "");
  if (person == null || person == "") {
    window.location = "/";
  }
  else{
    socket.emit('name submit', person);
  }
});

socket.on('invalid nickname', function(){
  var txt;
  var person = prompt("Name already in use. Try another");
  if (person == null || person == "") {
    alert("User cancelled the prompt.");
  }
  else{
    socket.emit('name submit', person);
  }
});
</scirpt>
