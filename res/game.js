var socket;
var started = false;

const showRealAnswer = function(answer) {
  $("#sender")[0].innerText = answer;
};

const updateMessage = function(msg) {
  if (!started) {
    $("#overlay").hide();
    started = true;
  }
  //$("#sender")[0].innerText = "";
  $("#participants-list").show();
  const scores = $("#scoreboard")[0].rows;
  let p = $("#message")[0];
  p.textContent = msg;
  for (let i = 1; i < scores.length; ++i) {
	const expr = scores[i].cells[1].innerHTML;
	if (expr.includes("+")) {
	  const split = expr.split("+");
	  scores[i].cells[1].innerHTML = parseInt(split[0]) + parseInt(split[1]);
	}
  }
};

const removePlayer = function(sid) {
  $("#readyrow" + sid).remove();
  $("#scorerow" + sid).remove();
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
    }
    else {
      row = row[0];
    }
    row.cells[0].innerHTML = escapeHtml(player.pseudo);
    row.cells[1].innerHTML = player.ready ? "Ready" : "Not ready";
  }
  row = $("#scorerow" + player.id);
  if (row.length === 0) {
    row = $("#scoreboard")[0].insertRow();
    row.id = "scorerow" + player.id;
    row.insertCell(0);
    row.insertCell(1);
    row.insertCell(2);
  }
  else {
    row = row[0];
  }
  row.cells[0].innerHTML = escapeHtml(player.pseudo);
  if (row.cells[1].innerHTML != "") {
	  const previousScore = parseInt(row.cells[1].innerHTML);
	  if (!isNaN(previousScore) && player.points != previousScore) {
		row.cells[1].innerHTML = previousScore + "+" + (player.points - previousScore);
	  }
	  else {
		row.cells[1].innerHTML = player.points;
	  }
  }
  else {
	row.cells[1].innerHTML = player.points;
  }
  row.cells[2].innerHTML = player.answered ? "Answered" : "Didn't answered yet";
};

const escapeHtml = function(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

const setMessageContext = function(messages) {
	let html = "";
	for (let i = messages.length - 1; i >= 0; --i) {
		const date = new Date(messages[i].timestamp);
		html += "<p><span class=\"context-sender\">" + messages[i].sender + "</span><span class=\"context-date\">" + date.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + "/" + (date.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + "/" + date.getFullYear() + " at " + date.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":" + date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":" + date.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + "</span><br/>" + messages[i].content + "</p>";
	}
	$("#message-context")[0].innerHTML = html;
}

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
  $("#change-pseudo-button").click(function() {
	  socket.emit('change pseudo', $("#pseudo-input")[0].value);
  });
  $("#change-pseudo-button-scoreboard").click(function() {
	  socket.emit('change pseudo', $("#pseudo-input-scoreboard")[0].value);
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
  socket.on('real answer', function(answer) {
    showRealAnswer(answer);
  });
  socket.on('msg context', function(msgs) {
	 setMessageContext(msgs);
  });
});