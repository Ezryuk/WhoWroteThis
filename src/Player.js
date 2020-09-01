class Player {

  constructor(id, pseudo) {
    this.pseudo = pseudo;
    this.id = id;
    this.points = 0;
    this.lastAnswer = null;
  }
}

module.exports = Player;