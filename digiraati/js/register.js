var socket = io();

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");
});

function initial_register_text_inputs(){
  color_input_text("#username_input", "#EBEDED");
  color_input_text("#firstname_input", "#EBEDED");
  color_input_text("#lastname_input", "#EBEDED");
  color_input_text("#email_input", "#EBEDED");
  color_input_text("#password_input", "#EBEDED");
  color_input_text("#password_input2", "#EBEDED");
  $('#register_error_text').css("display", "none");
  $('#policy_agreement_checkbox').css("outline", "initial");

}

function color_input_text(element, color){
  $(element).css("border-color", color);
  $(element).css("border-width", "2px");
  $(element).css("border-style", "solid");

}

$('#confirm_register').click(function(){
  initial_register_text_inputs();
  if($('#username_input').val() == ""){ color_input_text('#username_input', "red"); }
  if($('#firstname_input').val() == ""){ color_input_text('#firstname_input', "red"); }
  if($('#lastname_input').val() == ""){ color_input_text('#lastname_input', "red"); }
  if($('#id_input').val() == ""){ color_input_text('#id_input', "red"); }
  if($('#email_input').val() == ""){ color_input_text('#email_input', "red"); }
  if($('#password_input').val() == ""){ color_input_text('#password_input', "red"); }
  if($('#password_input2').val() == ""){ color_input_text('#password_input2', "red"); }
  if(!$('#policy_agreement_checkbox').is(':checked')){ $('#policy_agreement_checkbox').css("outline", "1px solid red"); }
  if( $('#username_input').val() == "" ||
      $('#firstname_input').val() == "" ||
      $('#lastname_input').val() == "" ||
      $('#email_input').val() == "" ||
      $('#password_input').val() == "" ||
      $('#password_input2').val() == ""){ return; }

  else if($('#password_input').val() != $('#password_input2').val()){
    color_input_text("#password_input", "red");
    color_input_text("#password_input2", "red");
    $('#register_error_text').html("Salasanat eivät täsmää");
    $('#register_error_text').css("display", "block");
    return;
  }

  else if(check_testing_id($('#id_input').val()) == false)
  {
    color_input_text("#id_input", "red");
    $('#register_error_text').html("Tarkista kolminumeroinen tunnistekoodisi täyttämästäsi rekisteröitymislomakkeesta.");
    $('#register_error_text').css("display", "block");
    return;
  }

  var register = {};
  register["id"] = makeid(8);
  register["username"] = $('#username_input').val();
  register["firstname"] = $('#firstname_input').val();
  register["lastname"] = $('#lastname_input').val();
  register["email"] = $('#email_input').val();
  register["password1"] = $('#password_input').val();
  register["password2"] = $('#password_input2').val();
  register["testing_id"] = $('#id_input').val();
  console.log("Registering: " + register["testing_id"]);
  socket.emit("register attempt", register);
});

function check_testing_id(id)
{
  if (length(id) != 3) { return false; }
  else if (isNaN(id)) { return false; }
  else { return true } ;
}

socket.on('register success', function(){
  alert("Rekisteröinti onnistui!");
  goToPage("/");
});

socket.on('invalid username', function(){
  $('#register_error_text').html("Käyttäjänimi on varattu");
  color_input_text("#username_input", "red");
  $('#register_error_text').css("display", "block");
});

socket.on('invalid email', function(){
  $('#register_error_text').html("Sähköposti on jo käytössä");
  color_input_text("#email_input", "red");
  $('#register_error_text').css("display", "block");
});
