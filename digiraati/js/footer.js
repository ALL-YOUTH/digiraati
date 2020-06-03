
$(function(){
  $("#footer").css('top', window.innerHeight + "px");
});

$("#control_panel").click(function(){
  goToPage("/admin");
});

$(document).ready(function() {
  console.log("Page is ready");
  $('.loader_container').hide();
});
