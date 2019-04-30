function goToPage(page){
  window.location = page;
}

function logout(){
  socket.emit('user logout');
}

function log(text){
  console.log("Log:", str(text))
}

function clear_child_elements(e){
  while (e.firstChild) {
    e.removeChild(e.firstChild);
  }
}

function TODO(){
    alert("Yayy! I'm glad you are exploring the site. However, my sorry excuse of creator (the coder) has not implemented this feature yet, so just sit patient. =))");
}
