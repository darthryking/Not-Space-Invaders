import {
    sleep,
    randRange,
}
from './utils.js';
import AssetManager from './assets.js';
import {
    Keyboard,
    Mouse
}
from './input.js';
import Player from './player.js';
import {
    LaserGun,
    BeamCannon,
    MissileLauncher,
}
from './weapons.js';
import {
    Alien,
    ShieldedAlien,
    UFO,
}
from './enemies.js';
import {
    FRAME_INTERVAL,
    PLAYER_LASER_GUN_ROF,
    PLAYER_LASER_GUN_BULLET_SPEED,
    PLAYER_LASER_GUN_BULLET_DAMAGE,
    PLAYER_BEAM_CANNON_BEAM_COLOR,
    PLAYER_BEAM_CANNON_BEAM_WIDTH,
    PLAYER_BEAM_CANNON_BEAM_DAMAGE,
    MISSILE_LAUNCHER_MISSILE_SPEED,
    MISSILE_LAUNCHER_MISSILE_SELF_DESTRUCT_DIST,
}
from './configs.js';

export default class Game {
    constructor() {
        this.canvas = document.getElementById('game');
        this.keyboard = new Keyboard();
        this.mouse = new Mouse(this.canvas);

        this.assets = new AssetManager();

        this.gameObjects = [];

        this.now = 0;
    }

    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
        return gameObject;
    }

    getActiveGameObjects() {
        const activeGameObjects = [];

        for (const gameObject of this.gameObjects) {
            if (gameObject.isAlive) {
                activeGameObjects.push(gameObject);
            }
        }

        return activeGameObjects;
    }

    cleanUpGameObjects() {
        this.gameObjects = this.getActiveGameObjects();
    }

    async run() {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');

        const keyboard = this.keyboard;
        const mouse = this.mouse;

        // Draw loading message
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48pt monospace';
        ctx.textAlign = 'center';
        ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2);

        // Load assets
        await this.assets.loadBitmap(
            'player',
            'assets/trucks.png',
            463, 211,
            138, 96,
        );
        await this.assets.loadBitmap(
            'alien',
            'assets/spaceships_spritesheet.png',
            24, 19,
            67, 80,
        );
        await this.assets.loadBitmap(
            'alien_2',
            'assets/spaceships_spritesheet.png',
            138, 17,
            67, 81,
        );
        await this.assets.loadBitmap(
            'ufo',
            'assets/ufo.png',
            0, 0,
            523, 484,
        );
        await this.assets.loadBitmap(
            'shield',
            'assets/spaceships_spritesheet.png',
            798, 344,
            114, 113,
        );
        await this.assets.loadBitmap(
            'bullet',
            'assets/bullets_spritesheet.png',
            61, 106,
            13, 13,
        );
        await this.assets.loadBitmap(
            'alien_bullet',
            'assets/bullets_spritesheet.png',
            153, 57,
            8, 21,
        );
        await this.assets.loadBitmap(
            'alien_bullet_2',
            'assets/bullets_spritesheet.png',
            61, 57,
            12, 21,
        );
        await this.assets.loadBitmap(
            'missile',
            'assets/bullets_spritesheet.png',
            240, 10,
            13, 26,
        );
        await this.assets.loadBitmap(
            'explosion',
            'assets/explosion.png',
            208, 18,
            63, 65,
        );

        // Initialize the player
        const player = this.addGameObject(new Player(this, 'player', 0, 0));
        player.x = canvas.width / 2 - player.getWidth() / 2;
        player.y = canvas.height - player.getHeight();

        // Initialize the player's weapons
        const laserGun = this.addGameObject(
            new LaserGun(
                this,
                PLAYER_LASER_GUN_ROF,
                'bullet',
                PLAYER_LASER_GUN_BULLET_SPEED,
                PLAYER_LASER_GUN_BULLET_DAMAGE,
            )
        );
        const beamCannon = this.addGameObject(
            new BeamCannon(
                this,
                PLAYER_BEAM_CANNON_BEAM_WIDTH,
                PLAYER_BEAM_CANNON_BEAM_COLOR,
                PLAYER_BEAM_CANNON_BEAM_DAMAGE,
            )
        );
        const missileLauncher = this.addGameObject(
            new MissileLauncher(
                this,
                MISSILE_LAUNCHER_MISSILE_SPEED,
                MISSILE_LAUNCHER_MISSILE_SELF_DESTRUCT_DIST,
            )
        );

        player.switchWeapon(laserGun);

        // Enemies
        const enemies = [
            new Alien(this, 100, 0),
            new Alien(this, 200, 0),
            new Alien(this, 300, 0),
            new Alien(this, 400, 0),
            new Alien(this, 500, 0),
            new ShieldedAlien(this, 50, 100),
            new ShieldedAlien(this, 150, 100),
            new ShieldedAlien(this, 250, 100),
            new ShieldedAlien(this, 350, 100),
            new ShieldedAlien(this, 450, 100),
            new ShieldedAlien(this, 550, 100),
            new UFO(this, 400, 200),
        ];
        for (const enemy of enemies) {
            this.addGameObject(enemy);
        }

        // Main loop
        while (true) {
            this.now = window.performance.now();
            const nextFrameTime = this.now + FRAME_INTERVAL;

            // Handle player input
            if (player.isAlive) {
                if (keyboard.isKeyPressed('a') ||
                    keyboard.isKeyPressed('ArrowLeft')) {
                    player.moveLeft();
                }
                else if (keyboard.isKeyPressed('d') ||
                    keyboard.isKeyPressed('ArrowRight')) {
                    player.moveRight();
                }

                if (keyboard.isKeyPressed('1')) {
                    player.switchWeapon(laserGun);
                }
                else if (keyboard.isKeyPressed('2')) {
                    player.switchWeapon(beamCannon);
                }
                else if (keyboard.isKeyPressed('3')) {
                    player.switchWeapon(missileLauncher);
                }

                player.weapon.aimAt(mouse.x, mouse.y);

                if (mouse.leftMouseDown) {
                    player.weapon.fire();
                }
                else {
                    player.weapon.updateNotFiring();
                }
            }

            // Update everything
            for (const gameObject of this.gameObjects) {
                if (gameObject.isAlive) {
                    gameObject.update();
                }
            }
            this.cleanUpGameObjects();

            // Draw everything
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (const gameObject of this.gameObjects) {
                gameObject.draw(ctx);
            }

            if (!player.isAlive) {
                ctx.fillStyle = '#FF0000';
                ctx.font = '48pt sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("lol u ded", canvas.width / 2, canvas.height / 2);
            }

            // Wait for next frame
            await sleep(nextFrameTime - window.performance.now());
        }
    }
}

const game = new Game();
game.run();
