var socket = io();
var host = socket["io"]["uri"] + ":" + location.port;

$(function(){
  $('#header').load(socket["io"]["uri"] + "/html/header.html");
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
  $('#footer').load(socket["io"]["uri"] + "/html/footer.html");
});


