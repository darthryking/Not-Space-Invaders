import {
    CombatCharacter
}
from './weapons.js';

export default class Player extends CombatCharacter {
    constructor(game, bitmapName, x, y, speed) {
        super(game, bitmapName, x, y);

        this.speed = speed;
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
