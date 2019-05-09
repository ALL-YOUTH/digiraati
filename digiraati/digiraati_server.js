var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");

var port = process.env.PORT || 3000;
var host = "localhost";

var Users = require(path.join(__dirname + "/user.js"));
var Councils = require(path.join(__dirname + "/councils.js"));

let users = new Users();
let councils = new Councils();

//Comments in lakiteksti
var comments = {};
MESSAGES2PRINT = 50;

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
  var id = socket.request.connection.remoteAddress;
  /*name = users.get_username_by_id(id);
  if(name == -1){
    //Connected user is not logged inspect
    socket.emit('not logged');
  }
  else{
    users.login_user(name);
    socket.emit('login success', name);
    update_page();
  }*/

  socket.on('check login', function(){
    var name = users.get_username_by_id(id);
    if(name == -1){
      socket.emit('not logged');
    }
    else{
      users.login_user(name);
      socket.emit('login success', name);
      update_page();
    }
  });

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

  socket.on('council create attempt', function(info){
    ret_val = councils.add_council(info["id"], info["name"], "TESTIRAATI", info["creator"]);
    if(ret_val == -1){
      console.log("Unable to create council...");
    }
    update_page();
  });

  //SENDING A MESSAGE PART
  socket.on('chat message', function(msg){
    var sender = users.get_username_by_id(id);
    councils.add_message(msg["council"], sender, msg["message"]);
    send_msg = sender + ": " + msg["message"];
    io.emit('chat message', msg["council"], send_msg);
  });

  //User logged out of the chat
  socket.on('logout attempt', function(name){
    users.logout_user(name);
    update_page();
  });

  socket.on('get prev messages', function(c){
    msgs = councils.get_previous_messages_from_council(c, MESSAGES2PRINT);
    for(var i = 0; i < msgs.length; ++i){
      socket.emit('chat message', msgs[i]["sender"] + ": " + msgs[i]["text"]);
    }
  });

  /*socket.on('check user login', function(){
    client = socket.request.connection.remoteAddress;
    check = get_name(client);
    if(check == -1){
      io.emit("not logged in");
    }
  });*/
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

function update_page(){
  //Users
  var online_users = users.get_logged_in_usernames();
  io.emit('users update', online_users);

  //Councils
  var all_councils = councils.get_councils();
  io.emit('councils update', all_councils);
  //print_councils(all_councils);

  //Lakitekstit

  //...
}

function print_messages(c, n){

}

//////////////////////////////////////////////////////////////////////////////
// DEBUG FUNCTIONS
//////////////////////////////////////////////////////////////////////////////

function print_councils(c){
  for(var i = 0; i < c.length; ++i){
    console.log("Council name: ", c[i]["name"], "|", "Council ID:", c[i]["id"])
  }
}

function print_users(u){
  for(var i = 0; i < u.length; ++i){
    console.log(u[i]);
  }
}
