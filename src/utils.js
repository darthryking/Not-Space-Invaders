export const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const distance = (x1, y1, x2, y2) => {
    const dX = x2 - x1;
    const dY = y2 - y1;
    return Math.sqrt(dX * dX + dY * dY);
};

export const randRange = (lower, upper) => Math.random() * (upper - lower) + lower;

export const pointBelowLine = (
    pointX, pointY,
    lineStartX, lineStartY,
    lineEndX, lineEndY,
) => {
    const dX = lineEndX - lineStartX;
    const dY = lineEndY - lineStartY;

    if (dY == 0) {
        return false;
    }

    const slope = dY / dX;

    const expectedY = lineStartY + slope * (pointX - lineStartX);

    return pointY < expectedY;
};
