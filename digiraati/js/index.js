var hamburger_menu_open = false;
var socket = io();

var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");
  socket.emit('request councils update');
});

socket.on('councils update', function(all_councils){
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
  res.appendChild(add_class_innerhtml(["council_picture", "council_btn"], ""));
  res.appendChild(add_class_innerhtml(["council_title", "council_btn"], c["name"]));
  res.appendChild(add_class_innerhtml(["council_description", "council_btn"], c["description"]));
  res.appendChild(add_class_innerhtml(["council_likes", "far", "fa-thumbs-up", "council_btn"], 0));
  res.appendChild(add_class_innerhtml(["council_dislikes", "far", "fa-thumbs-down", "council_btn"], 0));
  res.appendChild(add_class_innerhtml(["council_people", "fas", "fa-users", "council_btn"], c["users"].length));
  res.appendChild(add_class_innerhtml(["council_time", "far", "fa-clock", "council_btn"], c["startdate"] + " : " + c["enddate"]));
  return res;
}

function display_councils(councils){
  var councils_list = document.getElementById('council_list');
  clear_child_elements(councils_list);
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
