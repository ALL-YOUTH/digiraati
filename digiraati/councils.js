
class Message{
  constructor(sender, text, likes){
    this.sender = sender;
    this.content = text;
    this.likes = likes;
  }
  get_sender(){ return this.senderid; }
  get_content(){ return this.content; }
  get_likes(){ return this.likes; }
}

class Comment{
  constructor(id, sender, text, time, likes, dislikes, parentid, childid){
    this.id = id;
    this.sender = sender;
    this.text = text;
    this.time = time;
    this.likes = likes;
    this.dislikes = dislikes;
    this.parentid = parentid;
    this.childid = childid;
  }
  get_id(){ return this.id; }
  get_sender(){ return this.sender; }
  get_content(){ return this.text; }
  get_likes(){ return this.likes; }
  get_dislikes(){ return this.dislikes; }
  get_time(){ return this.time; }
  get_child_comment_id(){ return this.childid; }
  get_parent_comment_id(){ return this.parentid; }
}

class File{
  constructor(id, path, sender){
    this.id = id;
    this.path = path;
    this.sender = sender;
  }
  get_id(){return this.id;}
  get_path(){return this.path;}
  get_sender(){return this.sender;}
}

//Class for one chat room
class Council{
  constructor(id, name, description, creator, startdate, starttime,
              enddate, endtime, userlimit=-1, tags, likes, dislikes){
    this.id = id;
    this.name = name;
    this.description = description;
    this.creator = creator;
    this.startdate = startdate;
    this.starttime = starttime;
    this.enddate = enddate;
    this.endtime = endtime;
    this.tags = tags;
    this.userlimit = userlimit;

    this.users = [];
    this.messages = [];
    this.files = [];
    this.comments = [];
    this.likes = likes;
    this.dislikes = dislikes;
  }

  get_council_name(){ return this.name; }
  get_council_id(){ return this.id; }
  get_council_description(){ return this.description; }
  get_council_messages(){ return this.messages; }
  get_council_creator(){ return this.creator; }
  get_council_startdate(){ return this.startdate; }
  get_council_starttime(){ return this.starttime; }
  get_council_enddate(){ return this.enddate; }
  get_council_endtime(){ return this.endtime; }
  get_council_tags(){ return this.tags; }
  get_council_userlimit(){ return this.userlimit; }
  get_council_users(){ return this.users; }
  get_council_files(){ return this.files; }

  add_participant(uid){
    var result = false;
    if(this.userlimit == -1){
      this.users.push(uid);
      result = true;
    }
    else if (this.userlimit > this.users.length) {
      this.users.push(uid);
      result = true;
    }

    return result;
  }

  add_file(file){
    this.files.push(file);
  }

  add_msg(msg){
    this.messages.push(msg);
  }

  add_comment(comment){
    this.comments.push(comment)
  }

  get_n_messages(n){
    var ret = [];
    if(n >= this.messages.length){
      for(var i = 0; i < this.messages.length; ++i){
        ret.push({"sender":this.messages[i].get_sender(), "text":this.messages[i].get_content()})
      }
    }
    else{
      for(var i = this.messages.length - n; i < this.messages.length; ++i){
        ret.push({"sender":this.messages[i].get_sender(), "text":this.messages[i].get_content()})
      }
    }
    return ret;
  }
}

//Class container for all chat rooms
module.exports = class Councils{
  constructor(){
    this.councils = [];
  }

  add_council(id, name, description, creator, startdate,
              starttime, enddate, endtime, userlimit=-1, tags){
    let new_council = new Council(id=id, name=name,
      description=description, creator=creator,
      startdate=startdate, starttime=starttime, enddate=enddate,
      endtime=endtime, userlimit=userlimit, tags=tags);
    this.councils.push(new_council);
  }

  //Gets coucils id and title
  //If there are no councils, returns -1
  get_councils(){
    if(this.councils.length == 0){ return -1; }
    return this.councils;
  }

  get_council_by_id(id){
    let coucils = this.get_councils();
    for(var i = 0; i < this.councils.length; ++i){
      let council = this.councils[i];
      if(council.get_council_id() == id){
        return council;
      }
    }
    return -1;
  }

  add_message(council_id, sender, message_text){
    var council = this.get_council_by_id(council_id);
    if(council == -1){
      return;
    }
    var new_message = new Message(sender, message_text, 0);
    council.add_msg(new_message);
  }

  add_file(fileid, filename, council_id, uploader){
    var council = this.get_council_by_id(council_id);
    if(council == -1){
      console.log("Unable to find council with id", council_id);
      return;
    }
    var file = new File(fileid, filename, uploader);
    council.add_file(file);
  }

  add_comment_to_council(cid, c){
    try{
      var council = this.get_council_by_id(cid);
      var comment = new Comment(makeid(8), c["sender"], c["text"], c["time"],
                                c["likes"], c["dislikes"], c["parent"], null);
      var res = council.add_comment(comment);
    }
    catch(err){
      console.log(err);
      return -1;
    }
    return 0;
  }

  is_user_joined(councilid, userid){
    let c = this.get_council_by_id(councilid);
    if(c == -1){return false;}
    let users = c.get_council_users();
    for(var i = 0; i < users.length; ++i){
      if(users[i] == userid){
        return true;
      }
    }
    return false;
  }

  get_previous_messages_from_council(council_id, number_of){
    try{
      var council = this.get_council_by_id(council_id);
      return council.get_n_messages(number_of);
    }
    catch(err){

    }
  }

  get_council_data(id){
    let council = this.get_council_by_id(id);
    var council_data = {};
    if(council == -1){ return null; }
    return council;
  }

  sign_user_in_council(cid, uid){
    let council = this.get_council_by_id(cid);
    //First check if user is already a member of the council
    let users = council.get_council_users();
    for(var i = 0; i < users.length; ++i){
      if(uid == users[i]){
        return false;
      }
    }
    //add the participant
    var res = council.add_participant(uid);
    return res;
  }

  resign_user_from_council(cid, uid){
    let council = this.get_council_by_id(cid);
    let users = council.get_council_users();
    for(var i = 0; i < users.length; ++i){
      if(uid == users[i]){
        users.splice(i, 1);
        return true;
      }
    }
  }

  get_council_members(cid){
    if(cid == undefined){return;}
    let council = this.get_council_by_id(cid);
    let users = council.get_council_users();
    return users;
  }

}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
