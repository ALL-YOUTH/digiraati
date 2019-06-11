var socket = io();
var council_data = {};

council_id = getUrlVars()["council"];

socket.emit('request council data', council_id);

socket.on('council data', function(data){
  council_data = data;
  
});
