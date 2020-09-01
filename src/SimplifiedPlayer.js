class Player {

  constructor(id, pseudo) {
    this.id = id;
    this.pseudo = pseudo;
    this.points = 0;
    this.ready = false;
    this.lost = false;
    this.answered = false;
  }
}

module.exports = Player;