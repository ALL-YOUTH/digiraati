var socket = io();
var logged_in = "";
var redirect = "/";


$(function(){
  //Quit pressed
  socket.emit('check login');

  $('#logout').click(function(){
    socket.emit('user logout');
    goToPage();
  });

  socket.on('invalid login', function(){
    var txt = "<h3 style=\"color:red\">Tarkista käyttäjänimi, sähköposti ja salasana.</h3>";
    document.getElementById('login_instruction').innerHTML = txt;
  });

  socket.on('invalid nickname', function(){
    var txt = "<h3 style=\"color:red\">Tarkista käyttäjänimi, sähköposti ja salasana.</h3>";
    document.getElementById('login_instruction').innerHTML = txt;
  });

  socket.on('login success', function(name){
    logged_in = name;
    document.getElementById('login_modal').style.display = "none";
    document.getElementById('login_btn').style.display = "none";
    document.getElementById('homepage_profile_element').style.display = "block";
    document.getElementById('raatini_btn').style.display = "block";
    document.getElementById('user_username_email').value = "";
    document.getElementById('user_password').value = "";
  });

  socket.on('not logged', function(){
    hide_user_logged_in();
  });

  socket.on('logged', function(name){
    display_user_logged_in(name);
  });

  /*socket.on('councils content', function(councils){
    //input parameter "councils" contains all the councils currently available
    //// TODO:
  });*/

  /*socket.on('users update', function(users_logged_in){
    display_users(users_logged_in);
  });*/

  socket.on('councils update', function(all_councils){
    display_councils(all_councils);
  });
});

function hide_user_logged_in(){
  $("#user-logged-in").css('display', 'none');
  $("#login_btn").css('display', 'block');
  $("#logout_btn").css('display', 'none');
  logged_in = "";
}

function home(){
  goToPage("/");
}

function startChat() {
    if(logged_in == ""){
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
  uname = document.getElementById('user_username_email').value;
  p = document.getElementById('user_password').value;
  socket.emit('login attempt', uname, p);
}

function _logout(){
  socket.emit('logout attempt', logged_in);
  logged_in = "";
  document.getElementById('login_btn').style.display = "block";
  document.getElementById('homepage_profile_element').style.display = "none";
  document.getElementById('raatini_btn').style.display = "none";
}

function display_councils(councils){
  var councils_element = document.getElementById('list_of_councils');
  clear_child_elements(councils_element);
  for(i = 0; i < councils.length; ++i){
    var new_elem = document.createElement("a");
    new_elem.id = councils[i]["id"];
    new_elem.onclick = function(){ open_council(this); }
    new_elem.innerHTML = "<h2>"+ councils[i]["name"]+"</h2>";
    new_elem.classList.add("council_element");
    councils_element.appendChild(new_elem);
  }
}

function open_council(e){
  //e.id is the ID of the council
  page = "/chat?chat=" + e.id;
  goToPage(page);
}

function login_modal(){
  document.getElementById('login_modal').style.display = "block";
}

function create_new_council_clicked(){
  var modal = document.getElementById('new_council_modal');
  modal.style.display = "block";
  //create_test_raati();
}

function cancel_login_modal(){
  document.getElementById('user_password').value = "";
  document.getElementById('user_username_email').value = "";
  document.getElementById('login_modal').style.display = "none";
  document.getElementById('login_instruction').innerHTML = "Kirjaudu sisään Digiraati-palveluun";

}

function cancel_council_modal(){
  document.getElementById('council_name').value = "";
  document.getElementById('council_description').value = "";
  var modal = document.getElementById('new_council_modal');
  modal.style.display = "none";
}

function create_raati(){
  var id = makeid(10);
  var name = document.getElementById('council_name').value;
  if(name.length == 0){
    console.log("Give Council a name");
    return;
  }
  if(logged_in.length == 0){
    console.log("Log in to create a council");
    return;
  }

  var info = {"id":id, "name":name, "creator":logged_in};
  cancel_council_modal();
  socket.emit('council create attempt', info);

}

function register_clicked(){
  goToPage("register");
}
