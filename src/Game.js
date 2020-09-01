const SimplifiedPlayer = require('./SimplifiedPlayer');

class Game {

  constructor(db) {
    this.db = db;
    this.resetGame();
  }

  async nextRound() {
    await this.pickRandomMessage();
    for (const [key, value] of Object.entries(this.players)) {
      let sp = this.simplePlayers[value.id];
      sp.answered = false;
      value.socket.emit('update message', this.currentMessage[0].content);
      this.updatePlayer(sp);
    }
  }

  announceWinnersAndAnswer() {
    if (this.everybodyAnswered()) {
      for (const [key, value] of Object.entries(this.players)) {
        if (this.currentMessage != null && value.lastAnswer === this.currentMessage.sender) {
          value.points++;
          let sp = this.simplePlayers[value.id];
          sp.points++;
          sp.lost = false;
        }
        else {
          this.simplePlayers[value.id].lost = true;
        }
        value.lastAnswer = null;
        value.socket.emit('real answer', this.currentMessage[0].sender);
        this.updatePlayer(this.simplePlayers[value.id]);
      }
      setTimeout(async function() { await this.nextRound() }.bind(this), 5000);
    }
  }

  everybodyAnswered() {
    for (const [key, value] of Object.entries(this.players)) {
      if (value.lastAnswer === null) {
        return false;
      }
    }
    return true;
  }

  everybodyReady() {
    for (const [key, value] of Object.entries(this.players)) {
      if (value.ready === false) {
        return false;
      }
    }
    return true;
  }

  chooseParticipants(participants) {
    this.participants = participants;
  }

  addPlayer(player) {
    for (const [key, value] of Object.entries(this.simplePlayers)) {
      player.socket.emit('update player', value);
    }
    this.players[player.id] = player;
    this.simplePlayers[player.id] = new SimplifiedPlayer(player.id.substr(0, player.id.length / 2), player.pseudo);
    this.updatePlayer(this.simplePlayers[player.id]);
  }

  removePlayer(id) {
    delete this.players[id];
    let sid = this.simplePlayers[id].id;
    delete this.simplePlayers[id];
    if (this.players.length === 0) {
      this.endGame();
      return;
    }
    this.updateRemovePlayer(sid);
  }

  async start() {
    if (this.participants.length !== 0 && this.everybodyReady()) {
      this.started = true;
      for (const [key, value] of Object.entries(this.players)) {
        value.socket.emit('participants', this.participants);
      }
      await this.nextRound();
    }
  }

  resetGame() {
    this.participants = null;
    this.players = {};
    this.simplePlayers = {};
    this.started = false;
    this.currentMessage = null;
  }

  endGame() {
    this.started = false;
    this.resetGame();
  }

  async pickRandomMessage() {
    if (!this.started) {
      throw new Error("Game not started!");
    }
    this.currentMessage = await this.db.getRandomMessage(this.participants);
    return this.currentMessage;
  }

  async playerAnswer(id, answer) {
    let p = this.players[id];
    if (p !== undefined && p.lastAnswer === null) {
      p.lastAnswer = answer;
      let sp = this.simplePlayers[p.id];
      sp.answered = true;
      this.updatePlayer();
      await this.announceWinnersAndAnswer();
    }
  }

  updatePlayer(simplifiedPlayer) {
    for (const [key, value] of Object.entries(this.players)) {
      value.socket.emit('update player', simplifiedPlayer);
    }
  }

  updateRemovePlayer(sid) {
    for (const [key, value] of Object.entries(this.players)) {
      value.socket.emit('remove player', sid);
    }
  }

  async playerReady(id) {
    this.players[id].ready = true;
    const sp = this.simplePlayers[id];
    sp.ready = true;
    this.updatePlayer(sp);
    await this.start();
  }

  async playerUnready(id) {
    this.players[id].ready = false;
    const sp = this.simplePlayers[id];
    sp.ready = false;
    this.updatePlayer(sp);
  }
}

module.exports = Game;