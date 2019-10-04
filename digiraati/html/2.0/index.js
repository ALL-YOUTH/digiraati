var hamburger_menu_open = false;

function inactivate_filter(){
  $('.selector_btn').removeClass("active");
  $('.selector_btn').addClass("inactive");
}

$('.selector_btn').click(function(){
  inactivate_filter();
  $(this).removeClass("inactive");
  $(this).addClass("active");
  //TODO arrange councils here
});

function inactivate_sorter(){
  $('.sorter_btn').removeClass("sorter_active");
  $('.sorter_btn').addClass("sorter_inactive");
}

$('.sorter_btn').click(function(){
  inactivate_sorter();
  $(this).removeClass("sorter_inactive");
  $(this).addClass("sorter_active");
  //TODO arrange councils here
});

function open_hamburger_menu(){
  console.log("opening hamburger");
  $('#hamburger_menu').animate({right: "0"});
}

function close_hamburger_menu(){
  console.log("closing hamburger");
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
