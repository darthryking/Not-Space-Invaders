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
    BeamCannon
}
from './weapons.js';

const FRAMERATE = 60; // FPS
const FRAME_INTERVAL = 1000 / FRAMERATE; // ms per frame

const PLAYER_SPEED = 5; // Pixels per frame

const LASER_GUN_ROF = 3; // Shots per second
const LASER_GUN_BULLET_SPEED = 10; // px per frame

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

        // Initialize the player
        const player = this.addGameObject(
            new Player(this, 'player', 0, 0, PLAYER_SPEED)
        );
        player.x = canvas.width / 2 - player.getWidth() / 2;
        player.y = canvas.height - player.getHeight();

        // Initialize the player's weapons
        const laserGun = this.addGameObject(
            new LaserGun(
                this, player,
                LASER_GUN_ROF,
                LASER_GUN_BULLET_SPEED,
            )
        );
        const beamCannon = this.addGameObject(
            new BeamCannon(this, player)
        );

        let currentWeapon = laserGun;
        const switchWeapon = (now, weapon) => {
            currentWeapon.updateNotFiring(now);
            currentWeapon = weapon;
        };

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
                switchWeapon(now, laserGun);
            }
            else if (keyboard.isKeyPressed('2')) {
                switchWeapon(now, beamCannon);
            }

            if (mouse.leftMouseDown) {
                currentWeapon.fire(now, mouse.x, mouse.y);
            }
            else {
                currentWeapon.updateNotFiring(now);
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
