import {
    sleep
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

const FRAMERATE = 60; // FPS
const FRAME_INTERVAL = 1000 / FRAMERATE; // ms per frame

const PLAYER_SPEED = 5; // Pixels per frame

const LASER_GUN_ROF = 3; // Shots per second
const LASER_GUN_BULLET_SPEED = 10; // px per frame

const MISSILE_LAUNCHER_MISSILE_SPEED = 10; // px per frame

// Distance to the mouse that the missile will explode, in px
const MISSILE_LAUNCHER_MISSILE_SELF_DESTRUCT_DIST = 10;

export default class Game {
    constructor() {
        this.canvas = document.getElementById('game');
        this.keyboard = new Keyboard();
        this.mouse = new Mouse(this.canvas);

        this.assets = new AssetManager();

        this.gameObjects = [];
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
            'assets/spaceships_spritesheet.png',
            820, 22,
            69, 71,
        );
        await this.assets.loadBitmap(
            'bullet',
            'assets/bullets_spritesheet.png',
            153, 57,
            8, 21,
        );
        await this.assets.loadBitmap(
            'missile',
            'assets/bullets_spritesheet.png',
            240, 10,
            13, 26,
        );

        // Initialize the player
        const player = this.addGameObject(
            new Player(this, 'player', 0, 0, PLAYER_SPEED)
        );
        player.x = canvas.width / 2 - player.getWidth() / 2;
        player.y = canvas.height - player.getHeight();

        // Initialize the player's weapons
        const laserGun = this.addGameObject(
            new LaserGun(
                this,
                LASER_GUN_ROF,
                LASER_GUN_BULLET_SPEED,
            )
        );
        const beamCannon = this.addGameObject(
            new BeamCannon(this)
        );
        const missileLauncher = this.addGameObject(
            new MissileLauncher(
                this,
                MISSILE_LAUNCHER_MISSILE_SPEED,
                MISSILE_LAUNCHER_MISSILE_SELF_DESTRUCT_DIST,
            )
        );

        player.switchWeapon(0, laserGun);

        // Main loop
        while (true) {
            const now = window.performance.now();
            const nextFrameTime = now + FRAME_INTERVAL;

            // Handle player input
            if (keyboard.isKeyPressed('a') ||
                keyboard.isKeyPressed('ArrowLeft')) {
                player.moveLeft();
                player.clampToBounds(0, canvas.width);
            }
            else if (keyboard.isKeyPressed('d') ||
                keyboard.isKeyPressed('ArrowRight')) {
                player.moveRight();
                player.clampToBounds(0, canvas.width);
            }

            if (keyboard.isKeyPressed('1')) {
                player.switchWeapon(now, laserGun);
            }
            else if (keyboard.isKeyPressed('2')) {
                player.switchWeapon(now, beamCannon);
            }
            else if (keyboard.isKeyPressed('3')) {
                player.switchWeapon(now, missileLauncher);
            }

            if (mouse.leftMouseDown) {
                player.weapon.fire(now, mouse.x, mouse.y);
            }
            else {
                player.weapon.updateNotFiring(now, mouse.x, mouse.y);
            }

            // Update everything
            for (const gameObject of this.gameObjects) {
                gameObject.update(now);
            }
            this.cleanUpGameObjects();

            // Draw everything
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (const gameObject of this.gameObjects) {
                gameObject.draw(ctx);
            }

            // Wait for next frame
            await sleep(nextFrameTime - window.performance.now());
        }
    }
}

const game = new Game();
game.run();
