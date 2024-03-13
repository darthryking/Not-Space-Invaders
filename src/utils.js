export const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const dist = (x1, y1, x2, y2) => {
    const dX = x2 - x1;
    const dY = y2 - y1;
    return Math.sqrt(dX * dX + dY * dY);
};
