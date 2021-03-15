var hamburger_menu_open = false;
var socket = io();

var host = socket["io"]["uri"];
let modal_open = false;

$(function(){
  $('#cookie_container').hide();
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
  socket.emit('request councils update', function(response){
    display_councils(response);  
  });
  console.log("Cookies: " + window.sessionStorage.getItem("cookies_accepted"));
  if (window.sessionStorage.getItem("cookies_accepted") === null || window.sessionStorage.getItem("cookies_accepted") != "true"){
    modal_open = true;
    $('#cookie_container').show();
  }
});

function add_class_innerhtml(c, html){
  var e = document.createElement('div');
  for(var i = 0; i < c.length; ++i){
      e.classList.add(c[i]);
  }
  e.textContent = html;
  return e;
}

function resizeIframe(obj) {
  obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
}

function create_council_face(c){
  var res = document.createElement('div');
  res.classList.add('council_box');
  res.id = c["id"];
  //res.appendChild(add_class_innerhtml(["council_picture", "council_btn"], ""));

  var council_picture = document.createElement('div');
  council_picture.classList.add("council_picture");

  var actual_image = document.createElement('img');
  actual_image.classList.add("council_picture");
  actual_image.src = "/council_images/" + c["header_image"];

  council_picture.appendChild(actual_image);
  res.appendChild(council_picture);

  var council_btn = document.createElement("div");
  council_btn.classList.add("council_btn");
  res.appendChild(council_btn);
  
  var council_title = document.createElement('div');
  council_title.classList.add("council_title");
  council_title.innerText = c['name'];
  res.appendChild(council_title);

  var description_box = document.createElement('div');
  description_box.classList.add("description_box");
  description_box.innerText = c['description'];
  res.appendChild(description_box);

  var peukkuboksi = document.createElement('div');
  peukkuboksi.classList.add("reaction_box");
  
  var likes_box = document.createElement('div');
  likes_box.classList.add("likes_box");
  var council_likes = document.createElement('div');
  council_likes.classList.add("council_likes_icon"); 
  var council_likes_number = document.createElement('div');
  council_likes_number.classList.add("council_likes_number");
  likes_box.appendChild(council_likes); likes_box.appendChild(council_likes_number);

  var dislikes_box = document.createElement('div');
  dislikes_box.classList.add('dislikes_box');
  var council_dislikes = document.createElement('div');
  council_dislikes.classList.add("council_dislikes_icon"); 
  var council_dislikes_number = document.createElement('div');
  council_dislikes_number.classList.add("council_dislikes_number");
  dislikes_box.appendChild(council_dislikes); dislikes_box.appendChild(council_dislikes_number);

  var people_box = document.createElement('div');
  people_box.classList.add("people_box");
  var council_people = document.createElement('div');
  council_people.classList.add("council_people_icon");
  var council_people_number = document.createElement('div');
  council_people_number.classList.add("council_people_number");
  people_box.appendChild(council_people); people_box.appendChild(council_people_number);
  
  peukkuboksi.appendChild(likes_box); peukkuboksi.appendChild(dislikes_box); peukkuboksi.appendChild(people_box);
  res.appendChild(peukkuboksi);
  council_likes_number.innerText = 0;
  council_dislikes_number.innerText = 0;
  if(c["userlimit"] == -1){
    council_people_number.innerText = c["users"].length;
  }
  else{
    council_people_number.innerText = c["users"].length + " / " + c["userlimit"];
  }
  if(c["startdate"] != "" && c["enddate"] != ""){
    var council_time_box = document.createElement('div');
    council_time_box.classList.add("council_time_box");
    council_time_box.innerText = reformatDate(c["startdate"]) + " - " + reformatDate(c["enddate"]);
    res.appendChild(council_time_box);
  }
  return res;
}

function display_councils(councils){
  var councils_list = document.getElementById('council_list');
  clear_child_elements(councils_list);
  councils = councils.reverse();
  for(i = 0; i < councils.length; ++i){
    var new_elem = create_council_face(councils[i]);
    councils_list.appendChild(new_elem);
  }
}

function inactivate_filter(){
  $('.indicator').removeClass("active");
  $('.indicator').addClass("inactive");
}

$(document).on('click', '#accept_cookies_button', function(e)
{
  window.sessionStorage.setItem('cookies_accepted', true)
  $('#cookie_container').hide();
  modal_open = false;
})

$(document).on('click', '#reject_cookies_button', function(e)
{
  window.location.href = "http://www.google.com";
})

$(document).on('click', '.council_btn', function(e){
  if (modal_open == false)
  {
    var parentID = $(this).parent().attr('id');
    goToPage("/lobby/"+parentID+"/index");
  }
});

$(document).on('click', '.council_box', function(e){
  if (modal_open == false)
  {
    var parentID = $(this).attr('id');
    goToPage("/lobby/"+parentID+"/index");
  }
});

$('#ongoing').click(function(){
  if (modal_open == false)
  {
    inactivate_filter();
    $('#lobby_ongoing_indicator').removeClass("inactive");
    $('#lobby_ongoing_indicator').addClass("active");
  }
})

$('#newest').click(function(){
  if (modal_open == false)
  {
    inactivate_filter();
    $('#lobby_newest_indicator').removeClass("inactive");
    $('#lobby_newest_indicator').addClass("active");
  }
})

$('#popularest').click(function(){
  if (modal_open == false)
  {
    inactivate_filter();
    $('#lobby_popular_indicator').removeClass("inactive");
    $('#lobby_popular_indicator').addClass("active");
  }
})

function inactivate_sorter(){
  $('.sorter_btn').removeClass("sorter_active");
  $('.sorter_btn').addClass("sorter_inactive");
}

$('.sorter_btn').click(function(){
  if (modal_open == false)
  {
    inactivate_sorter();
    $(this).removeClass("sorter_inactive");
    $(this).addClass("sorter_active");
    //TODO arrange councils here
  }
});

$('#hero_search_councils_btn_desktop').click(function(){
  if (modal_open == false)
  {
    goToPage("/search");
  }
});

function reformatDate(input){
  try{
    var arr = input.split("-");
    return arr[2]+ "." + arr[1]+ "." + arr[0];
  }
  catch(err){

  }
}