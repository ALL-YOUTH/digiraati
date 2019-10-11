var socket = io();
var rect = {};
var drag = false;
var canvas = document.getElementById('comment_canvas');
var ctx = canvas.getContext('2d');

$(function(){
  $('#header').load(host + "/html/2.0/header.html");
  $('#footer').load(host + "/html/2.0/footer.html");
});

function uniqId() {
  return Math.round(new Date().getTime() + (Math.random() * 100));
}

function init() {
  canvas.addEventListener('mousedown', mouseDown, false);
  canvas.addEventListener('mouseup', mouseUp, false);
  canvas.addEventListener('mousemove', mouseMove, false);
}

init();
function mouseDown(e){
  ctx.canvas.width = $('#pdf').width();
  ctx.canvas.height = $('#pdf').height();
  rect.startX = e.pageX - this.offsetLeft;
  rect.startY = e.pageY - this.offsetTop;
  drag = true;
}

function mouseMove(e){
  if (drag) {
    rect.w = (e.pageX - this.offsetLeft) - rect.startX;
    rect.h = (e.pageY - this.offsetTop) - rect.startY ;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw();
  }
}

function mouseUp(e){
  drag = false;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  crop_comment();
}

function draw() {
  ctx.setLineDash([6]);
  ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
}

function crop_comment(){
  if(rect.h < 0){
    rect.h = Math.abs(rect.h);
    rect.startY = rect.startY - rect.h;
  }
  if(rect.w < 0){
    rect.w = Math.abs(rect.w);
    rect.startX = rect.startX - rect.w;
  }
  var nc = document.createElement('div');
  nc.classList.add("comment");
  nc.style.left = rect.startX + "px";
  nc.style.top = rect.startY + "px";
  nc.style.height = rect.h + "px";
  nc.style.width = rect.w + "px";
  $('#comment_layer').append(nc);
}
