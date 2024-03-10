export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, vX, vY) {
        super(scene, x, y, 'bullets', 8);

        // Add to scene
        scene.physics.add.existing(this);
        scene.add.existing(this);

        // Set velocity
        this.setVelocity(vX, vY);

        this.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;
        this.body.world.on('worldbounds', (body) => {
            if (body.gameObject === this) {
                this.destroy();
            }
        });
    }
}