export default class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, vX, vY) {
    super(scene, x, y, 'bullets', 0);
    scene.physics.add.existing(this);
    this.setVelocity(vX, vY); 
  }
}
