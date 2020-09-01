var socket;

const updateMessage = function(msg) {
  let p = $("#message")[0];
  p.text = msg;
  p.textContent = msg;
};

const removePlayer = function(sid) {
  console.log("remove player: " + sid);
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
  socket.on('remove player', function(sid) {
    removePlayer(sid);
  });
});