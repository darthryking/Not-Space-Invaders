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

    draw(ctx) {
        const halfWidth = this.getWidth() / 2;
        const halfHeight = this.getHeight() / 2;

        ctx.save();
        ctx.translate(this.x + halfWidth, this.y + halfHeight);
        ctx.rotate(this.angle);
        ctx.drawImage(this.bitmap, -halfWidth, -halfHeight);
        ctx.restore();
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
}
