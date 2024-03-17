import {
    DEBUG_SHOW_BOUNDING_BOXES
}
from './configs.js'

export default class GameObject {
    constructor(game, x, y) {
        this.game = game;
        this.isAlive = true;
        this.x = x;
        this.y = y; 
    }

    update() {
        // no-op
    }

    draw(ctx) {
        // no-op
    }

    remove() {
        this.isAlive = false;
    }

    getWidth() {
        // no-op, must implement in subclass
    }

    getHeight() {
        // no-op, must implement in subclass
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

    onCollision(otherSprite) {
        // no-op
    }
}

export class LawnSegment extends GameObject {
    constructor(game, x, y, width, height) {
        super(game);

        this.x = x;
        this.y = y;
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
        } else {
            ctx.fillStyle = 'brown'; 
        }

        ctx.fillRect(this.x, this.y, this.width, this.height); 
    }

    update(ctx) {
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

export class Sprite extends GameObject {
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

    update() {
        for (const gameObject of this.game.getActiveGameObjects()) {
            if (gameObject !== this &&
                (gameObject instanceof Sprite || gameObject instanceof LawnSegment) &&
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
        ctx.drawImage(this.bitmap, -halfWidth, -halfHeight, width, height);
        ctx.restore();

        if (DEBUG_SHOW_BOUNDING_BOXES) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1;
            ctx.lineJoin = 'butt';

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
}
