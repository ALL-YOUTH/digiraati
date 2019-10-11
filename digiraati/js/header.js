var hamburger_menu_open = false;
var socket = io();
var logged_in = "";
var view = "";

socket.emit('check login');

if($(window).width() < 800){
  view = "mobile";
}
else{
  view = "desktop";
}

window.onresize = function(){
  if(view == "desktop" && $(window).width() < 800){
    socket.emit('check login');
    view = "mobile";
  }
  else if(view == "mobile" && $(window).width() > 799){
    socket.emit('check login');
    view = "desktop";
  }
}

$('#Kirjaudu_ulos_btn').hide();

$("#Etusivu_btn").click(function(){
  goToPage("/");
});

$("#logo_div").click(function(){
  goToPage("/");
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
  goToPage("/");
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

$('#Kirjaudu_ulos_btn').click(function(){
  socket.emit('logout attempt', logged_in);
});

$('#hamburger_signout').click(function(){
  socket.emit('logout attempt', logged_in);
});

$('#login_confirm').click(function(){
  var email = $('#login_email').val();
  var password = $('#login_password').val();
  socket.emit('login attempt', email, password);
});

function mobile_header_fix(){
  $('#Kirjaudu_btn').hide();
  $('#Kirjaudu_ulos_btn').hide();
}

socket.on("login success", function(name){
  logged_in = name;
  if($(window).width() > 799){
    $('#login_div').css("display", "none");
    $('#Profile_avatar').show();
    $('#Kirjaudu_btn').hide();
    $('#Kirjaudu_ulos_btn').show();
  }
  else{
    $('#hamburger_avatar').show()
    $('#login_div').css("display", "none");
    $('#hamburger_signin').hide();
    $('#hamburger_signout').show();
    $('#Kirjaudu_btn').hide();
    $('#Kirjaudu_ulos_btn').hide();
  }
});

socket.on('logout success', function(){
  logged_in = "";
  if($(window).width() > 799){
    $('#Profile_avatar').hide();
    $('#Kirjaudu_btn').show();
    $('#Kirjaudu_ulos_btn').hide();
  }
  else{
    $('#hamburger_avatar').hide()
    $('#hamburger_signin').show();
    $('#hamburger_signout').hide();
    $('#Kirjaudu_btn').hide();
    $('#Kirjaudu_ulos_btn').hide();
  }
});

socket.on('not logged', function(){
  logged_in = "";
  if($(window).width() > 799){
    $('#Profile_avatar').hide();
    $('#Kirjaudu_btn').show();
    $('#Kirjaudu_ulos_btn').hide();
  }
  else{
    $('#hamburger_avatar').hide()
    $('#hamburger_signin').show();
    $('#hamburger_signout').hide();
    $('#Kirjaudu_btn').hide();
    $('#Kirjaudu_ulos_btn').hide();
  }
});
