var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;
var current_page = 1;
var number_of_questions = 1;
var trix_editor;
var modal_open = false;
var uploader = new SocketIOFileClient(socket);
var council_id = "";
var bases = [];
var submitting = false;
var submittable;
var uploaded_header = "default.png";

$(function(){
  $('#create_container_2').hide();
  $('#create_container_3').hide();
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
  trix_editor = document.querySelector("trix-editor");
  $('#file_upload_container').hide();
  $('#council_base_container').hide();
  $('#image_changer_container').hide();
  council_id = makeid();
});

$('#council_publish_date').change(function(){
  $('#council_chat_open_date').attr({'min': $(this).val()});
  $('#council_chat_close_date').attr({'min': $(this).val()});
  $('#council_chat_open_date').attr({'min': $(this).val()});
  $('#council_ends_date').attr({'min': $(this).val()});
  $('#conclusion_due_date').attr({'min': $(this).val()});
  $('#feedback_due_date').attr({'min': $(this).val()});
});

$('#council_chat_open_date').change(function(){
  $('#council_publish_date').attr({'max': $(this).val()});
  $('#council_chat_close_date').attr({'min': $(this).val()});
  $('#council_chat_open_date').attr({'min': $(this).val()});
  $('#council_ends_date').attr({'min': $(this).val()});
  $('#conclusion_due_date').attr({'min': $(this).val()});
  $('#feedback_due_date').attr({'min': $(this).val()});
});

$('#council_chat_close_date').change(function(){
  $('#council_chat_open_date').attr({'max': $(this).val()});
  $('#council_ends_date').attr({'min': $(this).val()});
  $('#conclusion_due_date').attr({'min': $(this).val()});
  $('#feedback_due_date').attr({'min': $(this).val()});
});

$('#council_ends_date').change(function(){
  $('#council_chat_open_date').attr({'max': $(this).val()});
  $('#council_chat_close_date').attr({'max': $(this).val()});
  $('#council_chat_open_date').attr({'max': $(this).val()});
  $('#conclusion_due_date').attr({'min': $(this).val()});
  $('#feedback_due_date').attr({'min': $(this).val()});
});

function validateUpload(filename)
{
  let parts = filename.split('.');
  let ext = parts[parts.length-1];
  switch(ext.toLowerCase())
  {
    case 'jpg':
    case 'png':
      return true;
  }
  return false;
}

$('textarea').on('keydown', function(e){

}).on('input', function(){
    $(this).height(1);
    var totalHeight = $(this).prop('scrollHeight') - parseInt($(this).css('padding-top')) - parseInt($(this).css('padding-bottom'));
    if(totalHeight < 30){
      totalHeight = 30;
    }
    $(this).height(totalHeight);
    });

$('#add_file_btn').click(function(ev){
  ev.preventDefault();
  var fileEl = document.getElementById('file_input');
  var fn = fileEl.files[0]["name"];
  let file_id = makeid(8);
  var uploadIds = uploader.upload(fileEl, {
    uploadTo: "files",
    rename: file_id,
    data: {
      "id":makeid(8),
      "filename":fn,
      "council":council_id,
      "uploader": window.sessionStorage.getItem('logged_in')
    }
  });

  setTimeout(function() {
    uploader.abort(uploadIds[0]);
  }, 5000);
});
  
  $('#add_image_btn').click(function(ev){
    console.log("Uploading image");
    ev.preventDefault();
    let imgEl = document.getElementById('image_input');
    let iname = imgEl.files[0]["name"];
    if (validateUpload(iname) == true)
    {
    let img_id = makeid(8);
    let imgUploadIds = uploader.upload(imgEl, {
      uploadTo: "images",
      rename: img_id,
      data: {
        "id" :img_id,
        "filename": iname,
        "council": council_id,
        "uploader": window.sessionStorage.getItem('logged_in')
      }
    });

    console.log("Uploading file: " + img_id);

    setTimeout(function() {
      uploader.abort(imgUploadIds[0]);
    }, 5000);
    }
    else (alert("Tiedoston täytyy olla JPG- tai PNG-kuvatiedosto."));
  });

$('#save_images_btn').click(function(ev){
  console.log("Trying to upload picture");
  ev.preventDefault();
  var fileE2 = document.getElementById("image_input");
  var fn = fileE2.files[0]["name"];
  let ft = fileE2.files[0]["type"];
  if (ft != "image/jpeg" && ft != "image/png")
  {
    window.alert("Tiedostosi ei vaikuta olevan kuva.\nSallitut tiedostotyypit: JPG, PNG.");
    return;
  }
  let file_id = makeid(8);
  console.log("Rename set to: " + file_id + "." + fn.split('.')[1]);
  uploaded_header = file_id + "." + fn.split('.')[1];
  let uploadIds = uploader.upload(fileE2, {
    rename: file_id + "." + fn.split('.')[1],
    uploadTo: "images",
    data: {
      "id": file_id,
      "filename": fn,
      "council": council_id,
      "uploader": window.sessionStorage.getItem('logged_in')
    }
  });

  setTimeout(function() {
    uploader.abort(uploadIds[0]);
  }, 5000);
});

$('#change_image_btn').click(function(ev){
  if(modal_open == false)
  {
    modal_open = true;
    $('#image_changer_container').show();
  }
});

uploader.on('start', function(fileInfo) {
  console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
  console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
});
uploader.on('complete', function(fileInfo) {
  console.log(fileInfo);
  if(fileInfo["uploadTo"] == "files")
  {
  socket.emit('update files request', council_id, function(response)
  {
    list_files(response);
  });
  } 
  else
  {
    console.log("Uploaded JPG");
    document.getElementById("header_image").src = "/council_images/" + fileInfo["name"];
    uploaded_header = fileInfo["name"];
    $('#image_changer_container').hide();
  }
});

uploader.on('error', function(err) {
  console.log('Error!', err);
  alert("Tiedoston lähetyksessä tapahtui virhe");
});

uploader.on('abort', function(fileInfo) {
  console.log('Aborted: ', fileInfo);
});

function list_files(files){
  console.log("Ey yo, %s", files.length);
  if(files == null){return;}
  var filelist = document.getElementById('file_list');
  clear_child_elements(filelist);
  for(var i = 0; i < files.length; ++i){
    var el = document.createElement('div');
    el.id = files[i]["id"];
    el.textContent = files[i]["path"];
    filelist.appendChild(el);
  }
}

$('#add_question_btn').click(function(){
  number_of_questions += 1;
  var temp_question = document.createElement('div');
  temp_question.classList.add("conclusion_question");
  var temp_text = document.createElement('div');
  temp_text.classList.add("create_text");
  temp_text.innerHTML = "Kysymys " + number_of_questions;
  temp_question.appendChild(temp_text);
  var temp_text_entry = document.createElement("textarea");
  temp_text_entry.classList.add("text");
  temp_text_entry.classList.add("conclusion_question_text")
  temp_text_entry.id = "conclusion_question_" + number_of_questions;
  temp_text_entry.placeholder = "Kirjoita tähän kysymys " + number_of_questions;
  temp_text_entry.rows = "3";
  temp_question.appendChild(temp_text_entry);

  document.getElementById("conclusion_questions").appendChild(temp_question);
});

$('#load_base_btn').click(function(){
  if (modal_open == false)
  {
    socket.emit("request all bases", function(response)
    {
      ProcessBases(response);
    });
  }
});

function ProcessBases(data)
{
  console.log("This just popped");
  $('#council_base_list').empty();
    if (data.length == 0)
    {
      let temp_description = document.createElement("div");
      temp_description.id = "no_bases_found_text";
      temp_description.classList.add("create_text");
      temp_description.innerHTML = "Ei valmiita pohjia"
      document.getElementById("council_base_list").appendChild(temp_description);
    }
    else {
      for(let base of data)
      {
        bases = data;
        let base_listing = document.createElement("div");
        base_listing.id = base["id"];
        base_listing.classList.add("base_meta_container");

        let base_description = document.createElement("div");
        base_description.id = base["id"] + "description";
        base_description.classList.add("create_text");
        base_description.innerHTML = base["description"];

        let base_button = document.createElement("div");
        base_button.id = base["id"];
        base_button.classList.add("container_button");
        base_button.innerHTML = "Valitse pohja";
        base_button.onclick = function(){
          base_selected(this);
        }

        base_listing.appendChild(base_description); base_listing.appendChild(base_button);
        document.getElementById("council_base_list").appendChild(base_listing);
      }
    }
    modal_open = true;
    $('#council_base_container').show();
}

function base_selected(base)
{
  modal_open = false;
  $('#council_base_container').hide();
  submitting = false;
  let base_data = bases.filter(element => element["id"] == base.id)[0]["details"];
  council_id = makeid();
  document.getElementById("name_input").value = base_data["name"];
  document.getElementById("create_tags").value = base_data["keywords"];
  document.getElementById("create_description_input").value = base_data["description"];
  document.getElementById("council_publish_date").value = base_data["startdate"];
  document.getElementById("council_publish_time").value = base_data["starttime"];
  document.getElementById("council_ends_date").value = base_data["enddate"];
  document.getElementById("council_ends_time").value = base_data["endtime"];
  document.getElementById("council_chat_open_date").value = base_data["discussion_open_date"];
  document.getElementById("council_chat_open_time").value = base_data["discussion_open_time"];
  document.getElementById("council_chat_close_date").value = base_data["discussion_close_date"];
  document.getElementById("council_chat_close_time").value = base_data["discussion_close_time"];
  document.getElementById("conclusion_due_date").value = base_data["conclusion_due_date"];
  document.getElementById("conclusion_due_time").value = base_data["conclusion_due_time"];
  document.getElementById("feedback_due_date").value = base_data["feedback_due_date"];
  document.getElementById("feedback_due_time").value = base_data["feedback_due_time"];
  document.getElementById("password_text").value = base_data["password"];

  if (base_data["conclusion_questions"].length > 0)
  {
    console.log("There are conclusion questions");
    number_of_questions = 0;
    $('#conclusion_questions').empty();

    for(let question of base_data["conclusion_questions"])
    {
      console.log("Question: " + question);
      number_of_questions += 1;
      var temp_question = document.createElement('div');
      temp_question.classList.add("conclusion_question");
      var temp_text = document.createElement('div');
      temp_text.classList.add("create_text");
      temp_text.innerHTML = "Kysymys " + number_of_questions;
      temp_question.appendChild(temp_text);
      var temp_text_entry = document.createElement("textarea");
      temp_text_entry.classList.add("text");
      temp_text_entry.classList.add("conclusion_question_text")
      temp_text_entry.id = "conclusion_question_" + number_of_questions;
      temp_text_entry.placeholder = "Kirjoita tähän kysymys " + number_of_questions;
      temp_text_entry.rows = "3";
      temp_question.appendChild(temp_text_entry);

      document.getElementById("conclusion_questions").appendChild(temp_question);
      document.getElementById("conclusion_question_" + number_of_questions).value = question;
    }
  }
  
  trix_editor.editor.loadJSON(JSON.parse(base_data["conclusion_base"]));

}

$('#ei_loppulausumaa_checkboxbtn').change(function(){
  if($(this).is(':checked')){
    $('#loppulausuma_checkboxbtn').prop('checked', false);
    $("#questionnaire_meta_container").hide();
  }
  else if($(this).is(':checked') == false)
  {
    $('#loppulausuma_checkboxbtn').prop('checked', true);
    $("#questionnaire_meta_container").show();
  }
});

$('#cancel_files_btn').click(function(e){
  $('#file_upload_container').hide();
  modal_open = false;
});

$('#loppulausuma_checkboxbtn').change(function(){
  if($(this).is(':checked')){
    $('#ei_loppulausumaa_checkboxbtn').prop('checked', false);
    $("#questionnaire_meta_container").show();
  }
  else if($(this).is(':checked') == false)
  {
    $('#ei_loppulausumaa_checkboxbtn').prop('checked', true);
    $("#questionnaire_meta_container").hide();
  }
});

$('#no_limit_radiobtn').change(function(){
  if($(this).is(':checked')){
    document.getElementById('limit_number').style.display = "none";
  }
});

$('#limit_radiobtn').change(function(){
  if($(this).is(':checked')){
    document.getElementById('limit_number').style.display = "inline-block";
    
  }
});

$('#save_files_btn').click(function(){
  goToPage("/");
});

$('#page_backwards_btn').click(function(){
  if (current_page > 1)
  {
    $('#page_forwards_btn').removeClass("disabled");
    current_page -= 1;
    $('#create_container_1').hide();
    $('#create_container_2').hide();
    $('#create_container_3').hide();
    $('#create_container_'+current_page).show();

    if (current_page == 1)
    {
      $('#page_backwards_btn').addClass("disabled");
    }
  }
});

$('#page_forwards_btn').click(function(){
  if (current_page <= 2)
  {
    $('#page_backwards_btn').removeClass("disabled");
    current_page += 1;
    $('#create_container_1').hide();
    $('#create_container_2').hide();
    $('#create_container_3').hide();
    $('#create_container_'+current_page).show();

    if (current_page == 3)
    {
      $('#page_forwards_btn').addClass("disabled");
    }
  }
})

$('#save_changes_btn').click(function(){  //Retrieve data from the form and submit it to the server for creation

  if (submitting == true)
  {
    alert("Olet jo tallentanut tämän raadin. Jos haluat luoda samanlaisia raateja, tallenna raati pohjaksi ja luo sen avulla uusia raateja.")
    return;
  }
  if (CheckValidInputs() == false)
  {
    alert("Lomakkeesta puuttuu vaadittuja tietoja.");
    return;
  }

  submittable = {};
  submitting = true;
  submittable["id"] = council_id;
  submittable["creator"] = window.sessionStorage.getItem('logged_in');
  submittable["name"] = document.getElementById("name_input").value;
  submittable["keywords"] = document.getElementById("create_tags").value;
  submittable["description"] = document.getElementById("create_description_input").value;
  if($('#limit_radiobtn').is(':checked')) { submittable["userlimit"] = document.getElementById("limit_number").value}
  else { submittable["userlimit"] = -1}
  submittable["startdate"] = document.getElementById("council_publish_date").value;
  submittable["starttime"] = document.getElementById("council_publish_time").value;
  submittable["enddate"] = document.getElementById("council_ends_date").value;
  submittable["endtime"] = document.getElementById("council_ends_time").value;
  submittable["discussion_open_date"] = document.getElementById("council_chat_open_date").value;
  submittable["discussion_open_time"] = document.getElementById("council_chat_open_time").value;
  submittable["discussion_close_date"] = document.getElementById("council_chat_close_date").value;
  submittable["discussion_close_time"] = document.getElementById("council_chat_close_time").value;
  submittable["conclusion_due_date"] = document.getElementById("conclusion_due_date").value;
  submittable["conclusion_due_time"] = document.getElementById("conclusion_due_time").value;
  submittable["feedback_due_date"] = document.getElementById("feedback_due_date").value;
  submittable["feedback_due_time"] = document.getElementById("feedback_due_time").value;
  submittable["password"] = document.getElementById("password_text").value;
  submittable["header_image"] = uploaded_header;
  if ($('#loppulausuma_checkboxbtn').is(':checked'))
  {
    submittable["conclusion_questions"] = []
    var c_qs = document.getElementsByClassName("conclusion_question_text");
    console.log("Kysymyksiä: " + c_qs.length)
    for (let i = 0; i < c_qs.length; i++)
    {
      if(c_qs[i].value.length > 0){ submittable["conclusion_questions"].push(c_qs[i].value); }
    }

    submittable["conclusion_base"] = JSON.stringify(trix_editor.editor);
  }
  submittable["notifications"] = []
  var publish = {}
  publish["event"] = "publish"
  if ($('#publish_notif_checkbox_btn').is(':checked')) { publish["oneday"] = true} else { publish["oneday"] = false};
  if ($('#publish_no_notif_checkbox_btn').is(':checked')) { publish["oneweek"] = true} else { publish["oneweek"] = false};
  submittable["notifications"].push(publish);
  var chatopen = {};
  chatopen["event"] = "chatopen";
  if ($('#chat_open_notif_checkbox_btn').is(':checked')) { chatopen["oneday"] = true} else { chatopen["oneday"] = false};
  if ($('#chat_open_no_notif_checkbox_btn').is(':checked')) { chatopen["oneweek"] = true} else { chatopen["oneweek"] = false};
  submittable["notifications"].push(chatopen);
  var chatclose = {};
  chatclose["event"] = "chatclose";
  if ($('#chat_close_notif_checkbox_btn').is(':checked')) { chatclose["oneday"] = true} else { chatclose["oneday"] = false};
  if ($('#chat_close_no_notif_checkbox_btn').is(':checked')) { chatclose["oneweek"] = true} else { chatclose["oneweek"] = false};
  submittable["notifications"].push(chatclose);
  var councilclose = {};
  councilclose["event"] = "councilclose";
  if ($('#council_close_notif_checkbox_btn').is(':checked')) { councilclose["oneday"] = true} else { councilclose["oneday"] = false};
  if ($('#council_close_no_notif_checkbox_btn').is(':checked')) { councilclose["oneweek"] = true} else { councilclose["oneweek"] = false};
  submittable["notifications"].push(councilclose);
  var q_due = {};
  q_due["event"] = "q_due";
  if ($('#questionnaire_notif_checkbox_btn').is(':checked')) { q_due["oneday"] = true} else { q_due["oneday"] = false};
  if ($('#questionnaire_no_notif_checkbox_btn').is(':checked')) { q_due["oneweek"] = true} else { q_due["oneweek"] = false};
  submittable["notifications"].push(q_due);
  var feedback = {};
  feedback["event"] = "feedback";
  if ($('#feedback_notif_checkbox_btn').is(':checked')) { feedback["oneday"] = true} else { feedback["oneday"] = false};
  if ($('#feedback_no_notif_checkbox_btn').is(':checked')) { feedback["oneweek"] = true} else { feedback["oneweek"] = false};
  submittable["notifications"].push(feedback);

  socket.emit("request council create", submittable, function(response){
    if (response == "success")
    {
      AfterCouncilCreation();
    }
    else
    {
      alert("Raadin luomisessa tapahtui virhe");
      submitting = false;
    }
  });
});

$('#close_base_btn').click(function(e){
  modal_open = false;
  $('#council_base_container').hide();
});

function AfterCouncilCreation(){ // Called after a council has been successfully created to perform after-action tasks
  if (window.confirm("Haluatko tallentaa raadin pohjaksi?") == true)
  {
    let base_description = window.prompt("Anna pohjalle kuvaus")
    let s_data = {}
    s_data["description"] = base_description;
    s_data["content"] = submittable;
    socket.emit('request add new base', s_data);
  }

  if (window.confirm("Haluatko lisätä raatiin tiedostoja?") == true)
  {
    $('#file_upload_container').show();
  }

  else {
    goToPage("/");
  }
}

function CheckValidInputs() // Checks to see that all required fields are filled, and colours missing / invalid entries in red
{
  var missingrequired = false;
  var required_inputs = document.getElementsByClassName("required");
  
  for (var i = 0; i < required_inputs.length; i++)
  {
    if (required_inputs[i].value == "") 
    {
        required_inputs[i].style.cssText = "border: 3px solid red";
        missingrequired = true;
    }
  }

  if (missingrequired === true)
  {
    return false;
  }

  return true;
};

$('#confirm_create').click(function(){ // 1.1.2020: Remnant from a previous version? Probably not needed anymore? 
  console.log("Creating a council!");
  let data = {};
  data["id"] = makeid(8);
  data["name"] = $('#name_input').val();
  data["keywords"] = $('#create_tags').val().split(" ");
  data["description"] = $('#create_description_text_input').val();
  data["startdate"] = document.getElementById('startdate_input').value;
  data["starttime"] = document.getElementById('starttime_input').value;
  data["enddate"] = document.getElementById('enddate_input').value;
  data["endtime"] = document.getElementById('endtime_input').value;
  data["creator"] = logged_in;
  data["userlimit"] = -1;
  data["open"] = true;
  data["password"] = $('#password_text').val();
  var open = true;
  var limit = -1;
  if(document.getElementById('closed_radio').checked){
    data["open"] = false;
  }
  if(document.getElementById('limit_radiobtn').checked){
    data["userlimit"] = $('#limit_number').val();
  }
  console.log("Salasana: " + data["password"]);
  console.log(data);
  socket.emit('request council create', data, function(response){

  });
});
