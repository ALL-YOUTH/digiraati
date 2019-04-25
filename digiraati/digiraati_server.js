var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");

var port = process.env.PORT || 3000;
var host = "localhost";

var Users = require(path.join(__dirname + "/user.js"));
var Rooms = require(path.join(__dirname + "/rooms.js"));

//Chatters are arrays of [socketID, name]
var chatters = [];
let users = new Users();
let rooms = new Rooms();

//Messages are arrays of [name, msg]
var messages = [];
var MESSAGES2PRINT = 10;

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
  client = socket.request.connection.remoteAddress;
  name = get_name(client);
  if(name == -1){
    //Connected user is not logged inspect
    socket.emit('not logged');
  }
  else{
    socket.emit('logged', name);
  }


  socket.on('name submit', function(name){
    console.log("Client submitted a name", name);
    ret_val = users.add_user(client, name, "12345");
    if(ret_val != -1){
      socket.emit('login success');
    }
    else{
      socket.emit('invalid nickname');
    }
  });

  //SENDING A MESSAGE PART
  socket.on('chat message', function(msg){
    send_msg = get_name(client) + ": " + msg;
    io.emit('chat message', send_msg);
    messages.push(send_msg);
  });
  
  //User logged out of the chat
  socket.on('user logout', function(){
    client = socket.request.connection.remoteAddress;
    remove_client(client);
    console.log("Removed client", client);
  });

  socket.on('get prev messages', function(){
    print_msgs(socket, MESSAGES2PRINT);
  });

  socket.on('check user login', function(){
    client = socket.request.connection.remoteAddress;
    check = get_name(client);
    if(check == -1){
      io.emit("not logged in");
    }
  });

  socket.on('add comment', function(page, comment, ref_text){
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
  });
});

http.listen(port, function(){
  console.log('Running on: http://' + host + ":" + port);
});

function check_page_comments(page){
  var keys = [];
  for(var key in comments) keys.push(key);
  for(i = 0; i < keys.length; ++i){
    if(keys[i] == page){
      //page was found in known keys
      return 1;
    }
  }
  //page was not found in known keys
  return 0;

}

function get_name(id){
  for(i = 0; i < chatters.length; ++i){
    if(chatters[i][0] == id){
      return chatters[i][1];
    }
  }
  return -1;
}

function get_client(id){
  for(i = 0; i < chatters.length; ++i){
    if(chatters[i][0] == id){
      return chatters[i];
    }
  }
  return -1;
}

function print_msgs(socket, num_to_print){
  if(messages.length <= num_to_print){
    for(i = 0; i < messages.length; ++i){
      socket.emit('chat message', messages[i]);
    }
  }
  else{
    for(i = messages.length - num_to_print - 1; i < messages.length; ++i){
      socket.emit('chat message', messages[i]);
    }
  }
}

function remove_client(id){
  for(i = 0; i < chatters.length; ++i){
    if(chatters[i][0] == id){
      chatters.splice(i, 1);
    }
  }
}
