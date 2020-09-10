var socket = io();

$(function()
{
    let page = window.location.href.split("/").slice(5)[0];
    console.log("page: " + page)
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