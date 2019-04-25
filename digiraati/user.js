//Class a single user
class User{
  constructor(id, name, pw){
    this.id = id;
    this.username = name;
    this.pw = pw;
  }

  set_username(uname){ this.username = uname; }
  get_username(){ return this.username; }

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
    for(i = 0; i < this.users.length; ++i){
      if(this.users[i].get_username().toLowerCase() == name.toLowerCase()){
        return this.users[i];
      }
    }
    return null;
  }

  check_pw(name, pw){
    var u = get_user(name);
    if(u.get_pw() != pw){
      return false;
    }
    else{
      return true;
    }
  }
}
