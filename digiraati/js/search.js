var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var search_criteria = {};

$(function(){
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
});

$('#hero_search_councils_btn').click(function(){
  goToPage("/search");
});

$('.search_list_btn').click(function(e){
  e.preventDefault();
  if(e.target.classList.contains("inactive")){
    e.target.classList.remove("inactive");
    e.target.classList.add("active");
  }
  else if(e.target.classList.contains("active")){
    e.target.classList.remove("active");
    e.target.classList.add("inactive");
  }
});
