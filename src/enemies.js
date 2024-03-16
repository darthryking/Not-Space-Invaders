import {
    randRange
}
from './utils.js';
import {
    CombatCharacter,
    LaserGun,
    BeamCannon,
    Explosion,
}
from './weapons.js';
import {
    ALIEN_SPEED,
    ALIEN_MAX_HEALTH,
    ALIEN_SHIELD_MAX_INTEGRITY,
    ALIEN_SHIELD_REGEN_DELAY,
    ALIEN_BOUNTY,
    SHIELDED_ALIEN_BOUNTY,
    ALIEN_LASER_GUN_MIN_ROF,
    ALIEN_LASER_GUN_MAX_ROF,
    ALIEN_LASER_GUN_BULLET_SPEED,
    ALIEN_LASER_GUN_BULLET_DAMAGE,
    UFO_SPRITE_SCALE,
    UFO_SPEED,
    UFO_MAX_HEALTH,
    UFO_BEAM_MIN_BURST_INTERVAL,
    UFO_BEAM_MAX_BURST_INTERVAL,
    UFO_BEAM_MIN_BURST_TIME,
    UFO_BEAM_MAX_BURST_TIME,
    UFO_BEAM_Y_OFFSET,
    UFO_BOUNTY,
    UFO_BEAM_CANNON_BEAM_COLOR,
    UFO_BEAM_CANNON_BEAM_WIDTH,
    UFO_BEAM_CANNON_BEAM_DAMAGE,
    MOTHERSHIP_SPRITE_SCALE,
    MOTHERSHIP_SPEED,
    MOTHERSHIP_MAX_HEALTH,
    MOTHERSHIP_SHIELD_MAX_INTEGRITY,
    MOTHERSHIP_SHIELD_REGEN_DELAY,
    MOTHERSHIP_BEAM_MIN_BURST_INTERVAL,
    MOTHERSHIP_BEAM_MAX_BURST_INTERVAL,
    MOTHERSHIP_BEAM_MIN_BURST_TIME,
    MOTHERSHIP_BEAM_MAX_BURST_TIME,
    MOTHERSHIP_BEAM_Y_OFFSET,
    MOTHERSHIP_BOUNTY,
    MOTHERSHIP_BEAM_CANNON_BEAM_WIDTH,
    MOTHERSHIP_BEAM_CANNON_BEAM_COLOR,
    MOTHERSHIP_BEAM_CANNON_BEAM_DAMAGE,
    METEOR_SPRITE_SCALE,
    METEOR_SPEED,
    METEOR_GRAVITY,
    METEOR_MAX_HEALTH,
    METEOR_EXPLOSION_Y_OFFSET,
    METEOR_EXPLOSION_RADIUS,
    METEOR_EXPLOSION_DURATION,
    METEOR_EXPLOSION_DAMAGE,
    METEOR_BOUNTY,
    BEAM_CANNON_SHIELD_DAMAGE_MULTIPLIER,
    MISSILE_LAUNCHER_MISSILE_UFO_DAMAGE_MULTIPLIER,
}
from './configs.js';
import GameObject from './gameObjects.js';

export class Enemy extends CombatCharacter {
    constructor(game, bitmapName, x, y, speed, maxHealth, bounty) {
        super(game, bitmapName, x, y, maxHealth);

        this.speed = speed;
        this.direction = 1;

        this.bounty = bounty;
    }

    update() {
        const canvas = this.game.canvas;

        this.x += this.speed * this.direction;

        if (this.getRight() > canvas.width) {
            this.x = canvas.width - this.getWidth();
            this.direction = -1;
        }
        else if (this.getLeft() < 0) {
            this.x = 0;
            this.direction = 1;
        }

        super.update();
    }

    remove() {
        if (this.health <= 0) {
            this.game.player.money += this.bounty;
        }

        super.remove();
    }

    likes(otherSprite) {
        return otherSprite instanceof Enemy;
    }
}

export class Alien extends Enemy {
    constructor(game, x, y) {
        super(
            game, 'alien',
            x, y,
            ALIEN_SPEED, ALIEN_MAX_HEALTH, ALIEN_BOUNTY,
        );

        this.angle = Math.PI;

        this.bulletBitmapName = 'alien_bullet';
    }

    update() {
        if (this.weapon === null) {
            this.#initWeapon();
        }

        super.update();

        const game = this.game;

        const aimX = randRange(0, game.getRight());
        const aimY = game.getBottom();

        this.weapon.aimAt(aimX, aimY);
        this.weapon.fire();
    }

    remove() {
        this.weapon.remove();
        super.remove();
    }

    getFirePos() {
        return [this.getCenterX(), this.getBottom()];
    }

    #initWeapon() {
        const weapon = this.game.addGameObject(
            new LaserGun(
                this.game,
                randRange(ALIEN_LASER_GUN_MIN_ROF, ALIEN_LASER_GUN_MAX_ROF),
                this.bulletBitmapName,
                ALIEN_LASER_GUN_BULLET_SPEED,
                ALIEN_LASER_GUN_BULLET_DAMAGE,
            )
        );

        weapon.nextShotTime = this.game.now + weapon.getShotIntervalMs();

        this.switchWeapon(weapon);
    }
}

export class ShieldedAlien extends Alien {
    constructor(game, x, y) {
        super(game, x, y);

        this.bitmap = game.assets.get('alien_2');
        this.bounty = SHIELDED_ALIEN_BOUNTY;

        this.bulletBitmapName = 'alien_bullet_2';

        this.shield = new Shield(
            game, this,
            'shield',
            Math.max(this.getWidth(), this.getHeight()) / 2,
            ALIEN_SHIELD_MAX_INTEGRITY,
            ALIEN_SHIELD_REGEN_DELAY,
        );
    }

    update() {
        super.update();
        this.shield.update();
    }

    takeDamage(inflictor, damage) {
        const shield = this.shield;

        if (shield.isActive()) {
            shield.takeDamage(inflictor, damage);
        }
        else {
            super.takeDamage(inflictor, damage);
        }
    }

    draw(ctx) {
        super.draw(ctx);

        const shield = this.shield;

        if (shield.isActive()) {
            shield.draw(ctx);
        }
    }
}

export class UFO extends Enemy {
    constructor(game, x, y) {
        super(game, 'ufo', x, y, UFO_SPEED, UFO_MAX_HEALTH, UFO_BOUNTY);

        this.beamMinBurstInterval = UFO_BEAM_MIN_BURST_INTERVAL;
        this.beamMaxBurstInterval = UFO_BEAM_MAX_BURST_INTERVAL;

        this.beamMinBurstTime = UFO_BEAM_MIN_BURST_TIME;
        this.beamMaxBurstTime = UFO_BEAM_MAX_BURST_TIME;

        this.beamCannonBeamWidth = UFO_BEAM_CANNON_BEAM_WIDTH;
        this.beamCannonBeamColor = UFO_BEAM_CANNON_BEAM_COLOR;
        this.beamCannonBeamDamage = UFO_BEAM_CANNON_BEAM_DAMAGE;

        this.nextBeamToggleTime = null;
        this.firing = false;
    }

    getWidth() {
        return this.bitmap.width * UFO_SPRITE_SCALE;
    }

    getHeight() {
        return this.bitmap.height * UFO_SPRITE_SCALE;
    }

    update() {
        const now = this.game.now;

        if (this.nextBeamToggleTime === null) {
            this.nextBeamToggleTime = now + randRange(
                this.beamMinBurstInterval,
                this.beamMaxBurstInterval,
            );
        }

        if (this.weapon === null) {
            this.#initWeapon();
        }

        super.update();

        if (now >= this.nextBeamToggleTime) {
            this.firing = !this.firing;

            if (this.firing) {
                this.nextBeamToggleTime = now + randRange(
                    this.beamMinBurstTime,
                    this.beamMaxBurstTime,
                );
            }
            else {
                this.nextBeamToggleTime = now + randRange(
                    this.beamMinBurstInterval,
                    this.beamMaxBurstInterval,
                );
            }
        }

        if (this.firing) {
            const [firePosX, firePosY] = this.getFirePos();

            const aimPosX = firePosX;
            const aimPosY = firePosY + 1;

            this.weapon.aimAt(aimPosX, aimPosY);
            this.weapon.fire();
        }
        else {
            this.weapon.updateNotFiring();
        }
    }

    remove() {
        this.weapon.remove();
        super.remove();
    }

    getFirePos() {
        return [this.getCenterX(), this.getCenterY() + UFO_BEAM_Y_OFFSET];
    }

    takeDamage(inflictor, damage) {
        if (inflictor instanceof Explosion) {
            damage *= MISSILE_LAUNCHER_MISSILE_UFO_DAMAGE_MULTIPLIER;
        }

        super.takeDamage(inflictor, damage);
    }

    #initWeapon() {
        const weapon = this.game.addGameObject(
            new BeamCannon(
                this.game,
                this.beamCannonBeamWidth,
                this.beamCannonBeamColor,
                this.beamCannonBeamDamage,
            )
        );
        weapon.maxAmmo = Infinity;
        weapon.ammo = Infinity;

        this.switchWeapon(weapon);
    }
}

export class Mothership extends UFO {
    constructor(game, x, y) {
        super(game, x, y);

        this.bitmap = game.assets.get('mothership');
        this.bounty = MOTHERSHIP_BOUNTY;

        this.beamMinBurstInterval = MOTHERSHIP_BEAM_MIN_BURST_INTERVAL;
        this.beamMaxBurstInterval = MOTHERSHIP_BEAM_MAX_BURST_INTERVAL;

        this.beamMinBurstTime = MOTHERSHIP_BEAM_MIN_BURST_TIME;
        this.beamMaxBurstTime = MOTHERSHIP_BEAM_MAX_BURST_TIME;

        this.speed = MOTHERSHIP_SPEED;
        this.maxHealth = MOTHERSHIP_MAX_HEALTH;
        this.health = MOTHERSHIP_MAX_HEALTH;

        this.beamCannonBeamWidth = MOTHERSHIP_BEAM_CANNON_BEAM_WIDTH;
        this.beamCannonBeamColor = MOTHERSHIP_BEAM_CANNON_BEAM_COLOR;
        this.beamCannonBeamDamage = MOTHERSHIP_BEAM_CANNON_BEAM_DAMAGE;

        this.shield = new Shield(
            game, this,
            'shield',
            Math.max(this.getWidth(), this.getHeight()) / 2,
            MOTHERSHIP_SHIELD_MAX_INTEGRITY,
            MOTHERSHIP_SHIELD_REGEN_DELAY,
        );
    }

    getWidth() {
        return this.bitmap.width * MOTHERSHIP_SPRITE_SCALE;
    }

    getHeight() {
        return this.bitmap.height * MOTHERSHIP_SPRITE_SCALE;
    }

    update() {
        super.update();
        this.shield.update();
    }

    takeDamage(inflictor, damage) {
        const shield = this.shield;

        if (shield.isActive()) {
            shield.takeDamage(inflictor, damage);
        }
        else {
            super.takeDamage(inflictor, damage);
        }
    }

    draw(ctx) {
        super.draw(ctx);

        const shield = this.shield;

        if (shield.isActive()) {
            shield.draw(ctx);
        }
    }

    getFirePos() {
        return [
            this.getCenterX(),
            this.getCenterY() + MOTHERSHIP_BEAM_Y_OFFSET,
        ];
    }
}

export class Meteor extends Enemy {
    constructor(game, x, y, aimPosX, aimPosY) {
        super(game, 'meteor', x, y, 0, METEOR_MAX_HEALTH, METEOR_BOUNTY);

        // Disable my superclass's movement logic
        this.direction = 0;

        const [vX, vY] = this.#calculateVelocity(aimPosX, aimPosY);

        this.vX = vX;
        this.vY = vY;
    }

    getWidth() {
        return this.bitmap.width * METEOR_SPRITE_SCALE;
    }

    getHeight() {
        return this.bitmap.height * METEOR_SPRITE_SCALE;
    }

    getFirePos() {
        return [this.getCenterX(), this.getBottom()];
    }

    update() {
        const vX = this.vX;
        const vY = this.vY;

        // Only accelerate when we're on-screen, so that we don't build up
        // insane velocity after falling from above the screen for long periods
        // of time.
        if (this.isOnScreen()) {
            this.vY += METEOR_GRAVITY;
        }

        this.x += vX;
        this.y += vY;

        this.angle = Math.atan2(vY, vX) + 3 * Math.PI / 2;

        if (this.getBottom() >= this.game.getBottom()) {
            this.explode();
        }

        super.update();
    }

    remove() {
        super.remove();

        if (this.health <= 0) {
            this.explode();
        }
    }

    collidesWith(otherSprite) {
        if (!(otherSprite instanceof CombatCharacter)) {
            return false;
        }

        if (this.likes(otherSprite)) {
            return false;
        }

        return super.collidesWith(otherSprite);
    }

    onCollision(otherSprite) {
        this.explode();
    }

    explode() {
        const [explosionX, explosionY] = this.getFirePos();

        this.game.addGameObject(
            new Explosion(
                this.game,
                'explosion',
                explosionX, explosionY,
                METEOR_EXPLOSION_RADIUS,
                METEOR_EXPLOSION_DURATION,
                METEOR_EXPLOSION_DAMAGE,
            )
        );

        if (this.isAlive) {
            this.remove();
        }
    }

    #calculateVelocity(aimPosX, aimPosY) {
        const dX = aimPosX - this.getCenterX();
        const dY = aimPosY - this.getCenterY();

        const hypotenuse = Math.sqrt(dX * dX + dY * dY);
        if (hypotenuse === 0) {
            return [0, -METEOR_SPEED];
        }

        const vX = (dX / hypotenuse) * METEOR_SPEED;
        const vY = (dY / hypotenuse) * METEOR_SPEED;

        return [vX, vY];
    }
}

class Shield {
    #regenTime;

    constructor(game, owner, bitmapName, radius, maxIntegrity, regenDelay) {
        this.game = game;
        this.owner = owner;

        this.bitmap = game.assets.get(bitmapName);

        this.radius = radius;

        this.maxIntegrity = maxIntegrity;
        this.integrity = maxIntegrity;

        this.regenDelay = regenDelay;
        this.#regenTime = null;
    }

    isActive() {
        return this.integrity > 0;
    }

    update() {
        const now = this.game.now;

        if (!this.isActive()) {
            if (this.#regenTime === null) {
                this.#regenTime = now + this.regenDelay;
            }
            else if (now >= this.#regenTime) {
                this.integrity = this.maxIntegrity;
                this.#regenTime = null;
            }
        }
    }

    takeDamage(inflictor, damage) {
        if (inflictor instanceof BeamCannon) {
            damage *= BEAM_CANNON_SHIELD_DAMAGE_MULTIPLIER;
        }

        this.integrity -= damage;

        if (this.integrity < 0) {
            this.integrity = 0;
        }
    }

    draw(ctx) {
        const owner = this.owner;
        const radius = this.radius;
        const diameter = radius * 2;

        ctx.drawImage(
            this.bitmap,
            owner.getCenterX() - radius,
            owner.getCenterY() - radius,
            diameter, diameter,
        );
    }
}
