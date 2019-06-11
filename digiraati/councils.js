
class Message{
  constructor(sender, text){
    this.sender = sender;
    this.content = text;
    this.likes = 0;
  }
  get_sender(){ return this.sender; }
  get_content(){ return this.content; }
  get_likes(){ return this.likes; }
}

//Class for one chat room
class Council{
  constructor(id, name, description, creator){
    this.id = id;
    this.name = name;
    this.description = description;
    this.creator = creator;
    this.messages = [];
    this.start_datetime = "";
    this.end_datetime = "";
  }

  get_council_name(){ return this.name; }
  get_council_id(){ return this.id; }
  get_council_description(){ return this.description; }
  get_council_messages(){ return this.messages; }
  get_council_creator(){ return this.creator; }


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
}

//Class container for all chat rooms
module.exports = class Councils{
  constructor(){
    this.councils = [];
  }

  add_council(id, name, description, creator){
    let new_council = new Council(id, name, description, creator);
    this.councils.push(new_council);
  }

  //Gets coucils id and title
  //If there are no councils, returns -1
  get_councils(){
    if(this.councils.length == 0){ return -1; }
    var all_councils = [];
    for(var i = 0; i < this.councils.length; ++i){
      var council = {};
      council["id"] = this.councils[i].get_council_id();
      council["name"] = this.councils[i].get_council_name();
      all_councils.push(council);
    }
    return all_councils;
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
    var new_message = new Message(sender, message_text);
    council.add_msg(new_message);
  }

  get_previous_messages_from_council(council_id, number_of){
    var council = this.get_council_by_id(council_id);
    return council.get_n_messages(number_of);

  }

  get_council_data(id){
    var council = this.get_council_id(id);
    var council_data = {};
    if(council == -1){ return null; }
    else{
      council_data["title"] = council.get_council_name();
      council_data["description"] = council.get_council_description();
      council_data["creator"] = council.get_council_creator();
      council_data["starttime"] = council.get_council_starttime();
      council_data["endtime"] = council.get_council_endtime();
    }

    return council_data;
  }
}
