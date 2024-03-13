import {
    randRange
}
from './utils.js';
import {
    CombatCharacter,
    LaserGun,
}
from './weapons.js';
import {
    ALIEN_SPEED,
    ALIEN_MAX_HEALTH,
    ALIEN_LASER_GUN_MIN_ROF,
    ALIEN_LASER_GUN_MAX_ROF,
    ALIEN_LASER_GUN_BULLET_SPEED,
    ALIEN_LASER_GUN_BULLET_DAMAGE,
}
from './configs.js';

export default class Enemy extends CombatCharacter {
    constructor(game, bitmapName, x, y) {
        super(game, bitmapName, x, y);
    }
}

export class Alien extends Enemy {
    constructor(game, x, y) {
        super(game, 'alien', x, y, ALIEN_MAX_HEALTH);

        this.angle = Math.PI;

        this.speed = ALIEN_SPEED;
        this.direction = 1;
    }

    update(now) {
        if (this.weapon === null) {
            this.#initWeapon(now);
        }

        const canvas = this.game.canvas;

        this.x += this.speed * this.direction;

        if (this.getRight() > canvas.width) {
            this.x = canvas.width - this.getWidth();
            this.direction = -1;
        }
        else if (this.getLeft() < 0) {
            this.x = 0;
            this.direction = 1;
        }

        const aimX = randRange(0, canvas.width);
        const aimY = canvas.height;

        this.weapon.fire(now, aimX, aimY);
    }

    draw(ctx) {
        super.draw(ctx);

        // const [firePosX, firePosY] = this.getFirePos();

        // ctx.fillStyle = '#FF0000';
        // ctx.beginPath();
        // ctx.ellipse(firePosX, firePosY, 10, 10, 0, Math.PI * 2, 0);
        // ctx.fill();
    }

    getFirePos() {
        return [this.getCenterX(), this.getBottom()];
    }

    #initWeapon(now) {
        const weapon = new LaserGun(
            this.game,
            randRange(ALIEN_LASER_GUN_MIN_ROF, ALIEN_LASER_GUN_MAX_ROF),
            ALIEN_LASER_GUN_BULLET_SPEED,
            ALIEN_LASER_GUN_BULLET_DAMAGE,
        );

        this.switchWeapon(now, weapon);
    }
}
