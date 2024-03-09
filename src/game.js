window.GAME_WIDTH = 800;
window.GAME_HEIGHT = 600;

class Game extends Phaser.Scene {
  preload() {
    // Load spaceships sprite sheet
    this.load.spritesheet('spaceships', 'assets/spaceships_spritesheet.png', {
      frameWidth: 120,
      frameHeight: 120,
    });
  }

  create() {
    this.player = this.add.sprite(GAME_WIDTH/2, GAME_HEIGHT - 100, 'spaceships', 0); 
  }

  update() {
    let movementAmount = 5;
    let cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.player.x -= movementAmount;
    } else if (cursors.right.isDown) {
      this.player.x += movementAmount;
    }
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: Game,
  parent: 'game',
});
