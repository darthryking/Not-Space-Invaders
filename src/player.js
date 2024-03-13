import {
    CombatCharacter
}
from './weapons.js';
import {
    PLAYER_SPEED,
    PLAYER_MAX_HEALTH,
}
from './configs.js';

export default class Player extends CombatCharacter {
    constructor(game, bitmapName, x, y) {
        super(game, bitmapName, x, y, PLAYER_MAX_HEALTH);

        this.speed = PLAYER_SPEED;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    moveRight() {
        this.x += this.speed;
    }

    clampToBounds(left, right) {
        this.x = Math.max(this.x, left);
        this.x = Math.min(this.x, right - this.getWidth());
    }

    getFirePos() {
        return [this.getCenterX(), this.getTop()];
    }
}
