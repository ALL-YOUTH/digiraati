var hamburger_menu_open = false;
var socket = io();

var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
  $('#header').load(host + "/html/2.0/header.html");
  $('#footer').load(host + "/html/2.0/footer.html");
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
  e.innerHTML = html;
  return e;
}

function create_council_face(c){
  var res = document.createElement('div');
  res.classList.add('council_box');
  res.appendChild(add_class_innerhtml(["council_picture"], ""));
  res.appendChild(add_class_innerhtml(["council_title"], c["name"]));
  res.appendChild(add_class_innerhtml(["council_description"], c["description"]));
  res.appendChild(add_class_innerhtml(["council_likes", "far", "fa-thumbs-up"], 0));
  res.appendChild(add_class_innerhtml(["council_dislikes", "far", "fa-thumbs-down"], 0));
  res.appendChild(add_class_innerhtml(["council_people", "fas", "fa-users"], c["users"].length));
  res.appendChild(add_class_innerhtml(["council_time", "far", "fa-clock"], c["startdate"] + " - "));
  return res;
}

function display_councils(councils){
  var councils_list = document.getElementById('council_list');
  //clear_child_elements(councils_element);
  for(i = 0; i < councils.length; ++i){
    var new_elem = create_council_face(councils[i]);
    councils_list.appendChild(new_elem);
  }
}

function inactivate_filter(){
  $('.selector_btn').removeClass("active");
  $('.selector_btn').addClass("inactive");
}

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
