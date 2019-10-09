var hamburger_menu_open = false;

$("#Etusivu_btn").click(function(){
  goToPage("/2.0");
});

$("#logo_div").click(function(){
  goToPage("/2.0");
});

$("#Rekistroidy_btn").click(function(){
  goToPage("/2.0/register");
});

function open_hamburger_menu(){
  $('#hamburger_menu').animate({right: "0"});
}

function close_hamburger_menu(){
  $('#hamburger_menu').animate({right: "-200px"});
}

$('#hamburger_div').click(function(){
  if(!hamburger_menu_open){
    open_hamburger_menu();
    hamburger_menu_open = true;
  }
  else{
    close_hamburger_menu();
    hamburger_menu_open = false;
  }
});

$('#hamburger_close').click(function(){
  close_hamburger_menu();
  hamburger_menu_open = false;
});

$('#hamburger_index').click(function(){
  goToPage("/2.0");
});

$('#hamburger_register').click(function(){
  goToPage("/2.0/register");
});

$('#arrow_left').click(function(){
  console.log("lol");
  window.history.back();
});
