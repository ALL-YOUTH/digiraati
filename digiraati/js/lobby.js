var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var logged_in = "";
var council_password = false;
var council_updated = false;

var colors = ["aqua", "blueviolet", "chartreuse", "chocolate", "coral",
              "cyan", "darkkhaki", "darkorange", "darksalmon", "darkturquoise",
              "deepskyblue", "forestgreen", "fuchsia", "gold", "greenyellow",
              "hotpink", "khaki", "lightgreen", "lightsalmon", "lightskyblue",
              "lime", "limegreen", "mediumaquamarine", "mediumorchid",
              "mediumspringgreen", "olive", "olivedrab", "orange", "orchid",
              "palevioletred", "peachpuff", "plum", "powderblue", "sandybrown",
              "silver", "salmon", "royalblue", "red", "springgreen", "tan",
              "thistle", "tomato", "turquoise", "violet", "wheat", "yellow",
              "yellowgreen"];


$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("request council data", council);
});

socket.on('login success', function(name){
  logged_in = name;
  socket.emit("request council data", council);
});

function reformatDate(input){
  console.log("Yo I'm reformatting over here!");
  try{
    var arr = input.split("-");
    return arr[2]+ "." + arr[1]+ "." + arr[0];
  }
  catch(err){

  }
}

socket.on('council data', function(data){
  if (data["password"] != "") {council_password = true; }
  if(council_updated){
    clear_child_elements(document.getElementById("lobby_tags"));
    clear_child_elements(document.getElementById("lobby_latest_messages"));
  }
  council_updated = true;
  $('#lobby_title').text(data["name"].toUpperCase());
  $('#lobby_starttime').text("Alkaa: " + data["starttime"] + " " + reformatDate(data["startdate"]));
  $('#lobby_endtime').text('Loppuu: ' + data["endtime"] + " " + reformatDate(data["enddate"]));
  $('#lobby_description_title').text(data["name"]);
  $('#lobby_description').text(data["description"]);

  $('#lobby_creator').text("Aloittanut: " + data["creator"]);
  for(var i = 0; i < data["tags"].length; ++i){
    if(data["tags"][i] == ""){
      continue;
    }
    var tag = document.createElement('div');
    tag.classList.add("lobby_tag");
    tag.textContent = data["tags"][i];
    document.getElementById("lobby_tags").appendChild(tag);
  }
  $("#leave_council_btn").css("display", "none");
  $("#join_council_btn").css("display", "none");
  if(logged_in != ""){
    $("#leave_council_btn").css("display", "none");
    $("#join_council_btn").css("display", "block");
    for(var j = 0; j < data["users"].length; ++j){
      if(logged_in == data["users"][j]){
        $("#leave_council_btn").css("display", "block");
        $("#join_council_btn").css("display", "none");
        $("#lobby_document_btn").removeClass("disabled");
        $("#lobby_chat_btn").removeClass("disabled");
        $("#lobby_conclusion_btn").removeClass("disabled");
        break;
      }
    }
    var msgs = data["messages"];
    try{
      for(var i = 4; i > 0; --i){               //Showing the last 4 messages
        var message = document.createElement('div');
        var msg = msgs[msgs.length-i];        //The last four messages sent to the chat
        var pic = document.createElement('div');
        pic.textContent = msg["sender"][0].toUpperCase();
        var c = 0;
        for(var j = 0; j < msg["sender"].length; ++j){
          c += msg["sender"].charCodeAt(j);
        }
        pic.style.backgroundColor = colors[c % colors.length];
        pic.classList.add("chat_avatar_ball");
        var sender = document.createElement('div');
        sender.textContent = msg["sender"];
        sender.classList.add("message_list_sender_name");
        var msg_text = document.createElement('div');
        msg_text.textContent = msg["content"];
        msg_text.classList.add("message_text");
        message.appendChild(pic); message.appendChild(sender);
        message.appendChild(msg_text);

        document.getElementById("lobby_latest_messages").appendChild(message);
      }
    }
    catch(error){
      console.log("lol", error);
    }
  }
});

$('#join_council_btn').click(function(){
  if (council_password == true)
  {
    var entered_password = window.prompt("Tämä raati on suojattu salasanalla. Syötä saamasi salasana alle. Jos sinulla ei ole salasanaa, voit pyytää sitä kontaktihenkilöltäsi.");
  }
  var data = {};
  data["council"] = council;
  data["user"] = logged_in;
  data["password"] = entered_password;
  console.log("yritän liittyä raatiin: " + data["password"]);
  socket.emit('request join council', data);
});

$('#leave_council_btn').click(function(){
  var data = {};
  data["council"] = council;
  data["user"] = logged_in;
  socket.emit('request leave council', data);
});

socket.on('password incorrect', function(){
    window.alert("Salasana ei ollut oikein. Jos et ole varma raadin salasanasta, ota yhteys kontaktihenkilöösi.");
})

socket.on('join success', function(){
  location.reload();
});

socket.on('leave success', function(){
  location.reload();
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
