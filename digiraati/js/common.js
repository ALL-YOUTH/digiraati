function goToPage(page){
  window.location = page;
}

function logout(){
  console.log("logout clicked");
  socket.emit('user logout');
}
