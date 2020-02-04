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
  constructor(id, uname, fname, lname, email, h, location, description, picture, testing_number = 999){
    this.id = id;
    this.testing_number = testing_number;
    this.username = uname;
    this.fname = fname;
    this.lname = lname;
    this.email = email;
    this.picture = picture;
    this.description = description;
    this.location = location;
    if(typeof h === 'string'){this.hash = hash(h); }
    else{this.hash = h; }
    this.online = false;
    this.ip = null;
  }

  get_id(){ return this.id; }

  set_fname(fname){ this.fname = fname; }
  get_fname(){ return this.fname; }

  set_lname(lname){ this.lname = lname; }
  get_lname(){ return this.lname; }

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

  set_location(loc){ this.location = loc; }
  get_location(){ return this.location; }

  set_description(d){ this.description = d; }
  get_description(){ return this.description; }

  set_picture(pic){ this.picture = pic; }
  get_picture(){ return this.picture; }

  set_testing_number(number) { this.testing_number = number; }
  get_testing_number() { return this.testing_number; }
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

  add_user(id, uname, fname, lname, email, pw, hash, testing_number){
    //Checks if the username is already taken
    if(this.username_available(uname)){
      if(hash != null){pw = null;}
      var new_user = new User(id, uname, fname, lname, email, pw=pw, hash=hash, "", "", "", testing_number);
      this.users.push(new_user);
      return 0;
    }
    else{
      return -1;
    }
  }

  recover_user(id, uname, fname, lname, email, hash, loc, des, pic, testing_number){
    //Checks if the username is already taken
    if(this.username_available(uname)){
      var new_user = new User(id, uname, fname, lname, email, hash, loc, des, pic, testing_number);
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
    return this.users;
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

  update_user_info(name, data){
    let user = this.get_user(name);
    user.set_fname(data["fname"]);
    user.set_lname(data["lname"]);
    user.set_description(data["description"]);
    user.set_location(data["location"]);
    user.set_user_email(data["email"]);
  }

  update_user_pw(name, data){
    let user = this.get_user(name);
    user.set_hash(data["pw1"]);
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
    let user = this.get_user(name);
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
