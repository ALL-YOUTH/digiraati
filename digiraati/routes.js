var app = require('express')();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var SocketIOFile = require('socket.io-file');

//Digiraati pages
//HOME
app.get('/js/home.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/js/home.js'));
});
app.get('/js/common.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/js/common.js'));
});
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/html/home.html'));
});
app.get('/css/style.css', function(req, res) {
  res.sendFile(path.join(__dirname + '/css/style.css'));
});
app.get('/res/digiraati_logo.png', function(req, res) {
  res.sendFile(path.join(__dirname + '/res/digiraati_logo.png'));
});
app.get('/res/favicon.ico', function(req, res) {
  res.sendFile(path.join(__dirname + '/res/favicon.ico'));
});

//DigiRaatiChat
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/html/chat.html');
});
app.get('/js/chat.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/js/chat.js'));
});
//Register page
app.get('/register', function(req, res){
  res.sendFile(__dirname + '/html/register.html');
});
app.get('/js/register.js', function(req, res){
  res.sendFile(__dirname + '/js/register.js');
});

//Info page
app.get('/info', function(req, res){
  res.sendFile(__dirname + '/html/info.html');
});

app.get('/js/info.js', function(req, res){
  res.sendFile(__dirname + '/js/info.js');
});

//Info page
app.get('/lobby', function(req, res){
  res.sendFile(__dirname + '/html/lobby.html');
});
app.get('/js/lobby.js', function(req, res){
  res.sendFile(__dirname + '/js/lobby.js');
});

app.get('/js/resizer.js', function(req, res){
  res.sendFile(__dirname + '/js/resizer.js');
});
app.get('/css/resizer.css', function(req, res){
  res.sendFile(__dirname + '/css/resizer.js');
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

module.exports = {"app":app, "http":http, "io":io};
