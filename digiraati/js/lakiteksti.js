
var lawList = document.querySelectorAll("#lakilista li"); // this returns an array of each li
var finlex_base = "http://data.finlex.fi/eli/sd";
var headers = {"Accept":"application/ld+json"};
var num_comments = 0;
var current_comment = "";
var logged_in = false;


lawList.forEach(function(item) {
  item.onclick = function(e) {
    console.log("clicked item");
    display_text(this.id); // this returns clicked li's value
  }
});

function display_text(id){
  text = get_text(id);
  document.getElementById("lakiteksti").innerHTML = text;
}

function get_text(id){
  url = finlex_base + id;
  var r = new XMLHttpRequest();
  r.open( "GET", url, false );
  r.setRequestHeader("Accept", "application/ld+json");
  r.send( null );
  var data = JSON.parse(r["response"]);
  return data["temporalVersion"]["languageVersion"]["hasFormat"]["content_fi"];
}

function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  }
  return text;
}

$("#lakiteksti_container").mouseup(function(e){
  console.log("Now check the selection");
  selected_text = getSelectionText();
  console.log(e);
  if(selected_text.length == 0){
    hide_context_menu();
    return;
  }
  else {
    open_context_menu(e);
  }
});

function open_context_menu(e){
  var rclickmenu = document.getElementById("rclickmenu");
  var quote = getSelectionText();
  document.getElementById("comment_quote").innerHTML = "\"" + quote + "\"";
  current_comment = quote;
  rclickmenu.style.left = e.pageX +"px";
  rclickmenu.style.top = e.pageY +"px";
  rclickmenu.style.display = "block";
}

function hide_context_menu(e){
  document.getElementById("rclickmenu").style.display = "none";
}

function startFocusOut(){
  $("#cancel_comment").on("click",function(){
    $("#rclickmenu").hide();
    $(document).off("click");
  });
}

function comment(){
  console.log("Adding a new comment");
  comment_text = document.getElementById("comment_text").value;
  var new_comment = document.createElement("a");
  new_comment.classList.add("comment");
  new_comment.innerHTML = comment_text;
  new_comment.id = "comment-" + num_comments;
  new_comment.value = current_comment;
  new_comment.onmouseover = function(){bold_commented(this)};
  new_comment.onmouseout = function(){unbold_commented(this)};
  comment_list = document.getElementById("comment_container");
  //TODO tee lisää juttuja että kommentit näyttää siistimmiltä
  comment_list.appendChild(new_comment);
  document.getElementById('rclickmenu').style.display = "none";
  comment_list.appendChild(document.createElement("br"));
  ++num_comments;
}

function cancel_comment(){
  console.log("cancelling comment");
  document.getElementById('rclickmenu').style.display = "none";
}

function bold_commented(e){
  var text_element = document.getElementById("lakiteksti");
  text = text_element.innerHTML;
  var i = text.indexOf(e.value);
  console.log(text.indexOf(e.value));
  console.log(e.value);
  if(i > -1){
    var text_length = e.value.length;
    var temp_text = text.substr(0, i) + "<b>";
    temp_text = temp_text + text.substr(i, text_length);
    temp_text = temp_text + "</b>" + text.substr(text_length + i);
    text_element.innerHTML = temp_text;
  }
}

function unbold_commented(e){
  console.log("unbolding comment");
  var text_element = document.getElementById("lakiteksti");
  var temp_text = text_element.innerHTML;
  text_element.innerHTML = temp_text;
}

function home(){
  goToPage("/");
}
