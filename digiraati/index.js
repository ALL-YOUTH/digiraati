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
var EventHandler = require(path.join(__dirname + "/eventhandler.js"));

//Create objects for user and council
let users = new Users();
let councils = new Councils();
let logger = new Logger();
let conclusioner = new Conclusions();
let eventhandler = new EventHandler(councils.get_councils(), users.get_all_users());
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
                          user["testing_number"]);
    }
    catch(err){
      server_log(err);
    }
  } 

  for(var i = 0; i <  recover_councils.length; ++i){
    let council = recover_councils[i];
    var council_password = council["password"] || "";
    var council_header = council["header_image"] || "default.png";
    councils.add_council( council["id"],
                          council["name"],
                          council["description"],
                          council["creator"],
                          council["startdate"],
                          council["starttime"],
                          council["enddate"],
                          council["endtime"],
                          council["chat_open_date"],
                          council["chat_open_time"],
                          council["chat_close_date"],
                          council["chat_close_time"],
                          council["conclusion_due_date"],
                          council["conclusion_due_time"],
                          council["feedback_due_date"],
                          council["feedback_due_time"],
                          council["userlimit"],
                          council["tags"],
                          council["likes"],
                          council["dislikes"],
                          council["conclusion"],
                          council_password,
                          council_header
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

  if(data["bases"] != undefined)
  {
      for(let base of data["bases"])
      {
        councils.add_base(base);
      }
  }

  eventhandler.recover_from_backup(councils.get_councils(), users.get_all_users(), data["events"]);
  
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
  origin: 'http://localhost:80',
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
    uploadDir: {
      images: 'council_images',
      files: 'files'},
    rename: function(fileName, fileInfo){
        var file = path.parse(fileName);
        var fname = file.name;
        var ext = file.ext;
        console.log("Renaming to " + fileInfo["data"]["id"] + ext);
        return `${fileInfo["data"]["id"]}${ext}`;
    },			// simple directory
    maxFileSize: 4194304, 	// 4 MB.
    chunkSize: 10240,				// default is 10240(1KB)
    transmissionDelay: 0,		// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
    overwrite: true	// overwrite file if exists, default is true.
  });

  //login check request. Checks the login according to the IP parsed from a socket
  socket.on('check login', function(token, callback){
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
      callback("not_logged");
    }
    else{
      console.log("Checked login for " + token + " and it's " + name);
      var uid = users.get_userid_by_username(name);
      callback([name, token]);
      update_page();
    }
  });

  socket.on("submit updated council data", function(data, callback){
    console.log("Received council updated data")
    if(councils.update_council_information(data) == true)
    {
      create_backup();
      callback("success");
    }

    else {callback("failed");}
  });

  socket.on("submit updated user data", function(data, callback){
    console.log("Received user updated data");
    if (users.update_user_information(data) == true)
    {
      create_backup();
      callback('success');
    }

    else { callback('failed')};
  });

  socket.on('request full data', function(callback){ // For the administrative panel. Returns all council data, user data and conclusion data.
    var user_data = users.get_all_users();
    var council_data = councils.get_councils();
    var conclusion_data = conclusioner.get_all_data();

    callback(council_data, user_data, conclusion_data);
  });

  //login check request. Checks the login according to currently in-use user token and council_id
  //Like 'check login' ,but modified for council check
  socket.on('check login council', function(token, cid, callback){
    console.log("!!!!! CHECKING COUNCIL LOGIN !!!");
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
      callback("not_logged");
    }
    else{
      var uid = users.get_userid_by_username(name);
      callback("success");
      socket.join(cid);
      update_page();
    }
  });

  //Request for a socket to join a room. Rooms are defined with council ID
  socket.on('request socket list', function(cid){
    socket.join(cid);
  });

  socket.on('request join council', function(data, callback){
    console.log("Someone's joining a council");
    socket.emit("blatant test");
    var res = councils.add_user_to_council(data);
    if(res == -1){
      console.log("incorrect password");
      callback({"result": "password_error"});
    }
    else{
      if(res)
      {
        console.log("and it succeeded");
        callback({"result": "success"});
        logger.AppendLog("e03", users.get_userid_by_username(data["user"]), new Date().getTime(), data["council"]);
        create_backup();
      }
      else{
        socket.emit('join failed');
      }
    }
  });

  //Request to leave a council
  socket.on('request leave council', function(data, callback){
    socket.join(data["user"]);
    var res = councils.remove_user_from_council(data);
    if(res){
      logger.AppendLog("e04", users.get_userid_by_username(data["user"]), new Date().getTime(), data["council"]);
      socket.emit('leave success', callback({"result": "success"}));
    }
    else{
      socket.emit('leave failed', callback({"result": "failure"}));
    }
  });

  //User tries to log in.
  socket.on('login attempt', function(name, pw, callback){
    if(users.login_user(name, pw, ip) == false){
      callback("login failure");
      server_log(ip + ": Failed to login");
      return;
    }
    else{

      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(name)) { 
        console.log("Tried to log in with email");
        var uid = users.get_user_by_email(name)["id"];
        name = users.get_user_by_email(name)["username"];}
      else { var uid = users.get_userid_by_username(name); }
      var user_token = crypto.randomBytes(20).toString('hex');
      var expiry_time = new Date();
      expiry_time.setHours(expiry_time.getHours() + 12);
      console.log("Registering new user token pair: " + user_token + ", " + uid);
      user_tokens.push({'token': user_token, 'name': name, 'expiry_time': expiry_time});
      callback([name, user_token]);
      logger.AppendLog("e01", uid, new Date().getTime());
      server_log(ip + ": " + uid + " (" + name + ") logged in");
      update_page();
      return;
    }
  });

  //User tries to register a new account.
  //Checks the availability of username and email.
  //TODO: password strength check(?)
  socket.on('register attempt', function(data, callback){
    if(users.get_user(data["username"]) != null){ //Username already in use
      callback('invalid_username');
      return;
    }
    else if(users.get_user_by_email(data["email"]) != null){ // email already in use
      callback('invalid_email');
      return;
    }
    console.log("Registering user " + data["testing_id"] + " " + data["id]"]);
    ret_val = users.add_user(data["id"], data["username"], data["testing_id"],
                              data["firstname"], data["lastname"],
                              data["email"], data["password1"]);
    if(ret_val != -1){
      callback('success');
      logger.AppendLog("e12", data["id"], new Date().getTime());
      server_log(ip + ": " + data["username"] + " registered succesfully");
      create_backup(); 
    }
    else{
      callback("unknown error");
    }
    update_page();
  });

  socket.on('request avatar change', function(data, callback){
    console.log("changing avatar");
    var user_id = users.get_userid_by_username(data["username"]);
    users.get_user(data["username"]).set_picture("/res/" + data["avatar"] + ".png");
    logger.AppendLog("e82", data["username"], new Date().getTime(), data["avatar"]);
    callback("success");
    create_backup();
  });

  socket.on('request save conclusion answers', function(data, callback){
    console.log("received conclusion save request");
    console.log(data);
    var user_id = users.get_userid_by_username(data["username"]);
    conclusioner.add_conclusion(user_id, data["council_id"], data["answers"]);
    create_backup();
    callback("success");
  });

  socket.on('request all bases', function(callback){
    console.log("List of all council bases requested");
    let returnable = councils.get_bases();
    callback(returnable);
  });

  socket.on('request add new base', function(data){
    console.log("adding new base")
    councils.add_base(data["description"], data["content"]);
    create_backup();
  });

  //Request to create a new council.
  //TODO: this should also check the user type. Official user should always be able
  //to create a council and those councils should stand out from the normal user
  //created councils.
  socket.on('request council create', function(info, callback){
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
                                    info["discussion_open_date"],
                                    info["discussion_open_time"],
                                    info["discussion_close_date"],
                                    info["discussion_close_time"],
                                    info["conclusion_due_date"],
                                    info["conclusion_due_time"],
                                    info["feedback_due_date"],
                                    info["feedback_due_time"],
                                    info["userlimit"],
                                    info["keywords"],
                                    0,
                                    0,
                                    "",
                                    info["password"],
                                    info["header_image"]);

    if(ret_val == -1){
      return;
    }

    if (info["conclusion_questions"].length > 0)
    {
      console.log("Adding conclusion questions");
      conclusioner.add_questionnaire(info["id"], info["conclusion_questions"]);
    }

    if (info["conclusion_base"].length > 0)
    {
      console.log("Adding conclusion base");
      councils.add_conclusion_to_council(info["id"], info["conclusion_base"]);
    }

    if (info["notifications"].length > 0)
    {
      let eventInfo = {};
      eventInfo["council_id"] = info["id"];
      eventInfo["council_name"] = info["name"];
      eventInfo["notifications"] = info["notifications"];
      console.log("Pushing event: " + eventInfo);
      eventhandler.register_council(eventInfo);
    }

    logger.AppendLog("e13", users.get_userid_by_username(info["creator"]), new Date().getTime(), info["id"]);
    create_backup();
    callback("success");
  });

  socket.on('request councils update', function(callback){
    update_page();
    let all_councils = councils.get_councils();
    callback(all_councils);
  });

  socket.on('request message edit', function(msg, callback){
    if (councils.edit_message(msg["council"], msg["msg_id"], msg["content"]) == true)
    {
        logger.AppendLog("e07", users.get_userid_by_username(msg["user_id"]), new Date().getTime(), msg["msg_id"]);
        create_backup();
        callback("success");
    }
    else { callback("failure"); }
  });

  //SENDING A MESSAGE PART
  //Request to send a message to a council
  socket.on('request new message', function(msg, callback){
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

    callback(msg);
    //io.to(msg["council"]).emit('new message', msg);
    if (parent == "") { logger.AppendLog("e05", users.get_userid_by_username(msg["sender"]), new Date().getTime(), msg["id"]); }
    else {logger.AppendLog("e06", users.get_userid_by_username(msg["sender"]), new Date().getTime(), parent);}
    
    create_backup();
  });

  //Request to add a like to a message. If user has already liked this message,
  //the like will be removed.
  socket.on('request add like', function(data, callback){
    console.log("Requested add like")
    var uid = users.get_userid_by_username(data["liker"]);
    var likes = councils.add_like_to_message(data["council"], data["mid"], uid);
    logger.AppendLog("e09", uid, new Date().getTime(), data["mid"]);
    io.to(data["council"]).emit('update likes', data["mid"], likes);
    callback(data["mid"], likes);
  });

    //Request to add a dislike to a message. If user has already liked this message,
  //the like will be removed.
  socket.on('request add dislike', function(data, callback){
    console.log("Requested add dislike")
    var uid = users.get_userid_by_username(data["liker"]);
    var dislikes = councils.add_dislike_to_message(data["council"], data["mid"], uid);
    logger.AppendLog("e10", uid, new Date().getTime(), data["mid"]);
    io.to(data["council"]).emit('update dislikes', data["mid"], dislikes);
    callback(data["mid"], dislikes);
  });

    //Request to add a good argument to a message. If user has already liked this message,
  //the like will be removed.
  socket.on('request add goodarg', function(data, callback){
    console.log("Requested add goodarg")
    var uid = users.get_userid_by_username(data["liker"]);
    var goodargs = councils.add_goodarg_to_message(data["council"], data["mid"], uid);
    logger.AppendLog("e11", uid, new Date().getTime(), data["mid"]);
    io.to(data["council"]).emit('update goodargs', data["mid"], goodargs);
    callback(data["mid"], goodargs);
  });

  //User logged out of the chat
  socket.on('logout attempt', function(token, callback){
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
    callback("success");
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

  socket.on('request userid by username', function(username, callback){
    console.log("Trying to find " + username);
    var returnable =  users.get_userid_by_username(username);
    callback(returnable);
  });

  //request to get the comments
  socket.on('comment refresh request', function(page){
    if(check_page_comments(page) == 0){
      comments[page] = [];
    }
    io.emit('refresh comments', comments[page]);
  });

  //request to fetch all data of a council
  socket.on('request council data', function(id, callback){
    council_data = councils.get_council_data(id);
    if(council_data != -1){
      console.log("Returning council data");
      callback(council_data);
    }
    else{
      console.log("Fetched invalid council data");
      callback('error');
    }
  });

  socket.on('check create password', function(password, callback){
    if (password == "porkkana5")
    {
      callback(true);
    }
    else{
      callback(false);
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
  socket.on('update files request', function(cid, callback){
    var files = councils.get_council_data(cid);
    try{
      callback(files["files"]);
    }
    catch(err){
      console.log("no files in this council", err);
      callback([]);
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
  socket.on('request add comment', function(data, callback){
    server_log(ip + ": " + "attempting to add a comment: " + data["id"] + " to a council " + data["council"]);
    var res = councils.add_comment_to_file(data);
    if(res != -1){
      callback(data);
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

  socket.on('request delete file', function(data){
    councils.delete_file(data["council"], data["file_id"]);
  });
  
  socket.on('request council delete', function(data, callback){
    server_log(data["submitter"] + " is deleting council " + data["council_id"]);
    if(councils.delete_council(data["council_id"]) == true)
    {
      create_backup();
      callback('success');
    }

    else{ callback('failed')}
  });

  //request to add a response to a comment
  socket.on('request add response', function(data){
    server_log(ip + ": attempting to add response to comment: " + data["id"]);
    logger.AppendLog("e16", users.get_userid_by_username(data["sender"]), new Date().getTime(), data["id"]);
    councils.add_response_to_comment(data);
    var res = councils.get_comment_data(data);
    socket.emit('comment data', res);
  });

  //request to fetch comment data
  socket.on("request comment data", function(data, callback){
    var res = councils.get_comment_data(data);
    callback(res);
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
  socket.on('request user data', function(token, callback){
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
    callback(userdata);
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
  socket.on('request conclusion refresh', function(cid, callback){
    var res = councils.get_council_conclusion(cid);
    callback(res);
  });

  //request to save changed conclusion
  socket.on('request conclusion update', function(data, callback){
    councils.add_conclusion_to_council(data["council"], data["text"]);
    create_backup();
    callback("success");
  });

  socket.on('request logged in answers', function(){
    var returnable = conclusioner.get_answers_by_user_id(users.get_userid_by_username(logged_in))
    socket.emit("logged in answers response", returnable);
  });

  socket.on('request add questionnaire', function(data){
    conclusioner.add_questionnaire(data["council_id"], data["questions"]);
  });

  socket.on('request questionnaire', function(data, callback){ // Palauttaa halutun käyttäjän loppukyselyn vastaukset halutulle raadille. Kutsutaan luokasta lobby_conclusion.js
    var returnable = {};
    returnable["questionnaire"] = conclusioner.get_questionnaire_by_council(data["council_id"]);
    returnable["answers"] = conclusioner.get_answers_by_user_id(data["council_id"], data["user_id"]);
    returnable["all_answers"] = conclusioner.get_all_answers(data["council_id"]);
    callback(returnable);
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
    server_log(ip + ": " + " started to upload a file: " + fileInfo["data"]["filename"] + " of type " + fileInfo["uploadTo"]);
  });

  uploader.on('stream', (fileInfo) => {
    //server_log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
  });

  uploader.on('complete', (fileInfo) => {
    server_log(ip + ": " + " file upload done");
    console.log(fileInfo);
    if (fileInfo["uploadDir"].includes("files"))
    {
    console.log("Adding file to councils")
    if (councils.add_file(fileInfo["data"]["id"],
                      fileInfo["data"]["filename"],
                      fileInfo["data"]["council"],
                      fileInfo["data"]["uploader"],
                      []) == -1)
                      {console.log("Council does not exist. Attempted file info: " + fileInfo)};
    }

    logger.AppendLog("e14", users.get_userid_by_username(fileInfo["data"]["uploader"]), new Date().getTime(), fileInfo["data"]["id"]);
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
    backup_data["events"] = eventhandler.dump_event_data();
    backup_data["bases"] = councils.get_bases();
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
