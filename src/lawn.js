import {
    Renderable
}
from './gameObjects.js';

export default class LawnSegment extends Renderable {
    constructor(game, x, y, width, height) {
        super(game, x, y);

        this.width = width;
        this.height = height;

        /* Can be green (2), brown (1), or dead (0) */
        this.isAlive = true;
        this.health = 2;
    }

    draw(ctx) {
        if (this.health < 1) {
            return;
        }

        if (this.health === 2) {
            ctx.fillStyle = 'green';
        }
        else {
            ctx.fillStyle = 'brown';
        }

        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    takeDamage(inflictor, damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
    }
}
