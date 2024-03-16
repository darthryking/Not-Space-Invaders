import {
    LaserGun,
    BeamCannon,
    MissileLauncher
}
from './weapons.js';

export class BottomBar {
    constructor(game, color, x, y, width, height) {
        this.game = game;

        this.color = color;

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.healthBar = new GaugeBar(
            this.x + 150, this.y + 15,
            '#666666', '#FF0000',
            200, 30,
            game.player.health, game.player.maxHealth,
        );

        this.chargeBar = new GaugeBar(
            0, 0,
            '#666666', '#00FF00',
            200, 30,
            0, 0,
        );

        this.missileBitmap = game.assets.get('missile');
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x, this.y,
            this.width, this.height,
        );

        const game = this.game;
        const player = game.player;

        /* Health */
        writeText(
            ctx,
            this.x + 20, this.y + 40,
            "Health:",
            '24pt monospace', '#FFFFFF', 'left',
        );

        const healthBar = this.healthBar;

        healthBar.value = player.health;
        healthBar.draw(ctx);

        writeText(
            ctx,
            healthBar.x + healthBar.width / 2,
            healthBar.y + healthBar.height - 5,
            `${player.health.toFixed(0)}/${player.maxHealth.toFixed(0)}`,
            '24pt monospace', '#FFFFFF', 'center',
        );

        /* Weapon */
        const weapon = player.weapon;
        if (weapon !== null) {
            writeText(
                ctx,
                this.x + 20, this.y + 70,
                `Weapon: ${weapon.name}`,
                '24pt monospace', '#FFFFFF', 'left',
            );

            this.#drawWeaponAmmo(ctx, weapon, this.x + 500, this.y + 70);
        }

        /* Money */
        writeText(
            ctx,
            this.x + 500, this.y + 40,
            `Money: $${player.money}`,
            '24pt monospace', '#99FF99', 'left',
        );
    }

    #drawWeaponAmmo(ctx, weapon, x, y) {
        if (weapon instanceof LaserGun) {
            writeText(
                ctx,
                x, y,
                "Ammo: ∞",
                '24pt monospace', '#FFFFFF', 'left',
            )
        }
        else if (weapon instanceof BeamCannon) {
            writeText(
                ctx,
                x, y,
                "Charge:",
                '24pt monospace', '#FFFFFF', 'left',
            );

            const chargeBar = this.chargeBar;

            chargeBar.x = x + 130;
            chargeBar.y = y - chargeBar.height + 8;

            chargeBar.value = weapon.ammo;
            chargeBar.maxValue = weapon.maxAmmo;

            if (weapon.ammo >= 80) {
                chargeBar.color = '#00FF00';
            }
            else if (weapon.ammo >= 40) {
                chargeBar.color = '#FFFF00';
            }
            else {
                chargeBar.color = '#FF0000';
            }

            chargeBar.draw(ctx);

            writeText(
                ctx,
                chargeBar.x + chargeBar.width / 2,
                chargeBar.y + chargeBar.height - 5,
                `${weapon.ammo.toFixed(2)}%`,
                '24pt monospace', '#000000', 'center',
            );
        }
        else if (weapon instanceof MissileLauncher) {
            writeText(
                ctx,
                x, y,
                (weapon.ammo > 0) ? "Missiles:" : "Missiles: (empty)",
                '24pt monospace', '#FFFFFF', 'left',
            )

            const missileBitmap = this.missileBitmap;
            const ammoIconStart = x + 170;

            for (let i = 0; i < weapon.ammo; i++) {
                const iconX = ammoIconStart + i * (missileBitmap.width + 5);
                const iconY = y - missileBitmap.height + 2;

                ctx.drawImage(
                    missileBitmap,
                    iconX, iconY,
                );
            }
        }
    }
}

export class GaugeBar {
    constructor(x, y, bkgColor, color, width, height, value, maxValue) {
        this.x = x;
        this.y = y;

        this.bkgColor = bkgColor;
        this.color = color;

        this.width = width;
        this.height = height;

        this.value = value;
        this.maxValue = maxValue;
    }

    draw(ctx) {
        /* Background */
        ctx.fillStyle = this.bkgColor;
        ctx.fillRect(
            this.x, this.y,
            this.width, this.height,
        );

        /* Filled bar */
        let fraction = this.value / this.maxValue;
        if (fraction < 0) {
            fraction = 0;
        }
        else if (fraction > 1) {
            fraction = 1;
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x, this.y,
            this.width * fraction, this.height,
        );
    }
}

export const writeText = (ctx, x, y, text, font, color, align) => {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
};
