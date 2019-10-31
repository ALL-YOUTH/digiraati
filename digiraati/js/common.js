var socket = io();
var logged_in = "";
var host = socket["io"]["uri"] + ":" + location.port;

//socket.emit('check login');

function goToPage(page){
  window.location = page;
}

function timestamp(){
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function log(text){
  console.log("Log:", text)
}

function clear_child_elements(e){
  while (e.firstChild) {
    e.removeChild(e.firstChild);
  }
}

function TODO(){
    alert("Yayy! I'm glad you are exploring the site. However, my sorry excuse of creator (the coder) has not implemented this feature yet, so just sit patient. =))");
}

function makeid() {
  id = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while(id.length < 12){
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getUrlVars(){
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
	});
	return vars;
}

socket.on('login success', function(name){
  logged_in = name;
});

function add_classes_to_element(element, classes){
  for(var i = 0; i < classes.length; ++i){
    element.classList.add(classes[i]);
  }
}
