export default class Projectile extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, vX, vY, texture, frame) {
        super(scene, x, y, texture, frame);

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

    update() {
        super.update();

        const velocity = this.body.velocity;

        const vX = velocity.x;
        const vY = velocity.y;

        const angle = Math.atan2(vY, vX) + Math.PI / 2;

        this.setRotation(angle);
    }
}

export class Bullet extends Projectile {
    constructor(scene, x, y, vX, vY) {
        super(scene, x, y, vX, vY, 'bullets', 8);
    }
}

export class Missile extends Projectile {

}
