class Player {

  constructor(socket) {
    this.pseudo = 'Guest';
    this.id = socket.id;
    this.socket = socket;
    this.points = 0;
    this.lastAnswer = null;
  }

  handleSocket() {
    this.socket.on('disconnect', () => {
      wwtGame.removePlayer(this.id);
    });
    this.socket.on('answer', async (answer) => {
      await wwtGame.playerAnswer(this.id, answer);
    });
  }
}

module.exports = Player;