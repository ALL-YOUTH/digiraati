
$(function(){
  //console.log("I fired now");
  //$("#footer").css('top', window.innerHeight + "px");
});

$("#control_panel").click(function(){
  goToPage("/admin");
});

$("#info_button").click(function(){
  goToPage("/info");
});

$("#dataprot_button").click(function(){
  goToPage("/dataprot");
});

$("#rules_button").click(function(){
  goToPage("/rules");
});

$("#home_button").click(function(){
  goToPage("");
})

$(document).ready(function() {
  //console.log("Page is ready");
  $('.loader_container').hide();
});
