var socket;
var started = false;

const nextRoundMessage = function() {

};

const updateMessage = function(msg) {
  if (!started) {
    $("#overlay").hide();
    started = true;
  }
  $("#participants-list").show();
  nextRoundMessage();
  let p = $("#message")[0];
  p.textContent = msg;
};

const removePlayer = function(sid) {
  $("#readyrow" + sid).remove();
  //TODO score board
};

const updateParticipants = function(participants) {
  $("#participants-list tr").remove();
  for (let i = 0; i < participants.length; ++i) {
    $("#participants-list")[0].insertRow().insertCell(0).innerText = participants[i];
  }
};

const answer = function(participant) {
  socket.emit('answer', participant);
  $("#participants-list").hide();
};

const updatePlayer = function(player) {
  let row;
  if (!started) {
     row = $("#readyrow" + player.id);
    if (row.length === 0) {
      row = $("#readyTable")[0].insertRow();
      row.id = "readyrow" + player.id;
      row.insertCell(0);
      row.insertCell(1);
    } else {
      row = row[0];
    }
    row.cells[0].innerHTML = player.pseudo;
    row.cells[1].innerHTML = player.ready ? "Ready" : "Not ready";
  }
  /*row = $("participantrow" + player.id);
  if (row.length === 0) {
    row = $("#participants-list")[0].insertRow();
    row.id = "participantrow" + player.id;
    row.insertCell(0);
    row.insertCell(1);
  } TODO score board*/
};

$(document).ready(function () {
  $('#customCheck1').change(function() {
    if ($(this).is(':checked')) {
      socket.emit('ready');
    }
    else {
      socket.emit('unready');
    }
  });
  $("#participants-list").delegate('tr', 'click', function() {
    answer($(this).children('td')[0].innerText);
  });
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
  socket.on('participants', function(participants) {
    updateParticipants(participants);
  });
});