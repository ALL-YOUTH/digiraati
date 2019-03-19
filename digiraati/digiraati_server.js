var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");

var port = process.env.PORT || 3000;
var host = "localhost";


//Chatters are arrays of [socketID, name]
var chatters = [];
//Messages are arrays of [name, msg]
var messages = [];
var MESSAGES2PRINT = 10;

//Digiraati pages
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/html/chat.html');
});

app.get('/js/chat.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/chat.js'));
});

app.get('/css/style.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/css/style.css'));
});

app.get('/res/digiraati_title.png', function(req, res) {
    res.sendFile(path.join(__dirname + '/res/digiraati_title.png'));
});

app.get('/js/home.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/home.js'));
});
//Home page getter
app.get('/', function(req, res){
  res.sendFile(__dirname + '/html/home.html');
});

app.get('/lakiteksti', function(req, res){
  res.sendFile(__dirname + '/html/lakiteksti.html');
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
    for(i = 0; i < chatters.length; ++i){
      //Submitted nickname already taken
      if(chatters[i][1].toLowerCase() == name.toLowerCase()){
        socket.emit('invalid nickname');
        return;
      }
    }
    chatters.push([client, name]);
    //socket.emit('chat message', "Digiraati: Welcome to the chat " + name);
    //socket.broadcast.emit('chat message', "Digiraati: " + name + " joined the chat!");
    //print_msgs(socket, MESSAGES2PRINT);
    socket.emit('login success');
  });

  //SENDING A MESSAGE PART
  socket.on('chat message', function(msg){
    client = socket.request.connection.remoteAddress;
    //console.log("Message was sent \"", msg + "\"");
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

});

http.listen(port, function(){
  console.log('Running on: http://' + host + ":" + port);
});


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
