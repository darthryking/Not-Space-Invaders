import {
    distance,
    pointBelowLine,
    rectIntersectsCircle,
}
from './utils.js';
import GameObject, {
    Sprite
}
from './gameObjects.js';
import {
    BEAM_CANNON_BEAM_LENGTH,
    MISSILE_LAUNCHER_MISSILE_EXPLOSION_RADIUS,
    MISSILE_LAUNCHER_MISSILE_EXPLOSION_DAMAGE,
    MISSILE_LAUNCHER_MISSILE_EXPLOSION_DURATION,
    DEBUG_SHOW_FIRE_POS,
    DEBUG_SHOW_BOUNDING_BOXES,
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
            ctx.ellipse(firePosX, firePosY, 5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    remove() {
        this.switchWeapon(null);
        super.remove();
    }

    switchWeapon(weapon) {
        if (this.weapon !== null) {
            this.weapon.updateNotFiring();
            this.weapon.owner = null;
        }

        this.weapon = weapon;

        if (this.weapon !== null) {
            this.weapon.owner = this;
        }

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

        this.aimPosX = 0;
        this.aimPosY = 0;
    }

    aimAt(aimPosX, aimPosY) {
        this.aimPosX = aimPosX;
        this.aimPosY = aimPosY;
    }

    fire() {
        this.isFiring = true;
    }

    updateNotFiring() {
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

    fire() {
        super.fire();

        if (this.owner === null) {
            return;
        }

        const now = this.game.now;

        if (now < this.nextShotTime) {
            return;
        }

        const [firePosX, firePosY] = this.owner.getFirePos();
        const [vX, vY] = this.#calculateBulletVelocity();

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

    #calculateBulletVelocity() {
        const [firePosX, firePosY] = this.owner.getFirePos();

        const bulletSpeed = this.bulletSpeed;

        const dX = this.aimPosX - firePosX;
        const dY = this.aimPosY - firePosY;

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

    constructor(game, width, color, damage) {
        super(game);

        this.width = width;
        this.color = color;
        this.damage = damage;

        this.#beamEndX = 0;
        this.#beamEndY = 0;
    }

    fire() {
        super.fire();

        if (this.owner === null) {
            return;
        }

        const [beamHitTarget, distToTarget] = this.#findBeamHitTarget();

        let beamLen;

        if (beamHitTarget !== null) {
            beamLen = distToTarget;
            beamHitTarget.takeDamage(this, this.damage);
        }
        else {
            beamLen = BEAM_CANNON_BEAM_LENGTH;
        }

        const [beamEndX, beamEndY] = this.#calculateBeamEndPos(beamLen);

        this.#beamEndX = beamEndX;
        this.#beamEndY = beamEndY;
    }

    draw(ctx) {
        if (this.isFiring && this.owner !== null) {
            const [firePosX, firePosY] = this.owner.getFirePos();

            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(firePosX, firePosY);
            ctx.lineTo(this.#beamEndX, this.#beamEndY);
            ctx.lineTo(firePosX, firePosY);
            ctx.stroke();
        }
    }

    #findBeamHitTarget() {
        let closestTarget = null;
        let closestTargetDist = Infinity;

        const [firePosX, firePosY] = this.owner.getFirePos();
        const aimPosX = this.aimPosX;
        const aimPosY = this.aimPosY;

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
                const isBelowLine = pointBelowLine(
                    x, y,
                    firePosX, firePosY,
                    aimPosX, aimPosY
                );

                if (isBelowLine) {
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

    #calculateBeamEndPos(beamLen) {
        const [firePosX, firePosY] = this.owner.getFirePos();

        const dX = this.aimPosX - firePosX;
        const dY = this.aimPosY - firePosY;

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

    fire() {
        super.fire();

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
    }
}

export class Projectile extends Sprite {
    constructor(game, owner, bitmapName, centerX, centerY, vX, vY) {
        super(game, bitmapName, 0, 0);

        this.setCenter(centerX, centerY);

        this.vX = vX;
        this.vY = vY;

        this.owner = owner;
    }

    update() {
        const vX = this.vX;
        const vY = this.vY;

        this.x += vX;
        this.y += vY;

        if (!this.isOnScreen()) {
            this.remove();
            return;
        }

        this.angle = Math.atan2(vY, vX) + Math.PI / 2;

        super.update();
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
        super(game, owner, bitmapName, x, y, vX, vY);

        this.damage = damage;
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
        speed, selfDestructDist,
    ) {
        super(game, owner, 'missile', x, y, 0, 0, 0, 0);

        this.missileLauncher = missileLauncher;

        this.speed = speed;
        this.selfDestructDist = selfDestructDist;
    }

    update() {
        const [vX, vY] = this.#calculateVelocity();

        this.vX = vX;
        this.vY = vY;

        super.update();

        const [aimPosX, aimPosY] = this.getAimPos();

        const distToMouse = distance(this.x, this.y, aimPosX, aimPosY);
        if (distToMouse <= this.selfDestructDist) {
            this.explode();
        }
    }

    remove() {
        this.missileLauncher.missile = null;
        super.remove();
    }

    collidesWith(otherSprite) {
        if (!(otherSprite instanceof CombatCharacter)) {
            return false;
        }

        return super.collidesWith(otherSprite);
    }

    onCollision(otherSprite) {
        this.explode();
    }

    getAimPos() {
        const missileLauncher = this.missileLauncher;
        return [missileLauncher.aimPosX, missileLauncher.aimPosY];
    }

    explode() {
        this.game.addGameObject(
            new Explosion(
                this.game,
                'explosion',
                this.getCenterX(), this.getCenterY(),
                MISSILE_LAUNCHER_MISSILE_EXPLOSION_RADIUS,
                MISSILE_LAUNCHER_MISSILE_EXPLOSION_DURATION,
                MISSILE_LAUNCHER_MISSILE_EXPLOSION_DAMAGE,
            )
        );

        this.remove();
    }

    #calculateVelocity() {
        const [aimPosX, aimPosY] = this.getAimPos();
        const speed = this.speed;

        const dX = aimPosX - this.getCenterX();
        const dY = aimPosY - this.getCenterY();

        const hypotenuse = Math.sqrt(dX * dX + dY * dY);
        if (hypotenuse === 0) {
            return [0, -speed];
        }

        const vX = (dX / hypotenuse) * speed;
        const vY = (dY / hypotenuse) * speed;

        return [vX, vY];
    }
}

export class Explosion extends Sprite {
    constructor(game, bitmapName, centerX, centerY, radius, duration, damage) {
        super(game, bitmapName, centerX - radius, centerY - radius);

        this.radius = radius;

        this.startTime = null;
        this.duration = duration;

        this.damage = damage;
    }

    getWidth() {
        return this.radius * 2;
    }

    getHeight() {
        return this.radius * 2;
    }

    update() {
        const now = this.game.now;

        if (this.startTime === null) {
            this.startTime = now;
            this.#inflictRadiusDamage();
        }

        super.update();

        if (now - this.startTime >= this.duration) {
            this.remove();
        }
    }

    draw(ctx) {
        super.draw(ctx);

        if (DEBUG_SHOW_BOUNDING_BOXES) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1;
            ctx.lineJoin = 'butt';

            ctx.beginPath();
            ctx.ellipse(
                this.getCenterX(), this.getCenterY(),
                this.radius, this.radius,
                0, 0, Math.PI * 2,
            );
            ctx.stroke();
        }
    }

    #inflictRadiusDamage() {
        for (const gameObject of this.game.getActiveGameObjects()) {
            if (!(gameObject instanceof CombatCharacter)) {
                continue;
            }

            const gameObjectIsWithinExplosion = rectIntersectsCircle(
                gameObject.x, gameObject.y,
                gameObject.getWidth(), gameObject.getHeight(),
                this.getCenterX(), this.getCenterY(),
                this.radius,
            );

            if (gameObjectIsWithinExplosion) {
                gameObject.takeDamage(this, this.damage);
            }
        }
    }
}
