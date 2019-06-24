var socket = io();
var logged_in = "";

council_colors = {
  "environment":"#66FF66",
  "economy":"#66B2FF",
  "culture":"#FFB2FF"
}

socket.emit('request councils update');

socket.on('councils update', function(all_councils){
  display_councils(all_councils);
});

function home(){
  goToPage("/");
}

function display_councils(councils){
  var councils_element = document.getElementById('list_of_councils');
  clear_child_elements(councils_element);
  for(i = 0; i < councils.length; ++i){
    var new_elem = document.createElement("a");
    new_elem.id = councils[i]["id"];
    new_elem.onclick = function(){ open_council_frontpage(this.id); }
    new_elem.innerHTML = "<h2>"+ councils[i]["name"]+"</h2>";
    new_elem.classList.add("council_element");
    councils_element.appendChild(new_elem);
  }
}

function create_new_council_clicked(){
  var modal = document.getElementById('new_council_modal');
  modal.style.display = "block";
  //create_test_raati();
}

function cancel_council_modal(){
  document.getElementById('council_name').value = "";
  document.getElementById('council_description').value = "";
  var modal = document.getElementById('new_council_modal');
  modal.style.display = "none";
}

function create_raati(){
  var id = makeid(10);
  var name = document.getElementById('council_name').value;
  if(name.length == 0){
    console.log("Give Council a name");
    return;
  }
  if(logged_in.length == 0){
    console.log("Log in to create a council");
    return;
  }

  var info = {"id":id, "name":name, "creator":logged_in};
  cancel_council_modal();
  socket.emit('council create attempt', info);

}
