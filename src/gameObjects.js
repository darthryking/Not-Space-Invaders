import {
    rectIntersectsRect
}
from './utils.js';
import {
    DEBUG_SHOW_BOUNDING_BOXES
}
from './configs.js'

export default class GameObject {
    constructor(game, x, y) {
        this.game = game;
        this.isAlive = true;
    }

    update() {
        // no-op
    }

    remove() {
        this.isAlive = false;
    }
}

export class Renderable extends GameObject {
    constructor(game, x, y) {
        super(game);

        this.x = x;
        this.y = y;
    }

    update() {
        for (const gameObject of this.game.getActiveGameObjects()) {
            if (gameObject === this) {
                continue;
            }

            if (!(gameObject instanceof Renderable)) {
                continue;
            }

            if (!this.intersectsWith(gameObject)) {
                continue;
            }

            if (!this.shouldCollideWith(gameObject)) {
                continue;
            }

            this.onCollision(gameObject);
        }
    }

    draw(ctx) {
        throw new Error(".draw() not implemented!");
    }

    getWidth() {
        throw new Error(".getWidth() not implemented!");
    }

    getHeight() {
        throw new Error(".getHeight() not implemented!");
    }

    getLeft() {
        return this.x;
    }

    getRight() {
        return this.x + this.getWidth();
    }

    getTop() {
        return this.y;
    }

    getBottom() {
        return this.y + this.getHeight();
    }

    getCenterX() {
        return this.x + this.getWidth() / 2;
    }

    getCenterY() {
        return this.y + this.getHeight() / 2;
    }

    setCenter(centerX, centerY) {
        this.x = centerX - this.getWidth() / 2;
        this.y = centerY - this.getHeight() / 2;
    }

    getCenter() {
        return [this.getCenterX(), this.getCenterY()];
    }

    getCorners() {
        return [
            [this.getLeft(), this.getTop()],
            [this.getRight(), this.getTop()],
            [this.getLeft(), this.getBottom()],
            [this.getRight(), this.getBottom()],
        ];
    }

    isOnScreen() {
        const canvas = this.game.canvas;

        if (this.getRight() < 0) {
            return false;
        }

        if (this.getLeft() > canvas.width) {
            return false;
        }

        if (this.getBottom() < 0) {
            return false;
        }

        if (this.getTop() > canvas.height) {
            return false;
        }

        return true;
    }

    intersectsWith(other) {
        return rectIntersectsRect(
            this.x, this.y, this.getWidth(), this.getHeight(),
            other.x, other.y, other.getWidth(), other.getHeight(),
        );
    }

    shouldCollideWith(other) {
        return true;
    }

    onCollision(other) {
        // no-op
    }

    takeDamage(inflictor, damage) {
        // no-op
    }
}

export class Sprite extends Renderable {
    constructor(game, bitmapName, x, y) {
        super(game, x, y);

        this.bitmap = game.assets.get(bitmapName);
        this.angle = 0;
    }

    getWidth() {
        return this.bitmap.width;
    }

    getHeight() {
        return this.bitmap.height;
    }

    draw(ctx) {
        const width = this.getWidth();
        const height = this.getHeight();

        const halfWidth = width / 2;
        const halfHeight = height / 2;

        ctx.save();
        ctx.translate(this.x + halfWidth, this.y + halfHeight);
        ctx.rotate(this.angle);
        ctx.drawImage(this.bitmap, -halfWidth, -halfHeight, width, height);
        ctx.restore();

        if (DEBUG_SHOW_BOUNDING_BOXES) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1;
            ctx.lineJoin = 'butt';

            ctx.strokeRect(this.x, this.y, width, height);
        }
    }
}
