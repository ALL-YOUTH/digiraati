var path = require('path');
var util = require('util');
var SocketIOFile = require('socket.io-file');
var fs = require('fs');
var cors = require('cors');
var crypto = require('crypto');

var server = require('./routes.js');  //All the urls defined
var app = server["app"];
var io = server["io"];
var http = server["http"];
var user_tokens = [];

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
var Logger = require(path.join(__dirname + "/datalog.js"));
var Conclusions = require(path.join(__dirname + "/conclusioner.js"));

//Create objects for user and council
let users = new Users();
let councils = new Councils();
let logger = new Logger();
let conclusioner = new Conclusions();
setInterval(ClearExpiredSessions, 1000 * 60 * 60 * 12);

// Add temporary questionnaire for testing purposes
//let temp_data = {"council_id": "HW3kprXx14FW", "questions": ["What is tasty?", "Are cats or dogs better?", "I think we'd better get at least one long question in here as well to see just how well the data is formatted if the question is longer. I am tired of these jokes about my giant hand. The first such incident occured in 1956 when..."]};
//conclusioner.add_questionnaire(temp_data["council_id"], temp_data["questions"]);

//Recover digiraati from backupfile
fs.readFile(backup_file, function (err, data) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return;
  }
  data = JSON.parse(data);
  var recover_users = data["users"];
  var recover_councils = data["councils"];
  var recover_concs = data["conclusions"];
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
                          user["picture"],
                          user["testing_id"]);
    }
    catch(err){
      server_log(err);
    }
  }

  for(var i = 0; i <  recover_councils.length; ++i){
    let council = recover_councils[i];
    var council_password = council["password"] || "";
    console.log("Luin salasanan " + council_password);
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
                          council["conclusion"],
                          council_password
                        );
    for(let message of council["messages"]){
      councils.add_message(council["id"], message["id"], message["sender"], message["timestamp"], message["content"], message["likes"], message["dislikes"], message["goodargs"], message["parent"]);
    }
    for(let file of council["files"]){
      councils.add_file(file["id"], file["path"], council["id"], file["sender"], file["comments"]);
    }
    for(let user of council["users"]){
      //socket.join(data["user"]);
      var data = {};
      data["user"] = user;
      data["council"] = council["id"];
      councils.recover_user_to_council(data);
    }
    
  }

  try{
    console.log("concs: " + recover_concs.length);
    conclusioner.recover_backup_data(recover_concs);
  }

  catch(err)
  {
    console.log("Error: " + err);
  }

});

function ClearExpiredSessions()
{
  console.log("Clearing expired sessions");
  for (var i = 0; i < user_tokens.length; ++i)
  {
    if (user_tokens[i].expiry_time < new Date())
    {
      user_tokens.splice(i, 1);
    }
  }
}

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

  //login check request. Checks the login according to the IP parsed from a socket
  socket.on('check login', function(token){
    var name = false;
    for (var i = 0; i < user_tokens.length; ++i)
    {
      if (user_tokens[i].token == token)
      {
        name = user_tokens[i].name;
        console.log("Name found and set.");
      }
    }
    if(name == false){
      console.log("Emitting false");
      socket.emit('not logged');
    }
    else{
      console.log("Checked login for " + token + " and it's " + name);
      var uid = users.get_userid_by_username(name);
      socket.emit('login success', name, token);
      update_page();
    }
  });

  //login check request. Checks the login according to the IP parsed from a socket
  //Like 'check login' ,but modified for council check
  socket.on('check login council', function(token, cid){
    var name = false;
    for (var i = 0; i < user_tokens.length; ++i)
    {
      if (user_tokens[i].token == token)
      {
        name = user_tokens[i].name;
      }
    }
    if(name == false){
      console.log("You're not logged in");
      socket.emit('not logged');
    }
    else{
      var uid = users.get_userid_by_username(name);
      socket.emit('login success', name, token);
      socket.join(cid);
      update_page();
    }
  });

  //Request for a socket to join a room. Rooms are defined with council ID
  socket.on('request socket list', function(cid){
    socket.join(cid);
  });

  socket.on('request join council', function(data){
    //&socket.join(data["user"]);
    var res = councils.add_user_to_council(data);
    if(res == -1){
      socket.emit('password incorrect');
    }
    else{
      if(res)
      {
        socket.emit('join success');
        logger.AppendLog("e03", users.get_userid_by_username(data["user"]), new Date().getTime(), data["council"]);
        create_backup();
      }
      else{
        socket.emit('join failed');
      }
    }
  });

  //Request to leave a council
  socket.on('request leave council', function(data){
    socket.join(data["user"]);
    var res = councils.remove_user_from_council(data);
    if(res){
      logger.AppendLog("e04", users.get_userid_by_username(data["user"]), new Date().getTime(), data["council"]);
      socket.emit('leave success');
    }
    else{
      socket.emit('leave failed');
    }
  });

  //User tries to log in.
  socket.on('login attempt', function(name, pw){
    if(users.login_user(name, pw, ip) == false){
      socket.emit('invalid login');
      server_log(ip + ": Failed to login");
      return;
    }
    else{
      var uid = users.get_userid_by_username(name);
      var user_token = crypto.randomBytes(20).toString('hex');
      var expiry_time = new Date();
      expiry_time.setHours(expiry_time.getHours() + 12);
      console.log("Registering new user token pair: " + user_token + ", " + uid);
      user_tokens.push({'token': user_token, 'name': name, 'expiry_time': expiry_time});
      socket.emit('login success', name, user_token);
      logger.AppendLog("e01", uid, new Date().getTime());
      server_log(ip + ": " + uid + " (" + name + ") logged in");
      update_page();
      return;
    }
  });

  //User tries to register a new account.
  //Checks the availability of username and email.
  //TODO: password strength check(?)
  socket.on('register attempt', function(data){
    if(users.get_user(data["username"]) != null){ //Username already in use
      socket.emit("invalid username");
      return;
    }
    else if(users.get_user_by_email(data["email"]) != null){ // email already in use
      socket.emit("invalid email");
      return;
    }
    console.log("Registering user " + data["testing_id"]);
    ret_val = users.add_user(data["id"], data["username"], data["testing_id"],
                              data["firstname"], data["lastname"],
                              data["email"], data["password1"]);
    if(ret_val != -1){
      socket.emit('register success', data["username"]);
      logger.AppendLog("e12", data["id"], new Date().getTime());
      server_log(ip + ": " + data["username"] + " registered succesfully");
      create_backup();
    }
    else{
      socket.emit('invalid nickname');
    }
    update_page();
  });

  socket.on('request avatar change', function(data){
    console.log("changing avatar");
    var user_id = users.get_userid_by_username(data["username"]);
    users.get_user(data["username"]).set_picture("/res/" + data["avatar"] + ".png");
    logger.AppendLog("e82", data["username"], new Date().getTime(), data["avatar"]);
    socket.emit('avatar change complete');
    create_backup();
  });

  socket.on('request save conclusion answers', function(data){
    console.log("received conclusion save request");
    var user_id = users.get_userid_by_username(data["username"]);
    conclusioner.add_conclusion(user_id, data["council_id"], data["answers"]);
    create_backup();
    socket.emit('conclusion answers updated');
  });

  //Request to create a new council.
  //TODO: this should also check the user type. Official user should always be able
  //to create a council and those councils should stand out from the normal user
  //created councils.
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
                                    "",
                                    info["password"]);

    if(ret_val == -1){
      return;
    }
    update_page();
    socket.emit("council create succeess");
    logger.AppendLog("e13", users.get_userid_by_username(info["creator"]), new Date().getTime(), info["id"]);
    create_backup();
  });

  socket.on('request councils update', function(){
    update_page();
  });

  socket.on('request message edit', function(msg){
    console.log("Received edit request.");
    if (councils.edit_message(msg["council"], msg["msg_id"], msg["content"]) == true)
    {
        logger.AppendLog("e07", users.get_userid_by_username(msg["user_id"]), new Date().getTime(), msg["msg_id"]);
        create_backup();
        socket.emit('reload_chat_lobby');
    }
  });

  //SENDING A MESSAGE PART
  //Request to send a message to a council
  socket.on('request new message', function(msg){
    var userid = users.get_userid_by_username(msg["sender"]);
    if (msg["parent"] != undefined && msg["parent"] != "") { var parent = (msg["parent"]); }
    else { var parent = ""; }
    msg["likes"] = [];
    msg["dislikes"] = [];
    msg["goodargs"] = [];
    councils.add_message( msg["council"],
                          msg["id"],
                          msg["sender"],
                          msg["timestamp"],
                          msg["content"],
                          msg["likes"],
                          msg["dislikes"],
                          msg["goodargs"],
                          parent);

    io.to(msg["council"]).emit('new message', msg);
    if (parent == "") { logger.AppendLog("e05", users.get_userid_by_username(msg["sender"]), new Date().getTime(), msg["id"]); }
    else {logger.AppendLog("e06", users.get_userid_by_username(msg["sender"]), new Date().getTime(), parent);}
    
    create_backup();
  });

  //Request to add a like to a message. If user has already liked this message,
  //the like will be removed.
  socket.on('request add like', function(data){
    var uid = users.get_userid_by_username(data["liker"]);
    var likes = councils.add_like_to_message(data["council"], data["mid"], uid);
    logger.AppendLog("e09", uid, new Date().getTime(), data["mid"]);
    io.to(data["council"]).emit('update likes', data["mid"], likes);
  });

    //Request to add a dislike to a message. If user has already liked this message,
  //the like will be removed.
  socket.on('request add dislike', function(data){
    var uid = users.get_userid_by_username(data["liker"]);
    var dislikes = councils.add_dislike_to_message(data["council"], data["mid"], uid);
    logger.AppendLog("e10", uid, new Date().getTime(), data["mid"]);
    io.to(data["council"]).emit('update dislikes', data["mid"], dislikes);
  });

    //Request to add a good argument to a message. If user has already liked this message,
  //the like will be removed.
  socket.on('request add goodarg', function(data){
    var uid = users.get_userid_by_username(data["liker"]);
    var goodargs = councils.add_goodarg_to_message(data["council"], data["mid"], uid);
    logger.AppendLog("e11", uid, new Date().getTime(), data["mid"]);
    io.to(data["council"]).emit('update goodargs', data["mid"], goodargs);
  });

  //User logged out of the chat
  socket.on('logout attempt', function(token){
    logger.AppendLog("exx", token, new Date().getTime());
    var name = ""
    for (var i = 0; i < user_tokens.length; ++i)
    {
      if (user_tokens[i].token == token)
      {
        name = user_tokens[i].name;
        user_tokens.splice(i, 1);
      }
    }
    users.logout_user(name);
    server_log(ip + ": " + name + " logged out");
    logger.AppendLog("e02", users.get_userid_by_username(name), new Date().getTime());
    socket.emit('logout success');
    update_page();
    logged_in = "";
  });

  //request to get previous messages.
  //TODO: This is kind of a relic here. This data is fetchable with
  //'request council data'.
  socket.on('get prev messages', function(c){
    msgs = councils.get_previous_messages_from_council(c, MESSAGES2PRINT);
    if(msgs == undefined){return 0;}
    for(var i = 0; i < msgs.length; ++i){
      socket.emit('chat message', c, msgs[i]["sender"] + ": " + msgs[i]["text"]);
    }
  });

  //
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

  socket.on('request userid by username', function(username){
    console.log("Trying to find " + username);
    var returnable =  users.get_userid_by_username(username);
    socket.emit("userid request response", returnable);
  });

  //request to get the comments
  socket.on('comment refresh request', function(page){
    if(check_page_comments(page) == 0){
      comments[page] = [];
    }
    io.emit('refresh comments', comments[page]);
  });

  //request to fetch all data of a council
  socket.on('request council data', function(id){
    council_data = councils.get_council_data(id);
    if(council_data != -1){
      console.log(council_data);
      socket.emit('council data', council_data);
    }
    else{
      socket.emit('invalid council id');
    }
  });

  //check if user is 1. logged in and 2. joined the council.
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

  //request to get members of a council
  socket.on('request council members', function(councilid){
    var members = councils.get_council_members(councilid);
    socket.emit('council members', members);
  });

  //request to get the files of a council
  socket.on('update files request', function(cid){
    var files = councils.get_council_data(cid);
    try{
      socket.emit("update files", files["files"]);
    }
    catch(err){
      console.log("no files in this council", err);
    }
  });

  //request to get single files content
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

  //request to add a comment to a file
  socket.on('request add comment', function(data){
    server_log(ip + ": " + "attempting to add a comment: " + data["id"] + " to a council " + data["council"]);
    var res = councils.add_comment_to_file(data);
    if(res != -1){
      socket.emit("comment add success", data);
      logger.AppendLog("e15", users.get_userid_by_username(data["sender"]), new Date().getTime(), data["file"]);
      create_backup();
    }
    else{
      socket.emit("comment add failed");
    }
  });

  socket.on('request delete message', function(data){
    server_log(ip + ": " + "attempting to delete message: " + data["mid"] + " in council " + data["council"]);
    councils.delete_message(data["council"], data["mid"]);
    logger.AppendLog("e08", users.get_userid_by_username(data["user_id"]), new Date().getTime(), data["mid"]);
    io.to(data["council"]).emit('delete message', data["mid"]);
  })

  //request to add a response to a comment
  socket.on('request add response', function(data){
    server_log(ip + ": attempting to add response to comment: " + data["id"]);
    logger.AppendLog("e16", users.get_userid_by_username(data["sender"]), new Date().getTime(), data["id"]);
    councils.add_response_to_comment(data);
    var res = councils.get_comment_data(data);
    socket.emit('comment data', res);
  });

  //request to fetch comment data
  socket.on("request comment data", function(data){
    var res = councils.get_comment_data(data);
    socket.emit('comment data', res);
  });

  //request to fetch files comments
  socket.on('request file comments', function(cid, fid){
    var comments = councils.get_file_comments(cid, fid);
    if(comments == -1){
      socket.emit('no file comments');
      return;
    }
    socket.emit('file comments', comments);
  });

  //request to fetch user data
  socket.on('request user data', function(token){
    console.log("Received " + token);
    var name = "";
    for (var i = 0; i < user_tokens.length; ++i)
    {
      if (user_tokens[i].token == token)
      {
        name = user_tokens[i].name;
      }
    }
    console.log("Getting user data for " + name);
    var userdata = users.get_user(name);
    socket.emit('user data', userdata);
  });

  //request to make changes in user data
  socket.on('request update info', function(token, data){
    var name = "";
    
    for (var i = 0; i < user_tokens.length; ++i)
    {
      if (user_tokens[i].token == token)
      {
        name = user_tokens[i].name;
      }
    }
    var errors = users.update_user_info(name, data);
    if(!errors){
      socket.emit('info update success');
      create_backup();
    }
    else{
      socket.emit('info update failed', errors);
    }
  });

  //request to change users password
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

  //request to fetch latest conclusion data
  socket.on('request conclusion refresh', function(cid){
    var res = councils.get_council_conclusion(cid);
    socket.emit('update conclusion');
  });

  //request to save changed conclusion
  socket.on('request conclusion update', function(data){
    councils.add_counclusion_to_council(data["council"], data["text"]);
    var res = councils.get_council_conclusion(data["council"]);
    create_backup();
    socket.emit('update conclusion');
  });

  socket.on('request logged in answers', function(){
    var returnable = conclusioner.get_answers_by_user_id(users.get_userid_by_username(logged_in))
    socket.emit("logged in answers response", returnable);
  });

  socket.on('request add questionnaire', function(data){
    conclusioner.add_questionnaire(data["council_id"], data["questions"]);
  });

  socket.on('request questionnaire', function(data){
    var returnable = {};
    returnable["questionnaire"] = conclusioner.get_questionnaire_by_council(data["council_id"]);
    returnable["answers"] = conclusioner.get_answers_by_user_id(data["council_id"], data["user_id"]);
    returnable["all_answers"] = conclusioner.get_all_answers(data["council_id"]);
    socket.emit("questionnaire request response", returnable);
  });

  socket.on('request add conclusion answers', function(data){
    conclusioner.add_conclusion(data["user_id"], data["council_id"], data["answers"]);
    logger.AppendLog("e20", data['user_id'], new Date().getTime(), data["council_id"]);
  });

  socket.on('request answers by userid', function(data){
    var returnable = conclusioner.get_answers_by_user_id(data["user_id"]);
    socket.emit("userid answers response", returnable);
  });

  socket.on('request answers by index', function(data){
    var returnable = conclusioner.get_answers_by_index(data["council_id"], data["index"]);
      socket.emit("index answers request", returnable);
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

    logger.AppendLog("e14", users.get_userid_by_username(fileInfo["data"]["uploader"]), new Date().getTime(), fileInfo["data"]["id"]);

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
    backup_data["conclusions"] = conclusioner.get_all_data();
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

//OBSOLETE
//requet to add a comment
/*socket.on('add comment', function(page, comment, ref_text){
  if(check_page_comments(page) == 0){
    comments[page] = [];
  }
  comments[page].push([comment, ref_text]);
  io.emit('refresh comments', comments[page]);
});*/
