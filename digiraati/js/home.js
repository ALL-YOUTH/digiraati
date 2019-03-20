var socket = io();
var logged_in = false;
var redirect = "/";

$(function(){
  //Quit pressed
  $('#logout').click(function(){
    socket.emit('user logout');
    goToPage();
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
    goToPage(redirect);
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
      redirect = "chat";
      login();
    }
    else{
      goToPage("chat");
    }
  }
function startLakiteksti(){
    goToPage("lakiteksti");
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
