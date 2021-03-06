var socket = io();
var council_data = {};
var council_id = "";

var allowed_extentions = [".txt", ".docx", ".doc", ".pdf"];

var uploader = new SocketIOFileClient(socket);
var files = document.getElementById('files');
var loadingTask = null;
var pageNumber = 1;
var current_file = "";
var pdf_scale = 1.0;
var comment_x = 0;
var comment_y = 0;

var comment_visibility = false;

$(function(){
  council_id = getUrlVars()["lobby"];
  open_council_info();
  socket.emit('request council data', council_id);
  socket.emit('check joined', council_id, logged_in);
  socket.emit('request council members', council_id);
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
  document.getElementById('submit_file').style.display = "none";
  document.getElementById('filename').innerHTML = "";
});

function file_clicked(e){
  $('#material-url').attr("href", "localhost:3000/files/"+e.id);
  $('#material-url').gdocsViewer();
}


//This function is modified version of provided in:
//https://github.com/mozilla/pdf.js/blob/master/examples/learning/helloworld.html
/*function file_clicked(e){
  pageNumber = 1;
  var url = 'http://localhost:3000/files/'+ e.id;
  current_file = url;
  var pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
  loadingTask = pdfjsLib.getDocument(url);

  reset_file_canvas();
  display_file(pageNumber);
}

function reset_file_canvas(){
  document.getElementById('material-url').remove();
  var canvas = document.createElement('canvas');
  canvas.id = "material-url";
  canvas.addEventListener("click", canvas_clicked);

  document.getElementById('canvas-div').appendChild(canvas);
}

function display_file(page_){
  loadingTask.promise.then(function(pdf) {
    var totalPages = pdf.numPages;
    if(page_ > totalPages){
      return;
    }
    else if (page_ == 0) {
      return;
    }
    pageNumber = page_;
    document.getElementById("file_pages").innerHTML = "Sivu " +
                                                     page_ + "/"
                                                      + totalPages;
    pdf.getPage(page_).then(function(page) {
      var scale = 0.1;
      var canvas = document.getElementById('material-url');
      var viewport = page.getViewport(scale);
      var div = document.getElementById('material-file-viewer');
      while(viewport.width < div.clientWidth){
        scale += 0.1;
        viewport = page.getViewport(scale);
      }
      viewport = page.getViewport(scale-0.1);
      var context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      var renderTask = page.render(renderContext);
      try{
        renderTask.promise.then(function () {
          console.log('Page rendered');
        });
      }
      catch(err){
        reset_file_canvas();
        display_file(pageNumber);
      }
    });
  }, function (reason) {
    console.error(reason);
  });
}

function next_page(){
  display_file(pageNumber + 1);
}

function prev_page(){
  display_file(pageNumber - 1);
}*/

function sign_in_council(){
  socket.emit('request council join', council_id, logged_in);
}

function resign_from_council(){
  var ans = confirm("Oletko varma ett?? haluat poistua raadista?");
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
  var submit_file_btn = document.getElementById('submit_file')
  var filename = document.getElementById('filename');
  try{
    var file = document.getElementById('fileselect').files[0]["name"];
    filename.innerHTML = file;
    if(file.length == 0){
      submit_file_btn.style.display = "none";
    }
    else{
      submit_file_btn.style.display = "block";
    }
  }
  catch{
    submit_file_btn.style.display = "none";
    filename = "";
  }
}

files.onsubmit = function(ev) {
  ev.preventDefault();
  var fileEl = document.getElementById('fileselect');
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

function file_select_clicked(){
  document.getElementById('fileselect').click();
  document.getElementById('fileselect').value = null;
}

function canvas_clicked(e) {
  comment_x = e.pageX / $(window).width();
  comment_y = e.pageY;
  var rclickmenu = document.getElementById("rclickmenu");
  if(comment_visibility == false){
    open_comment_menu(rclickmenu, e);
  }
  else{
    close_comment_menu();
  }
}

function close_comment_menu(){
  //var rclickmenu = document.getElementById("rclickmenu");
  //rclickmenu.style.display = "none";
  document.getElementById('text-selector').style.display = "none";
  comment_visibility = false;
}

function open_comment_menu(rclickmenu, e){
  /*rclickmenu.style.left = e.pageX +"px";
  rclickmenu.style.top = e.pageY +"px";
  rclickmenu.style.display = "block";*/
  comment_visibility = true;
  var s = document.getElementById('pane');
  show_comment_menu(e);
  s.style.left = e.pageX + "px";
  s.style.top = e.pageY + "px";
  s.style.display = "block";
}

function show_comment_menu(e){
  var s = document.getElementById('pane');
  document.getElementById('ghostpane').style.display = "block";
  s.style.left = e.pageX + "px";
  s.style.top = e.pageY + "px";
  s.style.display = "block";
}

function draw_comments(comment){
  //TODO
}

function add_custom_comment(){
  add_comment(document.getElementById('comment_text').value);
}

function add_comment(text){
  var value = croppr.getValue();
  console.log(value);
  if(logged_in == ""){
    alert("Sinun t??ytyy olla kirjautuneena sis????n jotta voit lis??t?? kommentin");
  }
  else{
    var comment = {};
    comment["text"] = text;
    comment["sender"] = logged_in;
    comment["time"] = timestamp();
    comment["likes"] = 0;
    comment["dislikes"] = 0;
    socket.emit('request add comment', council_id, comment);
  }
  close_comment_menu();

  /*var new_comment = document.createElement('a');
  new_comment.classList.add("speech-bubble");
  new_comment.style.right = "30%";
  new_comment.style.top = comment_y + "px";
  //document.getElementById('material-file-viewer').appendChild(new_comment);
  close_comment_menu();*/
}

socket.on("comment add failed", function(){
  alert("Kommentin lis????minen ep??onnistui");
});

socket.on("comment add success", function(){
  alert("Kommentin lis????minen onnistui");
});

window.onresize = function () {
  display_file(pageNumber);
};

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

dragElement(document.getElementById("rclickmenu"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  }
  else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function get_parent_elements(element){
  var nodes = [];
  nodes.push(element);
  while(element.parentNode){
    nodes.unshift(element.parentNode);
    element = element.parentNode;
  }
  return nodes;
}
