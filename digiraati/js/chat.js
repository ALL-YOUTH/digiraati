$(function () {
  var socket = io();
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

  //When server emits a message we go here
  socket.on('chat message', function(msg){
    try{
      previous_msg = document.getElementById("messages").lastChild.innerHTML;
    }
    catch(err){
      console.log("First message in the chat");
      $('#messages').append($('<li>').text(msg));
      window.scrollTo(0, document.body.scrollHeight);
      return;
    }
    index = previous_msg.indexOf(":");
    previous_sender = previous_msg.substr(0,index);
    this_sender = msg.substr(0,msg.indexOf(":"));
    if(previous_sender == this_sender){
      msg = msg.replace(msg.substr(0, index+1), "");
      document.getElementById('messages').lastChild.innerHTML += "<br>   " + msg;
    }
    else{
      $('#messages').append($('<li>').text(msg));
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
});
function home(){
  window.location = "/";
}
