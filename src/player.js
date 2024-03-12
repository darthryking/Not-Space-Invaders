import {
    Sprite
}
from './gameObjects.js';

export default class Player extends Sprite {
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
