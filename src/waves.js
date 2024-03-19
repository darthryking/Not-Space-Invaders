import {
    randRange
}
from './utils.js';
import {
    writeText
}
from './ui.js';
import {
    Renderable
}
from './gameObjects.js';
import {
    Enemy,
    Alien,
    ShieldedAlien,
    UFO,
    Mothership,
    Meteor,
}
from './enemies.js';
import {
    WAVE_SPAWN_DELAY
}
from './configs.js';

export default class EnemyManager extends Renderable {
    #nextWaveTime;
    #waves;
    #maxGeneratedEnemies;

    constructor(game) {
        super(game, 0, 0);

        this.currentWaveIndex = 0;
        this.currentWave = [];
        this.#nextWaveTime = WAVE_SPAWN_DELAY;

        this.#waves = [];
        this.#maxGeneratedEnemies = 5;

        this.addWave([
            new Alien(game, 100, 0),
        ]);
        this.addWave([
            new Alien(game, 100, 0),
            new Alien(game, 200, 0),
            new Alien(game, 300, 0),
            new Alien(game, 400, 0),
            new Alien(game, 500, 0),
        ]);
        this.addWave([
            new Alien(game, 100, 0),
            new Alien(game, 200, 0),
            new Alien(game, 300, 0),
            new Alien(game, 400, 0),
            new Alien(game, 500, 0),
            new Alien(game, 100, 100),
            new Alien(game, 200, 100),
            new Alien(game, 300, 100),
            new Alien(game, 400, 100),
            new Alien(game, 500, 100),
        ]);
        this.addWave(this.makeMeteors(10));
        this.addWave([
            new Alien(game, 100, 0),
            new ShieldedAlien(game, 200, 0),
            new Alien(game, 300, 0),
        ]);
        this.addWave([
            new ShieldedAlien(game, 100, 0),
            new ShieldedAlien(game, 200, 0),
            new ShieldedAlien(game, 300, 0),
        ]);
        this.addWave([
            new Alien(game, 150, 0),
            new Alien(game, 250, 0),
            new ShieldedAlien(game, 100, 100),
            new ShieldedAlien(game, 200, 100),
            new ShieldedAlien(game, 300, 100),
        ]);
        this.addWave([
            new Alien(game, 150, 0),
            new Alien(game, 250, 0),
            new Alien(game, 350, 0),
            new Alien(game, 450, 0),
            new Alien(game, 550, 0),
            new ShieldedAlien(game, 100, 100),
            new ShieldedAlien(game, 200, 100),
            new ShieldedAlien(game, 300, 100),
            new ShieldedAlien(game, 400, 100),
            new ShieldedAlien(game, 500, 100),
            new ShieldedAlien(game, 600, 100),
        ]);
        this.addWave([
            new Alien(game, 150, 0),
            new Alien(game, 250, 0),
            new Alien(game, 350, 0),
            new Alien(game, 450, 0),
            new Alien(game, 550, 0),
            new Alien(game, 650, 0),
            new Alien(game, 750, 0),
            new Alien(game, 850, 0),
            new Alien(game, 950, 0),
            new Alien(game, 150, 100),
            new Alien(game, 250, 100),
            new Alien(game, 350, 100),
            new Alien(game, 450, 100),
            new Alien(game, 550, 100),
            new Alien(game, 650, 100),
            new Alien(game, 750, 100),
            new Alien(game, 850, 100),
            new Alien(game, 950, 100),
            new ShieldedAlien(game, 100, 200),
            new ShieldedAlien(game, 200, 200),
            new ShieldedAlien(game, 300, 200),
            new ShieldedAlien(game, 400, 200),
            new ShieldedAlien(game, 500, 200),
            new ShieldedAlien(game, 600, 200),
            new ShieldedAlien(game, 700, 200),
            new ShieldedAlien(game, 800, 200),
            new ShieldedAlien(game, 900, 200),
            new ShieldedAlien(game, 1000, 200),
        ]);
        this.addWave(this.makeMeteors(20));
        this.addWave([
            new Alien(game, 100, 0),
            new Alien(game, 200, 0),
            new UFO(game, 150, 100),
        ]);
        this.addWave([
            new UFO(game, 100, 0),
            new UFO(game, 500, 0),
            new Alien(game, 100, 100),
            new Alien(game, 200, 100),
            new Alien(game, 300, 100),
            new Alien(game, 400, 100),
            new Alien(game, 500, 100),
        ]);
        this.addWave([
            new UFO(game, 100, 0),
            new UFO(game, 500, 0),
            new UFO(game, 1000, 0),
            new ShieldedAlien(game, 100, 100),
            new ShieldedAlien(game, 200, 100),
            new ShieldedAlien(game, 300, 100),
            new ShieldedAlien(game, 400, 100),
            new ShieldedAlien(game, 500, 100),
            new ShieldedAlien(game, 600, 100),
            new ShieldedAlien(game, 700, 100),
            new ShieldedAlien(game, 800, 100),
            new ShieldedAlien(game, 900, 100),
            new ShieldedAlien(game, 1000, 100),
        ]);
        this.addWave([
            new Mothership(game, 0, 0),
        ]);
        this.addWave(this.makeMeteors(30));
    }

    getWidth() {
        return 0;
    }

    getHeight() {
        return 0;
    }

    update() {
        const now = this.game.now;

        if (this.#nextWaveTime !== null) {
            if (now >= this.#nextWaveTime) {
                this.spawnNextWave();
            }
        }
        else if (this.allEnemiesDefeated()) {
            this.currentWaveIndex++;
            this.#nextWaveTime = now + WAVE_SPAWN_DELAY;
        }
    }

    draw(ctx) {
        if (this.#nextWaveTime !== null) {
            const canvas = this.game.canvas;

            writeText(
                ctx,
                canvas.width / 2, canvas.height / 2,
                `Wave ${this.currentWaveIndex + 1}`,
                '48pt sans-serif', '#FFFFFF', 'center',
            );
        }
    }

    allEnemiesDefeated() {
        const currentEnemies = this.currentWave;

        let waveOnlyHasMeteors = true;
        for (const enemy of currentEnemies) {
            if (!(enemy instanceof Meteor)) {
                waveOnlyHasMeteors = false;
                break;
            }
        }

        for (const enemy of currentEnemies) {
            // If there are only Meteors in this wave, wait until all of
            // them are destroyed. Otherwise, if there are any non-Meteor
            // enemies in the wave, Meteors don't need to be destroyed for the
            // wave to count as complete.
            if (!waveOnlyHasMeteors && (enemy instanceof Meteor)) {
                continue;
            }

            if (enemy.isAlive) {
                return false;
            }
        }

        return true;
    }

    spawnNextWave() {
        if (this.currentWaveIndex < this.#waves.length) {
            this.currentWave = this.#waves[this.currentWaveIndex];
        }
        else {
            this.currentWave = this.generateWave();
        }

        for (const enemy of this.currentWave) {
            this.game.addGameObject(enemy);
        }

        this.#nextWaveTime = null;
    }

    addWave(enemies) {
        this.#waves.push(enemies);
    }

    makeMeteors(maxMeteors) {
        const game = this.game;

        // How high above the top of the screen to spawn
        const maxMeteorHeight = maxMeteors * game.getBottom() / 10;

        const meteors = [];

        for (let i = 0; i < maxMeteors; i++) {
            meteors.push(
                new Meteor(
                    game,
                    randRange(0, game.getRight()),
                    randRange(-maxMeteorHeight, 0),
                    randRange(0, game.getRight()),
                    game.getBottom(),
                )
            );
        }

        return meteors;
    }

    generateWave() {
        const game = this.game;

        let enemies = [];

        for (let i = 0; i < this.#maxGeneratedEnemies; i++) {
            const x = randRange(0, game.getRight());
            const y = randRange(0, 400);

            const rng = Math.random();

            let enemy;
            if (rng < 0.3) {
                enemy = new ShieldedAlien(game, x, y);
            }
            else if (rng < 0.4) {
                enemy = new UFO(game, x, y);
            }
            else if (rng < 0.45) {
                enemy = new Mothership(game, x, 0);
            }
            else {
                enemy = new Alien(game, x, y);
            }

            enemies.push(enemy);
        }

        enemies = enemies.concat(this.makeMeteors(this.#maxGeneratedEnemies));

        this.#maxGeneratedEnemies++;

        return enemies;
    }
}
