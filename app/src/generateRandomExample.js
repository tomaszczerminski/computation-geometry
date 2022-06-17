import * as gen from './generators';
import appStatus from "@/appStatus";

const createRandom = require('ngraph.random');
const prng = createRandom(42);

const params = [
    {
        name: 'random',
        algorithm: ['brute', 'bush'],
        args: [
            {min: 100, max: 500},  // number of lines
            {min: 100, max: 200},  // visible area
        ]
    },
    {
        name: 'complete',
        algorithm: ['brute', 'bush'],
        args: [
            {min: 10, max: 40},  // number of nodes
            function p1(qs) {
                return Math.round((10 + prng.gaussian()) * qs.p0);
                // {min: 400, max: 600},  // visible area
            }
        ]
    },
    {
        name: 'cube',
        algorithm: ['brute', 'bush'],
        args: [
            {min: 100, max: 150},  // number of rects
            function p2() {
                return Math.round((10 + prng.gaussian()));
            }
        ]
    },
    {
        name: 'drunkgrid',
        algorithm: ['brute', 'bush'],
        args: [
            {min: 10, max: 150},  // Row x Col
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
        algorithm: ['bush', 'bush', 'sweep'],
        args: [
            {min: 50, max: 300},  // Count
        ]
    },
    {
        name: 'triangle',
        algorithm(qs) {
            // sparse is better with sweep
            return (qs.p1 > 7) ? 'brute' : 'bush'
        },
        args: [
            {min: 10, max: 30},  // Count
            {min: 1, max: 20},  // Count
        ]
    },
    {
        name: 'splash',
        algorithm: ['sweep', 'bush'],
        args: [
            {min: 10, max: 50},  // Number of lines
            {min: 40, max: 70},  // squared variance
        ]
    },
    {
        name: 'island',
        algorithm: ['sweep', 'bush'],
        args: [
            {min: 3, max: 10},  // Number of control points on circle
            {min: 6, max: 11},  // Number of subdivisions
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
    console.log(generator.name)
    const segments = gen[generator.name](p0, p1);
    appStatus.segments = segments;
    qs.algorithm = 'sweep';
    qs.stepsPerFrame = 1;
    return qs;
}

function getNumber(x, defaultValue) {
    const num = Number.parseFloat(x);
    return Number.isFinite(num) ? num : defaultValue;
}
