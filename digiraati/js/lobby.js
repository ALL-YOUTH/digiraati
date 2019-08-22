var socket = io();
var council_data = {};
var council_id = "";

var allowed_extentions = [".txt", ".docx", ".doc", ".pdf"];

var uploader = new SocketIOFileClient(socket);
var files = document.getElementById('files');

$(function(){
  council_id = getUrlVars()["lobby"];
  open_council_info();
  socket.emit('request council data', council_id);
  socket.emit('check joined', council_id, logged_in);
  socket.emit('request council members', council_id);
  console.log("Checking page ready");
});

socket.on('login success', function(name){
  log("login success");
  logged_in = name;
  socket.emit('check joined', council_id, logged_in);
});

socket.on('council members', function(members){
  log("council members");
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
  log("user not logged in");
  document.getElementById('resign_council_btn').style.display = "none";
  document.getElementById('join_council_btn').style.display = "none";

});

socket.on('user joined in council',function(){
  log("user joined in council");
  document.getElementById('resign_council_btn').style.display = "block";
  document.getElementById('join_council_btn').style.display = "none";
  document.getElementById("send_btn").classList.remove("disabled");
  document.getElementById("message_input").disabled = false;

});

socket.on('user not in council', function(){
  log("user not in council");
  document.getElementById('resign_council_btn').style.display = "none";
  document.getElementById('join_council_btn').style.display = "block";
});

socket.on('council data', function(data){
  council_data = data;
  log("council data");
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
  alert("Olet liittynyt raatiin");
  location.reload();
});

socket.on('council resign failed', function(){
  alert("Could not resign user from the council...(!?!?!?)");
  location.reload();
});

socket.on('council resign success', function(){
  location.reload();
});

socket.on('update files', function(files){
  list_files(files);
});

socket.on('file data', function(data){
  document.getElementById('material-file-viewer').innerHTML = data;
});

function file_clicked(e){
  socket.emit("request file data", e.id);
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

function list_files(files){
  var filelist = document.getElementById('file_list');
  clear_child_elements(filelist);
  for(var i = 0; i < files.length; ++i){
    var el = document.createElement('h3');
    el.id = files[i]["id"];
    el.innerHTML = files[i]["path"];
    el.onclick = function(){
      file_clicked(this);
    }
    filelist.appendChild(el);
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
  document.getElementById("council-material-container").style.display = "none";
  document.getElementById("council-statistics-container").style.display = "none";
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
}

function open_council_material(){
  hide_all_lobby_containers();
  socket.emit('update files request', council_id);
  document.getElementById('material_btn').classList.add("active");
  display_container("council-material-container");
}

function open_council_statistics(){
  hide_all_lobby_containers();
  document.getElementById('statistics_btn').classList.add("active");
  display_container("council-statistics-container");
}

function check_file_extention(name){
  var res = false;
  for(var i = 0; i < allowed_extentions.length; ++i){
    if(name.endsWith(allowed_extentions[i])){
      res = true;
    }
  }
  return res;
}

//////////////////////////////////////////////////////////////////////
////////////////FILE UPLOAD ATTEMPT///////////////////////////////////
//////////////////////////////////////////////////////////////////////
uploader.on('start', function(fileInfo) {
    console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
    console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
});
uploader.on('complete', function(fileInfo) {
    socket.emit('update files request', council_id);
});
uploader.on('error', function(err) {
    console.log('Error!', err);
});
uploader.on('abort', function(fileInfo) {
    console.log('Aborted: ', fileInfo);
});

function file_select_check(){
  try{
    var file = document.getElementById('file').files[0]["name"];
    if(file.length == 0){
      document.getElementById('submit_file').style.display = "none";
    }
    else{
      document.getElementById('submit_file').style.display = "block";
    }
  }
  catch{
    document.getElementById('submit_file').style.display = "none";
  }
}

files.onsubmit = function(ev) {
    ev.preventDefault();
    var fileEl = document.getElementById('file');
    var fn = fileEl.files[0]["name"];
    if(!check_file_extention(fn)){
      console.log("Not allowed file");
      return;
    }
    var uploadIds = uploader.upload(fileEl, {
        data: {
          "id":makeid(8),
          "filename":fn,
          "council":council_id,
          "uploader":logged_in,
        }
    });

    setTimeout(function() {
        uploader.abort(uploadIds[0]);
        console.log(uploader.getUploadInfo());
    }, 5000);
};
