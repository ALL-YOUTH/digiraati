var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
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

$('#confirm_create').click(function(){
  var data = {};
  data["id"] = makeid(8);
  data["name"] = $('#name_input').val();
  data["keywords"] = $('#create_tags').val().split();
  data["description"] = $('#create_description_text_input').val();
  data["startdate"] = $('#startdate_input').val();
  data["starttime"] = $('#startdate_input').val();
  data["enddate"] = $('#startdate_input').val();
  data["endtime"] = $('#startdate_input').val();
  data["creator"] = logged_in;
  data["userlimit"] = -1;
  data["open"] = true;
  var open = true;
  var limit = -1;
  if(document.getElementById('closed_radio').checked){
    data["open"] = false;
  }
  if(document.getElementById('limit_radiobtn').checked){
    data["userlimit"] = $('#limit_number').val();
  }

  socket.emit('request council create', data);
});

socket.on('council create succeess', function(){
  goToPage("/");
});
