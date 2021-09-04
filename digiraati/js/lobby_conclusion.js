var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var council = "";
var questionnaire = [];
var myAnswers = [];
var tempAnswers = [];
var allAnswers = [];
var data = {};
var currentPage = 0;
var quest_view;
var trix_editor;
var chat_list;
var conclusions = false;

$(function(){
  window.sessionStorage.removeItem("in_council");
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
  $('#navbar').load(socket["io"]["uri"] + '/html/navbar.html');

  trix_editor = document.querySelector("trix-editor");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("check login council", window.sessionStorage.getItem('token'), council, function(reply)
  {
    if (reply == "success"){
      window.sessionStorage.setItem("in_council", true);
      data["username"] = window.sessionStorage.getItem('logged_in');
      socket.emit("request council data", council, function(data){
        //console.log(data);
        try{  // palautuksena voi tulla joko JSON-formatoitu loppulausuma, joka voidaan ladata sellaisenaan TRIXiin, tai legacy-tapauksissa string, joka pitää erikseen formatoida.
          trix_editor.editor.loadJSON(JSON.parse(data["conclusion"]));
        }
        catch(e)
        {
          if (e instanceof SyntaxError)
          {
            trix_editor.editor.insertString(data["conclusion"]);
          }
      
        else {
          alert("Loppulausuman lataamisessa tapahtui virhe.");
          }
        }
      
        finally{
          chat_list = document.getElementById("conclusion_chat_list");
          var chat_messages = data["messages"];
          var original_messages = chat_messages.filter(element => element["parent"] == "");
          //console.log("Parsing " + chat_messages.length + " chat messages, " + original_messages.length + " original ones");
          for(message of original_messages)
          {
            ParseChatMessage(message, chat_messages);
          }
        }
        
      });

      socket.emit("request userid by username", window.sessionStorage.getItem("logged_in"), function(user_id)
      { 
        data["user_id"] = user_id;
        socket.emit('request questionnaire', data, function(response){ // Hakee loppukyselyn kysymykset ja vastaukset

        data["questions"] = response["questionnaire"]; // Loppukyselyn kysymykset
    
        let conc_value = document.getElementById("conclusion_input").val;
      
        if (conc_value == undefined)
        {
        
          var base_text = "";
          for (var i = 0; i < data["questions"].length; i++)
        {
          base_text += i+1 + ". " + data["questions"][i] + "\n\n";
        }
        $('#conclusion_input').text(base_text);
      }
      
      try {
        data["answers"] = response["answers"]; // Käyttäjän omat vastaukset kyselyyn
    
        if (data["answers"].length > 0) // jos vastauksia on
        {
          for (var i = 0; i < data["answers"].length; ++i)
          {
            if (data["answers"][i] != "" && data["answers"][i] != undefined) // Ja kyseessä ei ole tyhjä arrayn paikka joka on päätynyt sinne Jotenkin
            {
              //console.log(i + ": " + data["answers"][i]);
              tempAnswers[i] = data["answers"][i]; // haetaan käyttäjän vastaus editoria varten
            }
            else {
              tempAnswers[i] = "Kirjoita vastauksesi tähän." // jos vastausta ei ole, annetaan avustukseksi helper-arvo
            }
          }
        }
        else
        {
          for (var i = 0; i < data["questions"].length; ++i) // Siltä varalta että data on korruptoitunutta
        {
          tempAnswers[i] = "Kirjoita vastauksesi tähän";
        }
        }
        }
      
      catch{
    
        for (var i = 0; i < data["questions"].length; ++i) // Siltä varalta että data on korruptoitunutta
        {
          tempAnswers[i] = "Kirjoita vastauksesi tähän";
        }
      }
    
      try {
        for (var i = 0; i < response["all_answers"].length; ++i) // Kaikkien käyttäjien vastaukset loppukyselyyn "tarkastele kyselyn vastauksia" -funktionaalisuutta varten
        {
          allAnswers[i] = response["all_answers"][i];
        }
      }
    
      catch(err){
        //console.log("Error parsing all answers: " + err);
      }
      ActivateQuestionnaire();  
    });
    });
    }
  });
  
  $('#conclusion_div').hide();
  $('#questionnaire_container').show();
  $('#conclusion_chat_content').hide();
  data["council_id"] = council;
  quest_view = document.getElementById('questionnaire_viewer');
  //console.log("this happened, activating questionnaire")
});

$('#own_btn').click(function(){
  $('#conclusion_div').hide();
  $('#questionnaire_container').show();
  document.getElementById('conclusion_own_indicator').className = "active";
  document.getElementById('conclusion_answer_indicator').className = "inactive";
  document.getElementById('conclusion_conclusion_indicator').className = "inactive";
  ActivateQuestionnaire();
});

$('#conclusion_chat_toggle_btn').click(function(){
    $('#conclusion_chat_toggle_btn').toggleClass('active');
    $('#conclusion_chat_toggle_btn').toggleClass('inactive');
    $('#conclusion_chat_content').toggle(5.5);
    //console.log(document.getElementById('conclusion_chat_toggle_btn').innerHTML);
    if (document.getElementById('conclusion_chat_toggle_btn').innerHTML === "Näytä keskustelu")  
    { 
      //console.log("Piilotan keskustelun");
      document.getElementById('conclusion_chat_toggle_btn').innerHTML = "Piilota keskustelu";
    }
    else {
      //console.log("No match here")
      document.getElementById('conclusion_chat_toggle_btn').innerHTML = "Näytä keskustelu";
    }
});

$('#answer_btn').click(function(){
  $('#conclusion_div').hide();
  $('#questionnaire_container').show();
  document.getElementById('conclusion_own_indicator').className = "inactive";
  document.getElementById('conclusion_answer_indicator').className = "active";
  document.getElementById('conclusion_conclusion_indicator').className = "inactive";
  ActivateViewerpage(currentPage);
});

$('#conclusion_btn').click(function(){
  $('#conclusion_div').show();
  $('#questionnaire_container').hide();
  document.getElementById('conclusion_own_indicator').className = "inactive";
  document.getElementById('conclusion_answer_indicator').className = "inactive";
  document.getElementById('conclusion_conclusion_indicator').className = "active";
});

$(document).on('click', '.save_conclusion_btn', function(e){
  for (var i = 0; i < data["questions"].length; ++i)
  {
    var temp_answer = document.getElementById('answer_box' + i).value;
    if (temp_answer != undefined)
    {
      myAnswers[i] = temp_answer;
    }

    else { myAnswers[i] = ""};
  }

  data["answers"] = myAnswers;
  socket.emit('request save conclusion answers', data, function(reply)
  {
    alert("Vastauksesi on tallennettu");
    location.reload();
  });
});


$('#save_conclusion_text').click(function(){
  var coun_data = {};
  coun_data["council"] = council;
  coun_data["text"] = JSON.stringify(trix_editor.editor);
  socket.emit('request conclusion update', coun_data, function(result)
  {
    if (result == "success")
    {
      alert("Loppulausuma on päivitetty");
      location.reload();
    }
  });
});

$('#refresh_conclusion_text').click(function(){
  socket.emit('request conclusion refresh', council, function(updated_conclusion)
  {
    // Toistaiseksi loppulausuman päivitystä ei ole sivuston ominaisuuksissa, mutta jos sellainen halutaan, se voidaan toteuttaa tähän.
  });
});

$('#conclusion_input').keydown(function(e){
  var key = e.keyCode;
  return;
});

$(document).on('click', '.back_button', function(e){
    if (e.currentTarget.classList.contains('valid'))
    {
      currentPage -= 1;
      ActivateViewerpage(currentPage);
    }
});

$(document).on('click', '.forw_button', function(e){
  if (e.currentTarget.classList.contains('valid'))
  {
    currentPage += 1;
    ActivateViewerpage(currentPage);
  }
});

function ParseChatMessage(message, messageList)
{
    var temp_message = document.createElement('div');
    temp_message.classList.add("message_container");
    var header_line = document.createElement('div');
    header_line.classList.add("message_header");
    var message_sender = document.createElement('span');
    message_sender.classList.add("message_sender");
    message_sender.innerHTML = message["sender"];
    var message_timestamp = document.createElement('span');
    message_timestamp.classList.add("message_timestamp");
    message_timestamp.innerHTML = message["timestamp"];
    header_line.appendChild(message_sender); header_line.appendChild(message_timestamp);
    var message_body = document.createElement('div');
    message_body.classList.add("message_text");
    message_body.innerHTML = message["content"];
    var separator = document.createElement('div');
    separator.classList.add("msg_separator");
    temp_message.appendChild(header_line);
    temp_message.appendChild(message_body);
    temp_message.appendChild(separator);
    chat_list.appendChild(temp_message);

    var children_messages = messageList.filter(element => element.parent == message["id"]);
    children_messages.forEach(element => ParseChatMessage(element, messageList));
}

function ActivateViewerpage(page)
{

  quest_view = document.getElementById("questionnaire_viewer");
  var qf = document.createElement('div');
  qf.classList.add("questionnaire_viewer");
  qf.id = "questionnaire_viewer";
  
  if (typeof data["questions"] != 'undefined' && data["questions"].length > 0)
  {
  
  var viewer_title = document.createElement('div');
  viewer_title.classList.add("viewer_question_title");
  viewer_title.innerHTML = data["questions"][page];
  qf.appendChild(viewer_title);

  var button_div = document.createElement('div');
  button_div.classList.add("question_nav_container");

  var back_button = document.createElement('div');
  back_button.classList.add("back_button");
  back_button.innerHTML = "Edellinen kysymys";
  button_div.appendChild(back_button);

  var forw_button = document.createElement('div');
  forw_button.classList.add("forw_button");
  forw_button.innerHTML = "Seuraava kysymys";
  button_div.appendChild(forw_button);

  qf.appendChild(button_div);

  if (currentPage > 0)
  {
    back_button.classList.add("valid");
  }

  if (currentPage < data["questions"].length - 1)
  {
    forw_button.classList.add("valid");
  }

  var content_container = document.createElement('div');
  content_container.classList.add("content_container");

  for (var i = 0; i < allAnswers.length; ++i)
  {
    var temp_question = document.createElement('div');
    temp_question.classList.add("question_container");

    var sender = document.createElement('div');
    sender.classList.add("conclusion_sender");
    sender.innerHTML = randomize_name();
    temp_question.appendChild(sender);

    var content = document.createElement('div');
    content.classList.add("conclusion_content");
    content.innerHTML = allAnswers[i][page];
    temp_question.appendChild(content);

    var separator = document.createElement('div');
    separator.classList.add("separator");
    temp_question.appendChild(separator);

    content_container.appendChild(temp_question);
  }

  qf.appendChild(content_container);
  quest_view.outerHTML = qf.outerHTML;
  }

  else {
    
    var no_questionnaire = document.createElement("div");
    no_questionnaire.classList.add("no_question_text");
    no_questionnaire.innerText = "Tälle raadille ei ole luotu loppulausumakyselyä.";
    quest_view = document.getElementById("questionnaire_viewer");
    qf.appendChild(no_questionnaire);
  
  }
}

function ActivateQuestionnaire()
{
  //console.log("Questionnaire activating")
  quest_view = document.getElementById("questionnaire_viewer");
  var qf = document.createElement('div');
  qf.classList.add("questionnaire_viewer");
  qf.id = "questionnaire_viewer";

  let warning_div = document.createElement('div');
      warning_div.classList.add('warning_header');
      warning_div.innerHTML = "Antamasi vastaukset näkyvät kaikille pseudonymisoituina. Älä siis kirjoita mitään liian henkilökohtaista!"
      qf.appendChild(warning_div);

  if (typeof data["questions"] != 'undefined' && data["questions"].length > 0)
  {
    for (var i = 0; i < data["questions"].length; ++i)
    {

      var temp_question = document.createElement('div');
      temp_question.classList.add("conclusion_question");
      temp_question.id = "conclusion_question" + i;
      temp_question.innerText = data["questions"][i];
      qf.appendChild(temp_question);
      
      var answer_box = document.createElement('TEXTAREA');
      answer_box.classList.add("answer_box");
      answer_box.id = "answer_box" + i;
      answer_box.defaultValue = tempAnswers[i];
      qf.appendChild(answer_box);
    }

      var save_btn = document.createElement('button');
      save_btn.classList.add("save_conclusion_btn");
      save_btn.innerHTML = "Tallenna vastauksesi";
      qf.appendChild(save_btn);
    }

  else {
    //console.log("Ei loppulausumakyselyä.");
    var no_questionnaire = document.createElement("div");
    no_questionnaire.classList.add("no_question_text");
    no_questionnaire.innerText = "Tälle raadille ei ole luotu loppulausumakyselyä.";
    qf.appendChild(no_questionnaire);
  }

  quest_view.outerHTML = qf.outerHTML;
}

function randomize_name()
{
  var adjektiivit = ["Innokas", "Avulias", "Iloinen", "Veikeä", "Osallistuva", "Toimelias", "Puuhakas", "Hauska", "Mukava"];
  var subjektiivit = ["Majava", "Myyrä", "Mäyrä", "Varpunen", "Sisilisko", "Hamsteri", "Kettu", "Kilpikonna", "Lokki"];

  var returnable = adjektiivit[Math.floor(Math.random() * adjektiivit.length)] + " " + subjektiivit[Math.floor(Math.random() * subjektiivit.length)];

  return returnable;
}


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
