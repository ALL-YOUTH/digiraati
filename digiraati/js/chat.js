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

  socket.on('chat message', function(c, msg){
    if(council != c){
      return;
    }
    try{
      previous_msg = document.getElementById("messages").lastChild.innerHTML;
    }
    catch(err){
      $('#messages').append($('<li>').text(msg));
      window.scrollTo(0, document.body.scrollHeight);
      return;
    }

    var c_menu = document.createElement("input");
    c_menu.setAttribute("type", "button");
    c_menu.value = "Tykkää";
    c_menu.style.display = "none";
    index = previous_msg.indexOf(":");
    previous_sender = previous_msg.substr(0,index);
    this_sender = msg.substr(0,msg.indexOf(":"));
    if(previous_sender == this_sender){
      msg = msg.replace(msg.substr(0, index+1), "");
      document.getElementById('messages').lastChild.innerHTML += "<br>   " + msg;
    }
    else{
      var new_comment = document.createElement("li");
      new_comment.innerHTML = msg;
      new_comment.classList.add("comment_menu");
      new_comment.appendChild(c_menu);

      document.getElementById("messages").appendChild(new_comment);
      //$('#messages').append($('<li>').text(msg));

      window.scrollTo(0, document.body.scrollHeight);
    }
    window.scrollTo(0, document.body.scrollHeight);
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
