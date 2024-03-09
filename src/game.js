import Player from './player.js';
import Bullet from './bullet.js';

window.GAME_WIDTH = 800;
window.GAME_HEIGHT = 600;

class Game extends Phaser.Scene {
  preload() {
    // Load spaceships sprite sheet
    this.load.spritesheet('spaceships', 'assets/spaceships_spritesheet.png', {
      frameWidth: 120,
      frameHeight: 120,
    });

    // Load bullets sprite sheet
    this.load.spritesheet('bullets', 'assets/bullets_spritesheet.png', {
      frameWidth: 45,
      frameHeight: 45,
    });
  }

  create() {
    this.player = new Player(this, 100, 100, 0, 0);
  }

  update() {
    let movementAmount = 5;
    let cursors = this.input.keyboard.createCursorKeys();
    
    if (cursors.left.isDown) {
      this.player.moveLeft();
    } else if (cursors.right.isDown) {
      this.player.moveRight(); 
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
      let bullet = new Bullet(this, this.player.x, this.player.y, 0, -50); 
    }
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: Game,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {},
      debug: true
    }
  },
});
