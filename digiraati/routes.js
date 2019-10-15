var app = require('express')();
var express = require('express');
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var SocketIOFile = require('socket.io-file');

//app.use(express.static(path.join(__dirname, '/public')));

app.get('/2.0/', function(req, res){
  res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.get('/2.0/register', function(req, res){
  res.sendFile(path.join(__dirname + '/html/register.html'));
});

app.get('/html/lobby', function(req, res){
  res.sendFile(path.join(__dirname + '/html/lobby_material.html'));
});

app.get('/test.pdf', function(req, res){
  res.sendFile(path.join(__dirname + '/test.pdf'));
});

app.get('/html/2.0/header.html', function(req, res){
  res.sendFile(path.join(__dirname + '/html/header.html'));
});

app.get('/html/2.0/footer.html', function(req, res){
  res.sendFile(path.join(__dirname + '/html/footer.html'));
});

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/html/home.html'));
});

app.get('/main.css', function(req, res){
  res.sendFile(path.join(__dirname + '/css/main.css'));
});

app.get('/index.js', function(req, res){
  res.sendFile(path.join(__dirname + '/js/index.js'));
});

app.get('/js/header.js', function(req, res){
  res.sendFile(path.join(__dirname + '/js/header.js'));
});

//DigiRaatiChat
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/html/chat.html');
});

//Register page
app.get('/register', function(req, res){
  res.sendFile(__dirname + '/html/register.html');
});

//Info page
app.get('/info', function(req, res){
  res.sendFile(__dirname + '/html/info.html');
});

//Council page
app.get('/lobby/:id/material', function(req, res){
  res.sendFile(__dirname + '/html/lobby_material.html');
});
app.get('/lobby/:id/index', function(req, res){
  res.sendFile(__dirname + '/html/lobby.html');
});
app.get('/lobby/:id/chat', function(req, res){
  res.sendFile(__dirname + '/html/lobby_chat.html');
});
app.get('/lobby/:id/stats', function(req, res){
  res.sendFile(__dirname + '/html/lobby_stats.html');
});

app.get('/socket.io.js', (req, res, next) => {
  return res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});
app.get('/socket.io-file-client.js', (req, res, next) => {
  return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

app.get('/files/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/files/" + fid));
});

app.get('/js/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/js/" + fid));
});

app.get('/css/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/css/" + fid));
});

app.get('/res/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/res/" + fid));
});


///////////////////////////////////////////////////////
// images
///////////////////////////////////////////////////////



module.exports = {"app":app, "http":http, "io":io};
