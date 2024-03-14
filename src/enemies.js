import {
    randRange
}
from './utils.js';
import {
    CombatCharacter,
    LaserGun,
    BeamCannon,
}
from './weapons.js';
import {
    ALIEN_SPEED,
    ALIEN_MAX_HEALTH,
    ALIEN_SHIELD_MAX_INTEGRITY,
    ALIEN_SHIELD_REGEN_TIME,
    ALIEN_LASER_GUN_MIN_ROF,
    ALIEN_LASER_GUN_MAX_ROF,
    ALIEN_LASER_GUN_BULLET_SPEED,
    ALIEN_LASER_GUN_BULLET_DAMAGE,
    BEAM_CANNON_SHIELD_DAMAGE_MULTIPLIER,
}
from './configs.js';

export class Enemy extends CombatCharacter {
    likes(otherSprite) {
        return otherSprite instanceof Enemy;
    }
}

export class Alien extends Enemy {
    constructor(game, x, y) {
        super(game, 'alien', x, y, ALIEN_MAX_HEALTH);

        this.angle = Math.PI;

        this.speed = ALIEN_SPEED;
        this.direction = 1;

        this.bulletBitmapName = 'alien_bullet';
    }

    update(now) {
        if (this.weapon === null) {
            this.#initWeapon(now);
        }

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

        const aimX = randRange(0, canvas.width);
        const aimY = canvas.height;

        this.weapon.fire(now, aimX, aimY);

        super.update(now);
    }

    getFirePos() {
        return [this.getCenterX(), this.getBottom()];
    }

    #initWeapon(now) {
        const weapon = new LaserGun(
            this.game,
            randRange(ALIEN_LASER_GUN_MIN_ROF, ALIEN_LASER_GUN_MAX_ROF),
            this.bulletBitmapName,
            ALIEN_LASER_GUN_BULLET_SPEED,
            ALIEN_LASER_GUN_BULLET_DAMAGE,
        );

        weapon.nextShotTime = now + weapon.getShotIntervalMs();

        this.switchWeapon(now, weapon);
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

    update(now) {
        super.update(now);

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
