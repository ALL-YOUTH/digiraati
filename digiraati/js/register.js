var socket = io();

$(function(){
  $('.popup_container').hide();
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
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
  //if($('#id_input').val() == ""){ color_input_text('#id_input', "red"); }
  if($('#email_input').val() == ""){ color_input_text('#email_input', "red"); }
  if($('#password_input').val() == ""){ color_input_text('#password_input', "red"); }
  if($('#password_input2').val() == ""){ color_input_text('#password_input2', "red"); }
  //if(!$('#policy_agreement_checkbox').is(':checked')){ $('#policy_agreement_checkbox').css("outline", "1px solid red"); }
  if( $('#username_input').val() == "" ||
      $('#firstname_input').val() == "" ||
      $('#lastname_input').val() == "" ||
      $('#email_input').val() == "" ||
      $('#password_input').val() == "" ||
      $('#password_input2').val() == ""){ return; }

  else if($('#password_input').val() != $('#password_input2').val()){
    color_input_text("#password_input", "red");
    color_input_text("#password_input2", "red");
    $('#register_error_text').html("Salasanat eiv??t t??sm????");
    $('#register_error_text').css("display", "block");
    return;
  }

  // else if(check_testing_id($('#id_input').val()) == false)
  // {
  //   color_input_text("#id_input", "red");
  //   $('#register_error_text').html("Tarkista kolminumeroinen tunnistekoodisi t??ytt??m??st??si rekister??itymislomakkeesta.");
  //   $('#register_error_text').css("display", "block");
  //   return;
  // }
  else{
    $('#rules_popup_container').show();
  }
});

  $(document).on('click', '#cancel_registration_button', function(){
    goToPage('/');
  });
  

  $(document).on('click', '#accept_registration_button', function(){
    var register = {};
  register["id"] = makeid(8);
  register["username"] = $('#username_input').val();
  register["firstname"] = $('#firstname_input').val();
  register["lastname"] = $('#lastname_input').val();
  register["email"] = $('#email_input').val();
  register["password1"] = $('#password_input').val();
  register["password2"] = $('#password_input2').val();
  register["testing_id"] = -1
  console.log("Registering: " + register["testing_id"]);
  
  socket.emit("register attempt", register, function(response) // L??hetet????n rekister??itymispyynt?? serverille. Serveri palauttaa oletusarvoisesti joko 'success' tai virheilmoituksen, jos k??ytt??j??nimi tai salasana ovat jo k??yt??ss??
  {
    if (response == 'invalid_username')
    {
      $('#register_error_text').html("K??ytt??j??nimi on varattu");
      color_input_text("#username_input", "red");
      $('#register_error_text').css("display", "block");
    }

    else if (response == 'invalid_email')
    {
      $('#register_error_text').html("S??hk??posti on jo k??yt??ss??");
      color_input_text("#email_input", "red");
      $('#register_error_text').css("display", "block");
    }

    else if (response == 'success')
    {
      alert("Rekister??inti onnistui!");
      goToPage("/");
    }

    else {
      alert("Rekister??inniss?? tapahtui tuntematon virhe.");
    }
  });
  });

  
function check_testing_id(id)
{
  console.log("Length: " + id.length + ", " + "not a number: " + isNaN(id));
  if (id.length != 3) { return false; }
  else if (isNaN(id)) { return false; }
  else { return true } ;
}