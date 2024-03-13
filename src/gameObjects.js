import {
    DEBUG_SHOW_BOUNDING_BOXES
}
from './configs.js'

export default class GameObject {
    constructor(game) {
        this.game = game;
        this.isAlive = true;
    }

    update(now) {
        // no-op
    }

    draw(ctx) {
        // no-op
    }

    remove() {
        this.isAlive = false;
    }
}

export class Sprite extends GameObject {
    constructor(game, bitmapName, x, y) {
        super(game);

        this.bitmap = game.assets.get(bitmapName);
        this.x = x;
        this.y = y;

        this.angle = 0;
    }

    getWidth() {
        return this.bitmap.width;
    }

    getHeight() {
        return this.bitmap.height;
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
        return this.y + this.getWidth();
    }

    getCenterX() {
        return this.x + this.getWidth() / 2;
    }

    getCenterY() {
        return this.y + this.getHeight() / 2;
    }

    getCenter() {
        return [this.getCenterX(), this.getCenterY()];
    }

    update(now) {
        for (const gameObject of this.game.getActiveGameObjects()) {
            if (gameObject !== this &&
                gameObject instanceof Sprite &&
                this.collidesWith(gameObject)) {
                this.onCollision(gameObject);
            }
        }
    }

    draw(ctx) {
        const width = this.getWidth();
        const height = this.getHeight();

        const halfWidth = width / 2;
        const halfHeight = height / 2;

        ctx.save();
        ctx.translate(this.x + halfWidth, this.y + halfHeight);
        ctx.rotate(this.angle);
        ctx.drawImage(this.bitmap, -halfWidth, -halfHeight);
        ctx.restore();

        if (DEBUG_SHOW_BOUNDING_BOXES) {
            ctx.strokeStyle = '#FF0000';
            ctx.strokeRect(this.x, this.y, width, height);
        }
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

    collidesWith(otherSprite) {
        if (this.getRight() < otherSprite.getLeft()) {
            return false;
        }

        if (this.getLeft() > otherSprite.getRight()) {
            return false;
        }

        if (this.getTop() > otherSprite.getBottom()) {
            return false;
        }

        if (this.getBottom() < otherSprite.getTop()) {
            return false;
        }

        return true;
    }

    onCollision(otherSprite) {
        // no-op
    }
}
