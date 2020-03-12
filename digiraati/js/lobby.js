var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var logged_in = "";
var council_password = false;
var council_updated = false;
var progress_updated = false;

var colors = ["#FE0456", "#CBE781", "#01AFC4", "#FFCE4E"];


$(function(){
  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  console.log("token: " + window.sessionStorage.getItem('token'))
  console.log("user: " + window.sessionStorage.getItem('logged_in'));
  socket.emit("check login council", window.sessionStorage.getItem('token'), council);
  console.log("Logged in: " + logged_in);
});

socket.on('login success', function(){
  console.log("success");
  socket.emit("request council data", council);
});

function reformatDate(input){
  try{
    var arr = input.split("-");
    return arr[2]+ "." + arr[1]+ "." + arr[0];
  }
  catch(err){

  }
}

socket.on('council data', function(data){
  $('#lobby_latest_messages_arrow_up').hide();
  if (data["password"] != "") {council_password = true; }
  if(council_updated){
    clear_child_elements(document.getElementById("lobby_tags"));
    clear_child_elements(document.getElementById("lobby_latest_messages"));
  }
  council_updated = true;
  $('#lobby_title').text(data["name"].toUpperCase());

  // Council progress
  var lb = document.getElementById("lobby_progress");

  if (progress_updated == false)
  {
    var councilStart = document.createElement('div');
    councilStart.classList.add("council_start");
    var startBall = document.createElement('img');
    startBall.classList.add("start_ball");
    startBall.setAttribute('src', '/res/ball_gold.png');
    var startText = document.createElement('div');
    startText.classList.add("start_date");
    startText.innerText = reformatDate(data["startdate"]);
    councilStart.appendChild(startBall); councilStart.appendChild(startText);

    $('#lobby_duration').text("AUKEAA " + reformatDate(data["startdate"]));

    if(new Date() > Date.parse(data["startdate"]))
    {
      console.log("Council has started");
      startBall.setAttribute('src', '/res/checkball.png');
      $('#lobby_duration').text("KÄYNNISSÄ " + reformatDate(data["startdate"]) + " - " + reformatDate(data["enddate"]));
    }
    
    var progressBar = document.createElement('div');
    progressBar.classList.add("council_progress_bar");
    var progress = document.createElement('div');
    progress.classList.add("council_timeline");
    progress.id = "progress_bar";
    progressBar.appendChild(progress);

    var dateDiff = new Date() - Date.parse(data["startdate"]);
    var progressPerc = dateDiff / (Date.parse(data["enddate"]) - Date.parse(data["startdate"]));

    console.log("Progress percentage: " + progressPerc);
    if (progressPerc > 100) {progressPerc = 100};

    progress.style.width = progressPerc * 100 + "%";

    var councilEnd = document.createElement('div');
    councilEnd.classList.add("council_end");
    var endBall = document.createElement('img');
    endBall.setAttribute('src', '/res/ball_gold.png');
    endBall.classList.add("end_ball");
    var endText = document.createElement("div");
    endText.classList.add("end_date");
    endText.innerText = reformatDate(data["enddate"]);
    councilEnd.appendChild(endBall); councilEnd.appendChild(endText);

    if(new Date() > Date.parse(data["enddate"]))
    {
      console.log("Council has started");
      endBall.setAttribute('src', '/res/checkball.png');
      $('#lobby_duration').text("PÄÄTTYNYT " + reformatDate(data["enddate"]));
    }

    lb.appendChild(councilStart); lb.appendChild(progressBar); lb.appendChild(councilEnd);
    progress_updated = true;
  }  

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
  $("#leave_council_btn").hide();
  $("#join_council_btn").hide();
  if(logged_in != ""){
    $("#leave_council_btn").css("display", "none");
    $("#join_council_btn").css("display", "block");
    for(var j = 0; j < data["users"].length; ++j){
      if(logged_in == data["users"][j]){
        $("#leave_council_btn").toggle();
        $("#join_council_btn").toggle();
        $("#lobby_document_btn").removeClass("disabled");
        $("#lobby_chat_btn").removeClass("disabled");
        $("#lobby_conclusion_btn").removeClass("disabled");
        break;
      }
    }
    if (logged_in != "")
    {
      var msgs = data["messages"];
      console.log(data["messages"]);
      try{
        for(var i = 1; i <= 4; ++i){               //Showing the last 4 messages
          var message = document.createElement('div');
          message.classList.add("lobby_chat_message");
          var msg = msgs[msgs.length-i];        //The last four messages sent to the chat
          var pic = document.createElement('div');
          pic.textContent = msg["sender"][0].toUpperCase();
          var c = 0;
          for(var j = 0; j < msg["sender"].length; ++j){
            c += msg["sender"].charCodeAt(j);
          }
          pic.style.backgroundColor = colors[c % colors.length];
          console.log("Picked colour " + colors[c % colors.length]);
          pic.classList.add("chat_avatar_ball");
          var sender = document.createElement('div');
          sender.textContent = msg["sender"];
          sender.classList.add("message_list_sender_name");
          var msg_text = document.createElement('div');
          msg_text.innerHTML = msg["content"];
          msg_text.classList.add("message_text");
          message.appendChild(pic); message.appendChild(sender);
          message.appendChild(msg_text);

          document.getElementById("lobby_latest_messages").appendChild(message);
          var separator = document.createElement('div');
          separator.classList.add("separator");
          if (i < 4){ document.getElementById("lobby_latest_messages").appendChild(separator); };
          
        }
      }
    
      catch(error){
        console.log("lol", error);
    }
    }
  }
});

$('#lobby_latest_messages_title_mobile').click(function(){
  $('#lobby_latest_messages').slideToggle();
  $('#lobby_chat_btn_mobile').slideToggle();
  $('#lobby_latest_messages_arrow_up').toggle();
  $('#lobby_latest_messages_arrow_down').toggle();
  $('#lobby_latest_messages_title_mobile').toggleClass("opened");
  $('#lobby_latest_messages_title_mobile').toggleClass("closed");
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

$('#lobby_chat_btn_mobile').click(function(){
  goToPage("/lobby/" + council + "/chat");
});

$('#lobby_document_btn').click(function(){
  goToPage("/lobby/" + council + "/material");
});

$('#lobby_conclusion_btn').click(function(){
  goToPage("/lobby/" + council + "/conclusion");
});
