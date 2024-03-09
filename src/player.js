export default class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene) {
    super(scene, GAME_WIDTH/2, GAME_HEIGHT - 40, "spaceships", 7);
    scene.physics.add.existing(this); 

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


