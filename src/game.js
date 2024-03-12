import Player from './player.js';
import {
    LaserGun,
    BeamCannon,
}
from './weapons.js';

window.GAME_WIDTH = 800;
window.GAME_HEIGHT = 600;

class Game extends Phaser.Scene {
    preload() {
        // Load spaceships sprite sheet
        this.load.spritesheet('spaceships', 'assets/spaceships_spritesheet.png', {
            frameWidth: 120,
            frameHeight: 120,
        });

        // Load bullets sprite sheet
        this.load.spritesheet('bullets', 'assets/bullets_spritesheet.png', {
            frameWidth: 45,
            frameHeight: 45,
        });
    }

    create() {
        this.player = new Player(this, 100, 100, 0, 0);

        this.currentWeapon = null;
        this.weapons = [
            new LaserGun(this, this.player),
            new BeamCannon(this, this.player),
        ];
        this.switchWeapon(0);

        const keyboard = this.input.keyboard;

        this.keys = {
            a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            num1: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            num2: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            num3: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
        };
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        const keys = this.keys;
        const cursors = this.cursors;

        if (cursors.left.isDown || keys.a.isDown) {
            this.player.moveLeft();
        }
        else if (cursors.right.isDown || keys.d.isDown) {
            this.player.moveRight();
        }

        if (Phaser.Input.Keyboard.JustDown(keys.num1)) {
            this.switchWeapon(0);
        }
        else if (Phaser.Input.Keyboard.JustDown(keys.num2)) {
            this.switchWeapon(1);
        }
        else if (Phaser.Input.Keyboard.JustDown(keys.num3)) {
            // this.switchWeapon(2);
        }

        const [mouseX, mouseY] = this.getMousePos();

        if (this.input.activePointer.leftButtonDown()) {
            this.currentWeapon?.fire(mouseX, mouseY);
        }
        else {
            this.currentWeapon?.updateNotFiring(mouseX, mouseY);
        }
    }

    switchWeapon(index) {
        if (index >= this.weapons.length) {
            return;
        }

        if (this.currentWeapon !== null) {
            const [mouseX, mouseY] = this.getMousePos();
            this.currentWeapon.updateNotFiring(mouseX, mouseY);
            this.currentWeapon.isActive = false;
        }

        this.currentWeapon = this.weapons[index];
        this.currentWeapon.isActive = true;

        console.log("Switched to " + this.currentWeapon.name);
    }

    getMousePos() {
        const activePointer = this.input.activePointer;
        return [activePointer.x, activePointer.y];
    }
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: Game,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {},
            debug: false
        }
    },
});
