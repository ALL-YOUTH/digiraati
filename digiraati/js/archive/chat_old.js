$(function () {
  socket.emit('get prev messages', council_id);
  //When server emits a message we go here
  //SENDING A MESSAGE PART
  $('form').submit(function(){
    message = document.getElementById('message_input').value;
    var info = { "sender":logged_in, "message":message, "council":council_id };
    socket.emit('chat message', info);
    document.getElementById('message_input').value = "";
    return false;
  });

  socket.on('chat message', function(c, msg){
    var cont = document.getElementById('messages');
    if(msg.length == ""){ return; }
    if(council_id != c){ return; }
    try{
      previous_msg = document.getElementById("messages").lastChild.innerHTML;
    }
    catch(err){
      previous_msg = "";
    }

    var c_menu = document.createElement("a");
    c_menu.innerHTML = "Tykkää";
    c_menu.classList.add("comment_menu");
    c_menu.onclick = function(){ console.log("Tykkäsit kommentista")};
    index = previous_msg.indexOf(":");
    previous_sender = previous_msg.substr(0,index);
    this_sender = msg.substr(0,msg.indexOf(":"));
    if(previous_sender == this_sender){
      msg = msg.replace(msg.substr(0, index+1), "");
      document.getElementById('messages').lastChild.innerHTML += "<br>   " + msg;
    }
    else{
      var new_comment = document.createElement("div");
      new_comment.innerHTML = msg;
      new_comment.appendChild(c_menu);
      document.getElementById("messages").appendChild(new_comment);
    }
    cont.scrollTo(0, cont.scrollHeight);
  });
});

function start_lakiteksti(){
  goToPage("/lakiteksti");
}

function home(){
  goToPage("/");
}

function logout(){
  logout(logged_in);
  home();
}
