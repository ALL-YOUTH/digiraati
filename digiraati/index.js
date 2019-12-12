var path = require('path');
var util = require('util');
var SocketIOFile = require('socket.io-file');
var fs = require('fs');
var cors = require('cors');

var server = require('./routes.js');
var app = server["app"];
var io = server["io"];
var http = server["http"];

//Define the port
var port = process.env.PORT || 3000;

//Define the backup file
var backup_file = path.join(__dirname, "backup.json");

//Define the logfile
var log_filename = __dirname + '/logs/' + new Date().toISOString().slice(-24).replace(/\D/g,'').slice(0, 14); + ".log";
fs.closeSync(fs.openSync(log_filename, 'w'));
fs.writeFile(log_filename, 'Server started at: ' + timestamp() , function (err) {
  if (err) throw err;
});

var log_file = fs.createWriteStream(log_filename, {flags : 'w'});
var log_stdout = process.stdout;

//import users.js and councils.js modules
var Users = require(path.join(__dirname + "/user.js"));
var Councils = require(path.join(__dirname + "/councils.js"));

//Create objects for user and council
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
  for(var i = 0; i < recover_users.length; ++i){
    let user = recover_users[i];
    try{
      users.recover_user( user["id"],
                          user["username"],
                          user["fname"],
                          user["lname"],
                          user["email"],
                          user["hash"],
                          user["location"],
                          user["description"],
                          user["picture"]);
    }
    catch(err){
      server_log(err);
    }
  }

  for(var i = 0; i <  recover_councils.length; ++i){
    let council = recover_councils[i];
    councils.add_council( council["id"],
                          council["name"],
                          council["description"],
                          council["creator"],
                          council["startdate"],
                          council["starttime"],
                          council["enddate"],
                          council["endtime"],
                          council["userlimit"],
                          council["tags"],
                          council["likes"],
                          council["dislikes"],
                          council["conclusion"]
                        );
    for(let message of council["messages"]){
      councils.add_message(council["id"], message["id"], message["sender"], message["content"], message["likes"]);
    }
    for(let file of council["files"]){
      councils.add_file(file["id"], file["path"], council["id"], file["sender"], file["comments"]);
    }
    for(let user of council["users"]){
      //socket.join(data["user"]);
      var data = {};
      data["user"] = user;
      data["council"] = council["id"];
      councils.add_user_to_council(data);
    }
  }

});

//Start listening to the server:port
http.listen(port);

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//Backup interval
setInterval(function () {
  create_backup();
}, 1 * 60 * 1000); // 1 min

app.use(cors(corsOptions));

//===================================================================
//===================================================================
//===================================================================
//===================================================================
//===================================================================
//===================================================================


//Connection
io.on('connection', function(socket){

  //ip variable is parsed from the incoming socket
  var ip = socket.request.connection.remoteAddress;

  //uploader for file transfers
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
      var uid = users.get_userid_by_username(name);
      socket.emit('login success', name);
      update_page();
    }
  });

  socket.on('check login council', function(cid){
    var name = users.get_login_by_ip(ip);
    if(name == false){
      socket.emit('not logged');
    }
    else{
      var uid = users.get_userid_by_username(name);
      socket.emit('login success', name);
      socket.join(cid);
      update_page();
    }
  });

  socket.on('request socket list', function(cid){
    socket.join(cid);
  });

  socket.on('request join council', function(data){
    //&socket.join(data["user"]);
    var res = councils.add_user_to_council(data);
    if(res){
      socket.emit('join success');
      create_backup();
    }
    else{
      socket.emit('join failed');
    }
  });

  socket.on('request leave council', function(data){
    socket.join(data["user"]);
    var res = councils.remove_user_from_council(data);
    if(res){
      socket.emit('leave success');
    }
    else{
      socket.emit('leave failed');
    }
  });

  socket.on('login attempt', function(name, pw){
    if(users.login_user(name, pw, ip) == false){
      socket.emit('invalid login');
      server_log(ip + ": Failed to login");
      return;
    }
    else{
      var uid = users.get_userid_by_username(name);
      socket.emit('login success', name);
      server_log(ip + ": " + uid + " (" + name + ") logged in");
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
    ret_val = users.add_user(data["id"], data["username"],
                              data["firstname"], data["lastname"],
                              data["email"], data["password1"]);
    if(ret_val != -1){
      socket.emit('register success', data["username"]);
      server_log(ip + ": " + data["username"] + " registered succesfully");
      create_backup();
    }
    else{
      socket.emit('invalid nickname');
    }
    update_page();
  });

  socket.on('request council create', function(info){
    server_log(ip + ": " + info["creator"] + " attempted to create council: " +
                info["name"]);
    ret_val = councils.add_council( info["id"],
                                    info["name"],
                                    info["description"],
                                    info["creator"],
                                    info["startdate"],
                                    info["starttime"],
                                    info["enddate"],
                                    info["endtime"],
                                    info["userlimit"],
                                    info["keywords"],
                                    0,
                                    0,
                                    "");

    if(ret_val == -1){
      return;
    }
    update_page();
    socket.emit("council create succeess");
    create_backup();
  });

  socket.on('request councils update', function(){
    update_page();
  });

  //SENDING A MESSAGE PART
  socket.on('request new message', function(msg){
    var userid = users.get_userid_by_username(msg["sender"]);
    msg["likes"] = [];
    councils.add_message( msg["council"],
                          msg["id"],
                          msg["sender"],
                          msg["content"],
                          msg["likes"]);

    io.to(msg["council"]).emit('new message', msg);
    create_backup();
  });

  socket.on('request add like', function(data){
    var uid = users.get_userid_by_username(data["liker"]);
    var likes = councils.add_like_to_message(data["council"], data["mid"], uid);
    io.to(data["council"]).emit('update likes', data["mid"], likes);
  });

  //User logged out of the chat
  socket.on('logout attempt', function(name){
    users.logout_user(name);
    server_log(ip + ": " + name + " logged out");
    socket.emit('logout success');
    update_page();
    logged_in = "";
  });

  socket.on('get prev messages', function(c){
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
    if(council_data != -1){
      socket.emit('council data', council_data);
    }
    else{
      socket.emit('invalid council id');
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

  socket.on('request council members', function(councilid){
    var members = councils.get_council_members(councilid);
    socket.emit('council members', members);
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
      create_backup();
    });
  });

  socket.on('request add comment', function(data){
    server_log(ip + ": " + "attempting to add a comment: " + data["id"] + " to a council " + data["council"]);
    var res = councils.add_comment_to_file(data);
    if(res != -1){
      socket.emit("comment add success", data);
      create_backup();
    }
    else{
      socket.emit("comment add failed");
    }
  });

  socket.on('request add response', function(data){
    server_log(ip + ": attempting to add response to comment: " + data["id"]);
    councils.add_response_to_comment(data);
    var res = councils.get_comment_data(data);
    socket.emit('comment data', res);
  });

  socket.on("request comment data", function(data){
    var res = councils.get_comment_data(data);
    socket.emit('comment data', res);
  });

  socket.on('request file comments', function(cid, fid){
    var comments = councils.get_file_comments(cid, fid);
    if(comments == -1){
      socket.emit('no file comments');
      return;
    }
    socket.emit('file comments', comments);
  });

  socket.on('request user data', function(){
    var username = users.get_username_by_ip(ip);
    var userdata = users.get_user(username);
    socket.emit('user data', userdata);
  });

  socket.on('request update info', function(data){
    var name = users.get_username_by_ip(ip);
    var errors = users.update_user_info(name, data);
    if(!errors){
      socket.emit('info update success');
      create_backup();
    }
    else{
      socket.emit('info update failed', errors);
    }
  });

  socket.on('request update password', function(data){
    var name = users.get_username_by_ip(ip);
    var errors = users.update_user_pw(name, data);
    if(!errors){
      socket.emit('password update success');
      create_backup();
    }
    else{
      socket.emit('password update failed', errors);
    }
  });

  socket.on('request conclusion refresh', function(cid){
    var res = councils.get_council_conclusion(cid);
    socket.emit('update conclusion');
  });

  socket.on('request conclusion update', function(data){
    councils.add_counclusion_to_council(data["council"], data["text"]);
    var res = councils.get_council_conclusion(data["council"]);
    create_backup();
    socket.emit('update conclusion');
  });

  //////////////////////////////////////////////////////////////////////////////
  ///File upload stuff
  uploader.on('start', (fileInfo) => {
    server_log(ip + ": " + " started to upload a file: " + fileInfo["data"]["filename"]);
  });

  uploader.on('stream', (fileInfo) => {
    //server_log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
  });

  uploader.on('complete', (fileInfo) => {
    server_log(ip + ": " + " file upload done");
    councils.add_file(fileInfo["data"]["id"],
                      fileInfo["data"]["filename"],
                      fileInfo["data"]["council"],
                      fileInfo["data"]["uploader"],
                      []);

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

  /////////////////////////////////////////////////////////////////////////////
});

function update_page(){
  update_councils();
}

function update_councils(){
  var all_councils = councils.get_councils();
  io.emit('councils update', all_councils);
}

//Create a backup
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
    });
  }
  catch(err){
    console.log("Unable to create backup", err);
  }
}

//Create a timestamp
function timestamp(){
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

//Write a server log message
function server_log(str){
  log_file.write(util.format(str) + '\n');
  log_stdout.write(util.format(str) + '\n');
}
