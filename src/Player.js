class Player {

  constructor(socket) {
    this.pseudo = 'Guest' + Math.floor(1000 + Math.random() * 9000);
    this.id = socket.id;
    this.socket = socket;
    this.points = 0;
    this.lastAnswer = null;
    this.ready = false;
    this.handleSocket();
  }

  handleSocket() {
    this.socket.on('disconnect', () => {
      wwtGame.removePlayer(this.id);
    });
    this.socket.on('answer', async (answer) => {
      await wwtGame.playerAnswer(this.id, answer);
    });
    this.socket.on('ready', async () => {
      await wwtGame.playerReady(this.id);
    });
    this.socket.on('unready', async () => {
      await wwtGame.playerUnready(this.id);
    });
  }
}

module.exports = Player;