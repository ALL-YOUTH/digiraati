var hamburger_menu_open = false;
var socket = io();

$("#Etusivu_btn").click(function(){
  goToPage("/2.0");
});

$("#logo_div").click(function(){
  goToPage("/2.0");
});

$("#Rekistroidy_btn").click(function(){
  goToPage("/2.0/register");
});

function open_hamburger_menu(){
  $('#hamburger_menu').animate({right: "0"});
  hamburger_menu_open = true;
}

function close_hamburger_menu(){
  $('#hamburger_menu').animate({right: "-200px"});
  hamburger_menu_open = false;
}

$('#hamburger_div').click(function(){
  if(!hamburger_menu_open){
    open_hamburger_menu();
  }
  else{
    close_hamburger_menu();
  }
});

$('#hamburger_close').click(function(){
  close_hamburger_menu();
});

$('#hamburger_index').click(function(){
  goToPage("/2.0");
});

$('#hamburger_register').click(function(){
  goToPage("/2.0/register");
});

$('#arrow_left').click(function(){
  window.history.back();
});

$('#hamburger_signin').click(function(){
  open_login_menu();
  close_hamburger_menu();
});

function open_login_menu(){
  $('#login_div').css("display", "block");
}

function close_login_menu(){
  $('#login_div').css("display", "none");
}

$('#login_close_btn').click(function(){
  close_login_menu();
})

$('#Kirjaudu_btn').click(function(){
  open_login_menu();
});

$('#login_confirm').click(function(){
  var email = $('#login_email').val();
  var password = $('#login_password').val();
  socket.emit('login attempt', email, password);
});

socket.on("login success", function(){
  console.log("hyvin kirjauduttu sisään");
  $('#login_div').css("display", "none");
});
