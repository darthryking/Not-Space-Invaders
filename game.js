class Game extends Phaser.Scene {
    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet(
            'dude',
            'assets/dude.png',
            {
                frameWidth: 32,
                frameHeight: 48
            }
        );
    }

    create() {
        this.add.image(400, 300, 'sky');
    }

    update() {

    }
}


const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Game,
    parent: 'game',
});
