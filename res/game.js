var socket;

const updateMessage = function(msg) {
  console.log("new message: " + msg);
  let p = $("#message")[0];
  p.text = msg;
  p.textContent = msg;
};

const updatePlayer = function(player) {
  console.log("update player: " + player);
};

$(document).ready(function () {
  socket = io();
  socket.on('update message', function(msg) {
    updateMessage(msg);
  });
  socket.on('update player', function(player) {
    updatePlayer(player);
  });
});