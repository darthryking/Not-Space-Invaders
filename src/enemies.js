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
    ALIEN_SHIELD_REGEN_TIME,
    UFO_SPRITE_SCALE,
    UFO_SPEED,
    UFO_MAX_HEALTH,
    UFO_BEAM_CANNON_DAMAGE,
    UFO_BEAM_MIN_BURST_INTERVAL,
    UFO_BEAM_MAX_BURST_INTERVAL,
    UFO_BEAM_MIN_BURST_TIME,
    UFO_BEAM_MAX_BURST_TIME,
    UFO_BEAM_WIDTH,
    UFO_BEAM_Y_OFFSET,
    ALIEN_LASER_GUN_MIN_ROF,
    ALIEN_LASER_GUN_MAX_ROF,
    ALIEN_LASER_GUN_BULLET_SPEED,
    ALIEN_LASER_GUN_BULLET_DAMAGE,
    BEAM_CANNON_SHIELD_DAMAGE_MULTIPLIER,
    MISSILE_LAUNCHER_MISSILE_UFO_DAMAGE_MULTIPLIER,
}
from './configs.js';

export class Enemy extends CombatCharacter {
    constructor(game, bitmapName, x, y, speed, maxHealth) {
        super(game, bitmapName, x, y, maxHealth);

        this.speed = speed;
        this.direction = 1;
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

    likes(otherSprite) {
        return otherSprite instanceof Enemy;
    }
}

export class Alien extends Enemy {
    constructor(game, x, y) {
        super(game, 'alien', x, y, ALIEN_SPEED, ALIEN_MAX_HEALTH);

        this.angle = Math.PI;

        this.bulletBitmapName = 'alien_bullet';
    }

    update() {
        if (this.weapon === null) {
            this.#initWeapon();
        }

        super.update();

        const canvas = this.game.canvas;

        const aimX = randRange(0, canvas.width);
        const aimY = canvas.height;

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
        this.shieldBitmap = game.assets.get('shield');

        this.bulletBitmapName = 'alien_bullet_2';

        this.shieldIntegrity = ALIEN_SHIELD_MAX_INTEGRITY;
        this.shieldRegenTime = null;
    }

    update() {
        super.update();

        const now = this.game.now;

        if (this.shieldIntegrity <= 0) {
            if (this.shieldRegenTime === null) {
                this.shieldRegenTime = now + ALIEN_SHIELD_REGEN_TIME;
            }
            else if (now >= this.shieldRegenTime) {
                this.shieldIntegrity = ALIEN_SHIELD_MAX_INTEGRITY;
                this.shieldRegenTime = null;
            }
        }
    }

    takeDamage(inflictor, damage) {
        if (this.shieldIntegrity > 0) {
            if (inflictor instanceof BeamCannon) {
                damage *= BEAM_CANNON_SHIELD_DAMAGE_MULTIPLIER;
            }

            this.shieldIntegrity -= damage;

            if (this.shieldIntegrity < 0) {
                this.shieldIntegrity = 0;
            }
        }
        else {
            super.takeDamage(inflictor, damage);
        }
    }

    draw(ctx) {
        super.draw(ctx);

        if (this.shieldIntegrity > 0) {
            const shieldWidth = Math.max(this.getWidth(), this.getHeight());

            ctx.drawImage(
                this.shieldBitmap,
                this.getCenterX() - shieldWidth / 2,
                this.getCenterY() - shieldWidth / 2,
                shieldWidth, shieldWidth,
            );
        }
    }
}

export class UFO extends Enemy {
    constructor(game, x, y) {
        super(game, 'ufo', x, y, UFO_SPEED, UFO_MAX_HEALTH);

        this.nextBeamToggleTime = null;
        this.firing = false;
    }

    getWidth() {
        return super.getWidth() * UFO_SPRITE_SCALE;
    }

    getHeight() {
        return super.getWidth() * UFO_SPRITE_SCALE;
    }

    update() {
        const now = this.game.now;

        if (this.nextBeamToggleTime === null) {
            this.nextBeamToggleTime = now + randRange(
                UFO_BEAM_MIN_BURST_INTERVAL,
                UFO_BEAM_MAX_BURST_INTERVAL,
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
                    UFO_BEAM_MIN_BURST_INTERVAL,
                    UFO_BEAM_MAX_BURST_INTERVAL,
                );
            }
            else {
                this.nextBeamToggleTime = now + randRange(
                    UFO_BEAM_MIN_BURST_TIME,
                    UFO_BEAM_MAX_BURST_TIME,
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
            new BeamCannon(this.game, UFO_BEAM_CANNON_DAMAGE)
        );

        this.switchWeapon(weapon);
    }
}
