var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var last_message_sender = null;
var window_open = false;
var messages = [];
var modal_open = false;
var original_message;

var colors = ["#FE0456", "#CBE781", "#01AFC4", "#FFCE4E"];

$(function(){

  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("check login council", window.sessionStorage.getItem('token'), council);
});

socket.on('council data', function(data){
  $('#left_menu_title').html(data["name"].toUpperCase());
  $('#chat_title').html(data["name"].toUpperCase());
  //$('#chat_description').html(data["description"]);
  $('#chat_hashtag').html("#"+data["name"].toLowerCase().replace(" ", ""));
  var h = document.getElementById('chat_content').offsetHeight +
          document.getElementById('header').offsetHeight;
  $('#chat_container').css("height", h + "px");

  var ml = document.getElementById('message_list');
  ml.innerHTML = "";
  ml.id = "message_list";
  messages = data["messages"];
  var original_messages = data["messages"].filter(element => element["parent"] == "");
  
  for(message of original_messages){
    ParseMessage(message, 1);
  }
});

function ParseMessage(message, level)
{
  if (level == 1)
  {
    create_message(message)
    var replies = messages.filter(element => element["parent"] == message["id"]);

    if (window.screen.width > 1000)
    {
      for (reply of replies)
        {
          ParseMessage(reply, 2);
        }
    }
    
  }
  if (level == 2)
  {
    create_reply(message), level;
    var replies = messages.filter(element => element["parent"] == message["id"]);
    for (reply of replies)
    {
      ParseMessage(reply, 3);
    }
  }
  if (level >= 3)
  {
    create_reply(message, level);
    var replies = messages.filter(element => element["parent"] == message["id"]);
    for (reply of replies)
    {
      ParseMessage(reply, 3);
    }
  }
  
}

socket.on("login success", function(){
  socket.emit("request council data", council);
  socket.emit("request socket list", council);
});

window.onscroll = function(e){
  if ($(window).height() + $(window).scrollTop() > $(document).height() - $("#footer").height()) {
    var h = $(document).height() - $(window).height() - $(window).scrollTop() - $("#footer").height()
    $('#chat_message_container').css("bottom", Math.abs(h)+"px");
  }
  else{
    $('#chat_message_container').css("bottom", "0px");
  }
}

$("#message_input").keypress(function (e) {
  if(e.which == 13 && e.shiftKey){
    e.preventDefault();
    var position = this.selectionEnd;
    this.value = this.value.substring(0, position) + '\n' + this.value.substring(position);
    this.selectionEnd = position+1;
  }
  else if(e.which == 13) {
    e.preventDefault();
    send_message();
  }
});

$('#send_btn').click(function(e){
  e.preventDefault();
  send_message();
});

$(document).on('click', ".reply_number", function(e){
  modal_open = true;
  e.preventDefault();
  console.log("Opening reply panel.");
  open_mobile_reply_panel($(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id'));
});

function removeModalWindow(e)
{
  $(this).parents('.mobile_container').first().remove();
  modal_open = false;
}

$(document).on('click', ".close_mobile_text_entry_panel_btn, .mobile_cancel_button", function(e){
  $('.mobile_text_entry_panel').toggle("slide", {"direction": "right"}, 250, function(){
    $('.mobile_text_entry_panel').remove();
    modal_open = false;
  });
});

$(document).on('click', ".close_mobile_reply_panel_btn", function(e)
{
  $('.reply_panel_container').toggle(250, function()
  {
    $('.reply_panel_container').remove();
    modal_open = false;
  });
});

$(document).on('click', ".close_mobile_reaction_panel_btn", function(e)
{
    $('.reaction_panel_container').toggle("slide", {'direction': 'left'}, 250, function()
    {
      console.log("I just happened")
      $('.reaction_panel_container').remove();
      modal_open = false;
    });
});

$(document).on('click', ".close_mobile_actions_panel_btn", function(e)
{
  $('.action_panel_container').toggle("slide", {'direction': 'right'}, 250, function()
  {
    console.log("I just happened")
    $('.action_panel_container').remove();
    modal_open = false;
  });
});

$(document).on('click', ".mobile_reply_btn", function(e)
{
  console.log("Button pressed");
  $('.action_panel_container').remove();
  var message_id = $(this).parents('.mobile_container').first().attr('id').replace("action_panel", "");
  original_message = messages.filter(element => element.id === message_id)[0];

  var text_entry_panel = document.createElement('div');
  text_entry_panel.classList.add('mobile_text_entry_panel');
  text_entry_panel.classList.add('mobile_container');
  text_entry_panel.id = message_id + "text_panel";
  document.getElementById('modal_container').appendChild(text_entry_panel);
  $('.text_entry_panel').hide();

  var close_btn = document.createElement('div');
  close_btn.classList.add("close_mobile_text_entry_panel_btn");
  close_btn.innerHTML = '<span class="fas fa-times"></span>';
  text_entry_panel.appendChild(close_btn);

  var text_field = document.createElement('textarea');
  text_field.classList.add('mobile_text_field');
  text_field.id = message_id + "textarea";
  text_field.setAttribute('rows', 10);
  text_field.setAttribute('autofocus', true);
  text_entry_panel.appendChild(text_field);

  var button_container = document.createElement('div');
  button_container.classList.add("mobile_button_container");

  var cancel_button = document.createElement('div');
  cancel_button.classList.add('mobile_cancel_button');
  cancel_button.innerHTML = "PERUUTA";
  button_container.appendChild(cancel_button);

  var send_button = document.createElement('div');
  send_button.classList.add('mobile_send_button');
  send_button.innerHTML = "LÄHETÄ";
  button_container.appendChild(send_button);

  text_entry_panel.appendChild(button_container);
  $('.text_entry_panel').show();
});

$(document).on('click', '.mobile_send_button', function(e){
  var message_id = $(this).parents('.mobile_container').first().attr('id').replace("text_panel", "");
  var textbox = document.getElementById(message_id + "textarea");
  console.log("Trying to find " + textbox);
  var msg_time = new Date();
  var msg_timestamp = msg_time.getDate() + "." + (msg_time.getMonth() + 1) + "." + msg_time.getFullYear() + " " + ("0" + msg_time.getHours()).slice(-2) + ":" + ("0" + msg_time.getMinutes()).slice(-2) + ":" + ("0" + msg_time.getSeconds()).slice(-2);
  var msg = {};
  msg["sender"] = logged_in;
  msg["council"] = council;
  msg["content"] = textbox.value;
  msg["timestamp"] = msg_timestamp;
  msg["id"] = makeid();
  msg["parent"] = original_message.id;
  console.log("sending message " + msg);
  socket.emit('request new message', msg);
  modal_open = false;
  window.location.reload();
});

$(document).on('click', '.mobile_save_button', function(e){
  var message_id = $(this).parents('.mobile_container').first().attr('id').replace("text_panel", "");
  var msg = {}
  msg["user_id"] = logged_in;
  msg["council"] = council;
  msg["content"] = document.getElementById(message_id + "textarea").value;
  msg["msg_id"] = original_message.id;
  modal_open = false;
  socket.emit('request message edit', msg);
});

$(document).on('click', ".mobile_edit_btn", function(e)
{
  if ($(this).hasClass('inactive')){
    alert("Et voi muokata tätä viestiä.");
    return;
  }
  else
  {
    console.log("Button pressed");
    $('.action_panel_container').remove();
    var message_id = $(this).parents('.mobile_container').first().attr('id').replace("action_panel", "");
    console.log("looking for " + message_id);
    original_message = messages.filter(element => element.id === message_id)[0];
    console.log("found " + original_message);

    var text_entry_panel = document.createElement('div');
    text_entry_panel.classList.add('mobile_text_entry_panel');
    text_entry_panel.classList.add('mobile_container');
    text_entry_panel.id = message_id + "text_panel";
    document.getElementById('modal_container').appendChild(text_entry_panel);
    $('.text_entry_panel').hide();

    var close_btn = document.createElement('div');
    close_btn.classList.add("close_mobile_text_entry_panel_btn");
    close_btn.innerHTML = '<span class="fas fa-times"></span>';
    text_entry_panel.appendChild(close_btn);

    var text_field = document.createElement('textarea');
    text_field.classList.add('mobile_text_field');
    text_field.id = message_id + "textarea";
    text_field.setAttribute('rows', 10);
    text_field.setAttribute('autofocus', true);
    text_field.defaultValue = document.getElementById(message_id + "text").innerHTML;
    text_entry_panel.appendChild(text_field);

    var button_container = document.createElement('div');
    button_container.classList.add("mobile_button_container");

    var cancel_button = document.createElement('div');
    cancel_button.classList.add('mobile_cancel_button');
    cancel_button.innerHTML = "PERUUTA";
    button_container.appendChild(cancel_button);

    var send_button = document.createElement('div');
    send_button.classList.add('mobile_save_button');
    send_button.innerHTML = "LÄHETÄ";
    button_container.appendChild(send_button);

    text_entry_panel.appendChild(button_container);
    $('.text_entry_panel').show();
  }
});

/*
$(document).on('click', ".mobile_reaction_button", function(e)
{

  if(modal_open == false)
  {
    modal_open = true;

    var message_id = $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id');
    original_message = messages.filter(element => element.id === message_id)[0];

    var reaction_panel_container = document.createElement('div');
    reaction_panel_container.classList.add("reaction_panel_container");
    reaction_panel_container.classList.add('mobile_container');
    reaction_panel_container.id = message_id + "reaction_panel";
    document.getElementById('modal_container').appendChild(reaction_panel_container);
    $('.reaction_panel_container').hide();

    var close_btn = document.createElement('div');
    close_btn.classList.add("close_mobile_reaction_panel_btn");
    close_btn.innerHTML = '<span class="fas fa-times"></span>';
    reaction_panel_container.appendChild(close_btn);

    var thumbs_up_container = document.createElement('div');
    thumbs_up_container.classList.add("mobile_thumb_container");
    var likes_btn = document.createElement('span');
    likes_btn.classList.add("likes_btn");
    var likes_number = document.createElement('span');
    likes_number.classList.add("likes_number");
    likes_number.id = message_id+"likes_number";
    likes_number.innerHTML = original_message.likes.length;

    thumbs_up_container.appendChild(likes_btn); thumbs_up_container.appendChild(likes_number); 

    var thumbs_down_container = document.createElement('div');
    thumbs_down_container.classList.add("mobile_thumb_container");
    var dislikes_btn = document.createElement('span');
    dislikes_btn.classList.add("dislikes_btn");
    var dislikes_number = document.createElement('span');
    dislikes_number.classList.add("dislikes_number");
    dislikes_number.id = message_id+"dislikes_number";
    dislikes_number.innerHTML = original_message.dislikes.length;

    thumbs_down_container.appendChild(dislikes_btn); thumbs_down_container.appendChild(dislikes_number); 

    var goodargs_container = document.createElement('div');
    goodargs_container.classList.add("mobile_thumb_container");
    var goodargs_btn = document.createElement('span');
    goodargs_btn.classList.add("goodargs_btn");
    var goodargs_number = document.createElement('span');
    goodargs_number.classList.add("goodargs_number");
    goodargs_number.id = message_id+"goodargs_number";
    goodargs_number.innerHTML = original_message.goodargs.length;

    goodargs_container.appendChild(goodargs_btn); goodargs_container.appendChild(goodargs_number); 

    reaction_panel_container.appendChild(thumbs_up_container); reaction_panel_container.appendChild(thumbs_down_container); reaction_panel_container.appendChild(goodargs_container);

    $('.reaction_panel_container').toggle("slide", {'direction': 'left'}, 250);
  }

});

$(document).on('click', ".mobile_message_actions", function(e)
{
  if (modal_open == false)
  {
    modal_open = true;

    var message_id = $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id');
    console.log("opening action panel for message " + message_id);
    original_message = messages.filter(element => element.id === message_id)[0];
    console.log("found original message " + original_message.id);

    var action_panel_container = document.createElement('div');
    action_panel_container.classList.add("action_panel_container");
    action_panel_container.classList.add("mobile_container");
    action_panel_container.id = message_id + "action_panel";
    document.getElementById('modal_container').appendChild(action_panel_container);
    $('.action_panel_container').hide();

    var close_btn = document.createElement('div');
    close_btn.classList.add("close_mobile_actions_panel_btn");
    close_btn.innerHTML = '<span class="fas fa-times"></span>';
    action_panel_container.appendChild(close_btn);

    var reply_btn = document.createElement('div');
    reply_btn.classList.add('mobile_reply_btn');
    reply_btn.innerHTML = "VASTAA VIESTIIN";
    action_panel_container.appendChild(reply_btn);

    if (original_message.sender === window.sessionStorage.getItem('logged_in'))
    {
      var edit_btn = document.createElement('div');
      edit_btn.classList.add('mobile_edit_btn');
      edit_btn.innerHTML = "MUOKKAA VIESTIÄ";
      action_panel_container.appendChild(edit_btn);

      var delete_btn = document.createElement('div');
      delete_btn.classList.add('mobile_delete_btn');
      delete_btn.innerHTML = "POISTA VIESTI";
      action_panel_container.appendChild(delete_btn);
    }

    $('.action_panel_container').toggle("slide", {'direction': 'right'}, 250);
  }
  });*/

$(document).on('click', ".mobile_message_actions", function(e)
{
  if (modal_open == false)
  {
    modal_open = true;

    var message_id = $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id');
    console.log("opening action panel for message " + message_id);
    original_message = messages.filter(element => element.id === message_id)[0];
    console.log("found original message " + original_message.id);

    var action_panel_container = document.createElement('div');
    action_panel_container.classList.add("action_panel_container");
    action_panel_container.classList.add("mobile_container");
    action_panel_container.id = message_id + "action_panel";
    document.getElementById('modal_container').appendChild(action_panel_container);
    $('.action_panel_container').hide();

    var close_btn = document.createElement('div');
    close_btn.classList.add("close_mobile_actions_panel_btn");
    close_btn.innerHTML = '<span class="fas fa-times"></span>';
    action_panel_container.appendChild(close_btn);

    var thumbs_up_container = document.createElement('div');
    thumbs_up_container.classList.add("mobile_thumb_container");
    var likes_btn = document.createElement('span');
    likes_btn.classList.add("likes_btn");
    var likes_number = document.createElement('span');
    likes_number.classList.add("likes_number");
    likes_number.id = message_id+"likes_number";
    likes_number.innerHTML = original_message.likes.length;

    thumbs_up_container.appendChild(likes_btn); thumbs_up_container.appendChild(likes_number); 

    var thumbs_down_container = document.createElement('div');
    thumbs_down_container.classList.add("mobile_thumb_container");
    var dislikes_btn = document.createElement('span');
    dislikes_btn.classList.add("dislikes_btn");
    var dislikes_number = document.createElement('span');
    dislikes_number.classList.add("dislikes_number");
    dislikes_number.id = message_id+"dislikes_number";
    dislikes_number.innerHTML = original_message.dislikes.length;

    thumbs_down_container.appendChild(dislikes_btn); thumbs_down_container.appendChild(dislikes_number); 

    var goodargs_container = document.createElement('div');
    goodargs_container.classList.add("mobile_thumb_container");
    var goodargs_btn = document.createElement('span');
    goodargs_btn.classList.add("goodargs_btn");
    var goodargs_number = document.createElement('span');
    goodargs_number.classList.add("goodargs_number");
    goodargs_number.id = message_id+"goodargs_number";
    goodargs_number.innerHTML = original_message.goodargs.length;
    
    goodargs_container.appendChild(goodargs_btn); goodargs_container.appendChild(goodargs_number); 

    
    var container_for_buttons = document.createElement('span');
    container_for_buttons.classList.add("mobile_action_button_container");

    container_for_buttons.appendChild(thumbs_up_container); container_for_buttons.appendChild(thumbs_down_container); container_for_buttons.appendChild(goodargs_container);

    var reply_btn = document.createElement('div');
    reply_btn.classList.add('mobile_reply_btn');
    reply_btn.innerHTML = '<span class="fas fa-reply" title="Vastaa viestiin"></span>'
    container_for_buttons.appendChild(reply_btn);
  
    var edit_btn = document.createElement('div');
    edit_btn.classList.add('mobile_edit_btn');
    edit_btn.innerHTML = '<span class="far fa-edit" title="Muokkaa viestiä"></span>'
    if (original_message.sender != window.sessionStorage.getItem('logged_in')) {edit_btn.classList.add("inactive");}
    container_for_buttons.appendChild(edit_btn);

    var delete_btn = document.createElement('div');
    delete_btn.classList.add('mobile_delete_btn');
    delete_btn.innerHTML = '<span class="far fa-trash-alt" title="Poista viesti"></span>'
    if (original_message.sender != window.sessionStorage.getItem('logged_in')) {delete_btn.classList.add("inactive");}
    container_for_buttons.appendChild(delete_btn);

    action_panel_container.appendChild(container_for_buttons);
  
    $('.action_panel_container').toggle("slide", {'direction': 'right'}, 250);
  }
  });

function open_mobile_reply_panel(msg_id){

  modal_open = true; 

  try{ 
    $(".reply_panel_container").remove();
  }
  catch(err){
    console.log("tried to delete existing panel but it didn't work");
  }

  console.log("reply panel opening for message " + msg_id);
  var reply_panel = document.createElement('div');
  reply_panel.classList.add("reply_panel_container");
  reply_panel.classList.add("mobile_container");

  var sc = document.getElementById('modal_container');
  sc.appendChild(reply_panel);

  $('.reply_panel_container').hide();

  var close_btn = document.createElement('div');
  close_btn.classList.add("close_mobile_reply_panel_btn");
  close_btn.innerHTML = '<span class="fas fa-times"></span>';
  reply_panel.appendChild(close_btn);

  var title_text = document.createElement('div');
  title_text.classList.add("title_text");
  title_text.innerHTML = "Vastaukset viestiin";

  reply_panel.appendChild(title_text);

  var reply_content = document.createElement('div');
  reply_content.classList.add("reply_content");
  reply_content.id = "reply_content";
  reply_panel.appendChild(reply_content);

  var replies_to_process = messages.filter(element => element.parent === msg_id);
  console.log("found " + replies_to_process.length + " messages");

  for (reply of replies_to_process)
  {
    console.log(reply);
    create_message(reply, "reply_content");
  }

  $('.reply_panel_container').toggle(250);
}

function send_message(){
  if(document.getElementById('message_input').value.length < 1){
    return;
  }
  var msg = {};
  if(logged_in == ""){
    alert("Et ole kirjautuneena sisään. Jotta voit lähettää viestin, sinun täytyy olla kirjautunut.");
    return;
  }
  var msg_time = new Date();
  var msg_timestamp = msg_time.getDate() + "." + (msg_time.getMonth() + 1) + "." + msg_time.getFullYear() + " " + ("0" + msg_time.getHours()).slice(-2) + ":" + ("0" + msg_time.getMinutes()).slice(-2) + ":" + ("0" + msg_time.getSeconds()).slice(-2);
  msg["sender"] = logged_in;
  msg["council"] = council;
  msg["content"] = document.getElementById('message_input').value;
  msg["timestamp"] = msg_timestamp;
  msg["id"] = makeid();
  socket.emit('request new message', msg);
  document.getElementById('message_input').value = "";
}

function create_message(msg, msg_target = 'message_list'){
  var nm = document.createElement('div');
  nm.classList.add("chat_message");
  nm.id = msg["id"];
  if (!msg.hasOwnProperty("timestamp") || msg["timestamp"] == undefined) {var msg_timestamp = ""}
  else {var msg_timestamp = msg["timestamp"] + " "}
  if(last_message_sender != msg["sender"]){
    var pic = document.createElement('div');
    pic.textContent = msg["sender"][0].toUpperCase();
    var c = 0;
    for(var i = 0; i < msg["sender"].length; ++i){
      c += msg["sender"].charCodeAt(i);
    }
    pic.style.backgroundColor = colors[c % colors.length];
    pic.classList.add("chat_avatar_ball");
    var senderContainer = document.createElement('div');
    senderContainer.classList.add("sender_container");
    var sender = document.createElement('div');
    sender.innerHTML = msg["sender"]
    sender.classList.add("message_list_sender_name");
    var timeStamp = document.createElement('div');
    timeStamp.innerHTML = msg_timestamp;
    timeStamp.classList.add("message_list_timestamp");
    senderContainer.appendChild(pic); senderContainer.appendChild(sender); senderContainer.appendChild(timeStamp); 
    nm.appendChild(senderContainer);
  }
  else
  {
    var senderContainer = document.createElement('div');
    senderContainer.classList.add("sender_container");
    var timeStamp = document.createElement('div');
    timeStamp.innerHTML = msg_timestamp;
    timeStamp.classList.add("message_list_timestamp");
    senderContainer.appendChild(timeStamp);
    nm.appendChild(senderContainer);
  }
  var text = document.createElement('div'); // Actual text body
  text.id = nm.id + "text";
  //console.log(msg["content"]);
  text.innerHTML = msg["content"];
  text.classList.add("message_list_text");
  nm.appendChild(text);
  
  var likes_btn = document.createElement('div'); // Beginning of likes?
  likes_btn.classList.add("likes_btn"); likes_btn.classList.add("message_reactions"); likes_btn.classList.add("noselect");
  likes_btn.setAttribute("aria-label", "Samaa mieltä"); likes_btn.setAttribute("title", "Samaa mieltä");

  var dislikes_btn = document.createElement('div'); 
  dislikes_btn.classList.add("dislikes_btn"); dislikes_btn.classList.add("dislike_reactions"); dislikes_btn.classList.add("noselect");
  dislikes_btn.setAttribute("aria-label", "Eri mieltä"); dislikes_btn.setAttribute("title", "Eri mieltä");

  var goodargs_btn = document.createElement('div');
  goodargs_btn.classList.add("goodargs_btn"); goodargs_btn.classList.add("goodarg_reactions"); goodargs_btn.classList.add("noselect");
  goodargs_btn.setAttribute("aria-label", "Hyvin argumentoitu"); goodargs_btn.setAttribute("title", "Hyvin argumentoitu");

  if(msg["likes"] == undefined){ msg["likes"] = 0; }
  if(msg["dislikes"] == undefined) { msg["dislikes"] = 0;}
  if(msg["goodargs"] == undefined) { msg["goodargs"] = 0;}

  var likes_number = document.createElement('div');
  likes_number.id = msg["id"] + "likes";
  likes_number.classList.add("likes_number"); likes_number.classList.add("noselect");

  var dislikes_number = document.createElement('div');
  dislikes_number.id = msg["id"] + "dislikes";
  dislikes_number.classList.add("dislikes_number"); dislikes_number.classList.add("noselect");

  var goodargs_number = document.createElement('div');
  goodargs_number.id = msg["id"] + 'goodargs';
  goodargs_number.classList.add("goodargs_number"); goodargs_number.classList.add("noselect");

  likes_number.textContent = "  " + msg["likes"].length;
  dislikes_number.textContent = "   " + msg["dislikes"].length;
  goodargs_number.textContent = "   " + msg["goodargs"].length;
  var reaction_container = document.createElement('div');
  reaction_container.classList.add("reaction_container");
  reaction_container.appendChild(likes_btn); reaction_container.appendChild(likes_number); reaction_container.appendChild(dislikes_btn); reaction_container.appendChild(dislikes_number); reaction_container.appendChild(goodargs_btn); reaction_container.appendChild(goodargs_number);
  
  var response_container = document.createElement('div');
  response_container.classList.add("response_container");

  var reply = document.createElement('div');
  reply.classList.add("message_list_reply"); reply.classList.add("noselect");
  reply.textContent = "VASTAA";
  response_container.appendChild(reply);

  console.log("sender: " + msg["sender"] + " logged in " + logged_in);
  if (msg["sender"] == logged_in)
  {
    var deleteMessage = document.createElement('div');
    deleteMessage.classList.add("message_list_delete"); deleteMessage.classList.add("noselect");
    deleteMessage.textContent = "POISTA VIESTI";
    response_container.appendChild(deleteMessage);

    var editMessage = document.createElement('div');
    editMessage.classList.add("message_list_edit"); editMessage.classList.add("noselect");
    editMessage.textContent = "MUOKKAA VIESTIÄ";
    response_container.appendChild(editMessage);
  }

  var number_of_replies = messages.filter(element => element["parent"] === msg["id"]).length;

  var mobile_container = document.createElement('div');
  mobile_container.classList.add("mobile_reaction_container");

  //var reaction_button = document.createElement('span');
  //reaction_button.classList.add('mobile_reaction_button');
  //reaction_button.innerHTML = '<span class="far fa-thumbs-up"></span>';
  //mobile_container.appendChild(reaction_button);

  var replyNumber = document.createElement('span');
  replyNumber.classList.add("reply_number");
  replyNumber.innerHTML = number_of_replies + " vastausta";
  if (number_of_replies == 0) { replyNumber.classList.add("no_replies");}
  mobile_container.appendChild(replyNumber);

  var message_actions = document.createElement('span');
  message_actions.classList.add('mobile_message_actions');
  message_actions.innerHTML = "<span class='fas fa-comment-alt'></span>";
  mobile_container.appendChild(message_actions);
  
  var bottomContainer = document.createElement("div");
  bottomContainer.classList.add("bottom_container");

  bottomContainer.appendChild(response_container); bottomContainer.appendChild(mobile_container);

  nm.appendChild(bottomContainer);

  console.log("using target " + msg_target);
  var ml = document.getElementById(msg_target);
  ml.appendChild(nm);
  last_message_sender = msg["sender"];
  var separator = document.createElement('div');
  separator.classList.add("separator");
  ml.appendChild(separator);
  ml.scrollTop = ml.scrollHeight;
  window.scrollTop = window.scrollHeight;
}

function create_reply(msg, level){
  var nm = document.createElement('div');
  if (level == 3){   nm.classList.add("second_tier_reply"); }
  else { nm.classList.add("reply_message"); }
  nm.id = msg["id"];
  if (!msg.hasOwnProperty("timestamp") || msg["timestamp"] == undefined) {var msg_timestamp = ""}
  else {var msg_timestamp = msg["timestamp"] + " "}

  var pic = document.createElement('div');
  pic.textContent = msg["sender"][0].toUpperCase();
  var c = 0;
  for(var i = 0; i < msg["sender"].length; ++i){
    c += msg["sender"].charCodeAt(i);
  }
  pic.style.backgroundColor = colors[c % colors.length];
  pic.classList.add("chat_avatar_ball");
  var senderContainer = document.createElement('div');
  senderContainer.classList.add("sender_container");
  var sender = document.createElement('div');
    sender.innerHTML = msg["sender"]
    sender.classList.add("message_list_sender_name");
  var timeStamp = document.createElement('div');
    timeStamp.innerHTML = msg_timestamp;
    timeStamp.classList.add("message_list_timestamp");
  senderContainer.appendChild(pic);senderContainer.appendChild(sender); senderContainer.appendChild(timeStamp); 
  nm.appendChild(senderContainer);
  
  var text = document.createElement('div'); // Actual text body
  //console.log(msg["content"]);
  text.innerHTML = msg["content"];
  text.classList.add("message_list_text");
  text.id = nm.id + ("text");
  nm.appendChild(text);
  
  var likes_btn = document.createElement('div'); // Beginning of likes?
  likes_btn.classList.add("likes_btn"); likes_btn.classList.add("message_reactions"); likes_btn.classList.add("noselect");
  likes_btn.setAttribute("aria-label", "Samaa mieltä"); likes_btn.setAttribute("title", "Samaa mieltä");

  var dislikes_btn = document.createElement('div'); 
  dislikes_btn.classList.add("dislikes_btn"); dislikes_btn.classList.add("dislike_reactions"); dislikes_btn.classList.add("noselect");
  dislikes_btn.setAttribute("aria-label", "Eri mieltä"); dislikes_btn.setAttribute("title", "Eri mieltä");

  var goodargs_btn = document.createElement('div');
  goodargs_btn.classList.add("goodargs_btn"); goodargs_btn.classList.add("goodarg_reactions"); goodargs_btn.classList.add("noselect");
  goodargs_btn.setAttribute("aria-label", "Hyvin argumentoitu"); goodargs_btn.setAttribute("title", "Hyvin argumentoitu");

  if(msg["likes"] == undefined){ msg["likes"] = 0; }
  if(msg["dislikes"] == undefined) { msg["dislikes"] = 0;}
  if(msg["goodargs"] == undefined) { msg["goodargs"] = 0;}

  var likes_number = document.createElement('div');
  likes_number.id = msg["id"] + "likes";
  likes_number.classList.add("likes_number"); likes_number.classList.add("noselect");

  var dislikes_number = document.createElement('div');
  dislikes_number.id = msg["id"] + "dislikes";
  dislikes_number.classList.add("dislikes_number"); dislikes_number.classList.add("noselect");

  var goodargs_number = document.createElement('div');
  goodargs_number.id = msg["id"] + 'goodargs';
  goodargs_number.classList.add("goodargs_number"); goodargs_number.classList.add("noselect");

  likes_number.textContent = "  " + msg["likes"].length;
  dislikes_number.textContent = "   " + msg["dislikes"].length;
  goodargs_number.textContent = "   " + msg["goodargs"].length;
  var reaction_container = document.createElement('div');
  reaction_container.classList.add("reaction_container");
  reaction_container.appendChild(likes_btn); reaction_container.appendChild(likes_number); reaction_container.appendChild(dislikes_btn); reaction_container.appendChild(dislikes_number); reaction_container.appendChild(goodargs_btn); reaction_container.appendChild(goodargs_number);
    
  var response_container = document.createElement('div');
  response_container.classList.add("response_container");

  var reply = document.createElement('div');
  reply.classList.add("message_list_reply"); reply.classList.add("noselect");
  reply.textContent = "VASTAA";
  response_container.appendChild(reply);

  if (msg["sender"] == logged_in)
  {
    var deleteMessage = document.createElement('div');
    deleteMessage.classList.add("message_list_delete"); deleteMessage.classList.add("noselect");
    deleteMessage.textContent = "POISTA VIESTI";
    response_container.appendChild(deleteMessage);

    var editMessage = document.createElement('div');
    editMessage.classList.add("message_list_edit"); editMessage.classList.add("noselect");
    editMessage.textContent = "MUOKKAA VIESTIÄ";
    response_container.appendChild(editMessage);
  }

  var bottomContainer = document.createElement("div");
  bottomContainer.classList.add("bottom_container");

  bottomContainer.appendChild(reaction_container); bottomContainer.appendChild(response_container);

  nm.appendChild(bottomContainer);

  var ml = document.getElementById('message_list');
  ml.appendChild(nm);
  last_message_sender = msg["sender"];
  var separator = document.createElement('div');
  separator.classList.add("separator");
  ml.appendChild(separator);
  ml.scrollTop = ml.scrollHeight;
  window.scrollTop = window.scrollHeight;
}

socket.on('new message', function(msg){
  create_message(msg);
});

socket.on('new reply', function(msg){
  create_reply(msg)
});

$(document).on('click', ".message_list_edit", function(e)
{
  if (window_open == false)
  {
    window_open = true;
    original_message = document.getElementById($(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id'));
    var editContainer = document.createElement('div');
    editContainer.setAttribute('data-parent', $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id'));
    editContainer.classList.add("text-container");
    editContainer.id = makeid();
    var editBox = document.createElement('TEXTAREA');
    editBox.id = editContainer.id + "editbox";
    editContainer.setAttribute('data-editbox', editBox.id);
    editBox.classList.add("edit_box");
    var saveButton = document.createElement('div');
    saveButton.innerHTML = '<i class="fas fa-arrow-circle-right fa-2x"></i>';
    saveButton.classList.add('noselect'); saveButton.classList.add("save_edit_btn");
    saveButton.id = editContainer.id + "saveButton";
    editBox.defaultValue = document.getElementById($(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id')+"text").innerHTML;
    editContainer.appendChild(editBox); editContainer.appendChild(saveButton);
    original_message.innerHTML = editContainer.innerHTML;
  }
})

$(document).on('click', ".message_list_reply", function(e)
{
  if (window_open == false)
  {
    window_open = true;
    original_message = document.getElementById($(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id'));
    var replyContainer = document.createElement('div');
    replyContainer.classList.add("text-container");
    replyContainer.setAttribute('data-parent', $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id'));
    replyContainer.id = makeid();
    var separator = document.createElement('div');
    separator.classList.add("separator");
    replyContainer.appendChild(separator);
    var replyBox = document.createElement('TEXTAREA');
    replyBox.id = replyContainer.id + "replybox";
    replyBox.classList.add("reply_box");
    var replyButton = document.createElement('div');
    replyButton.innerHTML = '<i class="fas fa-arrow-circle-right fa-2x"></i>';
    replyButton.classList.add("noselect"); replyButton.classList.add("reply_btn");
    replyButton.id = replyContainer.id + "replyButton";
    replyContainer.appendChild(replyBox);
    replyContainer.appendChild(replyButton);
    original_message.insertAdjacentElement('afterend', replyContainer);
  }
});

$(document).on('click', '.save_edit_btn', function(e){
  var msg = {}
  msg["user_id"] = logged_in;
  msg["council"] = council;
  msg["content"] = e.currentTarget.previousElementSibling.value;
  msg["msg_id"] = $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id');
  window_open = false;
  socket.emit('request message edit', msg);
})

$(document).on('click', ".reply_btn", function(e){
  var textbox = document.getElementById($(this).parents('.text-container').first().attr('id') + "replybox");
  console.log("Trying to find " + textbox);
  var msg_time = new Date();
  var msg_timestamp = msg_time.getDate() + "." + (msg_time.getMonth() + 1) + "." + msg_time.getFullYear() + " " + ("0" + msg_time.getHours()).slice(-2) + ":" + ("0" + msg_time.getMinutes()).slice(-2) + ":" + ("0" + msg_time.getSeconds()).slice(-2);
  var msg = {};
  msg["sender"] = logged_in;
  msg["council"] = council;
  msg["content"] = textbox.value;
  msg["timestamp"] = msg_timestamp;
  msg["id"] = makeid();
  msg["parent"] = (e.currentTarget.parentElement.getAttribute('data-parent'));
  socket.emit('request new message', msg);
  window_open = false;
  window.location.reload();
});

$(document).on('click', ".message_list_delete", function(e){
  if(window.confirm("Oletko varma että haluat poistaa tämän viestin?"))
  {
    data = {}
    data["user_id"] = logged_in;
    data["council"] = council;
    data["mid"] = $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().id;
    socket.emit('request delete message', data);
    window.location.reload();
  }
});

$(document).on('click', ".mobile_delete_btn", function(e){
  if ($(this).hasClass('inactive')){
    alert("Et voi poistaa tätä viestiä.");
    return;
  }
  else {
    if(window.confirm("Oletko varma että haluat poistaa tämän viestin?"))
    {
      data = {}
      data["user_id"] = logged_in;
      data["council"] = council;
      data["mid"] = $(this).parents('.mobile_container').first().attr('id').replace("action_panel", "");
      socket.emit('request delete message', data);
      window.location.reload();
    }
  }
});

$(document).on('click', '.message_reactions', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
    return;
  }
  data = {};
  data["council"] = council;
  data["mid"] = $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id');
  data["liker"] = logged_in;
  socket.emit('request add like', data);
});

$(document).on('click', '.likes_btn', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
    return;
  }
  data = {};
  data["council"] = council;
  data["liker"] = logged_in;
  data["mid"] = $(this).parents('.mobile_container').first().attr('id').replace("reaction_panel", "");
  socket.emit('request add like', data);
});

$(document).on('click', '.dislikes_btn', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
    return;
  }
  data = {};
  data["council"] = council;
  data["liker"] = logged_in;
  data["mid"] = $(this).parents('.mobile_container').first().attr('id').replace("reaction_panel", "");
  socket.emit('request add dislike', data);
});

$(document).on('click', '.goodargs_btn', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
    return;
  }
  data = {};
  data["council"] = council;
  data["liker"] = logged_in;
  data["mid"] = $(this).parents('.mobile_container').first().attr('id').replace("reaction_panel", "");
  socket.emit('request add goodarg', data);
});

socket.on('update likes', function(mid, likes){
  console.log("mid: " + mid);
  var message = document.getElementById(mid+"likes");
  message.textContent = "   "+likes;
  var mobile_message = document.getElementById(mid+"likes_number");
  mobile_message.textContent = "    "+likes;
});

socket.on('reload_chat_lobby', function()
{
  console.log("Reloading");
  window.location.reload();
});

$(document).on('click', '.dislike_reactions', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
    return;
  }
  data = {};
  data["council"] = council;
  data["mid"] = $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id');
  data["liker"] = logged_in;
  socket.emit('request add dislike', data);
});

socket.on('update dislikes', function(mid, dislikes){
  var message = document.getElementById(mid+"dislikes");
  message.textContent = "   "+dislikes;
  var mobile_message = document.getElementById(mid+"dislikes_number");
  mobile_message.textContent = "    "+dislikes;
});


$(document).on('click', '.goodarg_reactions', function(e){
  if(logged_in.length < 1){
    alert("Et voi reagoida viesteihin ellet ole kirjautunut sisään!");
    return;
  }
  data = {};
  data["council"] = council;
  data["mid"] = $(this).parents('.chat_message, .reply_message, .second_tier_reply').first().attr('id');
  data["liker"] = logged_in;
  socket.emit('request add goodarg', data);
});

socket.on('update goodargs', function(mid, goodargs){
  var message = document.getElementById(mid+"goodargs");
  message.textContent = "   "+goodargs;
  var mobile_message = document.getElementById(mid+"goodargs_number");
  mobile_message.textContent = "    "+goodargs;
});

socket.on('delete message', function(mid){
  var message = document.getElementById(mid);
  console.log(message);
  var message_text = message.querySelector(".message_list_text");
  message_text.innerHTML = "<em>Käyttäjä on poistanut tämän viestin.</em>";
  //message.getElementsByClassName
});

$('#lobby_home_btn').click(function(){
  goToPage("/lobby/" + council + "/index");
});

$('#lobby_chat_btn').click(function(){
  goToPage("/lobby/" + council + "/chat");
});

$('#lobby_document_btn').click(function(){
  goToPage("/lobby/" + council + "/material");
});

$('#lobby_conclusion_btn').click(function(){
  goToPage("/lobby/" + council + "/conclusion");
});
