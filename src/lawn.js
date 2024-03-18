import {
    randRange
}
from './utils.js';
import {
    Renderable
}
from './gameObjects.js';
import {
    MAX_HEALED_LAWN_SEGMENTS
}
from './configs.js';

export default class LawnSegment extends Renderable {
    constructor(game, x, y, width, height) {
        super(game, x, y);

        this.width = width;
        this.height = height;

        this.isAlive = true;

        /* Can be green (2), brown (1), or dead (0) */
        this.maxHealth = 2;
        this.health = this.maxHealth;
    }

    draw(ctx) {
        if (this.health < 1) {
            return;
        }

        if (this.health === 2) {
            ctx.fillStyle = '#33CC33';
        }
        else {
            ctx.fillStyle = '#996633';
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

export const restoreLawn = (game) => {
    const topRowDestroyedLawn = [];
    const topRowDamagedLawn = [];
    const bottomRowDamagedLawn = [];
    const bottomRowDestroyedLawn = [];

    for (const lawnSegment of game.lawn) {
        const lawnHealth = lawnSegment.health;
        if (lawnHealth >= lawnSegment.maxHealth) {
            continue;
        }

        const isAtBottom = lawnSegment.getBottom() == game.getBottom();
        const isDamaged = lawnHealth < lawnSegment.maxHealth;
        const isDestroyed = lawnHealth == 0;

        if (isAtBottom) {
            if (isDestroyed) {
                bottomRowDestroyedLawn.push(lawnSegment);
            }
            else if (isDamaged) {
                bottomRowDamagedLawn.push(lawnSegment);
            }
        }
        else {
            if (isDestroyed) {
                topRowDestroyedLawn.push(lawnSegment);
            }
            else if (isDamaged) {
                topRowDamagedLawn.push(lawnSegment);
            }
        }
    }

    for (let i = 0; i < MAX_HEALED_LAWN_SEGMENTS; i++) {
        let damagedLawn;

        if (bottomRowDestroyedLawn.length > 0) {
            damagedLawn = bottomRowDestroyedLawn;
        }
        else if (bottomRowDamagedLawn.length > 0) {
            damagedLawn = bottomRowDamagedLawn;
        }
        else if (topRowDestroyedLawn.length > 0) {
            damagedLawn = topRowDestroyedLawn;
        }
        else if (topRowDamagedLawn.length > 0) {
            damagedLawn = topRowDamagedLawn;
        }
        else {
            break;
        }

        const indexToRestore = Math.trunc(randRange(0, damagedLawn.length));
        const lawnToRestore = damagedLawn[indexToRestore];

        if (!lawnToRestore.isAlive) {
            lawnToRestore.isAlive = true;
            game.addGameObject(lawnToRestore);
        }

        lawnToRestore.health = lawnToRestore.maxHealth;

        damagedLawn.splice(indexToRestore, 1);
    }
};
