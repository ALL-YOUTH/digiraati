var hamburger_menu_open = false;
var socket = io();
var logged_in = "";
var view = "";

var colors = ["#FE0456", "#CBE781", "#01AFC4", "#FFCE4E"];

if (typeof(sessionStorage) === undefined)
{
  alert("Selaimesi ei tunnu tukevan evästeitä. Digiraati.fi vaatii evästeitä toimiakseen, joten sivusto tuskin toimii selaimessasi. Voit koittaa käyttää toista selainta, tai ottaa yhteyttä opettajaasi tai IT-tukihenkilöösi.");
}

$(function(){
  socket.emit('check login', window.sessionStorage.getItem('token'), function(reply)
  {
    processLoginCheckReply(reply);
  });
})

function processLoginCheckReply(reply)
{
  console.log(reply);
  if (reply == "not_logged")
  {
    window.sessionStorage.clear();
    logged_in = "";
    if(view == "desktop"){
      $('#Profile_avatar').hide();
      $('#Kirjaudu_btn').show();
      $('#Kirjaudu_ulos_btn').hide();
    }
    else if(view == "mobile"){
      $('#hamburger_avatar').hide()
      $('#hamburger_signin').show();
      $('#hamburger_signout').hide();
      $('#Kirjaudu_btn').hide();
      $('#Kirjaudu_ulos_btn').hide();
    }
  } 
  else 
  {
    logged_in = reply[0];
    var c = 0;
    for(var i = 0; i < name.length; ++i){
      c += name.charCodeAt(i);
    }
    document.getElementById("Profile_avatar").style.backgroundColor = colors[c % colors.length];
    document.getElementById("Profile_avatar").textContent = reply[0][0].toUpperCase();

    document.getElementById("hamburger_avatar").style.backgroundColor = colors[c % colors.length];
    document.getElementById("hamburger_avatar").textContent = reply[0][0].toUpperCase();
    if(view == "desktop"){
      $('#login_div').css("display", "none");
      $('#Profile_avatar').show();
      $('#Kirjaudu_btn').hide();
      $('#Kirjaudu_ulos_btn').show();
      $('#Rekistroidy_btn').hide();
    }
    else if(view == "mobile"){
      $('#hamburger_avatar').show()
      $('#login_div').css("display", "none");
      $('#hamburger_signin').hide();
      $('#hamburger_signout').show();
      $('#hamburger_register').hide();
      $('#Kirjaudu_btn').hide();
      $('#Kirjaudu_ulos_btn').hide();
      $('#Profile_avatar').hide();
      $('#Rekistroidy_btn').hide();
    }
  }
}

if($(window).width() < 983){
  view = "mobile";
}
else{
  view = "desktop";
}

window.onresize = function(){
  if(view == "desktop" && $(window).width() < 983){
    socket.emit('check login', window.sessionStorage.getItem('token'), function(reply){
      processLoginCheckReply(reply);
    });
    view = "mobile";
  }
  else if(view == "mobile" && $(window).width() >= 983){
    socket.emit('check login', window.sessionStorage.getItem('token'), function(reply){
      processLoginCheckReply(reply);
    });
    view = "desktop";
  }
}

$('#Hae_btn').hide();
$('#Kirjaudu_ulos_btn').hide();
$('#hamburger_profile').hide();

$("#Etusivu_btn").click(function(){
  goToPage("/");
});

$("#Hae_btn").click(function(){
  goToPage("/search");
});

$("#logo_div").click(function(){
  goToPage("/");
});

$("#Rekistroidy_btn").click(function(){
  goToPage("/register");
});

$('#Info_btn').click(function(){
  goToPage("/info");
})
$('#Profile_avatar').click(function(){
  goToPage("/profile");
})

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

$('#hamburger_info').click(function(){
  goToPage("/info");
});

$('#hamburger_index').click(function(){
  goToPage("/");
});

$('#hamburger_register').click(function(){
  goToPage("/register");
});

$('#hamburger_profile').click(function(){
  goToPage("/profile");
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
  socket.emit('logout attempt', sessionStorage.getItem('token'), function(reply)
  {
    if (reply == 'success')
    {
      sessionStorage.clear();
      logged_in = "";
      goToPage("/");
    }
  });
});

$('#hamburger_signout').click(function(){
  socket.emit('logout attempt', sessionStorage.getItem('token'), function(reply){
    if (reply == 'success')
    {
      sessionStorage.clear();
      logged_in = "";
      goToPage("/");
    }
  });
});

$('#login_confirm').click(function(){
  console.log("Logging in");
  var email = $('#login_email').val();
  var password = $('#login_password').val();
  socket.emit('login attempt', email, password, function(reply){
      if (reply == 'login failure')
      {
        alert("Kirjautuminen epäonnistui. Tarkista käyttäjänimesi ja salasanasi.")
      }

      else
        {
        logged_in = reply[0];
        console.log("Success! Logged in: " + logged_in);
        window.sessionStorage.setItem('token', reply[1]);
        window.sessionStorage.setItem('logged_in', reply[0]);
        window.sessionStorage.setItem('userID', reply[2]);
        var c = 0;
        for(var i = 0; i < name.length; ++i){
          c += name.charCodeAt(i);
        }
        document.getElementById("Profile_avatar").style.backgroundColor = colors[c % colors.length];
        document.getElementById("Profile_avatar").textContent = logged_in[0].toUpperCase();

        document.getElementById("hamburger_avatar").style.backgroundColor = colors[c % colors.length];
        document.getElementById("hamburger_avatar").textContent = logged_in[0].toUpperCase();
        reload = location.reload(); // Refresh automatically after Login
        if(view == "desktop"){
          $('#login_div').css("display", "none");
          $('#Profile_avatar').show();
          $('#Kirjaudu_btn').hide();
          $('#Kirjaudu_ulos_btn').show();
          $('#Rekistroidy_btn').hide();
          $('#Hae_btn').show();
          $('#Rekistroidy_btn').hide();

        }
        else if(view == "mobile"){
          $('#hamburger_avatar').show()
          $('#login_div').css("display", "none");
          $('#hamburger_signin').hide();
          $('#hamburger_signout').show();
          $('#hamburger_register').hide();
          $('#hamburger_profile').show();
          $('#Kirjaudu_btn').hide();
          $('#Kirjaudu_ulos_btn').hide();
          $('#Profile_avatar').hide();
          $('#Rekistroidy_btn').hide();
        }

      }
  });
});

socket.on("login reload", function(){
  location.reload();
});
