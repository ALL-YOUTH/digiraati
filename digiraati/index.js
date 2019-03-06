var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var host = "127.0.0.1";

var chatters = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  client = socket["client"]["id"];
  if(chatters.indexOf(client) == -1){
    //New user entered the channel
    console.log("New user");
    socket.emit('new user');
  }
  else{
    socket.emit("Welcome back, " + get_name(client));
  }
  socket.on('name submit', function(name){
    console.log("Client submitted a name", name);
    for(i = 0; i < chatters.length; ++i){
      //nickname used
      if(chatters[i][1] == name){
        console.log("Name already taken");
        socket.emit('invalid nickname');
        return;
      }
    }
    console.log("Adding new nickname to chatters", name);
    chatters.push([client, name]);
    socket.emit('chat message', "Welcome to the chat " + name);
    console.log(chatters);
  });

  socket.on('chat message', function(msg){
    console.log("Message was sent", msg);
    send_msg = get_name(client) + ": " + msg;
    io.emit('chat message', send_msg);
  });
});

http.listen(port, host, function(){
  console.log('Running on: http://:' + host + ":" + port);
});


function get_name(id){
  for(i = 0; i < chatters.length; ++i){
    if(chatters[i][0] == id){
      return chatters[i][1];
    }
  }
  return -1;
}
