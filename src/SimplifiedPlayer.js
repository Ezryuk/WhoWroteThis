class Player {

  constructor(id, pseudo) {
    this.id = id;
    this.pseudo = pseudo;
    this.points = 0;
    this.ready = false;
  }
}

module.exports = Player;