export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, GAME_WIDTH/2, GAME_HEIGHT, "spaceships", 0);

    this.movementAmount = 5; 
  }

  moveLeft() {
    if (this.x > this.width / 2) {
      this.x -= this.movementAmount;
    }
  }

  moveRight() {
    if (this.x < GAME_WIDTH - (this.width / 2)) {
      this.x += this.movementAmount;
    }
  }
}


