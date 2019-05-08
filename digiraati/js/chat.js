var socket = io();
var council = "";
var logged_in = "";

//Check login
socket.emit("check login")
socket.on("not logged", function(){
  home();
});

$(function () {
  council = getUrlVars()["chat"];
  if(council.length == 0){
    home();
  }
  socket.emit('check login');
  socket.on('login success', function(name){
    logged_in = name;
  });

  socket.emit('get prev messages', council);
  //When server emits a message we go here
  //SENDING A MESSAGE PART
  $('form').submit(function(){
    message = document.getElementById('message_input').value;
    var info = { "message":message, "council":council };
    socket.emit('chat message', info);
    document.getElementById('message_input').value = "";
    return false;
  });

  socket.on('chat message', function(msg){
    try{
      previous_msg = document.getElementById("messages").lastChild.innerHTML;
    }
    catch(err){
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

function start_lakiteksti(){
  goToPage("/lakiteksti");
}

function home(){
  goToPage("/");
}

function _logout(){
  logout(logged_in);
  home();
}
