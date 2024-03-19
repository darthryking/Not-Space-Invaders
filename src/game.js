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
import {
    Renderable,
}
from './gameObjects.js';
import LawnSegment, {
    restoreLawn
}
from './lawn.js';
import Player from './player.js';
import {
    LaserGun,
    BeamCannon,
    MissileLauncher,
}
from './weapons.js';
import EnemyManager from './waves.js';
import Shop from './shop.js';
import {
    BottomBar,
    writeText,
}
from './ui.js';
import {
    FRAME_INTERVAL,
    PLAYER_LASER_GUN_ROF,
    PLAYER_LASER_GUN_BULLET_SPEED,
    PLAYER_LASER_GUN_BULLET_DAMAGE,
    BEAM_CANNON_MAX_CHARGE_REFILLS,
    PLAYER_BEAM_CANNON_BEAM_COLOR,
    PLAYER_BEAM_CANNON_BEAM_WIDTH,
    PLAYER_BEAM_CANNON_BEAM_DAMAGE,
    MISSILE_LAUNCHER_MISSILE_SPEED,
    MISSILE_LAUNCHER_MISSILE_SELF_DESTRUCT_DIST,
    SHOP_Y,
    SHOP_WIDTH,
    SHOP_HEIGHT,
    BEAM_CANNON_NAME,
    MISSILE_LAUNCHER_NAME,
    BEAM_CANNON_AMMO_NAME,
    MISSILE_AMMO_NAME,
    LAWN_FERTILIZER_NAME,
    EXTRA_LIFE_NAME,
    BEAM_CANNON_PRICE,
    MISSILE_LAUNCHER_PRICE,
    BEAM_CANNON_AMMO_PRICE,
    MISSILE_AMMO_PRICE,
    LAWN_FERTILIZER_PRICE,
    EXTRA_LIFE_PRICE,
    BOTTOM_BAR_HEIGHT,
    LAWN_HEIGHT,
    NUM_LAWN_SEGMENTS,
}
from './configs.js';

export default class Game {
    constructor() {
        this.canvas = document.getElementById('game');
        this.keyboard = new Keyboard();
        this.mouse = new Mouse(this.canvas);

        this.assets = new AssetManager();

        this.player = null;
        this.lawn = [];

        this.gameObjects = [];

        this.loseMessage = null;

        this.now = 0;
    }

    getLeft() {
        return 0;
    }

    getRight() {
        return this.canvas.width;
    }

    getTop() {
        return 0;
    }

    getBottom() {
        return this.canvas.height - BOTTOM_BAR_HEIGHT;
    }

    async loadAssets() {
        await this.assets.loadBitmap(
            'player',
            'assets/trucks.png',
            463, 211,
            138, 96,
        );
        await this.assets.loadBitmap(
            'player_destroyed',
            'assets/trucks.png',
            956, 668,
            143, 84,
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
            'mothership',
            'assets/boss_2.png',
            0, 0,
            89, 33,
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
            'meteor',
            'assets/meteor.png',
            2, 16,
            204, 370,
        );
        await this.assets.loadBitmap(
            'explosion',
            'assets/explosion.png',
            208, 18,
            63, 65,
        );
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

    getLivingLawnSegments() {
        const livingLawnSegments = [];

        for (const lawnSegment of this.lawn) {
            if (lawnSegment.isAlive) {
                livingLawnSegments.push(lawnSegment);
            }
        }

        return livingLawnSegments;
    }

    movePlayerToFront() {
        const gameObjects = this.gameObjects;

        let playerIndex = -1;

        for (let i = 0; i < gameObjects.length; i++) {
            if (gameObjects[i] === this.player) {
                playerIndex = i;
                break;
            }
        }

        if (playerIndex === -1) {
            return;
        }

        gameObjects.splice(playerIndex, 1);
        gameObjects.push(this.player);
    }

    async run() {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');

        const keyboard = this.keyboard;
        const mouse = this.mouse;

        /* Draw loading message */
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        writeText(
            ctx,
            canvas.width / 2, canvas.height / 2,
            "Loading...",
            '48pt monospace', '#FFFFFF', 'center'
        );

        await this.loadAssets();

        /* Initialize the Lawn */
        const lawnWidth = canvas.width / NUM_LAWN_SEGMENTS;
        for (let i = 0; i < NUM_LAWN_SEGMENTS; i++) {
            this.lawn.push(
                this.addGameObject(
                    new LawnSegment(
                        this,
                        lawnWidth * i, this.getBottom() - LAWN_HEIGHT,
                        lawnWidth, LAWN_HEIGHT,
                    )
                )
            );
            this.lawn.push(
                this.addGameObject(
                    new LawnSegment(
                        this, lawnWidth * i, this.getBottom() - LAWN_HEIGHT * 2,
                        lawnWidth, LAWN_HEIGHT,
                    )
                )
            );
        }

        /* Initialize the player */
        const player = this.addGameObject(new Player(this, 'player', 0, 0));
        player.x = this.getRight() / 2 - player.getWidth() / 2;
        player.y = this.getBottom() - player.getHeight();

        this.player = player;

        /* Initialize the player's weapons */
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

        /* Initialize the UI */
        const bottomBar = new BottomBar(
            this,
            0, this.getBottom(),
            this.canvas.width, BOTTOM_BAR_HEIGHT,
        );

        /* Initialize the Shop */
        const shop = new Shop(
            this,
            canvas.width / 2 - SHOP_WIDTH / 2,
            SHOP_Y,
            SHOP_WIDTH, SHOP_HEIGHT,
        );

        shop.addOption(
            BEAM_CANNON_NAME, BEAM_CANNON_PRICE,
            () => {
                if (player.hasBeamCannon) {
                    return "Already Owned";
                }
                else {
                    return null;
                }
            },
            () => {
                player.hasBeamCannon = true;
            },
        );
        shop.addOption(
            MISSILE_LAUNCHER_NAME, MISSILE_LAUNCHER_PRICE,
            () => {
                if (player.hasMissileLauncher) {
                    return "Already Owned";
                }
                else {
                    return null;
                }
            },
            () => {
                player.hasMissileLauncher = true;
            },
        );
        shop.addOption(
            BEAM_CANNON_AMMO_NAME, BEAM_CANNON_AMMO_PRICE,
            () => {
                if (!player.hasBeamCannon) {
                    return "Beam Cannon Required";
                }
                else if (beamCannon.numRefills >=
                    BEAM_CANNON_MAX_CHARGE_REFILLS) {
                    return "Max Batteries Owned";
                }
                else {
                    return null;
                }
            },
            () => {
                beamCannon.addRefill();
            },
        );
        shop.addOption(
            MISSILE_AMMO_NAME, MISSILE_AMMO_PRICE,
            () => {
                if (!player.hasMissileLauncher) {
                    return "Missile Launcher Required";
                }
                else if (missileLauncher.ammo >= missileLauncher.maxAmmo) {
                    return "Max Missiles Owned";
                }
                else {
                    return null;
                }
            },
            () => {
                missileLauncher.ammo++;
            },
        );
        shop.addOption(
            LAWN_FERTILIZER_NAME, LAWN_FERTILIZER_PRICE,
            () => {
                for (const lawnSegment of this.lawn) {
                    if (lawnSegment.health < lawnSegment.maxHealth) {
                        return null;
                    }
                }
                return "Lawn Needs No Fertilizer";
            },
            () => {
                restoreLawn(this);
                this.movePlayerToFront();
            },
        );
        shop.addOption(
            EXTRA_LIFE_NAME, EXTRA_LIFE_PRICE,
            () => null,
            () => {
                player.extraLives++;
            },
        );

        /* Initialize Enemies */
        const enemyManager = this.addGameObject(new EnemyManager(this));

        /* Main loop */
        while (true) {
            this.now = window.performance.now();
            const nextFrameTime = this.now + FRAME_INTERVAL;

            /* Handle player input */
            if (this.loseMessage === null) {
                if (!shop.isActive) {
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
                    else if (keyboard.isKeyPressed('2') &&
                        player.hasBeamCannon) {
                        player.switchWeapon(beamCannon);
                    }
                    else if (keyboard.isKeyPressed('3') &&
                        player.hasMissileLauncher) {
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
                else {
                    for (let i = 0; i < shop.getNumOptions(); i++) {
                        const keyName = `${i + 1}`;
                        if (keyboard.isKeyJustPressed(keyName)) {
                            shop.buy(i);
                            break;
                        }
                    }
                }

                if (keyboard.isKeyJustPressed('b')) {
                    shop.isActive = !shop.isActive;
                }
            }

            /* Update all the game objects */
            for (const gameObject of this.gameObjects) {
                if (gameObject.isAlive) {
                    gameObject.update();
                }
            }
            this.cleanUpGameObjects();

            /* Have we lost yet? */
            if (this.loseMessage === null) {
                if (!this.player.isAlive) {
                    this.loseMessage = "lol u ded";
                }
                else if (this.getLivingLawnSegments().length <= 0) {
                    this.loseMessage = "the lawn died :(";
                }
            }

            /* Clear the screen */
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            /* Draw all renderable game objects */
            for (const gameObject of this.gameObjects) {
                if (gameObject instanceof Renderable) {
                    gameObject.draw(ctx);
                }
            }

            /* Draw the HUD */
            bottomBar.draw(ctx);

            /* Draw the lose message (if we've lost) */
            if (this.loseMessage !== null) {
                writeText(
                    ctx,
                    canvas.width / 2, canvas.height / 2,
                    this.loseMessage,
                    '48pt sans-serif', '#FF0000', 'center',
                );

                shop.isActive = false;
            }

            /* Draw the Shop */
            shop.draw(ctx);

            /* Wait for next frame */
            await sleep(nextFrameTime - window.performance.now());
        }
    }
}

const game = new Game();
game.run();
