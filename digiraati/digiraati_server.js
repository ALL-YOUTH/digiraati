var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var host = "localhost";

var chatters = [];

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/chat.html');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/home.html');
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
      if(chatters[i][1].toLowerCase() == name.toLowerCase()){
        console.log("Name already taken");
        socket.emit('invalid nickname');
        return;
      }
    }
    chatters.push([client, name]);
    socket.emit('chat message', "Digiraati: Welcome to the chat " + name);
    socket.broadcast.emit('chat message', "Digiraati: " + name + " joined the chat!");
  });


  //SENDING A MESSAGE PART
  socket.on('chat message', function(msg){
    client = socket["client"]["id"];
    console.log("Message was sent \"", msg + "\"");
    send_msg = get_name(client) + ": " + msg;
    io.emit('chat message', send_msg);
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
