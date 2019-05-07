function goToPage(page){
  window.location = page;
}

function logout(){
  socket.emit('user logout');
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

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function getUrlVars(){
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
	});
	return vars;
}
