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

$(function(){

  $('#header').load(host + "/html/header.html");
  $('#footer').load(host + "/html/footer.html");

  council = window.location.href.split("/").slice(-2)[0];
  socket.emit("check login council", council);
  socket.emit("request council data", council);
  $('#conclusion_editor').hide();
  $('#questionnaire_container').show();
  data["council_id"] = council;
  //myAnswers = socket.emit('request answers by userid', data);
  quest_view = document.getElementById('questionnaire_viewer');
});

socket.on('receive all council answers', function(data){ // Receives an array of arrays. Each sub-array is an array of a given user's anonymized answers to the final questions. 

    for (var i = 0; i < questionnaire.length; ++i) // Iteroidaan jokaisen kysymyksen yli.
    {
      for (var j = 0; j < data.length; ++j)
      {
        if (data[j] != "" && data[j] != undefined)
        {
          allAnswers[i].push(data[j][i]);
        }
      }
    }
});

socket.on('council data', function(data){
  $('#left_menu_title').html(data["name"]);
  $('#conclusion_input').text(data["conclusion"]);
});

$('#questionnaire_btn').click(function(){
  $('#conclusion_editor').hide();
  $('#questionnaire_container').show();
  document.getElementById('questionnaire_btn').className = "active";
  document.getElementById('view_answers_btn').className = "inactive";
  document.getElementById('conclusion_btn').className = "inactive";
  ActivateQuestionnaire();
});

$('#view_answers_btn').click(function(){
  $('#conclusion_editor').hide();
  $('#questionnaire_container').show();
  document.getElementById('questionnaire_btn').className = "inactive";
  document.getElementById('view_answers_btn').className = "active";
  document.getElementById('conclusion_btn').className = "inactive";
  ActivateViewerpage(currentPage);
});

$('#conclusion_btn').click(function(){
  $('#conclusion_editor').show();
  $('#questionnaire_container').hide();
  document.getElementById('questionnaire_btn').className = "inactive";
  document.getElementById('view_answers_btn').className = "inactive";
  document.getElementById('conclusion_btn').className = "active";
});

$(document).on('click', '.save_conclusion_btn', function(e){
  for (var i = 0; i < data["questions"].length; ++i)
  {
    console.log("Loop de loop + " + i);
    var temp_answer = document.getElementById('answer_box' + i).value;
    if (temp_answer != undefined)
    {
      myAnswers[i] = temp_answer;
    }

    else { myAnswers[i] = ""};
  }

  data["answers"] = myAnswers;
  socket.emit('request save conclusion answers', data);
});

socket.on('conclusion answers updated', function(e){
  alert("Vastaukset tallennettu.");
  window.location.reload();
});

$('#save_conclusion_text').click(function(){
  var coun_data = {};
  coun_data["council"] = council;
  coun_data["text"] = $('#conclusion_input').val();
  socket.emit('request conclusion update', coun_data);
});

$('#refresh_conclusion_text').click(function(){
  socket.emit('request conclusion refresh', council);
});

$('#conclusion_input').keydown(function(e){
  var key = e.keyCode;
  return;
});

socket.on('update conclusion', function(){
  goToPage("/lobby/" + council + "/conclusion");
});

socket.on("userid request response", function(user_id){
  data["user_id"] = user_id;
  socket.emit('request questionnaire', data);
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

socket.on("questionnaire request response", function(response)
{

  data["questions"] = response["questionnaire"];

  var conc_value = document.getElementById("conclusion_input").val;
  console.log("Conc value: " + conc_value);
  
  if (conc_value = undefined)
  {
    
    var base_text = "";
    for (var i = 0; i < data["questions"].length; i++)
    {
      base_text += i+1 + ". " + data["questions"][i] + "\n\n";
    }
    $('#conclusion_input').text(base_text);
  }
  
  try {
    data["answers"] = response["answers"]["answers"];

    if (data["answers"].length > 0)
    {
      for (var i = 0; i < data["answers"].length; ++i)
      {
        if (data["answers"][i] != "" && data["answers"][i] != undefined)
        {
          tempAnswers[i] = data["answers"][i];
        }
        else {
          tempAnswers[i] = "Syötä vastauksesi tähän."
        }
      }
    }
    }
  
  catch{

    for (var i = 0; i < data["questions"].length; ++i)
    {
      tempAnswers[i] = "Syötä vastauksesi tähän";
    }
  }

  try {
    for (var i = 0; i < response["all_answers"].length; ++i)
    {
      allAnswers[i] = response["all_answers"][i];
    }
  }

  catch(err){
    console.log("Error parsing all answers: " + err);
  }


  ActivateQuestionnaire();
});

function ActivateViewerpage(page)
{
  quest_view = document.getElementById("questionnaire_viewer");
  console.log("Viewing page " + page);
  var qf = document.createElement('div');
  qf.classList.add("questionnaire_viewer");
  qf.id = "questionnaire_viewer";

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

  console.log("Current page: " + currentPage + " max page: " + data["questions"].length);
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

function ActivateQuestionnaire()
{
  quest_view = document.getElementById("questionnaire_viewer");
  var qf = document.createElement('div');
  qf.classList.add("questionnaire_viewer");
  qf.id = "questionnaire_viewer";

  console.log("Creating questions");
  for (var i = 0; i < data["questions"].length; ++i)
  {
    console.log("Creating question");
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

  if (data["questions"].length > 0)
  {

    var save_btn = document.createElement('button');
    save_btn.classList.add("save_conclusion_btn");
    save_btn.innerHTML = "Tallenna vastauksesi";
    qf.appendChild(save_btn);
  }

  else {
    var no_questionnaire = document.createElement("div");
    no_questionnaire.classList.add("no_question_text");
    no_questionnaire.innerText = "Tälle raadille ei ole luotu loppulausumakyselyä.";
    qf.appendChild(no_questionnaire);
  }

  quest_view.outerHTML = qf.outerHTML;
}

socket.on("login success", function(response){
  data["username"] = response;
  socket.emit("request userid by username", response);
  socket.emit("request socket list", council);
});


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
