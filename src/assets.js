export default class AssetManager {
    #cache;

    constructor() {
        this.#cache = new Map();
    }

    async loadImage(name, src) {
        return await this.#load(
            name,
            async () => await loadImage(src),
        );
    }

    async loadBitmap(
        name,
        src,
        subRectX, subRectY,
        subRectWidth, subRectHeight,
    ) {
        return await this.#load(
            name,
            async () => await loadBitmap(
                src,
                subRectX, subRectY,
                subRectWidth, subRectHeight,
            ),
        );
    }

    async #load(name, loadFn) {
        let result = null;
        if (!this.#cache.has(name)) {
            result = await loadFn();
            this.#cache.set(name, result);
        }
        return result;
    }

    has(name) {
        return this.#cache.has(name);
    }

    get(name) {
        return this.#cache.get(name);
    }
}

export const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
});

export const loadBitmap = async (
    src,
    subRectX, subRectY,
    subRectWidth, subRectHeight,
) => {
    const spriteSheet = await loadImage(src);

    return await createImageBitmap(
        spriteSheet,
        subRectX, subRectY,
        subRectWidth, subRectHeight
    );
};
