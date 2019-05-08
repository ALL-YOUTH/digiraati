//Class a single user
class User{
  constructor(id, name, pw){
    this.id = id;
    this.username = name;
    this.pw = pw;
    this.online = true;
  }

  get_id(){ return this.id; }

  set_username(uname){ this.username = uname; }
  get_username(){ return this.username; }

  get_online_status(){ return this.online; }
  set_online_status(status) { this.online = status; }

  set_pw(pw){ this.pw = pw; }
  get_pw(){ return this.pw; }
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

  add_user(socket, name, pw){
    //Checks if the username is already taken
    if(this.username_available(name)){
      var new_user = new User(socket, name, pw);
      this.users.push(new_user);
      return 0;
    }
    else{
      return -1;
    }
  }

  get_user(name){
    for(var i = 0; i < this.users.length; ++i){
      if(this.users[i].get_username().toLowerCase() == name.toLowerCase()){
        return this.users[i];
      }
    }
    return null;
  }

  check_pw(name, pw){
    var u = this.get_user(name);
    if(u.get_pw() != pw){
      return false;
    }
    else{
      return true;
    }
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

  get_username_by_id(id){
    for(var i = 0; i < this.users.length; ++i){
      if(this.users[i].get_id() == id){
        return this.users[i].get_username();
      }
    }
    return -1;
  }

  get_online_status_of_username(name){
    return this.get_user(name).get_online_status();
  }

  logout_user(name){
    let user = this.get_user(name);
    user.set_online_status(false);
    //TODO
    //THIS HAS TO BE MODIFIED NO TO DELETE THE USER ON LOGOUT
    for(var i = 0; i < this.users.length; ++i){
      if(name == this.users[i].get_username()){
        this.users.splice(i, 1);
      }
    }
  }
  login_user(name){
    let user = this.get_user(name);
    user.set_online_status(true);
    return user.get_online_status();
  }
}
