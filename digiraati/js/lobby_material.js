var socket = io();
var rect = {};
var drag = false;
var comment_layer = document.getElementById("comment_layer");
var current_comment_id = null;
var COMMENT_SIZE = 20;

var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d')


$(function(){
  $('#header').load(host + "/html/2.0/header.html");
  $('#footer').load(host + "/html/2.0/footer.html");
  $('#comment_view').css("height", $(window).height()-100);
});

function uniqId() {
  return Math.round(new Date().getTime() + (Math.random() * 100));
}

function init() {
  comment_layer.addEventListener('mousedown', mouseDown, false);
  comment_layer.addEventListener('mouseup', mouseUp, false);
  comment_layer.addEventListener('mousemove', mouseMove, false);
}

init();
function mouseDown(e){
  if(e.target.id == "tmp_add" || e.target.id == "tmp_close"){return;}
  if(current_comment_id != null){
    document.getElementById(current_comment_id).remove();
    rect = {};
  }
  var temp = document.createElement("div");
  rect.startX = e.pageX - this.offsetLeft;
  rect.startY = e.pageY - this.offsetTop;
  rect.h = 0;
  rect.w = 0;
  drag = true;
  current_comment_id = uniqId();
  temp.id = current_comment_id;
  temp.style.left = rect.startX + "px";
  temp.style.top = rect.startY + "px";
  add_classes_to_element(temp, ["temp_comment"]);
  comment_layer.appendChild(temp);
}

function mouseMove(e){
  if (drag) {
    rect.w = (e.pageX - this.offsetLeft) - rect.startX;
    rect.h = (e.pageY - this.offsetTop) - rect.startY ;
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
    open_comment(e);
  }
  if(comment_too_small(current_comment_id)){
    document.getElementById(current_comment_id).remove();
    current_comment_id = null;
    rect = {};
    drag = false;
    return;
  }
  //clearRectangle();
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
  var id = uniqId();
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
  var style = document.createElement('style');
  document.head.appendChild(style);
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


function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  document.getElementById('page_num').textContent = num;
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  document.getElementById('page_count').textContent = pdfDoc.numPages;

  renderPage(pageNum);
});
