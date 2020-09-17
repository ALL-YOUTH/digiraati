var hamburger_menu_open = false;
var socket = io();

var host = socket["io"]["uri"];

$(function(){
  console.log("Requested council update");
  console.log("Host: " + host);
  console.log("Host natural " + socket["io"]["uri"])
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
  socket.emit('request councils update');
});

socket.on('councils update', function(all_councils){
  console.log("Received council update");
  display_councils(all_councils);
});

function add_class_innerhtml(c, html){
  var e = document.createElement('div');
  for(var i = 0; i < c.length; ++i){
      e.classList.add(c[i]);
  }
  e.textContent = html;
  return e;
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
  $('.selector_btn').removeClass("active");
  $('.selector_btn').addClass("inactive");
}

$(document).on('click', '.council_btn', function(e){
  var parentID = $(this).parent().attr('id');
  goToPage("/lobby/"+parentID+"/index");
});

$(document).on('click', '.council_box', function(e){
  var parentID = $(this).attr('id');
  goToPage("/lobby/"+parentID+"/index");
});

$('.selector_btn').click(function(){
  inactivate_filter();
  $(this).removeClass("inactive");
  $(this).addClass("active");
  //TODO arrange councils here
});

function inactivate_sorter(){
  $('.sorter_btn').removeClass("sorter_active");
  $('.sorter_btn').addClass("sorter_inactive");
}

$('.sorter_btn').click(function(){
  inactivate_sorter();
  $(this).removeClass("sorter_inactive");
  $(this).addClass("sorter_active");
  //TODO arrange councils here
});

$('#hero_search_councils_btn_desktop').click(function(){
  goToPage("/search");
});

function reformatDate(input){
  try{
    var arr = input.split("-");
    return arr[2]+ "." + arr[1]+ "." + arr[0];
  }
  catch(err){

  }
}
