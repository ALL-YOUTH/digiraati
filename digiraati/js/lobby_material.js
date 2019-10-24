var socket = io();
var rect = {};
var drag = false;
var comment_layer = document.getElementById("comment_layer");
var cw = document.getElementById("comment_view");
var pdf_div = document.getElementById('pdf_div');
var current_comment_id = null;
var COMMENT_SIZE = 20;
var council = "";

var url = "http://localhost:3000/test.pdf";

var numPages = 0;
var currPage = 1;
var thePDF = null;
var scale = 1.5;

$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");
  $('#comment_view').css("height", $(window).height()-100);
  council = window.location.href.split("/").slice(-2)[0];
});

function init() {
  pdf_div.addEventListener('mousedown', mouseDown, false);
  pdf_div.addEventListener('mouseup', mouseUp, false);
  pdf_div.addEventListener('mousemove', mouseMove, false);
  document.getElementById('comment_view').addEventListener('scroll', wheel);
}

init();

function wheel(){
  var cl = document.getElementById('comment_layer');
  var move_var = (0 - parseInt(cw.scrollTop) + cw.offsetTop)+ "px";
  cl.style.top = move_var;
  rect.startY -= move_var;
  console.log(cw.scrollTop);
  if(!current_comment_id){return;}
  draw();
}

function comment_wheel(e){
  if(cw.scrollTop == 0 && e.deltaY < 0){return;}
  var cl = document.getElementById('comment_layer');
  var move_var = (0 - parseInt(cw.scrollTop) + cw.offsetTop + e.deltaY)+ "px";
  cl.style.top = move_var;
  cw.scrollTo(0,cw.scrollTop + e.deltaY);
}

function mouseDown(e){
  if(e.target.id == "tmp_add" || e.target.id == "tmp_close"){return;}
  if(current_comment_id != null){
    document.getElementById(current_comment_id).remove();
    rect = {};
  }
  var temp = document.createElement("div");
  rect.startX = e.pageX - this.offsetLeft;
  rect.startY = e.pageY - this.offsetTop + cw.scrollTop;
  console.log(e.pageY, this.offsetTop, cw.scrollTop);
  rect.h = 0;
  rect.w = 0;
  drag = true;
  current_comment_id = makeid();
  temp.id = current_comment_id;
  temp.style.left = rect.startX + "px";
  temp.style.top = rect.startY + "px";
  add_classes_to_element(temp, ["temp_comment"]);
  temp.addEventListener("mousewheel", comment_wheel);
  comment_layer.appendChild(temp);
  draw();
}

function mouseMove(e){
  if (drag) {
    rect.w = (e.pageX - this.offsetLeft) - rect.startX;
    rect.h = (e.pageY - this.offsetTop + cw.scrollTop ) - rect.startY ;
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
  console.log(rect);
  if(!drag){ return; }
  drag = false;
  if(comment_too_small(current_comment_id) && e.target.className == "comment"){
    open_comment(e);
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
  if(rect.w < 5 && rect.w > -5){
    rect.w = 6;
  }
  if(rect.h < 5 && rect.w > -5){
    rect.h = 6;
  }
  c.style.height = rect.h + "px";
  c.style.width = rect.w + "px";
}

function add_classes_to_element(element, classes){
  for(var i = 0; i < classes.length; ++i){
    element.classList.add(classes[i]);
  }
}

function remove_comment(id){
  id.target.parentElement.remove();
  current_comment_id = null;
}

function add_comment(id){
  var c = document.getElementById(current_comment_id);
  c.classList.remove("temp_comment");
  c.classList.add("comment");
  while(c.childNodes.length > 0){
    c.removeChild(c.childNodes[0]);
  }
  var id = makeid();
  c.classList.add(id);
  current_comment_id = null;
  var nc = document.createElement('div');
  nc.classList.add("comment_in_list");
  nc.classList.add(id);
  nc.innerHTML = c.id;
  c.addEventListener("mouseover", hightlight_comment);
  c.addEventListener("mouseout", unhighlight_comment);
  nc.addEventListener("mouseover", hightlight_comment);
  nc.addEventListener("mouseout", unhighlight_comment);
  document.getElementById('comment_list').appendChild(nc);
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
  nc_add.addEventListener("click", add_comment);
  nc_add.id = "tmp_add";
  comment.appendChild(nc_add);
}

function open_comment(){
  console.log("opening comment");
}

function hightlight_comment(e){
  var id = e.target.classList[1];
  var elements = document.getElementsByClassName(id);
  for(var i = 0; i < elements.length; ++i){
    elements[i].style.backgroundColor = "rgb(255,255,0,0.7)";
  }
}

function unhighlight_comment(e){
  var id = e.target.classList[1];
  var elements = document.getElementsByClassName(id);
  for(var i = 0; i < elements.length; ++i){
    elements[i].style.backgroundColor = "rgb(255,255,0,0.5)";
  }
}


function handlePages(page) {
  //This gives us the page's dimensions at full scale
  currPage++;
  var viewport = page.getViewport({scale: scale,});
    //We'll create a canvas for each page to draw it on
  var canvas = document.createElement("canvas");
  canvas.style.display = "block";
  var context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  canvas.classList.add("page");

  //Draw it on the canvas
  page.render({canvasContext: context, viewport: viewport});

  //Add it to the web page
  var pdf_div = document.getElementById('pdf_div');
  pdf_div.appendChild(canvas);

  //Move to next page

  if ( thePDF !== null && currPage <= numPages )
  {
    thePDF.getPage( currPage ).then( handlePages );
  }
}

pdfjsLib.getDocument(url).promise.then(function(pdf) {
  thePDF = pdf;
  numPages = thePDF.numPages;
  pdf.getPage(currPage).then(handlePages);
});


$('#lobby_home_btn').click(function(){
  goToPage("/lobby/" + council + "/index");
});

$('#lobby_chat_btn').click(function(){
  goToPage("/lobby/" + council + "/chat");
});

$('#lobby_document_btn').click(function(){
  goToPage("/lobby/" + council + "/material");
});
