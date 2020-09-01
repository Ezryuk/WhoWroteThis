class Game {

  constructor(db, participants) {
    this.db = db;
    this.participants = participants;
    this.players = {};
    this.currentMessage = null;
  }

  addPlayer(player) {
    this.players[player.id] = player;
  }

  removePlayer(id) {
    delete this.players[id];
  }

  pickRandomMessage() {
    this.currentMessage = this.db.getRandomMessage(this.participants);
    return this.currentMessage;
  }
}

module.exports = Game;