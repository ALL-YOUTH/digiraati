var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var current_page = 1;

$(function(){
  $('#create_container_2').hide();
  $('#create_container_3').hide();
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");
});

$('textarea').on('keydown', function(e){

}).on('input', function(){
    $(this).height(1);
    var totalHeight = $(this).prop('scrollHeight') - parseInt($(this).css('padding-top')) - parseInt($(this).css('padding-bottom'));
    if(totalHeight < 30){
      totalHeight = 30;
    }
    $(this).height(totalHeight);
});

$('#no_limit_radiobtn').change(function(){
  if($(this).is(':checked')){
    document.getElementById('limit_number').style.display = "none";
  }
});

$('#limit_radiobtn').change(function(){
  if($(this).is(':checked')){
    document.getElementById('limit_number').style.display = "inline-block";
  }
});

$('#page_backwards_btn').click(function(){
  if (current_page > 1)
  {
    $('#page_forwards_btn').removeClass("disabled");
    current_page -= 1;
    $('#create_container_1').hide();
    $('#create_container_2').hide();
    $('#create_container_3').hide();
    $('#create_container_'+current_page).show();

    if (current_page == 1)
    {
      $('#page_backwards_btn').addClass("disabled");
    }
  }
});

$('#page_forwards_btn').click(function(){
  if (current_page <= 2)
  {
    $('#page_backwards_btn').removeClass("disabled");
    current_page += 1;
    $('#create_container_1').hide();
    $('#create_container_2').hide();
    $('#create_container_3').hide();
    $('#create_container_'+current_page).show();

    if (current_page == 3)
    {
      $('#page_forwards_btn').addClass("disabled");
    }
  }
})

$('#confirm_create').click(function(){
  console.log("Creating a council!");
  var data = {};
  data["id"] = makeid(8);
  data["name"] = $('#name_input').val();
  data["keywords"] = $('#create_tags').val().split(" ");
  data["description"] = $('#create_description_text_input').val();
  data["startdate"] = document.getElementById('startdate_input').value;
  data["starttime"] = document.getElementById('starttime_input').value;
  data["enddate"] = document.getElementById('enddate_input').value;
  data["endtime"] = document.getElementById('endtime_input').value;
  data["creator"] = logged_in;
  data["userlimit"] = -1;
  data["open"] = true;
  data["password"] = $('#password_text').val();
  var open = true;
  var limit = -1;
  if(document.getElementById('closed_radio').checked){
    data["open"] = false;
  }
  if(document.getElementById('limit_radiobtn').checked){
    data["userlimit"] = $('#limit_number').val();
  }
  console.log("Salasana: " + data["password"]);
  console.log(data);
  socket.emit('request council create', data);
});

socket.on('council create succeess', function(){
  goToPage("/");
});
