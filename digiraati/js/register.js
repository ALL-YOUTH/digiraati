var socket = io();

function home(){
  goToPage("/");
}

function _logout(){
  logout(logged_in);
  home();
}

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

function login(){
  uname = document.getElementById('user_username_email').value;
  p = document.getElementById('user_password').value;
  socket.emit('login attempt', uname, p);
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
