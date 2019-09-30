var socket = io();
var logged_in = "";
socket.emit('check login');

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

socket.on('invalid login', function(){
  var txt = "<h3 style=\"color:red\">Tarkista käyttäjänimi, sähköposti ja salasana.</h3>";
  document.getElementById('login_instruction').innerHTML = txt;
});

socket.on('invalid nickname', function(){
  var txt = "<h3 style=\"color:red\">Tarkista käyttäjänimi, sähköposti ja salasana.</h3>";
  document.getElementById('login_instruction').innerHTML = txt;
});

function login_modal(){
  document.getElementById('login_instruction').innerHTML = "Kirjaudu sisään Digiraati-palveluun";
  document.getElementById('login_modal').style.display = "block";
}

function cancel_login_modal(){
  document.getElementById('user_password').value = "";
  document.getElementById('user_username_email').value = "";
  document.getElementById('login_modal').style.display = "none";
  document.getElementById('login_instruction').innerHTML = "Kirjaudu sisään Digiraati-palveluun";
}

/*function login(){
  uname = document.getElementById('user_username_email').value;
  p = document.getElementById('user_password').value;
  socket.emit('login attempt', uname, p);
}*/

socket.on('login success', function(name){
  logged_in = name;
  try{
    document.getElementById('login_modal').style.display = "none";
    document.getElementById('login_btn').style.display = "none";
    document.getElementById('homepage_profile_element').style.display = "inline-block";
    document.getElementById('raatini_btn').style.display = "inline-block";
    document.getElementById('user_username_email').value = "";
    document.getElementById('user_password').value = "";
    document.getElementById('register_btn').style.display = "none";
  }
  catch{ } // Nothing in the catch just to avoid chat.js not having some of the modal elements
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

function register_btn_clicked(){
  if(document.getElementById('register_username').value == "" ||
      document.getElementById('register_name').value == "" ||
      document.getElementById('register_lastname').value == "" ||
      document.getElementById('register_email').value == "" ||
      document.getElementById('register_pw1').value == "" ||
      document.getElementById('register_pw2').value == ""){
        alert("Täytä kaikki kentät");
      }

  else if(document.getElementById('register_pw1').value !=
  document.getElementById('register_pw2').value){
    alert("Salasanat eivät täsmää");
  }

  var data = {};
  data["id"] = makeid(8);
  data["uname"] = document.getElementById('register_username').value;
  data["fname"] = document.getElementById('register_name').value;
  data["lname"] = document.getElementById('register_lastname').value;
  data["email"] = document.getElementById('register_email').value;
  data["p"] = document.getElementById('register_pw1').value;
  socket.emit('register attempt', data);
}

socket.on('register success', function(){
  alert("Registration success");
  goToPage("/");
});

/////////////////////////////////////////////////
///////////////Council functions     ////////////
/////////////////////////////////////////////////
/*function open_council_chat(id){
  //e.id is the ID of the council
  page = "/chat?chat=" + id;
  goToPage(page);
}*/

function open_council_frontpage(id){
  //e.id is the ID of the council
  page = "/lobby?lobby=" + id;
  goToPage(page);
}

function nav_info_clicked(){
  goToPage("/info");
}
