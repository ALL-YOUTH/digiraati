var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var logged_in = "";
var council_password = false;
var council_updated = false;
var progress_updated = false;

var colors = ["#FE0456", "#CBE781", "#01AFC4", "#FFCE4E"];


$(function(){
  sessionStorage.setItem('in_council', false);
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
  $('#navbar').load(socket["io"]["uri"] + '/html/navbar.html');

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("check login council", window.sessionStorage.getItem('token'), council, function(result){ // Checks if the currently logged in user is in the council
    if (result == "success") // If so, the user is checked in and council data is requested
    {
      logged_in = window.sessionStorage.getItem('logged_in');
      socket.emit("check in user", {"username": window.sessionStorage.getItem('logged_in'), "council_id": council});
      socket.emit("request council data", council, function(data){
      generate_council_info_from_data(data);
      
      socket.emit("request present users", council, function(result){ // Retrieve the list of users currently active in the council
        console.log("Fetched present users:")
        let current_time = new Date().getTime();
        let activeUsers = result.filter(i => current_time - i.last_checkin_time <= 12000); // Filter the list of present users to those active (last checkin two minutes ago)
        let sleepyUsers = result.filter(i => current_time - i.last_checkin_time > 12000); // And those on the verge of going inactive
        generate_present_user_list(activeUsers); // and generate the HTML required to display them
        generate_present_user_list(sleepyUsers);
      })
      });
    }
    else {
      socket.emit("request council data", council, function(data){
      //console.log("User is not in the council");
      generate_council_info_from_data(data);
      })    
    }
  });
});

function generate_present_user_list(userdata) // Generates the HTML for the list of present users
{
  let current_time = new Date().getTime();
  for (let i = 0; i < userdata.length; i++)
  {
    let temp_user = document.createElement("div");
    temp_user.classList.add("userlist-container");

    let temp_username = document.createElement("div");
    temp_username.classList.add("userlist-username");
    temp_username.innerHTML = userdata[i].user_id;

    let temp_usericon = document.createElement("div");
    if(current_time - userdata[i].last_checkin_time < 12000) // User has done something within the past 2 minutes
    {
      temp_usericon.classList.add("active_indicator");
    }

    else
    {
      temp_usericon.classList.add("sleeping_indicator");
    }

    temp_user.appendChild(temp_username);
    temp_user.appendChild(temp_usericon);

    document.getElementById("present_users").appendChild(temp_user);
  }

}

function generate_council_info_from_data(data)
{
  //console.log("Generating stuffs, logged in: " + window.sessionStorage.getItem('logged_in'));
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
        //console.log("Council has started");
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
  
      if (new Date() > Date.parse(data["enddate"])) {progressPerc = 100}
      else if (dateDiff < 0) { progressPerc = 0}
      else { progressPerc = progressPerc * 100};
  
      //console.log("Progress percentage: " + progressPerc);
    
      progress.style.width = progressPerc + "%";
  
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
        //console.log("Council has started");
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
    $("#leave_council_btn").css("display", "none");
    $("#join_council_btn").css("display", "none");
    if(window.sessionStorage.getItem('logged_in') != "" && window.sessionStorage.getItem('logged_in') != null){
      //console.log("Someone is logged in");
      $("#leave_council_btn").css("display", "none");
      $("#join_council_btn").css("display", "block");
      for(var j = 0; j < data["users"].length; ++j){
        if(window.sessionStorage.getItem('logged_in').toLowerCase() == data["users"][j].toLowerCase()){
          //console.log("Apparently this user is in the council");
          $("#join_council_btn").css({"display": "none"});
          $("#leave_council_btn").css({"display": "block"});
          $("#lobby_document_btn").removeClass("disabled");
          $("#lobby_chat_btn").removeClass("disabled");
          $("#lobby_conclusion_btn").removeClass("disabled");
          sessionStorage.setItem('in_council', true);
          break;
        }
      }

      if (new Date() > Date.parse(data["enddate"])) // If the council has already closed
      {
        console.log("raati on päättynyt");
        $("#join_council_btn").addClass('disabled_button');
        $("#join_council_btn").off('click');
        $('#join_council_btn').text("Raati on päättynyt");
      }

      if(window.sessionStorage.getItem('logged_in') != "" && window.sessionStorage.getItem('logged_in') != null && data["users"].includes(window.sessionStorage.getItem('logged_in'))){
        //console.log("User " + window.sessionStorage.getItem('logged_in') + " is logged in and appears to be in the council")
        try{
          for(var i = 1; i <= 4; ++i){               //Showing the last 4 messages
            var message = document.createElement('div');
            message.classList.add("lobby_chat_message");
            var msg = data["messages"][data["messages"].length-i];        //The last four messages sent to the chat
            var pic = document.createElement('div');
            pic.textContent = msg["sender"][0].toUpperCase();
            var c = 0;
            for(var j = 0; j < msg["sender"].length; ++j){
              c += msg["sender"].charCodeAt(j);
            }
            pic.style.backgroundColor = colors[c % colors.length];
            //console.log("Picked colour " + colors[c % colors.length]);
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
            document.getElementById("lobby_latest_messages_mobile").appendChild(message.cloneNode(true));
            var separator = document.createElement('div');
            separator.classList.add("separator");
            if (i < 4){ document.getElementById("lobby_latest_messages").appendChild(separator); };
            if (i < 4){ document.getElementById("lobby_latest_messages_mobile").appendChild(separator.cloneNode(true)); };
            
          }
        }
      
        catch(error){
          //console.log("Error fetching messages: ", error);
      }
      }
    }
  }

function reformatDate(input){
  try{
    var arr = input.split("-");
    return arr[2]+ "." + arr[1]+ "." + arr[0];
  }
  catch(err){

  }
}

$('#lobby_latest_messages_title_mobile').click(function(){
  $('#lobby_latest_messages_mobile').slideToggle();
  $('#lobby_chat_btn_mobile').slideToggle();
  $('#lobby_latest_messages_arrow_up').toggle();
  $('#lobby_latest_messages_arrow_down').toggle();
  $('#lobby_latest_messages_title_mobile').toggleClass("opened");
  $('#lobby_latest_messages_title_mobile').toggleClass("closed");
});

$('#join_council_btn, #join_council_btn_mobile').click(function(){
  if (council_password == true)
  {
    var entered_password = window.prompt("Tämä raati on suojattu salasanalla. Syötä saamasi salasana alle. Jos sinulla ei ole salasanaa, voit pyytää sitä kontaktihenkilöltäsi.");
  }
  var data = {};
  data["council"] = council;
  data["user"] = logged_in;
  data["password"] = entered_password;
  //console.log("yritän liittyä raatiin: " + data["council"]);
  socket.emit('request join council', data, function(reply){ // Return is {"result": $result_code}, possible values are "password_error" and "success"
    if(reply["result"] == "password_error")
    {alert("Salasana ei ollut oikein. Jos et ole varma raadin salasanasta, ota yhteys kontaktihenkilöösi.")}
    else if(reply["result"] == "success")
    {
      location.reload();
    }
  });
});

$('#leave_council_btn, #leave_council_btn_mobile').click(function(){
  var data = {};
  data["council"] = council;
  data["user"] = logged_in;
  //console.log("Yritän poistua raadista: " + data["user"] + ", " + data["council"]);
  socket.emit('request leave council', data, function(reply) {
    //console.log("Leave result: " + reply["result"]);
    location.reload();
  });
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
