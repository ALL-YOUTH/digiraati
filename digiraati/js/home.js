var socket = io();
var logged_in = false;

$(function(){
  //Quit pressed
  $('#logout').click(function(){
    socket.emit('user logout');
    refresh();
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

  socket.on('login success', function(){
    refresh();
  });

  socket.on('not logged', function(){
    $("#user-logged-in").css('display', 'none');
    $("#login_btn").css('display', 'block');
    $("#logout_btn").css('display', 'none');
    logged_in = false;
  });

  socket.on('logged', function(name){
    $("#user-logged-in").html("Logged in as: " + name);
    $("#user-logged-in").css('display', 'block');
    $("#login_btn").css('display', 'none');
    $("#logout_btn").css('display', 'block');
    logged_in = true;
  });
});

function startChat() {
    if(!logged_in){
      login();
    }
    else{
      window.location = "chat";
    }
  }
function startLakiteksti(){
    window.location = "lakiteksti";
}
function login(){
  var txt;
  var person = prompt("Hello new user. \nPlease enter your name:", "");
  if (person == null || person == "") {
    return;
  }
  else{
    socket.emit('name submit', person);
  }
}

function logout(){
  socket.emit('user logout');
  refresh();
}

function refresh(){
  window.location = "/";
}
