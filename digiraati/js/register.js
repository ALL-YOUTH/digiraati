var socket = io();

$(function(){
  $('#header').load(host + "/html/2.0/header.html");
  $('#footer').load(host + "/html/2.0/footer.html");
})

$('#confirm_register').click(function(){
  if($('#username_input').val() == "" ||
      $('#firstname_input').val() == "" ||
      $('#lastname_input').val() == "" ||
      $('#email_input').val() == "" ||
      $('#password_input').val() == "" ||
      $('#password_input2').val() == ""){
        $('#register_error_text').html("Täytä kaikki pakolliset kentät *");
        $('#register_error_text').css("display", "block");
        return;
      }

  else if($('#password_input').val() != $('#password_input2').val()){
    $('#register_error_text').html("Salasanat eivät täsmää").addClass("visible");
    $('#register_error_text').css("display", "block");
    return;
  }

  var register = {};
  register["username"] = $('#username_input').val();
  register["firstname"] = $('#firstname_input').val();
  register["lastname"] = $('#lastname_input').val();
  register["email"] = $('#email_input').val();
  register["password1"] = $('#password_input').val();
  register["password2"] = $('#password_input2').val();
  socket.emit("register attempt", register);
});

socket.on('register success', function(){
  alert("Rekisteröinti onnistui!");
  goToPage("/2.0");
});
