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
/*councils.add_council(id="AAAA", name="Raati, jolla on todella pitkä nimi, että nähdään kuinka otsikko asettuu laatikkoon.", description="Hehe", creator="test", startdate="12.12.2012", starttime="11:00", enddate="13.12.2013", endtime="12:00", userlimit=-1, tags=["General", "Ympäristö", "Ilmasto", "Nuoret"], likes=15, dislikes=8, userlimit=-1);
councils.add_council(id="BBBB", name="All-Youth", description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sagittis velit massa, nec faucibus orci venenatis quis. Nulla venenatis scelerisque semper. Aliquam dictum posuere dignissim. Etiam pulvinar vulputate leo, at aliquet ipsum gravida sit amet. Sed varius, elit non placerat eleifend, lectus tellus vestibulum metus, eu euismod magna nibh vitae nisi. Aenean hendrerit turpis metus, id interdum massa dignissim eget. Etiam sed est in massa dictum auctor vel in enim. Maecenas vel consequat lorem. Duis gravida nisi eget augue maximus auctor. Nulla sem neque, ultrices sit amet sollicitudin vel, facilisis in massa. Quisque eu fermentum magna, a auctor lorem. Aliquam non tincidunt nibh. Integer tincidunt velit quis dictum viverra. Proin ligula dui, accumsan sit amet pretium ut, pharetra blandit nunc. Suspendisse ut gravida sapien. In pharetra efficitur porta. Cras in felis a ex dictum ullamcorper ac sed neque. Praesent fermentum commodo arcu at cursus. Suspendisse euismod aliquet urna. Sed sed eleifend sem. Phalus tortor magna, iaculis eget nunc et, congue ornare augue. Donec rutrum enim sit amet libero ullamcorper, in maximus enim suscipit. Donec metus magna, ultricies vel tristique ut, accumsan luctus mi. Suspendisse ut feugiat lorem. Proin sollicitudin ante mi, sed imperdiet nunc egestas ut. Phasellus mollis feugiat erat, non sagittis mauris varius eu. Phasellus tempor, risus at fermentum tempus, velit risus aliquam arcu, sed convallis nisl dui sed lorem.Etiam arcu nibh, hendrerit non mattis in, fringilla et turpis. Etiam at ante non risus venenatis posuere. Mauris convallis ligula efficitur arcu vehicula, a tincidunt massa lacinia. Pellentesque finibus fringilla neque, at eleifend neque laoreet tincidunt. Maecenas cursus ex eget velit ultricies ornare. Praesent tellus lectus, efficitur eget nibh volutpat, aliquet blandit magna. Phasellus nec sem efficitur risus laoreet mollis. Cras non libero in justo aliquam vestibulum. Vivamus neque dui, rhoncus a ex vitae, euismod maximus lacus. Quisque rhoncus accumsan aliquet.Nullam molestie mattis leo ac faucibus. Donec vel egestas risus, tincidunt pretium dui. Ut in est quis sapien varius consectetur. Quisque ornare libero at augue facilisis placerat. Maecenas eget tristique risus. Duis tortor nibh, egestas sit amet quam scelerisque, dignissim sollicitudin turpis. Maecenas diam turpis, molestie maximus turpis sed, laoreet fermentum magna. Nunc urna mauris, fringilla quis vehicula at, ornare nec nibh. Quisque maximus nibh et augue tristique faucibus. Aliquam nec metus libero.Sed gravida eros sed metus varius hendrerit. Maecenas rutrum vestibulum augue, vitae fermentum lacus laoreet id. Maecenas accumsan libero quis condimentum fermentum. Vivamus feugiat ultrices volutpat. Fusce dapibus dictum metus, ut placerat magna condimentum a. Maecenas ex dolor, fringilla eu tincidunt at, congue quis nulla. Aliquam consectetur nunc ut metus varius, sit amet finibus purus elementum. Praesent faucibus id diam eu dapibus. Morbi porttitor tellus urna, in ultrices lorem sodales id. Maecenas laoreet metus quis mauris dictum suscipit. Phasellus sit amet porttitor nisi, nec rhoncus arcu. Fusce iaculis, enim vel efficitur sagittis, sapien purus fermentum nisl, ut pretium purus ante vitae ipsum. Nulla nec odio porttitor ligula vulputate luctus. Donec elementum eleifend lacus, quis feugiat purus luctus et. Donec eleifend mattis lorem vitae fermentum. Vestibulum condimentum venenatis risus, ut posuere tellus congue in. In vel tortor nec leo eleifend pretium ut eget nisi. Fusce id ultrices leo, in feugiat ipsum. Duis lobortis velit ac ultricies rhoncus. Aliquam eu eros a velit gravida scelerisque id at nisl. Cras ultricies, metus a porta laoreet, ante nunc fringilla arcu, vitae ultricies tellus libero eget lacus. Fusce lobortis nibh lectus, vitae gravida purus ornare id. Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris ultricies, ipsum eu auctor molestie, neque enim tincidunt libero, a euismod sapien quam in lectus. Ut vulputate vel est ut ultrices. Mauris aliquet blandit turpis nec faucibus. Donec posuere, urna id semper tempor, sapien felis pretium est, quis vestibulum tellus lorem sit amet mauris.", creator="test", startdate="12.12.2012", starttime="11:00", enddate="13.12.2013", endtime="12:00", files=[], tags=["General", "Ympäristö", "Ilmasto", "Nuoret"], likes=30, dislikes=0, userlimit=-1);
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
                      email=user["email"], hash=user["hash"],
                      online="false", ip=null);
    }
    catch(err){
      server_log(err);
    }
  }

  for(var i = 0; i <  recover_councils.length; ++i){
    let council = recover_councils[i];
    councils.add_council( id=council["id"],
                          name=council["name"],
                          description=council["description"],
                          creator=council["creator"],
                          startdate=council["startdate"],
                          starttime=council["starttime"],
                          enddate=council["enddate"],
                          endtime=council["endtime"],
                          userlimit=council["userlimit"],
                          tags=council["tags"],
                          likes=council["likes"],
                          dislikes=council["dislikes"]
                        );
    for(let message of council["messages"]){
      councils.add_message(council["id"], message["id"], message["sender"], message["content"], message["likes"]);
    }
    for(let file of council["files"]){
      councils.add_file(file["id"], file["path"], council["id"], file["sender"], file["comments"]);
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
  
  socket.on('request join council', function(cid){
    socket.join(cid);
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

  socket.on('request council create', function(info){
    server_log(ip + ": " + info["creator"] + " attempted to create council: " +
                info["name"]);
    ret_val = councils.add_council( id=info["id"],
                                    name=info["name"],
                                    description=info["description"],
                                    creator=info["creator"],
                                    startdate=info["startdate"],
                                    starttime=info["starttime"],
                                    enddate=info["enddate"],
                                    endtime=info["endtime"],
                                    userlimit=info["userlimit"],
                                    tags=info["keywords"],
                                    likes=0,
                                    dislikes=0);

    if(ret_val == -1){
      return;
    }
    update_page();
  });

  socket.on('request councils update', function(){
    update_page();
  });

  //SENDING A MESSAGE PART
  socket.on('request new message', function(msg){
    var userid = users.get_userid_by_username(msg["sender"]);
    councils.add_message(msg["council"], msg["id"], msg["sender"], msg["content"]);
    io.to(msg["council"]).emit('new message', msg);
  });

  socket.on('request add like', function(data){
    console.log(data);
    var likes = councils.add_like_to_message(data["council"], data["mid"]);
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

  socket.on('request add comment', function(data){
    server_log(ip + ": " + "attempting to add a comment: " + data["id"] + " to a council " + data["council"]);
    var res = councils.add_comment_to_file(data);
    if(res != -1){
      socket.emit("comment add success", data);
    }
    else{
      socket.emit("comment add failed");
    }
  });

  socket.on('request file comments', function(cid, fid){
    var comments = councils.get_file_comments(cid, fid);
    if(comments == -1){
      socket.emit('no file comments');
      return;
    }
    socket.emit('file comments', comments);
  });

  ///File upload stuff
  //Todo tähän pitää keksiä vielä vähän sääntöjä että kuka voi lisäämistä
  //tiedostoja ja samannimiset tiedostot yms....
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
