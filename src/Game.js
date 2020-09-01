class Game {

  constructor(db) {
    this.db = db;
    this.resetGame();
  }

  nextRound() {
    if (this.everybodyAnswered()) {
      this.pickRandomMessage();
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
  }

  removePlayer(id) {
    delete this.players[id];
  }

  start() {
    if (!this.participants) {
      this.started = true;
    }
  }

  resetGame() {
    this.participants = null;
    this.players = {};
    this.started = false;
    this.currentMessage = null;
  }

  endGame() {
    this.started = false;
    this.resetGame();
  }

  pickRandomMessage() {
    if (!this.started) {
      throw new Error("Game not started!");
    }
    this.currentMessage = this.db.getRandomMessage(this.participants);
    return this.currentMessage;
  }

  playerAnswer(id, answer) {
    let p = this.players[id];
    if (p !== undefined) {
      p.lastAnswer = answer;
      this.nextRound();
    }
  }
}

module.exports = Game;