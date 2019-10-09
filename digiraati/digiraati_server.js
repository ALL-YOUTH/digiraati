var path = require('path');
var util = require('util');
var SocketIOFile = require('socket.io-file');
var fs = require('fs');
var cors = require('cors');
var server = require('./routes.js');
var app = server["app"];
var io = server["io"];
var http = server["http"];

var port = process.env.PORT || 3000;
var host = "localhost";
var backup_file = path.join(__dirname, "backup.json");

var log_filename = __dirname + '/logs/' + new Date().toISOString().slice(-24).replace(/\D/g,'').slice(0, 14); + ".log";
fs.closeSync(fs.openSync(log_filename, 'w'));
fs.writeFile(log_filename, 'Server started at: ' + timestamp() , function (err) {
  if (err) throw err;
});

var log_file = fs.createWriteStream(log_filename, {flags : 'w'});
var log_stdout = process.stdout;

var Users = require(path.join(__dirname + "/user.js"));
var Councils = require(path.join(__dirname + "/councils.js"));

let users = new Users();
let councils = new Councils();

///////////////////////
//Add a couple of test users for test purposes
///////////////////////
/*users.add_user("1111", "test", "F_test", "L_test", "L_test@test.com", "test");
users.add_user("2222", "test2", "F_test", "L_test", "L_test@test.com", "test");
users.add_user("3333", "test3", "F_test", "L_test", "L_test@test.com", "test");
*/

///////////////////////
//Add a couple of councils for test purposes
/*councils.add_council("AAAA", "Raati, jolla on todella pitkä nimi, että nähdään kuinka otsikko asettuu laatikkoon.", "Hehe", "test", "12.12.2012", "11:00", "13.12.2013", "12:00", "General");
councils.add_council("BBBB", "Raatimaa", "Hehe", "test", "12.12.2012", "11:00", "13.12.2013", "12:00", "General");
councils.add_council("CCCC", "ALL-YOUTH", "Hehe", "test", "12.12.2012", "11:00", "13.12.2013", "12:00", "General");
*/
///////////////////////


//Recover digiraati from backupfile
fs.readFile(backup_file, function (err, data) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return;
  }
  data = JSON.parse(data);
  var recover_users = data["users"];
  var recover_councils = data["councils"];
  for(var i = 0; i < recover_users.length; ++i){
    let user = recover_users[i];
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

  for(var i = 0; i <  recover_councils.length; ++i){
    let council = recover_councils[i];
    try{
      councils.add_council( id=council["id"],
                            name=council["name"],
                            description=council["description"],
                            creator=council["creator"],
                            starttime=council["starttime"],
                            endtime=council["endtime"],
                            userlimit=council["userlimit"],
                            tags=council["tags"],
                            files=council["files"]);
      for(let message of council["messages"]){
        councils.add_message(council["id"], message["sender"], message["content"]);
      }
      for(let file of council["files"]){
        councils.add_file(file["id"], file["path"], council["id"], file["sender"]);
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

MESSAGES2PRINT = 50;

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
    if(users.get_user(data["username"]) != null){ //Username already in use
      socket.emit("invalid username");
      return;
    }
    else if(users.get_user_by_email(data["email"]) != null){ // email already in use
      socket.emit("invalid email");
      return;
    }
    ret_val = users.add_user(id=data["id"], uname=data["username"],
                              fname=data["firstname"], lname=data["lastname"],
                              email=data["email"], pw=data["password1"]);
    if(ret_val != -1){
      socket.emit('register success', data["username"]);
      server_log(ip + ": " + data["username"] + " registered succesfully");
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
    var sender_name = msg["sender"];
    var userid = users.get_userid_by_username(sender_name);
    councils.add_message(msg["council"], userid, msg["message"]);
    send_msg = sender_name + ": " + msg["message"];
    server_log(ip + ": " + sender_name + " : " + msg["council"]
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
    server_log(ip + ": requested file: " + fid);
    fs.readFile(path.join(__dirname, "/files/", fid), function(err, buff){
      if(err){
        server_log(ip + ": " + " could not send file: " + fid);
      }
      socket.emit('file data', {data:buff, binary:true});
    });
  });

  socket.on('request add comment', function(cid, comment){
    server_log(ip + ": " + "attempting to add a comment: " + comment["text"] + " to a council " + cid);
    var res = councils.add_comment_to_council(cid, comment);
    if(res != -1){
      socket.emit("comment add success");
    }
    else{
      socket.emit("comment add failed");
    }
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
    for(var i = 0; i < _councils.length; ++i){
      let c = _councils[i];
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
  log_file.write(util.format(str) + '\n');
  log_stdout.write(util.format(str) + '\n');
}
