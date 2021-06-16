var app = require('express')();
var fs = require('fs');
var express = require('express');
var path = require('path');
var http = require('https').createServer({
        key: fs.readFileSync('./ssl/privkey.pem'),
        cert: fs.readFileSync('./ssl/cert.pem'),
        ca: fs.readFileSync('./ssl/chain.pem')}, app);;

var SocketIOFile = require('socket.io-file');

var io = require('socket.io')(http);

let passwordList = [];

function checkPassword(username, password)
{
  for (let i = 0; i < passwordList.length; i++)
  {
    if (passwordList[i]["username"] == username && passwordList[i]["password"] == password)
    {
      return true;
    }
  }

  return false;
}

fs.readFile('passwords.json', function(err, data){
  if(err){
    console.log("Error reading password file");
    return;
  }

  passwordList = JSON.parse(data);
});

//app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.get('/test.pdf', function(req, res){
  res.sendFile(path.join(__dirname + '/test.pdf'));
});

app.get('/large_test.pdf', function(req, res){
  res.sendFile(path.join(__dirname + '/large_test.pdf'));
});

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/html/home.html'));
});

//DigiRaatiChat OLD
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/html/chat.html');
});

//Data protection
app.get('/dataprot', function(req, res){
  res.sendFile(__dirname + '/html/dataprot.html');
});

//Register page
app.get('/register', function(req, res){
  res.sendFile(__dirname + '/html/register.html');
});

//Info page
app.get('/info', function(req, res){
  res.sendFile(__dirname + '/html/info.html');
});

//Council search page
app.get('/search', function(req, res){
  res.sendFile(__dirname + '/html/search.html');
});

//Create council page
app.get('/create', function(req, res){
  res.sendFile(__dirname + '/html/create.html');
});

//Digiraati info page
app.get('/info', function(req, res){
  res.sendFile(__dirname + '/html/info.html');
});

//Digiraati user profile page
app.get('/profile', function(req, res){
  res.sendFile(__dirname + '/html/profile.html');
});

//Digiraati user profile
app.get('/editprofile', function(req, res){
  res.sendFile(__dirname + '/html/editprofile.html');
});

//Digiraati rules page
app.get('/rules', function(req, res){
  res.sendFile(__dirname + '/html/rules.html');
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
app.get('/lobby/:id/conclusion', function(req, res){
  res.sendFile(__dirname + '/html/lobby_conclusion.html');
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

app.get('/council_images/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/council_images/") + fid);
});

app.get('/js/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/js/" + fid));
});

app.get('/html/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/html/" + fid));
});

app.get('/css/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/css/" + fid));
});

app.get('/res/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/res/" + fid));
});

app.get('/images/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/council_images/" + fid));
});

app.get('/glide/:id', (req, res, next) => {
  var fid = req.params.id;
  return res.sendFile(path.join(__dirname, "/node_modules/@glidejs/glide/dist/" + fid));
});

app.get('/admin', function(req, res){
  const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401);
  };

  let authorization = req.headers.authorization;

  if (!authorization)
  {
    return reject()
  }

  let [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':');
  
  if(checkPassword(username, password) == true) {
    console.log("User " + username + " logged in to admin page at " + Date.now());
    res.sendFile(__dirname + '/html/admin.html');
  }

  else {
    console.log("User " + username + " tried to log in to admin page with incorrect password at " + Date.now());
    return reject();
  }

});


///////////////////////////////////////////////////////
// images
///////////////////////////////////////////////////////



module.exports = {"app":app, "http":http, "io":io};
