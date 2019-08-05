var socket = io();
var council_data = {};
var council_id = "";

//socket.emit('check login');
socket.on('login success', function(name){
  logged_in = name;
  socket.emit('check joined', council_id, logged_in);
});


$(function () {
  council_id = getUrlVars()["lobby"];
  open_council_info();
  socket.emit('request council data', council_id);
  socket.emit('check joined', council_id, logged_in);
  socket.emit('request council members', council_id);
});

socket.on('council members', function(members){
  document.getElementById('number_council_participants').innerHTML = members.length;
  var list = document.getElementById('list_participants');
  clear_child_elements(list);
  for(var i = 0; i < members.length; ++i){
    var new_member = document.createElement('div');
    new_member.innerHTML = members[i];
    list.appendChild(new_member);
  }
});

socket.on('user not logged in', function(){
  document.getElementById('resign_council_btn').style.display = "none";
  document.getElementById('join_council_btn').style.display = "none";
});

socket.on('user joined in council',function(){
  document.getElementById('resign_council_btn').style.display = "block";
  document.getElementById('join_council_btn').style.display = "none";
});

socket.on('user not in council', function(){
  document.getElementById('resign_council_btn').style.display = "none";
  document.getElementById('join_council_btn').style.display = "block";
  document.getElementById("send_btn").classList.remove("disabled");
  document.getElementById("message_input").readonly = true;
});

socket.on('council data', function(data){
  council_data = data;
  document.getElementById('lobby-title').innerHTML = data["title"];
  document.getElementById('lobby-keywords').innerHTML = data["tags"];
  document.getElementById('lobby-description-text').innerHTML = data["description"];
  document.getElementById('lobby-startdatetime-text').innerHTML = data["startdate"] + " " + data["starttime"];
  document.getElementById('lobby-enddatetime-text').innerHTML = data["enddate"] + " " + data["endtime"];
});

socket.on("council join failed", function(){
  alert("Something went wrong. Council may be full");
  location.reload();
});

socket.on("council join success", function(){
  alert("User joined the council");
  location.reload();
});

socket.on('council resign failed', function(){
  alert("Could not resign user from the council...(!?!?!?)");
  location.reload();
});
socket.on('council resign success', function(){
  alert("ET OLE ENÄÄ RAADISSA....");
  location.reload();
});

function open_material(){
  var url = "/material?material=" + council_id;
  goToPage("/lakiteksti");
}

function sign_in_council(){
  socket.emit('request council join', council_id, logged_in);
}

function resign_from_council(){
  var ans = confirm("Oletko varma että haluat poistua raadista?");
  if(ans){
    socket.emit('request resign council', council_id, logged_in);
  }
}

function hide_all_lobby_containers(){
  var c = document.getElementById('lobby_nav').children;
  for(var i = 0; i < c.length; ++i){
    c[i].classList.remove('active');
  }
  document.getElementById("council-info-container").style.display = "none";
  document.getElementById("council-participant-container").style.display = "none";
  document.getElementById("council-chat-container").style.display = "none";
}

function display_container(container){
  document.getElementById(container).style.display = "block";
}

function open_council_chat(){
  hide_all_lobby_containers();
  document.getElementById('chat_btn').classList.add("active");
  display_container("council-chat-container");
}

function open_council_info(){
  hide_all_lobby_containers();
  document.getElementById('info_btn').classList.add("active");
  display_container("council-info-container");
}

function open_council_participants(){
  hide_all_lobby_containers();
  document.getElementById('participant_btn').classList.add("active");
  display_container("council-participant-container");
  socket.emit("")
}
