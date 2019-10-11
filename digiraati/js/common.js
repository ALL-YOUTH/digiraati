var socket = io();
var logged_in = "";
var host = socket["io"]["uri"] + ":" + location.port;

//socket.emit('check login');

function goToPage(page){
  window.location = page;
}

function logout(){
  socket.emit('logout attempt', logged_in);
  logged_in = "";
  home();
}

function timestamp(){
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function login(){
  uname = document.getElementById('user_username_email').value;
  p = document.getElementById('user_password').value;
  socket.emit('login attempt', uname, p);
}

function log(text){
  console.log("Log:", text)
}

function clear_child_elements(e){
  while (e.firstChild) {
    e.removeChild(e.firstChild);
  }
}

function TODO(){
    alert("Yayy! I'm glad you are exploring the site. However, my sorry excuse of creator (the coder) has not implemented this feature yet, so just sit patient. =))");
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function getUrlVars(){
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
	});
	return vars;
}

/////////////////////////////////////////////////
///////////////Navigation functions//////////////
/////////////////////////////////////////////////
function home(){
  goToPage("/");
}

/////////////////////////////////////////////////
///////////////Login functions     //////////////
/////////////////////////////////////////////////


socket.on('login success', function(name){
  logged_in = name;
});

socket.on('not logged', function(){
  hide_user_logged_in();
});

socket.on('logged', function(name){
  display_user_logged_in(name);
});

function hide_user_logged_in(){
  $("#user-logged-in").css('display', 'none');
  $("#login_btn").css('display', 'inline-block');
  $("#logout_btn").css('display', 'none');
  logged_in = "";
}

/////////////////////////////////////////////////
///////////////Registration functions////////////
/////////////////////////////////////////////////
function nav_register_clicked(){
  goToPage("register");
}


function open_council_frontpage(id){
  //e.id is the ID of the council
  page = "/lobby?lobby=" + id;
  goToPage(page);
}

function nav_info_clicked(){
  goToPage("/info");
}
