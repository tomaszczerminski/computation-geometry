// noinspection JSUnusedGlobalSymbols

const createRandom = require('ngraph.random');
const seed = +new Date();
let prng = createRandom(seed);

export * from './brownian';

export function random(count = 4, range = 100, seed) {
    seed = 1536687392180
    prng = createRandom(seed);
    const lines = [];
    for (let i = 0; i < count; ++i) {
        lines.push({
            from: {x: (prng.nextDouble() - 0.5) * range, y: (prng.nextDouble() - 0.5) * range},
            to: {x: (prng.nextDouble() - 0.5) * range, y: (prng.nextDouble() - 0.5) * range}
        });
    }
    return lines;
}

export function parallelSlanted(count) {
    const lines = [];
    for (let i = 0; i < count; ++i) {
        const x = -i, y = i;
        lines.push({
            from: {x, y},
            to: {x: i, y: i + i}
        })
    }
    return lines;
}

export function sparse(size = 50) {
    const lines = [];
    for (let j = 0; j < size; ++j) {
        for (let i = 0; i < size; ++i) {
            const x = i * 10, y = j * 10;
            const a = prng.gaussian();
            lines.push({
                from: {x, y},
                to: {x: x + 10 * Math.cos(a), y: y + 10 * Math.sin(a)}
            });
        }
    }
    return lines;
}

export function triangle(count = 4, variance = 10) {
    const lines = [];
    const step = 5;
    const idxVar = prng.nextDouble() < 0.5 ? 1 : 0;
    for (let i = 0; i < count; ++i) {
        for (let j = 0; j < count; ++j) {
            const x = step * i;
            const y = step * j;
            const idxToUse = (i % 2 === idxVar) ? i : j;
            const angle = Math.PI * (idxToUse / count - prng.gaussian());
            drawTriangle(x, y, variance, angle);
        }
    }
    return lines;

    function drawTriangle(x, y, width, alpha) {
        const cp = {x: x + width / 2, y: y - width / 2};
        const left = rotate({x: x, y: y}, cp, alpha);
        const right = rotate({x: x + width, y: y}, cp, alpha);
        const middle = rotate({x: x + width / 2, y: y - width}, cp, alpha);
        lines.push(
            {from: {x: left.x, y: left.y}, to: {x: right.x, y: right.y}, name: `B${x},${y}`},
            {from: {x: right.x, y: right.y}, to: {x: middle.x, y: middle.y}, name: `U${x},${y}`},
            {from: {x: middle.x, y: middle.y}, to: {x: left.x, y: left.y}, name: `D${x},${y}`}
        )
    }
}

function rotate(point, center, alpha) {
    point.x -= center.x;
    point.y -= center.y;
    const x = Math.cos(alpha) * point.x - point.y * Math.sin(alpha) + center.x;
    const y = Math.sin(alpha) * point.x + point.y * Math.cos(alpha) + center.y;
    return {x, y};
}

export function cube(count = 4, variance = 10) {
    let forwardAngle = 0;
    let r = 4;
    const dAngle = Math.PI / count;
    const lines = [];
    for (let i = 0; i < count; ++i) {
        forwardAngle += dAngle + prng.gaussian() * variance;
        addRect(forwardAngle, r);
        r += prng.gaussian() * variance;
    }
    return lines;

    function addRect(angle, r) {
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        lines.push({
                from: {x: x, y: y},
                to: {x: -y, y: x},
            },
            {
                from: {x: -y, y: x},
                to: {x: -x, y: -y}
            },
            {
                from: {x: -x, y: -y},
                to: {x: y, y: -x}
            },
            {
                from: {x: y, y: -x},
                to: {x: x, y: y}
            }
        );
    }
}

export function grid(vertical = 10, horizontal = 10) {
    let i;
    const lines = [];
    const dx = 0;
    const dy = -0.3;
    for (i = 0; i < vertical; i += 1) {
        lines.push({
            name: 'h' + i,
            from: {x: dx, y: i + dy},
            to: {x: dx + (horizontal - 1), y: i + dy}
        });
    }
    for (i = 0; i < horizontal; i += 1) {
        lines.push({
            name: 'v' + i,
            from: {x: dx + i, y: dy},
            to: {x: dx + i, y: (vertical - 1) + dy}
        });
    }
    return lines;
}

export function drunkgrid(size = 10, variance = 10) {
    const lines = [];
    const dx = -2 * variance;
    const dy = -2 * variance;
    for (let i = 0; i < size; i += 1) {
        lines.push({
            name: 'h' + i,
            from: {x: dx + prng.gaussian() * variance, y: i + dy + prng.gaussian() * variance},
            to: {x: dx + (size - 1) + prng.gaussian() * variance, y: i + dy + prng.gaussian() * variance}
        });
        lines.push({
            name: 'v' + i,
            from: {x: dx + i + prng.gaussian() * variance, y: dy + prng.gaussian() * variance},
            to: {x: dx + i + prng.gaussian() * variance, y: (size - 1) + dy + prng.gaussian() * variance}
        });
    }
    return lines;
}

export function complete(count = 10, range = 100) {
    const angleStep = 2 * Math.PI / count;
    const lines = [];
    const seen = new Set();
    for (let i = 0; i < count; ++i) {
        const angle = angleStep * i;
        const x = Math.cos(angle) * range / 2;
        const y = Math.sin(angle) * range / 2;
        for (let j = 0; j < count; ++j) {
            if (j !== i) {
                const ex = Math.cos(angleStep * j) * range / 2;
                const ey = Math.sin(angleStep * j) * range / 2;
                const name = `${i},${j}`;
                const l = {
                    name: name,
                    from: {x: x, y: y},
                    to: {x: ex, y: ey}
                };
                const sKey = getKey(i, j);
                if (!seen.has(sKey)) {
                    lines.push(l);
                    seen.add(sKey)
                }
            }
        }
    }

    return lines;

    function getKey(i, j) {
        return i < j ? i + ';' + j : j + ';' + i;
    }
}
