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

//Add a template council
councils.add_council( id="TEMPLATE",
                      name="TESTIRAATI",
                      description="Tämä raati on tarkoitettu täysin testaukseen.",
                      creator="test",
                      starttime=null,
                      endtime=null,
                      userlimit=null,
                      tags=["General"]
                    );

//Add a template user
users.add_user("test", "test", "test", "test", "test", "test");

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
  res.sendFile(path.join(__dirname + '/html/home_test.html'));
});
app.get('/css/style.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/css/style.css'));
});
app.get('/res/digiraatilogo_trans.PNG', function(req, res) {
    res.sendFile(path.join(__dirname + '/res/digiraatilogo_trans.PNG'));
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

//Lakiteksti
app.get('/lakiteksti', function(req, res){
  res.sendFile(__dirname + '/html/lakiteksti.html');
});
app.get('/js/lakiteksti.js', function(req, res){
  res.sendFile(__dirname + '/js/lakiteksti.js');
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
//===================================================================
//===================================================================
//===================================================================
//===================================================================
//===================================================================
//===================================================================


//Connection
io.on('connection', function(socket){
  var ip = socket.request.connection.remoteAddress;

  socket.on('check login', function(){
    var name = users.get_login_by_ip(ip);
    if(name == false){
      socket.emit('not logged');
    }
    else{
      socket.emit('login success', name);
      update_page();
    }
  });

  socket.on('login attempt', function(name, pw){
    if(users.login_user(name, pw, ip) == false){
      socket.emit('invalid login');
      return;
    }
    else{
      socket.emit('login success', name);
      update_page();
      return;
    }
  });

  socket.on('register attempt', function(data){
    if(users.get_user(data["uname"]) != null){ //Username already in use
      socket.emit("invalid username");
      return;
    }
    else if(users.get_user_by_email(data["email"]) != null){ // email already in use
      socket.emit("invalid email");
      return;
    }
    ret_val = users.add_user(data["id"], data["uname"], data["fname"], data["lname"], data["email"], data["p"]);
    if(ret_val != -1){
      socket.emit('register success', data["uname"]);
    }
    else{
      socket.emit('invalid nickname');
    }
    update_page();
  });

  socket.on('council create attempt', function(info){
    ret_val = councils.add_council(id=info["id"], name=info["name"],
                                    description=info["description"],
                                    creator=info["creator"],
                                    startdate=info["startdate"],
                                    starttime=info["starttime"],
                                    enddate=info["enddate"],
                                    endtime=info["endtime"],
                                    tags=info["keywords"]);
    if(ret_val == -1){
      return;
    }
    update_page();
  });

  socket.on('request councils update', function(){
    update_page();
  });

  //SENDING A MESSAGE PART
  socket.on('chat message', function(msg){
    var sender = users.get_username_by_ip(ip);
    councils.add_message(msg["council"], sender, msg["message"]);
    send_msg = sender + ": " + msg["message"];
    io.emit('chat message', msg["council"], send_msg);
  });

  //User logged out of the chat
  socket.on('logout attempt', function(name){
    users.logout_user(name);
    update_page();
    logged_in = "";
  });

  socket.on('get prev messages', function(c){
    //This should be done in chat.js
    msgs = councils.get_previous_messages_from_council(c, MESSAGES2PRINT);
    if(msgs == undefined){return 0;}
    for(var i = 0; i < msgs.length; ++i){
      socket.emit('chat message', c, msgs[i]["sender"] + ": " + msgs[i]["text"]);
    }
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

  socket.on('request council data', function(id){
    council_data = councils.get_council_data(id);
    if(council_data != null){
      socket.emit('council data', council_data);
    }
  });

  socket.on('check joined', function(councilid, userid){
    if(userid.length == 0){
      socket.emit('user not logged in');
      return;
    }
    joined = councils.is_user_joined(councilid, userid);
    console.log("Checking if user is joined in council:", userid, joined);
    if(joined){
      socket.emit('user joined in council');
    }
    else{
      socket.emit('user not in council')
    }
  });

  socket.on('request council join', function(councilid, userid){
    var res = councils.sign_user_in_council(councilid, userid);
    if(!res){
      socket.emit("council join failed");
    }
    else{
      socket.emit("council join success");
    }
  });

  socket.on('request council members', function(councilid){
    var members = councils.get_council_members(councilid);
    socket.emit('council members', members);
  });

  socket.on('request resign council', function(cid, uid){
    var res = councils.resign_user_from_council(cid, uid);
    if(!res){
      socket.emit("council resign failed");
    }
    else{
      socket.emit("council resign success");
    }
  });
});

http.listen(port, function(){
  console.log('Running on: http://' + host + ":" + port);
});

function update_page(){
  update_councils();
}

function update_councils(){
  var all_councils = councils.get_councils();
  io.emit('councils update', all_councils);
}

function update_users(){
  //TODO
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
