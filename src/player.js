import {
    CombatCharacter
}
from './weapons.js';
import {
    Sprite
}
from './gameObjects.js';
import {
    PLAYER_SPEED,
    PLAYER_MAX_HEALTH,
    PLAYER_WEAPON_OFFSET_X,
}
from './configs.js';

export default class Player extends CombatCharacter {
    constructor(game, bitmapName, x, y) {
        super(game, bitmapName, x, y, PLAYER_MAX_HEALTH);

        this.extraLives = 0;

        this.speed = PLAYER_SPEED;
        this.money = 0;

        this.hasBeamCannon = false;
        this.hasMissileLauncher = false;
    }

    takeDamage(inflictor, damage) {
        this.health -= damage;

        if (this.health <= 0) {
            // Drop a "corpse"
            const corpse = new Sprite(
                this.game,
                'player_destroyed',
                this.x, this.y,
            );
            corpse.y = this.game.getBottom() - corpse.getHeight();

            // Add the corpse to the front so it renders below everything
            this.game.gameObjects.unshift(corpse);

            if (this.extraLives > 0) {
                this.extraLives--;
                this.health = this.maxHealth;
                this.x = this.game.getRight() / 2 - this.getWidth() / 2;
            }
            else {
                this.remove();
            }
        }
    }

    moveLeft() {
        this.x -= this.speed;

        if (this.x <= 0) {
            this.x = 0;
        }
    }

    moveRight() {
        this.x += this.speed;

        const canvasWidth = this.game.canvas.width;

        if (this.getRight() > canvasWidth) {
            this.x = canvasWidth - this.getWidth();
        }
    }

    getFirePos() {
        return [this.getCenterX() + PLAYER_WEAPON_OFFSET_X, this.getTop()];
    }
}
