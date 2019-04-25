function goToPage(page){
  window.location = page;
}

function logout(){
  console.log("logout clicked");
  socket.emit('user logout');
}

function log(text){
  console.log("Log:", str(text))
}
