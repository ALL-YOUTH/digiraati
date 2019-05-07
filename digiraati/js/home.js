var socket = io();
var logged_in = "";
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
      socket.emit('login attempt', person);
    }
  });

  socket.on('login success', function(name){
    display_user_logged_in(name);
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

  socket.on('users update', function(users_logged_in){
    display_users(users_logged_in);
  });

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

function display_user_logged_in(name){
  $("#user-logged-in").html("Logged in as: " + name);
  $("#user-logged-in").css('display', 'block');
  $("#login_btn").css('display', 'none');
  $("#logout_btn").css('display', 'block');
  logged_in = name;
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
  var txt;
  var person = prompt("Hello new user. \nPlease enter your name:", "");
  if (person == null || person == "") {
    return;
  }
  else{
    socket.emit('login attempt', person);
  }
}

function _logout(){
  socket.emit('logout attempt', logged_in);
  logged_in = "";
  hide_user_logged_in();
}

function display_users(user_a){
  var users_logged_element = document.getElementById("logged_in_users");
  clear_child_elements(users_logged_element);
  for(i = 0; i < user_a.length; ++i){
    var new_elem = document.createElement("div");
    new_elem.innerHTML = user_a[i];
    users_logged_element.appendChild(new_elem);
  }
}

function display_councils(councils){
  var councils_ddmenu = document.getElementById('list_of_councils');
  clear_child_elements(councils_ddmenu);
  for(i = 0; i < councils.length; ++i){
    var new_elem = document.createElement("a");
    new_elem.id = councils[i]["id"];
    new_elem.onclick = function(){ open_council(this); }
    new_elem.innerHTML = councils[i]["name"];
    councils_ddmenu.appendChild(new_elem);
  }
}

function open_council(e){
  //e.id is the ID of the council
  console.log(e.id);
  page = "/chat?chat=" + e.id;
  goToPage(page);
}

function create_new_council_clicked(){
  var modal = document.getElementById('new_council_modal');
  modal.style.display = "block";
  //create_test_raati();
}

function cancel_modal(){
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
  socket.emit('council create attempt', info);
  cancel_modal();
}
