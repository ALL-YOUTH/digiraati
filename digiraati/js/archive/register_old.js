var socket = io();

/*function register_btn_clicked(){
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
});*/
