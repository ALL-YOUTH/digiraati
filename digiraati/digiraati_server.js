var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");

var port = process.env.PORT || 3000;
var host = "localhost";

var Users = require(path.join(__dirname + "/user.js"));
var Rooms = require(path.join(__dirname + "/rooms.js"));

let users = new Users();
let rooms = new Rooms();

//Comments in lakiteksti
var comments = {};

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
app.get('/res/digiraati_title.png', function(req, res) {
    res.sendFile(path.join(__dirname + '/res/digiraati_title.png'));
});

//DigiRaatiChat
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/html/chat.html');
});
app.get('/js/chat.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/chat.js'));
});

//Lakiteksti
app.get('/lakiteksti', function(req, res){
  res.sendFile(__dirname + '/html/lakiteksti.html');
});
app.get('/js/lakiteksti.js', function(req, res){
  res.sendFile(__dirname + '/js/lakiteksti.js');
});

//===================================================================
//===================================================================
//===================================================================
//===================================================================
//===================================================================
//===================================================================


//Connection
io.on('connection', function(socket){
  id = socket.request.connection.remoteAddress;
  name = users.get_username_by_id(id);
  if(name == -1){
    //Connected user is not logged inspect
    socket.emit('not logged');
  }
  else{
    users.login_user(name);
    socket.emit('login success', name);
    update_page();
  }

  socket.on('login attempt', function(name){
    if(users.get_user(name) != null && users.get_online_status_of_username(name) == false){
      users.login_user(name);
      socket.emit('login success', name);
      update_page();
      return;
    }

    ret_val = users.add_user(id, name, "12345");
    if(ret_val != -1){
      socket.emit('login success', name);
    }
    else{
      socket.emit('invalid nickname');
    }
    update_page();
  });

  //SENDING A MESSAGE PART
  /*socket.on('chat message', function(msg){
    send_msg = get_name(client) + ": " + msg;
    io.emit('chat message', send_msg);
    messages.push(send_msg);
  });*/

  //User logged out of the chat
  socket.on('logout attempt', function(name){
    users.logout_user(name);
    update_page();
  });

  /*socket.on('get prev messages', function(){
    print_msgs(socket, MESSAGES2PRINT);
  });*/

  /*socket.on('check user login', function(){
    client = socket.request.connection.remoteAddress;
    check = get_name(client);
    if(check == -1){
      io.emit("not logged in");
    }
  });*/

  /*socket.on('add comment', function(page, comment, ref_text){
    if(check_page_comments(page) == 0){
      comments[page] = [];
    }
    comments[page].push([comment, ref_text]);
    io.emit('refresh comments', comments[page]);
  });

  socket.on('comment refresh request', function(page){
    if(check_page_comments(page) == 0){
      comments[page] = [];
    }
    io.emit('refresh comments', comments[page]);
  });*/
});

http.listen(port, function(){
  console.log('Running on: http://' + host + ":" + port);
});

function update_page(){
  //Users
  var online_users = users.get_logged_in_usernames();
  io.emit('users update', online_users);

  //councils

  //Lakitekstit

  //...
}
