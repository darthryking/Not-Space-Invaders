import {
    Bullet
}
from './projectiles.js';

const LASER_GUN_ROF = 3; // Shots per second
const LASER_GUN_FIRE_DELAY_MS = 1000.0 / LASER_GUN_ROF;

const LASER_GUN_BULLET_SPEED = 500; // px/sec

const BEAM_CANNON_BEAM_LENGTH = 99999;
const BEAM_CANNON_BEAM_WIDTH = 2;
const BEAM_CANNON_BEAM_COLOR = 0x00FFFF;

export default class Weapon {
    constructor(scene, player, name) {
        this.scene = scene;
        this.player = player;
        this.name = name;

        this.isActive = false;
    }

    fire(aimX, aimY) {
        throw new Error(".fire() method not implemented!");
    }

    updateNotFiring(aimX, aimY) {
        // no-op
    }
}

export class LaserGun extends Weapon {
    constructor(scene, player) {
        super(scene, player, "Laser Gun");

        this.nextShotTime = 0.0;

        this.bullets = scene.add.group([], {
            runChildUpdate: true
        })
    }

    fire(aimX, aimY) {
        const now = this.scene.game.getTime();

        if (now >= this.nextShotTime) {
            const firePosX = this.player.x;
            const firePosY = this.player.y;

            const [vX, vY] = this.#calculateBulletVelocity(
                firePosX, firePosY,
                aimX, aimY
            );

            this.bullets.add(
                new Bullet(this.scene, firePosX, firePosY, vX, vY)
            );

            this.nextShotTime = now + LASER_GUN_FIRE_DELAY_MS;
        }
    }

    #calculateBulletVelocity(firePosX, firePosY, aimX, aimY) {
        const dX = aimX - firePosX;
        const dY = aimY - firePosY;

        const hypotenuse = Math.sqrt(dX * dX + dY * dY);
        if (hypotenuse === 0) {
            return [0, -LASER_GUN_BULLET_SPEED];
        }

        const vX = (dX / hypotenuse) * LASER_GUN_BULLET_SPEED;
        const vY = (dY / hypotenuse) * LASER_GUN_BULLET_SPEED;

        return [vX, vY];
    }
}

export class BeamCannon extends Weapon {
    constructor(scene, player) {
        super(scene, player, "Beam Cannon");

        this.beam = scene.add.line().setOrigin(0, 0);
        this.beam.setStrokeStyle(null, BEAM_CANNON_BEAM_COLOR);
        this.beam.setLineWidth(BEAM_CANNON_BEAM_WIDTH);
    }

    fire(aimX, aimY) {
        const firePosX = this.player.x;
        const firePosY = this.player.y;

        const [beamEndX, beamEndY] = this.#calculateBeamEndPos(
            firePosX, firePosY,
            aimX, aimY,
        );

        this.beam.setAlpha(1);
        this.beam.setTo(firePosX, firePosY, beamEndX, beamEndY);
    }

    updateNotFiring(aimX, aimY) {
        this.beam.setAlpha(0);
    }

    #calculateBeamEndPos(firePosX, firePosY, aimX, aimY) {
        const dX = aimX - firePosX;
        const dY = aimY - firePosY;

        const hypotenuse = Math.sqrt(dX * dX + dY * dY);
        if (hypotenuse == 0) {
            return [0, -BEAM_CANNON_BEAM_LENGTH];
        }

        const beamEndX = (dX / hypotenuse) * BEAM_CANNON_BEAM_LENGTH;
        const beamEndY = (dY / hypotenuse) * BEAM_CANNON_BEAM_LENGTH;

        return [beamEndX, beamEndY];
    }
}

export class MissileLauncher extends Weapon {
    fire() {

    }
}
