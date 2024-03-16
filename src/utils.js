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

export const pointInRect = (
    pointX, pointY,
    rectX, rectY,
    rectWidth, rectHeight,
) => {
    const rectLeft = rectX;
    const rectRight = rectX + rectWidth;
    const rectTop = rectY;
    const rectBottom = rectY + rectHeight;

    if (pointX < rectLeft) {
        return false;
    }

    if (pointX > rectRight) {
        return false;
    }

    if (pointY < rectTop) {
        return false;
    }

    if (pointY > rectBottom) {
        return false;
    }

    return true;
};

export const rectIntersectsCircle = (
    rectX, rectY,
    rectWidth, rectHeight,
    circleX, circleY,
    circleRadius,
) => {
    const rectLeft = rectX;
    const rectRight = rectX + rectWidth;
    const rectTop = rectY;
    const rectBottom = rectY + rectHeight;

    const circleLeft = circleX - circleRadius;
    const circleRight = circleX + circleRadius;
    const circleTop = circleY - circleRadius;
    const circleBottom = circleY + circleRadius;

    const circleCenterIsWithinRect = pointInRect(
        circleX, circleY,
        rectX, rectY,
        rectWidth, rectHeight,
    );

    if (circleCenterIsWithinRect) {
        return true;
    }

    if (rectLeft <= circleX && circleX <= rectRight) {
        if (circleTop <= rectTop && rectTop <= circleBottom) {
            return true;
        }

        if (circleTop <= rectBottom && rectBottom <= circleBottom) {
            return true;
        }
    }

    if (rectTop <= circleY && circleY <= rectBottom) {
        if (circleLeft <= rectLeft && rectLeft <= circleRight) {
            return true;
        }

        if (circleLeft <= rectRight && rectRight <= circleRight) {
            return true;
        }
    }

    return false;
};
