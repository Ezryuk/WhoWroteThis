const SimplifiedPlayer = require('./SimplifiedPlayer');

class Game {

  constructor(db) {
    this.db = db;
    this.resetGame();
  }

  async nextRound(force = false) {
    if (force || this.everybodyAnswered()) {
      for (const [key, value] of Object.entries(this.players)) {
        value.lastAnswer = null;
      }
      await this.pickRandomMessage();
      for (const [key, value] of Object.entries(this.players)) {
        value.socket.emit('update message', this.currentMessage[0].content);
        this.updatePlayer(this.simplePlayers[value.id]);
      }
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

  chooseParticipants(participants) {
    this.participants = participants;
  }

  addPlayer(player) {
    this.players[player.id] = player;
    this.simplePlayers[player.id] = new SimplifiedPlayer(player.id.substr(0, player.id.length / 2), player.pseudo);
    this.updatePlayer(this.simplePlayers[player.id]);
  }

  removePlayer(id) {
    delete this.players[id];
    let sid = this.simplePlayers[id].id;
    delete this.simplePlayers[id];
    this.updateRemovePlayer(sid);
  }

  async start() {
    if (this.participants.length !== 0) {
      this.started = true;
      await this.nextRound(true);
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
    if (p !== undefined) {
      p.lastAnswer = answer;
      await this.nextRound();
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
}

module.exports = Game;