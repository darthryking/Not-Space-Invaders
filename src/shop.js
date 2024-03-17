import {
    writeText
}
from './ui.js';

export default class Shop {
    constructor(game, x, y, width, height) {
        this.game = game;

        this.x = x;
        this.y = y;

        this.color;
        this.width = width;
        this.height = height;

        this.options = [];
        this.isActive = false;
    }

    addOption(name, price, getDisabledMessage, action) {
        this.options.push({
            index: this.options.length,
            name: name,
            price: price,
            getDisabledMessage: getDisabledMessage,
            action: action,
        }, );
    }

    buy(optionIndex) {
        if (optionIndex >= this.options.length) {
            return false;
        }

        const option = this.options[optionIndex];
        if (option.getDisabledMessage() !== null) {
            return false;
        }

        const player = this.game.player;
        if (player.money < option.price) {
            return false;
        }

        player.money -= option.price;
        option.quantity--;

        option.action();

        return true;
    }

    getNumOptions() {
        return this.options.length;
    }

    draw(ctx) {
        if (!this.isActive) {
            return;
        }

        ctx.fillStyle = '#999999';
        ctx.fillRect(
            this.x, this.y,
            this.width, this.height,
        );

        const margin = 10;

        ctx.fillStyle = '#666666';
        ctx.fillRect(
            this.x + margin, this.y + margin,
            this.width - margin * 2, this.height - margin * 2,
        );

        writeText(
            ctx,
            this.x + this.width / 2, this.y + 50,
            "Welcome to the Awesome Shop of Awesomeness!",
            '24pt sans-serif', '#FFFFFF', 'center',
        );

        writeText(
            ctx,
            this.x + 50, this.y + 150,
            "Items for purchase:",
            '20pt sans-serif', '#FFFFFF', 'left',
        );

        const player = this.game.player;

        const itemX = this.x + 50;
        const itemStartY = this.y + 200;

        for (const option of this.options) {
            const {
                index,
                name,
                price
            } = option;

            let itemText = `    ${index + 1}. ${name}: $${price.toFixed(0)}`;
            let enabled = true;

            const disabledMessage = option.getDisabledMessage();
            if (disabledMessage !== null) {
                itemText += ` (${disabledMessage})`;
                enabled = false;
            }
            else if (player.money < price) {
                itemText += " (Insufficient Funds)";
                enabled = false;
            }

            let itemColor;
            if (enabled) {
                itemColor = '#FFFFFF';
            }
            else {
                itemColor = '#999999';
            }

            writeText(
                ctx,
                itemX, itemStartY + index * 50,
                itemText,
                '20pt sans-serif', itemColor, 'left',
            );
        }
    }
}
