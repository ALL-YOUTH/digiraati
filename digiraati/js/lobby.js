var socket = io();
var council_data = {};
var council_id = "";

socket.emit('check login');
socket.on('login success', function(name){
  logged_in = name;
  socket.emit('check joined', council_id, logged_in);
});


$(function () {
  council_id = getUrlVars()["lobby"];
  socket.emit('request council data', council_id);
  socket.emit('check joined', council_id, logged_in);
  socket.emit('request council members', council_id);
});

socket.on('council members', function(members){
  console.log("members:", members);
  document.getElementById('number_council_participants').innerHTML = members.length;
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

function open_chat(){
  var url = "/chat?chat=" + council_id;
  goToPage(url);
}

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
