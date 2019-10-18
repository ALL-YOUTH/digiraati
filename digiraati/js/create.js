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
