
class Message{
  constructor(sender, content){
    this.sender = sender;
    this.content = text;
    this.likes = 0;
  }
  get_sender(){ return this.sender; }
  get_content(){ return this.content; }
  get_likes(){ return this.likes; }
}

//Class for one chat room
class Room{
  constructor(name, description){
    this.name = name;
    this.messages = [];

  }
  add_council(){

  }
}

//Class container for all chat rooms
module.exports = class Rooms{
  constructor(){
    this.rooms = [];
  }

  add_council(name, description){

  }

  add_message(room_id, sender, message_text){

  }
}
