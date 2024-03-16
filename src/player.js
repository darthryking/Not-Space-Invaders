import {
    CombatCharacter
}
from './weapons.js';
import {
    PLAYER_SPEED,
    PLAYER_MAX_HEALTH,
    PLAYER_WEAPON_OFFSET_X,
}
from './configs.js';

export default class Player extends CombatCharacter {
    constructor(game, bitmapName, x, y) {
        super(game, bitmapName, x, y, PLAYER_MAX_HEALTH);

        this.speed = PLAYER_SPEED;
        this.money = 0;
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
