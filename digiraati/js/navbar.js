var socket = io();
let council_id = "";

$(function()
{
    let page = window.location.href.split("/").slice(5)[0];
    council_id = window.location.href.split("/").slice(-2)[0];
    //console.log("page: " + page)
    //console.log("council:")
   switch (page)
   {
       case "index":
        console.log("Index")
        document.getElementById('lobby_home_indicator').className = "active";
        break;
       case "chat":
        console.log("chat")
        document.getElementById('lobby_chat_indicator').className = "active";
        break;
       case "material":
        console.log("material")
        document.getElementById('lobby_document_indicator').className = "active";
        break;
       case "conclusion": 
        console.log("conclusion")
        document.getElementById('lobby_conclusion_indicator').className = "active";
        break;
       default:
        console.log("I have no idea");
   }
});

$('#lobby_home_btn').click(function(){
  if(sessionStorage.getItem('logged_in') != null && sessionStorage.getItem('in_council') == 'true')
  {
    socket.emit("check in user", {"username": sessionStorage.getItem('logged_in'), "council_id": council_id});
    goToPage("/lobby/" + council + "/index");
  }
  else{
    alert("Sivulle ei ole pääsyä raadin ulkopuolisilla henkilöillä")
  }
  });
  
  $('#lobby_chat_btn').click(function(){
    if(sessionStorage.getItem('logged_in') != null && sessionStorage.getItem('in_council') == 'true')
    {
    socket.emit("check in user", {"username": sessionStorage.getItem('logged_in'), "council_id": council_id});
    goToPage("/lobby/" + council + "/chat");
    }
    else{
      alert("Sivulle ei ole pääsyä raadin ulkopuolisilla henkilöillä")
    }
  });
  
  $('#lobby_chat_btn_mobile').click(function(){
    if(sessionStorage.getItem('logged_in') != null && sessionStorage.getItem('in_council') == 'true')
  {
    socket.emit("check in user", {"username": sessionStorage.getItem('logged_in'), "council_id": council_id});
    goToPage("/lobby/" + council + "/chat");
  }
  else{
    alert("Sivulle ei ole pääsyä raadin ulkopuolisilla henkilöillä")
  }
  });
  
  $('#lobby_document_btn').click(function(){
    if(sessionStorage.getItem('logged_in') != null && sessionStorage.getItem('in_council') == 'true')
  {
    socket.emit("check in user", {"username": sessionStorage.getItem('logged_in'), "council_id": council_id});
    goToPage("/lobby/" + council + "/material");
  }
  else{
    alert("Sivulle ei ole pääsyä raadin ulkopuolisilla henkilöillä")
  }
  });
  
  $('#lobby_conclusion_btn').click(function(){
    if(sessionStorage.getItem('logged_in') != null && sessionStorage.getItem('in_council') == 'true')
  {
    socket.emit("check in user", {"username": sessionStorage.getItem('logged_in'), "council_id": council_id});
    goToPage("/lobby/" + council + "/conclusion");
  }
  else{
    alert("Sivulle ei ole pääsyä raadin ulkopuolisilla henkilöillä")
  }
  });