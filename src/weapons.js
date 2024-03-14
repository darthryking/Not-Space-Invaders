import {
    distance,
    pointBelowLine,
}
from './utils.js';
import GameObject, {
    Sprite
}
from './gameObjects.js';
import {
    BEAM_CANNON_BEAM_WIDTH,
    BEAM_CANNON_BEAM_LENGTH,
    BEAM_CANNON_BEAM_COLOR,
    BEAM_CANNON_DAMAGE,
    DEBUG_SHOW_FIRE_POS,
}
from './configs.js';

export class CombatCharacter extends Sprite {
    constructor(game, bitmapName, x, y, maxHealth) {
        super(game, bitmapName, x, y);

        this.maxHealth = maxHealth;
        this.health = maxHealth;

        this.weapon = null;
    }

    draw(ctx) {
        super.draw(ctx);

        if (DEBUG_SHOW_FIRE_POS) {
            const [firePosX, firePosY] = this.getFirePos();

            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.ellipse(firePosX, firePosY, 5, 5, 0, Math.PI * 2, 0);
            ctx.fill();
        }
    }

    switchWeapon(now, weapon) {
        if (this.weapon !== null) {
            this.weapon.updateNotFiring(now);
            this.weapon.owner = null;
        }

        this.weapon = weapon;
        this.weapon.owner = this;

        return weapon;
    }

    getFirePos() {
        throw new Error(".getFirePos() not implemented!");
    }

    takeDamage(inflictor, damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.remove();
        }
    }

    likes(otherSprite) {
        return otherSprite === this;
    }
}

export class Weapon extends GameObject {
    constructor(game) {
        super(game);

        this.owner = null;
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

    constructor(game, rof, bulletBitmapName, bulletSpeed, bulletDamage) {
        super(game);

        this.rof = rof;

        this.bulletBitmapName = bulletBitmapName;
        this.bulletSpeed = bulletSpeed;
        this.bulletDamage = bulletDamage;

        this.nextShotTime = 0;
    }

    fire(now, aimX, aimY) {
        super.fire(now, aimX, aimY);

        if (this.owner === null) {
            return;
        }

        if (now < this.nextShotTime) {
            return;
        }

        const [firePosX, firePosY] = this.owner.getFirePos();
        const [vX, vY] = this.#calculateBulletVelocity(
            firePosX, firePosY,
            aimX, aimY,
        );

        this.game.addGameObject(
            new Bullet(
                this.game, this.owner,
                this.bulletBitmapName,
                firePosX, firePosY,
                vX, vY,
                this.bulletDamage,
            )
        );

        this.nextShotTime = now + this.getShotIntervalMs();
    }

    getShotIntervalMs() {
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

    constructor(game) {
        super(game);

        this.#beamEndX = 0;
        this.#beamEndY = 0;
    }

    fire(now, aimX, aimY) {
        super.fire(now, aimX, aimY);

        if (this.owner === null) {
            return;
        }

        const [firePosX, firePosY] = this.owner.getFirePos();

        const [beamHitTarget, distToTarget] = this.#findBeamHitTarget(
            firePosX, firePosY,
            aimX, aimY,
        );

        let beamLen;

        if (beamHitTarget !== null) {
            beamLen = distToTarget;
            beamHitTarget.takeDamage(this, BEAM_CANNON_DAMAGE);
        }
        else {
            beamLen = BEAM_CANNON_BEAM_LENGTH;
        }

        const [beamEndX, beamEndY] = this.#calculateBeamEndPos(
            firePosX, firePosY,
            aimX, aimY,
            beamLen,
        );

        this.#beamEndX = beamEndX;
        this.#beamEndY = beamEndY;
    }

    draw(ctx) {
        if (this.isFiring && this.owner !== null) {
            const [firePosX, firePosY] = this.owner.getFirePos();

            ctx.strokeStyle = BEAM_CANNON_BEAM_COLOR;
            ctx.lineWidth = BEAM_CANNON_BEAM_WIDTH;

            ctx.beginPath();
            ctx.moveTo(firePosX, firePosY);
            ctx.lineTo(this.#beamEndX, this.#beamEndY);
            ctx.stroke();
        }
    }

    #findBeamHitTarget(firePosX, firePosY, aimX, aimY) {
        let closestTarget = null;
        let closestTargetDist = Infinity;

        for (const gameObject of this.game.getActiveGameObjects()) {
            if (!(gameObject instanceof CombatCharacter)) {
                continue;
            }

            if (this.owner.likes(gameObject)) {
                continue;
            }

            let pointsBelowLine = 0;
            let pointsAboveLine = 0;

            for (const [x, y] of gameObject.getCorners()) {
                if (pointBelowLine(x, y, firePosX, firePosY, aimX, aimY)) {
                    pointsBelowLine++;
                }
                else {
                    pointsAboveLine++;
                }
            }

            if (pointsBelowLine < 4 && pointsAboveLine < 4) {
                const distToTarget = distance(
                    firePosX, firePosY,
                    gameObject.getCenterX(), gameObject.getCenterY(),
                );

                if (distToTarget < closestTargetDist) {
                    closestTarget = gameObject;
                    closestTargetDist = distToTarget;
                }
            }
        }

        return [closestTarget, closestTargetDist];
    }

    #calculateBeamEndPos(firePosX, firePosY, aimX, aimY, beamLen) {
        const dX = aimX - firePosX;
        const dY = aimY - firePosY;

        const hypotenuse = Math.sqrt(dX * dX + dY * dY);
        if (hypotenuse == 0) {
            return [0, -beamLen];
        }

        const beamEndX = firePosX + (dX / hypotenuse) * beamLen;
        const beamEndY = firePosY + (dY / hypotenuse) * beamLen;

        return [beamEndX, beamEndY];
    }
}

export class MissileLauncher extends Weapon {
    constructor(game, missileSpeed, missileSelfDestructDist) {
        super(game);

        this.missileSpeed = missileSpeed;
        this.missileSelfDestructDist = missileSelfDestructDist;

        this.missile = null;

        this.aimPosX = 0;
        this.aimPosY = 0;
    }

    fire(now, aimX, aimY) {
        super.fire(now, aimX, aimY);

        if (this.missile === null && this.owner !== null) {
            const [firePosX, firePosY] = this.owner.getFirePos();
            this.missile = this.game.addGameObject(
                new Missile(
                    this.game, this.owner, this,
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
    constructor(game, owner, bitmapName, x, y, vX, vY, damage) {
        super(game, bitmapName, x, y);

        this.vX = vX;
        this.vY = vY;

        this.damage = damage;
        this.owner = owner;
    }

    update(now) {
        const vX = this.vX;
        const vY = this.vY;

        this.x += vX;
        this.y += vY;

        if (!this.isOnScreen()) {
            this.remove();
            return;
        }

        this.angle = Math.atan2(vY, vX) + Math.PI / 2;

        super.update(now);
    }

    collidesWith(otherSprite) {
        if (this.owner.likes(otherSprite)) {
            return false;
        }

        return super.collidesWith(otherSprite);
    }
}

export class Bullet extends Projectile {
    constructor(game, owner, bitmapName, x, y, vX, vY, damage) {
        super(game, owner, bitmapName, x, y, vX, vY, damage);
    }

    collidesWith(otherSprite) {
        if (!(otherSprite instanceof CombatCharacter)) {
            return false;
        }

        return super.collidesWith(otherSprite);
    }

    onCollision(otherSprite) {
        otherSprite.takeDamage(this, this.damage);
        this.remove();
    }
}

export class Missile extends Projectile {
    constructor(
        game, owner, missileLauncher,
        x, y,
        damage, speed, selfDestructDist,
    ) {
        super(game, owner, 'missile', x, y, 0, 0, 0, 0, damage);

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
