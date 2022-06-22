// noinspection JSUnusedGlobalSymbols

const createRandom = require('ngraph.random');
const seed = +new Date();
const prng = createRandom(seed);

export function splash(linesCount, minMax) {
    const lines = [];
    for (let j = 0; j < linesCount; ++j) {
        const r = prng.gaussian() * minMax;
        const alpha = prng.gaussian() * Math.PI * 2;
        const points = getArr({
            x: prng.gaussian(),
            y: prng.gaussian()
        }, {
            x: r * Math.cos(alpha),
            y: r * Math.sin(alpha)
        }, 7);
        for (let i = 1; i < points.length; ++i) {
            lines.push({
                from: points[i - 1],
                to: points[i]
            })
        }
    }
    return lines;
}

export function island(pointsCount, bands) {
    let r = 100 * Math.sqrt(bands);
    const da = 2 * Math.PI / pointsCount;
    let angle = prng.gaussian();
    const lines = [];
    const end = {
        x: r * Math.cos(angle),
        y: r * Math.sin(angle)
    };
    let from = end;
    for (let j = 0; j < pointsCount; ++j) {
        r = prng.nextDouble() * 100;
        angle += da;
        const to = j < pointsCount - 1 ? {
            x: r * Math.cos(angle),
            y: r * Math.sin(angle)
        } : end; // close the loop.
        const points = getArr(from, to, bands);
        for (let i = 1; i < points.length; ++i) {
            lines.push({
                from: points[i - 1],
                to: points[i]
            })
        }
        from = to;
    }
    return lines;
}

function getArr(tMin, tMax, bands = 8) {
    let arr = [tMin, tMax];
    const dx = tMax.x - tMin.x;
    const dy = tMax.y - tMin.y;
    let variance = Math.sqrt(dx * dx + dy * dy);
    for (let j = 0; j < bands; ++j) {
        const newArr = [];
        for (let i = 1; i < arr.length; i += 1) {
            const prev = arr[i - 1];
            const mid = interpolate(prev, arr[i], Math.sqrt(variance));
            newArr.push(prev, mid);
        }
        newArr.push(arr[arr.length - 1]);
        variance /= 2;
        arr = newArr;
    }
    return arr;
}

function interpolate(p0, p1, variance) {
    return {
        x: (p0.x + p1.x) * 0.5 + prng.gaussian() * variance,
        y: (p0.y + p1.y) * 0.5 + prng.gaussian() * variance,
    }
}
