import {
    dist
}
from './utils.js';
import GameObject, {
    Sprite
}
from './gameObjects.js'

const BEAM_CANNON_BEAM_WIDTH = 2; // px
const BEAM_CANNON_BEAM_LENGTH = 99999;
const BEAM_CANNON_BEAM_COLOR = '#00FFFF';

export class Weapon extends GameObject {
    constructor(game, player) {
        super(game);

        this.player = player;

        this.isFiring = false;
    }

    fire(now, aimX, aimY) {
        this.isFiring = true;
    }

    updateNotFiring(now, aimX, aimY) {
        this.isFiring = false;
    }
}

export class LaserGun extends Weapon {
    #nextShotTime;

    constructor(game, player, rof, bulletSpeed) {
        super(game, player);

        this.rof = rof;
        this.bulletSpeed = bulletSpeed

        this.#nextShotTime = 0;
    }

    fire(now, aimX, aimY) {
        super.fire(now, aimX, aimY);

        if (now < this.#nextShotTime) {
            return;
        }

        const [firePosX, firePosY] = this.player.getFirePos();
        const [vX, vY] = this.#calculateBulletVelocity(
            firePosX, firePosY,
            aimX, aimY,
        );

        this.game.addGameObject(
            new Bullet(this.game, firePosX, firePosY, vX, vY)
        );

        this.#nextShotTime = now + this.#getShotIntervalMs();
    }

    #getShotIntervalMs() {
        return 1000 / this.rof;
    }

    #calculateBulletVelocity(firePosX, firePosY, aimX, aimY) {
        const bulletSpeed = this.bulletSpeed;

        const dX = aimX - firePosX;
        const dY = aimY - firePosY;

        const hypotenuse = Math.sqrt(dX * dX + dY * dY);
        if (hypotenuse === 0) {
            return [0, -bulletSpeed];
        }

        const vX = (dX / hypotenuse) * bulletSpeed;
        const vY = (dY / hypotenuse) * bulletSpeed;

        return [vX, vY];
    }
}

export class BeamCannon extends Weapon {
    #beamEndX;
    #beamEndY;

    constructor(game, player) {
        super(game, player);

        const [firePosX, firePosY] = player.getFirePos();
        this.#beamEndX = firePosX;
        this.#beamEndY = firePosY;
    }

    fire(now, aimX, aimY) {
        super.fire(now, aimX, aimY);

        const [firePosX, firePosY] = this.player.getFirePos();
        const [beamEndX, beamEndY] = this.#calculateBeamEndPos(
            firePosX, firePosY,
            aimX, aimY,
        );

        this.#beamEndX = beamEndX;
        this.#beamEndY = beamEndY;
    }

    draw(ctx) {
        if (this.isFiring) {
            const [firePosX, firePosY] = this.player.getFirePos();

            ctx.strokeStyle = BEAM_CANNON_BEAM_COLOR;
            ctx.lineWidth = BEAM_CANNON_BEAM_WIDTH;

            ctx.beginPath();
            ctx.moveTo(firePosX, firePosY);
            ctx.lineTo(this.#beamEndX, this.#beamEndY);
            ctx.stroke();
        }
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
    constructor(game, player, missileSpeed, missileSelfDestructDist) {
        super(game, player);

        this.missileSpeed = missileSpeed;
        this.missileSelfDestructDist = missileSelfDestructDist;

        this.missile = null;

        this.aimPosX = 0;
        this.aimPosY = 0;
    }

    fire(now, aimX, aimY) {
        super.fire(now, aimX, aimY);

        if (this.missile === null) {
            const [firePosX, firePosY] = this.player.getFirePos();
            this.missile = this.game.addGameObject(
                new Missile(
                    this.game, this,
                    firePosX, firePosY,
                    this.missileSpeed,
                    this.missileSelfDestructDist,
                )
            );
        }

        this.aimAt(aimX, aimY);
    }

    updateNotFiring(now, aimX, aimY) {
        super.updateNotFiring(now, aimX, aimY);

        this.aimAt(aimX, aimY);
    }

    aimAt(aimX, aimY) {
        this.aimPosX = aimX;
        this.aimPosY = aimY;
    }

    #calculateMissileVelocity(firePosX, firePosY, aimX, aimY) {
        const missileSpeed = this.missileSpeed;

        const dX = aimX - firePosX;
        const dY = aimY - firePosY;

        const hypotenuse = Math.sqrt(dX * dX + dY * dY);
        if (hypotenuse === 0) {
            return [0, -missileSpeed];
        }

        const vX = (dX / hypotenuse) * missileSpeed;
        const vY = (dY / hypotenuse) * missileSpeed;

        return [vX, vY];
    }
}

export class Projectile extends Sprite {
    constructor(game, bitmapName, x, y, vX, vY) {
        super(game, bitmapName, x, y);

        this.vX = vX;
        this.vY = vY;
    }

    update(now) {
        const vX = this.vX;
        const vY = this.vY;

        this.x += vX;
        this.y += vY;

        if (!this.isOnScreen()) {
            this.remove();
        }

        this.angle = Math.atan2(vY, vX) + Math.PI / 2;
    }
}

export class Bullet extends Projectile {
    constructor(game, x, y, vX, vY) {
        super(game, 'bullet', x, y, vX, vY);
    }
}

export class Missile extends Projectile {
    constructor(game, missileLauncher, x, y, speed, selfDestructDist) {
        super(game, 'missile', x, y, 0, 0, 0, 0);

        this.missileLauncher = missileLauncher;
        this.speed = speed;
        this.selfDestructDist = selfDestructDist;
    }

    update(now) {
        const [vX, vY] = this.#calculateVelocity();

        this.vX = vX;
        this.vY = vY;

        super.update(now);

        const [aimPosX, aimPosY] = this.getAimPos();

        if (dist(this.x, this.y, aimPosX, aimPosY) <= this.selfDestructDist) {
            this.remove();
        }
    }

    remove() {
        super.remove();
        this.missileLauncher.missile = null;
    }

    getAimPos() {
        const missileLauncher = this.missileLauncher;
        return [missileLauncher.aimPosX, missileLauncher.aimPosY];
    }

    #calculateVelocity() {
        const [aimX, aimY] = this.getAimPos();
        const speed = this.speed;

        const dX = aimX - this.x;
        const dY = aimY - this.y;

        const hypotenuse = Math.sqrt(dX * dX + dY * dY);
        if (hypotenuse === 0) {
            return [0, -speed];
        }

        const vX = (dX / hypotenuse) * speed;
        const vY = (dY / hypotenuse) * speed;

        return [vX, vY];
    }
}
