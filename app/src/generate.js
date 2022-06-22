import * as gen from './generators';
import appStatus from "@/app-state";

const createRandom = require('ngraph.random');
const prng = createRandom(42);

const params = [
    {
        name: 'random',
        args: [
            {min: 100, max: 500},
            {min: 100, max: 200},
        ]
    },
    {
        name: 'complete',
        args: [
            {min: 10, max: 40},
            function p1(qs) {
                return Math.round((10 + prng.gaussian()) * qs.p0);
            }
        ]
    },
    {
        name: 'cube',
        args: [
            {min: 100, max: 150},
            function p2() {
                return Math.round((10 + prng.gaussian()));
            }
        ]
    },
    {
        name: 'drunkgrid',
        args: [
            {min: 10, max: 150},
            function p2(qs) {
                let v = Math.round(Math.random() * 10) + 1;
                if (v === 0) return 0;
                if (qs.p0 > 20 && v < 1) v = 3;
                return v;
            }
        ]
    },
    {
        name: 'sparse',
        args: [
            {min: 50, max: 300},
        ]
    },
    {
        name: 'triangle',
        args: [
            {min: 10, max: 30},
            {min: 1, max: 20},
        ]
    },
    {
        name: 'splash',
        args: [
            {min: 10, max: 50},
            {min: 40, max: 70},
        ]
    },
    {
        name: 'island',
        args: [
            {min: 3, max: 10},
            {min: 6, max: 11},
        ]
    }
];

export default function generateRandomExample() {
    const generatorIdx = Math.round(Math.random() * (params.length - 1));
    const generator = params[generatorIdx];
    const qs = {
        generator: generator.name,
        dirty: true
    };
    generator.args.forEach((range, idx) => {
        const keyName = `p${idx}`;
        if (typeof range === 'function') {
            qs[keyName] = range(qs);
        } else {
            qs[keyName] = Math.round(Math.random() * (range.max - range.min) + range.min);
        }
    });
    const p0 = getNumber(qs.p0, 50);
    const p1 = getNumber(qs.p1, 4);
    appStatus.segments = gen[generator.name](p0, p1);
    qs.algorithm = 'sweep';
    qs.stepsPerFrame = 1;
    return qs;
}

function getNumber(x, defaultValue) {
    const num = Number.parseFloat(x);
    return Number.isFinite(num) ? num : defaultValue;
}
