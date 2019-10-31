function hash(p){
  var h;
  for (var i = 0; i < p.length; i++) {
    var char = p.charCodeAt(i);
    h = ((h<<5)-h)+char;
    h = h & h; // Convert to 32bit integer
  }
  return h;
}

//Class a single user
class User{
  constructor(id, uname, fname, lname, email, h){
    this.id = id;
    this.username = uname;
    this.fname = fname;
    this.lname = lname;
    this.email = email;
    if(typeof h === 'string'){this.hash = hash(h); }
    else{this.hash = h; }
    this.online = false;
    this.ip = null;
  }

  get_id(){ return this.id; }

  set_fname(fname){ this.first_name = fname; }
  get_fname(){ return this.first_name; }

  set_lname(lname){ this.last_name = lname; }
  get_lname(){ return this.last_name; }

  set_username(uname){ this.username = uname; }
  get_username(){ return this.username; }

  set_user_email(email){ this.email = email; }
  get_user_email(){ return this.email; }

  get_online_status(){ return this.online; }
  set_online_status(status) { this.online = status; }

  set_hash(pw){ this.hash = hash(pw); }
  get_hash(){ return this.hash; }

  set_ip(ip){ this.ip = ip }
  get_ip(){ return this.ip; }

}

//Class for handling all users
module.exports = class Users{
  constructor(){
    this.users = [];
  }

  username_available(name){
    var u = this.get_user(name);
    if(u != null){
      return false;
    }
    else{
      return true;
    }
  }

  add_user(id, uname, fname, lname, email, pw, hash){
    //Checks if the username is already taken
    if(this.username_available(uname)){
      if(hash != null){pw = null;}
      var new_user = new User(id, uname, fname, lname, email, pw=pw, hash=hash);
      console.log(new_user);
      this.users.push(new_user);
      return 0;
    }
    else{
      return -1;
    }
  }

  recover_user(id, uname, fname, lname, email, hash){
    //Checks if the username is already taken
    if(this.username_available(uname)){
      var new_user = new User(id, uname, fname, lname, email, hash);
      this.users.push(new_user);
      return 0;
    }
    else{
      return -1;
    }
  }

  get_userid_by_username(sender_name){
    for(var i = 0; i < this.users.length; ++i){
      if(this.users[i].get_username() == sender_name){
        return this.users[i].get_id();
      }
    }
    return -1;
  }

  get_all_users(){
    var all_users = [];
    for(var i = 0; i < this.users.length; ++i){
      var u = {};
      u["id"] = this.users[i].get_id();
      u["fname"] = this.users[i].get_fname();
      u["lname"] = this.users[i].get_lname();
      u["username"] = this.users[i].get_username();
      u["email"] = this.users[i].get_user_email();
      u["online"] = this.users[i].get_online_status();
      u["hash"] = this.users[i].get_hash();
      u["ip"] = this.users[i].get_ip();
      all_users.push(u);
    }
    return all_users;
  }

  get_user(name){
    try{
      if(name == ""){
        return null;
      }
      for(var i = 0; i < this.users.length; ++i){
        if(this.users[i].get_username().toLowerCase() == name.toLowerCase()){
          return this.users[i];
        }
      }
      return null;
    }
    catch(err){
      console.log(err);
    }
  }

  get_user_by_email(mail){
    for(var i = 0; i < this.users.length; ++i){
      if(this.users[i].get_user_email().toLowerCase() == mail.toLowerCase()){
        return this.users[i];
      }
    }
    return null;
  }

  get_all_usernames(){
    var all = [];
    for(var i = 0; i < this.users.length; ++i){
      all.push(this.users[i].get_username());
    }
    return all;
  }

  get_logged_in_usernames(){
    var all = [];
    for(var i = 0; i < this.users.length; ++i){
      if(this.users[i].get_online_status()){
        all.push(this.users[i].get_username());
      }
    }
    return all;
  }

  get_username_by_ip(ip){
    for(var i = 0; i < this.users.length; ++i){
      if(this.users[i].get_ip() == ip){
        return this.users[i].get_username();
      }
    }
    return -1;
  }

  get_login_by_ip(ip){
    let username = this.get_username_by_ip(ip);
    if(username == -1){
      return false;
    }
    let user = this.get_user(username);
    if(user == null){
      return false
    }
    let login = user.get_online_status();
    if(login){
      return username;
    }
    else{
      return false;
    }
  }

  get_online_status_of_username(name){
    return this.get_user(name).get_online_status();
  }

  logout_user(name){
    let user = this.get_user(name);
    user.set_online_status(false);
    user.set_ip(null);
  }

  login_user(name, p, ip){
    let user;
    if(this.get_user(name) != null){ //Username login
      user = this.get_user(name);
    }
    else if(this.get_user_by_email(name) != null){ //Username login
      user = this.get_user_by_email(name);
    }
    else{
      return false;   //no user found with this username or email
    }
    if(hash(p) == user.get_hash()){    //password hash check
      user.set_online_status(true);
      user.set_ip(ip);
      return true;
    }
    return false;
  }
}
