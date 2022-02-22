var socket = io();
var rect = {};
var drag = false;
var cl = document.getElementById("comment_layer");
var cw = document.getElementById("comment_view");
var pdf_div = document.getElementById('pdf_div');
var current_comment_id = null;
var COMMENT_SIZE = 10;
var council = "";
var current_file = "";
var uploader = new SocketIOFileClient(socket);
var showing = "";

var numPages = 0;
var currPage = 1;
var thePDF = null;
var scale = 0.1;
var current_comment_open = "";
var uploading = false;

var host = socket["io"]["uri"] + ":" + location.port;

var colors = ["#FE0456", "#CBE781", "#01AFC4", "#FFCE4E"];

$(function(){
  window.sessionStorage.removeItem("in_council");
  $('#material_content').hide();
  council = window.location.href.split("/").slice(-2)[0];
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
  $('#comment_view').css("height", $(window).height()-100);
  $('#comment_list_div').css("max-height", $(window).height()-100);
  $('#navbar').load(socket["io"]["uri"] + '/html/navbar.html');
  socket.emit("check login council", window.sessionStorage.getItem('token'), council, function(result){
    if (result == "success"){
        window.sessionStorage.setItem("in_council", true);
        socket.emit('update files request', council, function(file_list)
          {
            list_files(file_list);
          });
    $('#material_content').show();
    }
  });
});

function init() {
  // pdf_div.addEventListener('mousedown', mouseDown, false);
  // pdf_div.addEventListener('mouseup', mouseUp, false);
  // pdf_div.addEventListener('mousemove', mouseMove, false);
  document.getElementById('comment_view').addEventListener('scroll', wheel);
}

init();

window.addEventListener('resize', function(){
  cw.style.width = "70%";
});

function display_file(file, title){
  let file_ext = title.split(".").slice(-1)[0];
  //console.log("file:" + file + "." + file_ext);
  url = socket["io"]["uri"] + "/files/" + file + "." + file_ext;

  // JPG Support 07122021

  if (file_ext == "jpg" | "jpeg") {
    // console.log("URL:" + url + "file" + file);
    pdf_div.innerHTML="<img src=\""+url+"\">";
  } else {

  currPage = 1;
  pdfjsLib.getDocument(url).promise.then(function(pdf) {
    thePDF = pdf;
    numPages = thePDF.numPages;
    pdf.getPage(currPage).then(handlePages);
  });
  showing = file;
  }
}

function wheel(){
  var move_var = (parseInt(cw.scrollTop) - window.scrollY)+ "px";
  cl.style.top -= move_var;
  rect.startY -= move_var;
  if(!current_comment_id){return;}
  draw();
}

function comment_wheel(e){
  if(cw.scrollTop == 0 && e.deltaY < 0){return;}
  var move_var = (parseInt(cw.scrollTop) + e.deltaY)+ "px";
  cl.style.top = move_var;
  cw.scrollTo(0,cw.scrollTop + (e.deltaY/2));
}

function mouseDown(e){
  if(e.target.id == "tmp_add" || e.target.id == "tmp_close"
  || e.target.id == "comment_text_input"){return;}
  if(current_comment_id != null){
    document.getElementById(current_comment_id).remove();
    rect = {};
  }
  var temp = document.createElement("div");
  rect.startX = e.pageX - cl.getBoundingClientRect().left;
  rect.startY = e.pageY - cl.getBoundingClientRect().top - window.scrollY;
  rect.h = 0;
  rect.w = 0;
  drag = true;
  current_comment_id = makeid();
  temp.id = current_comment_id;
  temp.style.left = rect.startX + "px";
  temp.style.top = rect.startY + "px";
  add_classes_to_element(temp, ["temp_comment"]);
  temp.addEventListener("mousewheel", comment_wheel);
  cl.appendChild(temp);
  draw();
}

function mouseMove(e){
  if (drag) {
    rect.w = (e.pageX - cl.getBoundingClientRect().left) - rect.startX;
    rect.h = (e.pageY - cl.getBoundingClientRect().top - window.scrollY) - rect.startY ;
    draw();
  }
}

function comment_too_small(id){
  var c = document.getElementById(id);
  if(c.offsetWidth < COMMENT_SIZE && c.offsetWidth > -(COMMENT_SIZE)){
    return true;
  }
  if(c.offsetHeight < COMMENT_SIZE && c.offsetHeight > -(COMMENT_SIZE)){
    return true;
  }
  return false;
}

function mouseUp(e){
  if(!drag){ return; }
  drag = false;
  if(comment_too_small(current_comment_id) && e.target.className == "comment"){
    var id = get_comment_id(e);
    open_comment(id);
  }
  if(comment_too_small(current_comment_id)){
    document.getElementById(current_comment_id).remove();
    current_comment_id = null;
    rect = {};
    drag = false;
    return;
  }
  continue_comment();
}

function draw() {
  var c = document.getElementById(current_comment_id);
  if(rect.h < 0){
    c.style.top = rect.startY + rect.h + "px";
    c.style.height = Math.abs(rect.h) + "px";
  }
  if(rect.w < 0){
    c.style.left = rect.startX + rect.w + "px";
    c.style.width = Math.abs(rect.w) + "px";
  }
  c.style.height = rect.h + "px";
  c.style.width = rect.w + "px";
}

function remove_comment(id){
  id.target.parentElement.remove();
  current_comment_id = null;
}

function request_add_comment(){
  if(logged_in == ""){
    alert("Kirjaudu sisään kommentoidaksesi");
  }
  var comment_data = {};
  if(document.getElementById('comment_text_input').value.length < 1){
    return;
  }
  comment_data["sender"] = logged_in;
  comment_data["id"] = makeid();
  comment_data["timestamp"] = timestamp();
  comment_data["dimentions"] = rect;
  comment_data["text"] = document.getElementById('comment_text_input').value;
  comment_data["council"] = council;
  comment_data["file"] = current_file;
  socket.emit("request add comment", comment_data, function(data){
    var c = document.getElementById(current_comment_id);
    c.classList.remove("temp_comment");
    c.classList.add("comment");
    while(c.childNodes.length > 0){
      c.removeChild(c.childNodes[0]);
    }
    c.id = data["id"];
    c.classList.add(data["id"]);
    current_comment_id = null;

   create_comment(data);
  });
}

function create_comment(data){
  var nc = document.createElement('div');
  nc.classList.add("comment_in_list");
  nc.classList.add(data["id"]);

  var commenter = document.createElement('div');
  commenter.classList.add("comment_commenter");
  for(var j = 0; j < data["sender"].length; ++j){
    commenter.textContent += data["sender"][j];
    if(j == 40){
      commenter.textContent += "...";
      j = 9999999;
    }
  }

  var pic = document.createElement('div');
  pic.classList.add("avatar_ball");
  pic.textContent = data["sender"][0].toUpperCase();
  var c = 0;
  for(var i = 0; i < data["sender"].length; ++i){
    c += data["sender"].charCodeAt(i);
  }
  pic.style.backgroundColor = colors[c % colors.length];

  var ct = document.createElement('div');
  ct.textContent = data["text"];
  ct.classList.add("comment_text");
  ct.classList.add(data["id"]+"text");

  var reaction_btns = document.createElement('div');
  reaction_btns.classList.add(data["id"] + "reactions");
  reaction_btns.classList.add("comment_reactions");
  var comment_like_btn = document.createElement('div');
  add_classes_to_element(comment_like_btn, ["fas", "fa-thumbs-up"]);
  comment_like_btn.textContent = data["likes"];

  var idk_btn = document.createElement('div');
  idk_btn.textContent = "En ymmärrä";
  var comment_answer_btn = document.createElement('div');
  comment_answer_btn.textContent = "Vastaa";
  comment_answer_btn.id = "reply_btn";
  comment_answer_btn.addEventListener('click', open_reply_view);

  var reply_list = document.createElement('div');
  reply_list.id = data["id"] + "replylist";
  reply_list.classList.add("replylist");

  reaction_btns.appendChild(comment_like_btn);
  reaction_btns.appendChild(idk_btn);
  reaction_btns.appendChild(comment_answer_btn);


  var reply = document.createElement('div');
  reply.id = data["id"]+"reply_area";
  reply.classList.add("reply_area");

  var reply_text_input = document.createElement('textarea');
  reply_text_input.id = data["id"] + "replyinput";

  var reply_send_btn = document.createElement('span');
  add_classes_to_element(reply_send_btn, ["fas", "fa-arrow-circle-right", "fa-2x"]);
  reply_send_btn.addEventListener('click', send_reply);
  reply_send_btn.id = data["id"] + "replybtn";

  reply.appendChild(reply_text_input); reply.appendChild(reply_send_btn);


  nc.appendChild(pic); nc.appendChild(commenter);
  nc.appendChild(ct);nc.appendChild(reaction_btns);
  nc.appendChild(reply_list);
  nc.appendChild(reply)


  nc.addEventListener("mouseover", hightlight_comment);
  nc.addEventListener("mouseout", unhighlight_comment);
  nc.addEventListener("click", gotoComment);

  document.getElementById('comment_list').appendChild(nc);
}

function send_reply(e){
  var id = e.target.id.replace('replybtn', '');
  var data = {};
  data["id"] = id;
  data["text"] = $("#"+id+"replyinput").val();
  data["sender"] = logged_in;
  data["timestamp"] = timestamp();
  data["council"] = council;
  data["file"] = current_file;
  socket.emit('request add response', data, function(data){
    addResponse(data);
  });
  document.getElementById(id+"replyinput").value = "";
}

function addResponse(data){
  var list = document.getElementById(data["id"] + "replylist");
  clear_child_elements(list);
  for(var i = 0; i < data["responses"].length; ++i){
    var r = data["responses"][i];
    if(r["sender"] == ""){continue;}
    var response = document.createElement('div');
    var pic = document.createElement('div');
    pic.classList.add("avatar_ball");
    var c = 0;
    for(var j = 0; j < r["sender"].length; ++j){
      c += r["sender"].charCodeAt(j);
    }
    pic.style.backgroundColor = colors[c % colors.length];
    pic.textContent = r["sender"][0].toUpperCase();
    //console.log(pic);
    response.appendChild(pic);
    response.textContent = r["text"];
    list.appendChild(response);
  }
}

function open_reply_view(){
    document.getElementById(current_comment_open + "reply_area").style.display = "block";
}

function gotoComment(e){
  if(e.target.id == "reply_btn" || e.target.type == "textarea" ||
      e.target.id.includes('replybtn')){
    return;
  }
  var c = get_comment_id(e);
  cw.scrollTo(0, c.offsetTop - 300);
  open_comment(c);
}

function continue_comment(){
  if(rect.h < 5 && rect.h > -5 && rect.w < 5 && rect.w > -5){return;}
  var comment = document.getElementById(current_comment_id);

  var nc_close = document.createElement('a');
  nc_close.id = "tmp_close";
  add_classes_to_element(nc_close, ["fas", "fa-times", "comment_close_btn", current_comment_id]);
  nc_close.addEventListener("click", remove_comment);
  comment.appendChild(nc_close);

  var nc_add = document.createElement('a');
  add_classes_to_element(nc_add, ["fas", "fa-check", "comment_add_btn"]);
  nc_add.addEventListener("click", request_add_comment);
  nc_add.id = "tmp_add";
  comment.appendChild(nc_add);

  var comment_text_area = document.createElement('textarea');

  comment_text_area.id = "comment_text_input";
  comment_text_area.style.top = rect.h + "px";
  comment_text_area.style.left = "0px";
  comment_text_area.style.width = rect.w + "px";
  comment_text_area.style.height = "100px";
  comment.appendChild(comment_text_area);
}

function close_all_comments(){
  var comments = document.getElementsByClassName('comment_in_list');
  for(var j = 0; j < comments.length; ++j){
    comments[j].style.backgroundColor = "#C4EDF1";
  }
  var arr = document.getElementsByClassName('comment_text');
  for(var i = 0; i < arr.length; ++i){
    arr[i].style.display = "none";
  }
  var react = document.getElementsByClassName('comment_reactions');
  for(var i = 0; i < react.length; ++i){
    react[i].style.display = "none";
  }
  var reply = document.getElementsByClassName('reply_area');
  for(var i = 0; i < reply.length; ++i){
    reply[i].style.display = "none";
  }
  var replylist = document.getElementsByClassName('replylist');
  for(var i = 0; i < replylist.length; ++i){
    replylist[i].style.display = "none";
  }
}

function open_comment(id){
  close_all_comments();
  if(current_comment_open == id){
    current_comment_open = "";
    return;
  }
  document.getElementsByClassName(id)[1].style.backgroundColor = "#01AFC4";
  var elements = document.getElementsByClassName(id+"text");
  for(var i = 0; i < elements.length; ++i){
    elements[i].style.display = "block";
  }
  var reactions = document.getElementsByClassName(id+"reactions");
  for(var i = 0; i < reactions.length; ++i){
    reactions[i].style.display = "block";
  }

  var replylist = document.getElementById(id+"replylist")
  replylist.style.display = "block";
  current_comment_open = id;

  var data = {};
  data["id"] = id;
  data["council"] = council;
  data["file"] = current_file;
  socket.emit("request comment data", data, function(response){

  });
}

function get_comment_id(e){
  var a = e.target;
  var els = [];
  while (a) {
    if(a.classList[0] == "comment_in_list"){
      return a.classList[1];
    }
    els.unshift(a);
    a = a.parentNode;
  }
}

function hightlight_comment(e){
  var id = get_comment_id(e);
  document.getElementById(id).style.backgroundColor = "rgba(1,175,196,0.5)";
}

function unhighlight_comment(e){
  var id = get_comment_id(e);
  document.getElementById(id).style.backgroundColor = "rgba(196,237,241,0.5)";
}


function handlePages(page) {
  //This gives us the page's dimensions at full scale
  currPage++;
  var viewport = page.getViewport({scale: scale,});
  while(viewport.width < $('#comment_view').width()){
    scale += 0.1;
    viewport = page.getViewport({scale: scale,});
  }
  viewport = page.getViewport({scale: scale-0.1,});
  //We'll create a canvas for each page to draw it on
  var canvas = document.createElement("canvas");
  var context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  canvas.classList.add("page");

  //Draw it on the canvas
  page.render({canvasContext: context, viewport: viewport});

  //Add it to the web page
  var pdf = document.getElementById('pdf');
  pdf.appendChild(canvas);

  //Move to next page

  if ( thePDF !== null && currPage <= numPages )
  {
    thePDF.getPage( currPage ).then( handlePages );
  }
}

$('#add_file_btn').click(function(ev){
  if (uploading == false)
  {
    uploading = true;
  ev.preventDefault();
  var fileEl = document.getElementById('file_input');
  let file_id = makeid(8);
  var fn = fileEl.files[0]["name"];
  var uploadIds = uploader.upload(fileEl, {
    uploadTo: "files",
    rename: file_id,
    data: {
      "id":file_id,
      "filename":fn,
      "council":council,
      "uploader":logged_in,
    }
  });

  setTimeout(function() {
    uploader.abort(uploadIds[0]);
  }, 5000);
  }

  else 
  {
    alert("Tiedosto on jo lähetyksessä");
  }
});

uploader.on('start', function(fileInfo) {
  //console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
  //console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
});
uploader.on('complete', function(fileInfo) {
  //console.log("upload complete")
  alert("Tiedoston lähetys onnistui");
  uploading = false;
  socket.emit('update files request', council, function(file_list){
    list_files(file_list);
    //console.log("received files");
  });
});
uploader.on('error', function(err) {
  alert("Tiedoston lähetys epäonnistui");
  //console.log('Error!', err);
});
uploader.on('abort', function(fileInfo) {
  //console.log('Aborted: ', fileInfo);
});

function list_files(files){
  if(files == null){return;}
  var filelist = document.getElementById('file_list');
  clear_child_elements(filelist);
  for(var i = 0; i < files.length; ++i){
    var el = document.createElement('div');
    el.id = files[i]["id"];
    el.textContent = files[i]["path"];
    el.onclick = function(){
      file_clicked(this);
    }
    filelist.appendChild(el);
  }
}

$('#all_documents_btn').click(function(){
  showing = 0;
  reload = location.reload(); // fixed previously viewed JPG showing over PDFs
  $('#all_documents_container').css("display", "block");
  $('#document_container').css("display", "none");
  $('#all_documents_btn').css("width", "80%");
  $('#all_documents_btn').css("transition", "width 1s");
  $('#current_document').css("width", "0%");
  $('#current_document').css("transition", "width 1s");
  $('#current_document').html(" ");

});

function file_clicked(e){
  let maximum_length = 23; // Pisin tiedostonnimi, joka näytetään
  let tiedostonimi = e.innerHTML;
  let trimmedString = tiedostonimi.length > maximum_length ? 
                    tiedostonimi.substring(0, maximum_length - 3) + "..." : 
                    tiedostonimi;
  if(e.id == showing){return;}
  scale = 0.1;
  var w = document.getElementById('comment_view').style.width + "px";
  $('#all_documents_container').css("display", "none");
  $('#document_container').css("display", "block");
  $('#all_documents_btn').css("width", "39%");
  $('#all_documents_btn').css("transition", "width 1s");
  $('#current_document').css("width", "39%");
  $('#current_document').css("transition", "width 1s");
  $('#current_document').css("display", "inline-block");
  $('#current_document').text(trimmedString);
  $("html,body").animate({"scrollTop": $("#lobby_navigation").offset().top},1000);
  currPage = 1;
  thePDF = null;
  clear_child_elements(document.getElementById("comment_layer"));
  clear_child_elements(document.getElementById("comment_list"));
  clear_child_elements(document.getElementById("pdf"));
  current_file = e.id;
  display_file(e.id, e.textContent);
  socket.emit('request file comments', council, e.id, function(data){
    processComments(data);
  });
}

function processComments(comments){
  for(var i = 0; i < comments.length; ++i){
    var data = comments[i];
    if(data["sender"] == ""){
      continue;
    }
    create_comment(data);
    var c = document.createElement("div");
    c.id = data["id"];
    c.classList.add("comment");
    c.classList.add(data["id"]);
    c.style.top = data["dimentions"]["startY"] + "px";
    c.style.left = data["dimentions"]["startX"] + "px";
    c.style.height = Math.abs(data["dimentions"]["h"]) + "px";
    c.style.width = Math.abs(data["dimentions"]["w"]) + "px";
    if(data["dimentions"]["w"] < 0){
      c.style.left = (data["dimentions"]["startX"] + data["dimentions"]["w"]) + "px";
    }
    if(data["dimentions"]["h"] < 0){
      c.style.top += (data["dimentions"]["startY"] + data["dimentions"]["h"] + "px");
    }
    cl.appendChild(c);
  }
}

$('#lobby_home_btn').click(function(){
  goToPage("/lobby/" + council + "/index");
});

$('#lobby_chat_btn').click(function(){
  goToPage("/lobby/" + council + "/chat");
});

$('#lobby_document_btn').click(function(){
  goToPage("/lobby/" + council + "/material");
});

$('#lobby_conclusion_btn').click(function(){
  goToPage("/lobby/" + council + "/conclusion");
});
