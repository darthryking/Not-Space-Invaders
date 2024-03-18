import {
    distance,
    pointBelowLine,
    rectIntersectsRect,
    rectIntersectsCircle,
}
from './utils.js';
import GameObject, {
    Renderable,
    Sprite,
}
from './gameObjects.js';
import LawnSegment from './lawn.js';
import {
    LASER_GUN_NAME,
    BEAM_CANNON_NAME,
    BEAM_CANNON_MAX_CHARGE,
    BEAM_CANNON_CHARGE_CONSUMPTION,
    BEAM_CANNON_BEAM_LENGTH,
    MISSILE_LAUNCHER_NAME,
    MISSILE_LAUNCHER_MAX_MISSILES,
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

    likes(other) {
        return other === this;
    }
}

export class Weapon extends GameObject {
    constructor(game, name, maxAmmo) {
        super(game);

        this.name = name;

        this.maxAmmo = maxAmmo;
        this.ammo = maxAmmo;

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
        if (this.ammo > 0) {
            this.isFiring = true;
        }
        else {
            this.updateNotFiring();
        }
    }

    updateNotFiring() {
        this.isFiring = false;
    }
}

export class LaserGun extends Weapon {
    #nextShotTime;

    constructor(game, rof, bulletBitmapName, bulletSpeed, bulletDamage) {
        super(game, LASER_GUN_NAME, Infinity);

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
        super(game, BEAM_CANNON_NAME, BEAM_CANNON_MAX_CHARGE);

        this.width = width;
        this.color = color;
        this.damage = damage;

        this.beam = null;
        this.numRefills = 0;
    }

    fire() {
        super.fire();

        if (this.owner === null) {
            return;
        }

        if (this.ammo <= 0) {
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

        const [firePosX, firePosY] = this.owner.getFirePos();
        const [beamEndX, beamEndY] = this.#calculateBeamEndPos(beamLen);

        this.#updateBeam(firePosX, firePosY, beamEndX, beamEndY);

        this.beam.isActive = true;

        this.ammo -= BEAM_CANNON_CHARGE_CONSUMPTION;

        if (this.ammo <= 0) {
            if (this.numRefills > 0) {
                this.numRefills--;
                this.ammo += this.maxAmmo;
            }
            else {
                this.ammo = 0;
            }
        }
    }

    updateNotFiring() {
        if (this.beam !== null) {
            this.beam.isActive = false;
        }
    }

    addRefill() {
        if (this.ammo <= 0) {
            this.ammo = this.maxAmmo;
        }
        else {
            this.numRefills++;
        }
    }

    #findBeamHitTarget() {
        let closestTarget = null;
        let closestTargetDist = Infinity;

        const [firePosX, firePosY] = this.owner.getFirePos();
        const aimPosX = this.aimPosX;
        const aimPosY = this.aimPosY;

        for (const gameObject of this.game.getActiveGameObjects()) {
            if (this.owner.likes(gameObject)) {
                continue;
            }

            if (!(gameObject instanceof CombatCharacter) &&
                !(gameObject instanceof LawnSegment)) {
                continue;
            }

            const [beamEndX, beamEndY] = this.#calculateBeamEndPos(
                BEAM_CANNON_BEAM_LENGTH
            );
            const rect1X = Math.min(firePosX, beamEndX);
            const rect1Y = Math.min(firePosY, beamEndY);
            const rect1Width = Math.abs(beamEndX - firePosX);
            const rect1Height = Math.abs(beamEndY - firePosY);

            const rect2X = gameObject.x;
            const rect2Y = gameObject.y;
            const rect2Width = gameObject.getWidth();
            const rect2Height = gameObject.getHeight();

            if (!rectIntersectsRect(
                    rect1X, rect1Y, rect1Width, rect1Height,
                    rect2X, rect2Y, rect2Width, rect2Height,
                )) {
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

    #updateBeam(startX, startY, endX, endY) {
        if (this.beam === null) {
            this.beam = this.game.addGameObject(
                new Beam(
                    this.game,
                    startX, startY,
                    endX, endY,
                    this.width, this.color,
                )
            );
        }
        else {
            const beam = this.beam;

            beam.x = startX;
            beam.y = startY;
            beam.endX = endX;
            beam.endY = endY;
        }
    }
}

export class MissileLauncher extends Weapon {
    constructor(game, missileSpeed, missileSelfDestructDist) {
        super(game, MISSILE_LAUNCHER_NAME, MISSILE_LAUNCHER_MAX_MISSILES);

        this.missileSpeed = missileSpeed;
        this.missileSelfDestructDist = missileSelfDestructDist;

        this.missile = null;

        this.aimPosX = 0;
        this.aimPosY = 0;
    }

    fire() {
        super.fire();

        if (this.owner === null) {
            return;
        }

        if (this.missile !== null) {
            return;
        }

        if (this.ammo <= 0) {
            return;
        }

        const [firePosX, firePosY] = this.owner.getFirePos();

        this.missile = this.game.addGameObject(
            new Missile(
                this.game, this.owner, this,
                firePosX, firePosY,
                this.missileSpeed,
                this.missileSelfDestructDist,
            )
        );

        this.ammo--;
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

    shouldCollideWith(other) {
        if (this.owner.likes(other)) {
            return false;
        }

        if (other instanceof CombatCharacter) {
            return true;
        }

        if (other instanceof LawnSegment) {
            return true;
        }

        return false;
    }
}

export class Bullet extends Projectile {
    constructor(game, owner, bitmapName, x, y, vX, vY, damage) {
        super(game, owner, bitmapName, x, y, vX, vY);

        this.damage = damage;
    }

    onCollision(other) {
        other.takeDamage(this, this.damage);
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

    onCollision(other) {
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

export class Beam extends Renderable {
    constructor(game, startX, startY, endX, endY, width, color) {
        super(game, startX, startY);

        this.endX = endX;
        this.endY = endY;

        this.width = width;
        this.color = color;

        this.isActive = false;
    }

    getWidth() {
        return this.endX - this.x;
    }

    getHeight() {
        return this.endY - this.y;
    }

    draw(ctx) {
        if (!this.isActive) {
            return;
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.endX, this.endY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }

    shouldCollideWith(other) {
        return false;
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
            if (!(gameObject instanceof Renderable)) {
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
