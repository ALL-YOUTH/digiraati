
class Like{
  constructor(id, liker){
    this.id = id;
    this.liker = liker;
  }
  get_liker(){ return this.liker; }
}

class Dislike{
  constructor(id, liker){
    this.id = id;
    this.disliker = liker;
  }
  get_disliker(){ return this.disliker; }
}

class Goodarg{
  costructor(id, liker){
    this.id = id;
    this.goodarger = liker;
  }
  get_goodarger() { return this.goodarger; }
}

class Message{
  constructor(id, sender, timestamp, text, likes, dislikes, goodargs){
    this.id = id;
    this.sender = sender;
    this.timestamp = timestamp;
    this.content = text;
    this.likes = likes;
    this.dislikes = dislikes;
    this.goodargs = goodargs;
  }
  get_id(){ return this.id; }
  get_sender(){ return this.senderid; }
  get_timestamp() { return this.timestamp;}
  get_content(){ return this.content; }
  get_likes(){ return this.likes; }
  get_dislikes() { return this.dislikes; }
  get_goodargs() { return this.goodargs; }
  set_content(text) {this.content = text;}

  toggle_like(id, liker){
    for(var i = 0; i < this.likes.length; ++i){
      //If user already likes this message, the like is removed
      let like = this.likes[i];
      if(liker == like.get_liker()){
        this.likes.splice(i, 1);
        return this.likes.length;
      }
    }
    //If user has not liked this message, add a new like
    var like = new Like(id, liker);
    this.likes.push(like);
    return this.likes.length;
  }

  
toggle_dislike(id, liker){
  for(var i = 0; i < this.dislikes.length; ++i){
    //If user already likes this message, the like is removed
    let like = this.dislikes[i];
    if(liker == like.get_disliker()){
      this.dislikes.splice(i, 1);
      return this.dislikes.length;
    }
  }
  //If user has not liked this message, add a new like
  var like = new Dislike(id, liker);
  this.dislikes.push(like);
  return this.dislikes.length;
  }


  toggle_goodarg(id, liker){
    for(var i = 0; i < this.goodargs.length; ++i){
      //If user already likes this message, the like is removed
      let like = this.goodargs[i];
      if(liker == like.get_goodarger()){
        this.goodargs.splice(i, 1);
        return this.goodargs.length;
      }
    }
    //If user has not liked this message, add a new like
    var like = new Goodarg(id, liker);
    this.goodargs.push(like);
    return this.goodargs.length;
  }
}


class Comment{
  constructor(id, sender, text, time, dimentions){
    this.id = id;
    this.sender = sender;
    this.text = text;
    this.time = time;
    this.dimentions = dimentions;
    this.likes = 0;
    this.dislikes = 0;
    this.responses = [];
  }
  get_id(){ return this.id; }
  get_sender(){ return this.sender; }
  get_content(){ return this.text; }
  get_likes(){ return this.likes; }
  get_dislikes(){ return this.dislikes; }
  get_time(){ return this.time; }
  get_responses(){ return this.responses }

  add_reponse(res){ this.responses.push(res); }
}

class File{
  constructor(id, path, sender, comments){
    this.id = id;
    this.path = path;
    this.sender = sender;
    this.comments = comments;
  }
  get_id(){return this.id;}
  get_path(){return this.path;}
  get_sender(){return this.sender;}
  get_comments(){return this.comments;}

  add_comment(comment){
    return this.comments.push(comment);
  }
}

//Class for one chat room
class Council{
  constructor(id, name, description, creator, startdate, starttime,
              enddate, endtime, userlimit, tags, likes, dislikes, conclusion){
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
    this.likes = likes;
    this.dislikes = dislikes;

    this.files = [];
    this.users = [];
    this.messages = [];

    this.conclusion = conclusion;
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

  remove_participant(uid){
    var result = false;
    var index = this.users.indexOf(uid);
    if(index > -1){
      this.users.splice(index, 1);
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

  add_conclusion(text){
    this.conclusion = text;
  }

  get_conclusion(){
    return this.conclusion;
  }

  get_file_by_id(id){
    var file = -1;
    for(var i = 0; i < this.files.length; ++i){
      if(this.files[i].get_id() == id){
        file = this.files[i];
        break;
      }
    }
    return file;
  }

  add_response_to_comment(data){
    let file = this.get_file_by_id(data["file"]);
    data["rid"] = makeid();
    if(file == -1){
      return file;
    }
    let comments = file.get_comments();
    for(var i = 0; i < comments.length; ++i){
      if(comments[i]["id"] == data["id"]){
        var response = new Comment(data["id"], data["sender"],
                                  data["text"], data["time"]);
        comments[i]["responses"].push(response);
        return 0;
      }
    }
  }
  get_comment_data(data){
    let file = this.get_file_by_id(data["file"]);
    if(file == -1){
      return file;
    }
    let comments = file.get_comments();
    for(var i = 0; i < comments.length; ++i){
      if(comments[i]["id"] == data["id"]){
        return comments[i];
      }
    }
  }
}

//Class container for all chat rooms
module.exports = class Councils{
  constructor(){
    this.councils = [];
  }

  add_council(id, name, description, creator, startdate, starttime, enddate,
              endtime, userlimit, tags, likes, dislikes, conclusion){
    let new_council = new Council(id, name,
                                  description, creator,
                                  startdate, starttime, enddate,
                                  endtime, userlimit, tags, likes,
                                  dislikes, conclusion);
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

  add_message(council_id, mid, sender, timestamp, message_text, likes, dislikes, goodargs){
    var council = this.get_council_by_id(council_id);
    if(council == -1){
      return;
    }
    var l = [];
    if(likes.length > 0){
      for(var i = 0; i < likes.length; ++i){
        var like = new Like(likes[i]["id"], likes[i]["liker"]);
        l.push(like);
      }
    }

    var d = [];
    if(dislikes.length > 0){
      for(var i = 0; i < dislikes.length; ++i){
        var like = new Dislike(dislikes[i]["id"], dislikes[i]["disliker"]);
        d.push(like);
      }
    }

    var g = [];
    if(goodargs.length > 0){
      for(var i = 0; i < goodargs.length; ++i){
        var like = new Goodarg(goodargs[i]["id"], goodargs[i]["goodarger"]);
        g.push(like);
      }
    }
    var new_message = new Message(mid, sender, timestamp, message_text, l, d, g);
    council.add_msg(new_message);
  }

  add_file(fileid, filename, council_id, uploader, comments=[]){
    var council = this.get_council_by_id(council_id);
    if(council == -1){
      return;
    }
    var file = new File(fileid, filename, uploader, comments);
    council.add_file(file);
  }

  add_comment_to_file(data){
    try{
      var council = this.get_council_by_id(data["council"]);
      var files = council.get_council_files();
      var file = null;
      for(var i = 0; i < files.length; ++i){
        if(files[i]["id"] == data["file"]){
          file = files[i];
        }
      }
      if(file == null){
        return -1;
      }
      var comment = new Comment(data["id"], data["sender"], data["text"], data["timestamp"],
                                data["dimentions"]);
      var res = file.add_comment(comment);
    }
    catch(err){
      console.log(err);
      return -1;
    }
    return 0;
  }

  get_file_comments(cid, fid){
    var council = this.get_council_by_id(cid);
    var files = council.get_council_files();
    var file = null;
    for(var i = 0; i < files.length; ++i){
      if(files[i]["id"] == fid){
        return files[i].get_comments();
      }
    }
    return -1;
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
    return this.get_council_by_id(id);
  }

  get_council_members(cid){
    if(cid == undefined){return;}
    let council = this.get_council_by_id(cid);
    let users = council.get_council_users();
    return users;
  }

  get_council_conclusion(cid){
    let council = this.get_council_by_id(cid);
    return council.get_conclusion();
  }

  add_counclusion_to_council(cid, text){
    let council = this.get_council_by_id(cid);
    council.add_conclusion(text);
  }

  add_response_to_comment(data){
    let council = this.get_council_by_id(data["council"]);
    let res = council.add_response_to_comment(data);
    return res;
  }

  get_comment_data(data){
    let council = this.get_council_by_id(data["council"]);
    let res = council.get_comment_data(data);
    return res;
  }

  add_like_to_message(cid, mid, uid){
    let council = this.get_council_by_id(cid);
    var messages = council.get_council_messages();
    for(var i = 0; i < messages.length; ++i){
      if(messages[i].get_id() == mid){
        var id = makeid();
        return messages[i].toggle_like(id, uid);
      }
    }
  }

  add_dislike_to_message(cid, mid, uid){
    let council = this.get_council_by_id(cid);
    var messages = council.get_council_messages();
    for(var i = 0; i < messages.length; ++i){
      if(messages[i].get_id() == mid){
        var id = makeid();
        return messages[i].toggle_dislike(id, uid);
      }
    }
  }

  delete_message(cid, mid){
    let council = this.get_council_by_id(cid);
    var messages = council.get_council_messages();
    for(var i = 0; i < messages.length; ++i)
    {
      if(messages[i].get_id() == mid){
        messages[i].set_content("Käyttäjä on poistanut tämän viestin.");
      }
    }
  }

  add_goodarg_to_message(cid, mid, uid){
    let council = this.get_council_by_id(cid);
    var messages = council.get_council_messages();
    for(var i = 0; i < messages.length; ++i){
      if(messages[i].get_id() == mid){
        var id = makeid();
        return messages[i].toggle_goodarg(id, uid);
      }
    }
  }

  add_user_to_council(data){
    let council = this.get_council_by_id(data["council"]);
    var res = council.add_participant(data["user"]);
    return res;
  }

  remove_user_from_council(data){
    let council = this.get_council_by_id(data["council"]);
    var res = council.remove_participant(data["user"]);
    return res;
  }

}

function makeid() {
  id = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while(id.length < 12){
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
