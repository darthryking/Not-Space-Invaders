export class Keyboard {
    #pressedKeys;

    constructor() {
        this.#pressedKeys = new Map();

        document.addEventListener(
            'keydown',
            (event) => this.#keyDown(event),
        );
        document.addEventListener(
            'keyup',
            (event) => this.#keyUp(event),
        );
    }

    isKeyPressed(key) {
        if (this.#pressedKeys.has(key)) {
            return this.#pressedKeys.get(key);
        }
        else {
            return false;
        }
    }

    #keyDown(event) {
        this.#pressedKeys.set(event.key, true);
    }

    #keyUp(event) {
        this.#pressedKeys.set(event.key, false);
    }
}

export class Mouse {
    constructor(canvas) {
        this.canvas = canvas;

        this.x = 0;
        this.y = 0;

        this.leftMouseDown = false;
        this.middleMouseDown = false;
        this.rightMouseDown = false;

        document.addEventListener(
            'mousemove',
            (event) => this.#mouseMove(event),
        );
        document.addEventListener(
            'mousedown',
            (event) => this.#mouseDown(event),
        );
        document.addEventListener(
            'mouseup',
            (event) => this.#mouseUp(event),
        );
    }

    #mouseMove(event) {
        const canvas = this.canvas;
        const canvasRect = canvas.getBoundingClientRect();

        const canvasMouseXOffset = event.clientX - canvasRect.left;
        const canvasWidthBounds = canvasRect.right - canvasRect.left;

        const canvasMouseYOffset = event.clientY - canvasRect.top;
        const canvasHeightBounds = canvasRect.bottom - canvasRect.top;

        this.x = canvasMouseXOffset / canvasWidthBounds * canvas.width;
        this.y = canvasMouseYOffset / canvasHeightBounds * canvas.height;
    }

    #mouseDown(event) {
        this.#setMouseState(event.button, true);
    }

    #mouseUp(event) {
        this.#setMouseState(event.button, false);
    }

    #setMouseState(button, isDown) {
        switch (button) {
            case 0:
                this.leftMouseDown = isDown;
                break;

            case 1:
                this.middleMouseDown = isDown;
                break;

            case 2:
                this.rightMouseDown = isDown;
                break;
        }
    }
}
