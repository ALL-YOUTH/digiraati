var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var SocketIOFile = require('socket.io-file');
var fs = require('fs');
var cors = require('cors')

var port = process.env.PORT || 3000;
var host = "localhost";
var backup_file = "backup.json"

var Users = require(path.join(__dirname + "/user.js"));
var Councils = require(path.join(__dirname + "/councils.js"));

let users = new Users();
let councils = new Councils();

//Recover digiraati from backupfile
fs.readFile(backup_file, function (err, data) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return;
  }
  data = JSON.parse(data);
  var recover_users = data["users"];
  var recover_councils = data["councils"];
  for(let user of recover_users){
    try{
      users.recover_user(id=user["id"], uname=user["username"],
                      fname=user["fname"], lname=user["lname"],
                      email=user["email"],
                      hash=user["hash"], online="false", ip=null);
    }
    catch(err){
      server_log(err);
    }
  }
  for(let council of recover_councils){
    try{
      councils.add_council( id=council["id"],
                            name=council["name"],
                            description=council["description"],
                            creator=council["creator"],
                            starttime=council["starttime"],
                            endtime=council["endtime"],
                            userlimit=council["userlimit"],
                            tags=council["tags"]);
      for(let message of council["messages"]){
        councils.add_message(council["id"], message["sender"], message["content"]);
      }
    }
    catch(err){
      server_log("Something went wrong trying to recover users: " + err);
    }
  }
});

http.listen(port);

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//Backup functions
setInterval(function () {
  create_backup();
}, 1 * 60 * 1000); // 1 min


app.use(cors(corsOptions));

//Add a template council
/*councils.add_council( id="TEMPLATE",
name="TESTIRAATI",
description="Tämä raati on tarkoitettu täysin testaukseen.",
creator="test",
starttime=null,
endtime=null,
userlimit=null,
tags=["General"]);

//Add a template user
users.add_user("test", "test", "test", "test", "test", "test");
*/
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

app.get('/socket.io.js', (req, res, next) => {
  return res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});
app.get('/socket.io-file-client.js', (req, res, next) => {
  return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

app.get('/files/:id', (req, res, next) => {
  var fid = req.params.id;
  server_log(path.join(__dirname, "/files/" + fid));
  return res.sendFile(path.join(__dirname, "/files/" + fid));
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
  //server_log(ip + " connected to the server");
  var uploader = new SocketIOFile(socket, {
    uploadDir: 'files',			// simple directory
    maxFileSize: 4194304, 	// 4 MB.
    chunkSize: 10240,				// default is 10240(1KB)
    transmissionDelay: 0,		// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
    overwrite: true 				// overwrite file if exists, default is true.
  });

  socket.on('check login', function(){
    var name = users.get_login_by_ip(ip);
    if(name == false){
      socket.emit('not logged');
    }
    else{
      socket.emit('login success', name);
      server_log(ip + ": " + name + " logged in");
      update_page();
    }
  });

  socket.on('login attempt', function(name, pw){
    if(users.login_user(name, pw, ip) == false){
      socket.emit('invalid login');
      server_log(ip + ": Failed to login");
      return;
    }
    else{
      socket.emit('login success', name);
      server_log(ip + ": " + name + " logged in");
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
    ret_val = users.add_user(id=data["id"], uname=data["uname"],
                              fname=data["fname"], lname=data["lname"],
                              email=data["email"], pw=data["p"]);
    if(ret_val != -1){
      socket.emit('register success', data["uname"]);
      server_log(ip + ": " + data["uname"] + " registered succesfully");
    }
    else{
      socket.emit('invalid nickname');
    }
    update_page();
  });

  socket.on('council create attempt', function(info){
    server_log(ip + ": " + info["creator"] + " attempted to create council: " +
                info["name"]);
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
    server_log(ip + ": " + sender + " : " + msg["council"]
                + " send chat message: " + send_msg);
    io.emit('chat message', msg["council"], send_msg);
  });

  //User logged out of the chat
  socket.on('logout attempt', function(name){
    users.logout_user(name);
    server_log(ip + ": " + name + " logged out");
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
    if(joined){
      socket.emit('user joined in council');
    }
    else{
      socket.emit('user not in council')
    }
  });

  socket.on('request council join', function(councilid, userid){
    var res = councils.sign_user_in_council(councilid, userid);
    server_log(ip + ": " + userid + " attempted to join council " + councilid);
    if(!res){
      server_log(ip + ": " + userid + " was prevented from joining council: "
                  + councilid);
      socket.emit("council join failed");
    }
    else{
      server_log(ip + ": " + userid + " joined council: " + councilid);
      socket.emit("council join success");
    }
  });

  socket.on('request council members', function(councilid){
    var members = councils.get_council_members(councilid);
    socket.emit('council members', members);
  });

  socket.on('request resign council', function(cid, uid){
    var res = councils.resign_user_from_council(cid, uid);
    server_log(ip + ": " + uid + " attempting to resign from council: " + cid);
    if(!res){
      server_log(ip + ": " + uid + " could not resign from council: " + cid);
      socket.emit("council resign failed");
    }
    else{
      server_log(ip + ": " + uid + " resigned from council: " + cid);
      socket.emit("council resign success");
    }
  });

  socket.on('update files request', function(cid){
    var files = councils.get_council_data(cid);
    try{
      socket.emit("update files", files["files"]);
    }
    catch(err){
      console.log("no files in this council", err);
    }

  });

  socket.on('request file data', function(fid){
    server_log(ip + ": " + " requested file: " + fid);
    fs.readFile(path.join(__dirname, "/files/", fid), function(err, buff){
      if(err){
        server_log(ip + ": " + " could not send file: " + fid);
      }
      socket.emit('file data', {data:buff, binary:true});
    });
  });


  ///File upload stuff
  //Todo tähän pitää keksiä vielä vähän sääntöjä että kuka voi lisäämistä
  //tiedostoja ja samannimiset tiedostot yms....
  uploader.on('start', (fileInfo) => {
    server_log(ip + ": " + " started to upload a file");
  });

  uploader.on('stream', (fileInfo) => {
    //server_log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
  });

  uploader.on('complete', (fileInfo) => {
    server_log(ip + ": " + " file upload done");
    councils.add_file(fileInfo["data"]["id"],
    fileInfo["data"]["filename"],
    fileInfo["data"]["council"],
    fileInfo["data"]["uploader"]);

    fs.rename(__dirname + "/files/" + fileInfo["data"]["filename"],
    __dirname + '/files/' + fileInfo["data"]["id"],
    function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });
  });

  uploader.on('error', (err) => {
    server_log(ip + ": file upload ERROR");
  });

  uploader.on('abort', (fileInfo) => {
    server_log(ip + ": file upload ABORT");
  });

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

function create_backup(){
  try{
    var backup_data = {};
    var backup_users = users.get_all_users();
    backup_data["users"] = backup_users;
    var _councils = councils.get_councils();
    backup_data["councils"] = [];
    for(let c of _councils){
      backup_data["councils"].push(councils.get_council_by_id(c["id"]));
    }
    var json_data = JSON.stringify(backup_data);
    fs.writeFile(backup_file, json_data, 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
      console.log("Backup done");
    });
  }
  catch(err){
    console.log("Unable to create backup", err);
  }
}

function timestamp(){
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

//////////////////////////////////////////////////////////////////////////////
// DEBUG FUNCTIONS
//////////////////////////////////////////////////////////////////////////////

function print_councils(c){
  for(var i = 0; i < c.length; ++i){
    server_log("Council name: ", c[i]["name"], "|", "Council ID:", c[i]["id"])
  }
}

function print_users(u){
  for(var i = 0; i < u.length; ++i){
    server_log(u[i]);
  }
}

function server_log(str){
  console.log(timestamp(), str);
}
