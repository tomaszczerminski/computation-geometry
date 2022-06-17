import BBox from './BBox';
import appStatus from './appStatus';
import bus from "@/bus";

let isect = require('../../index.js');
let wgl = require('w-gl');
let algorithmName;
let iSector, nodeCollection;
const status = {};
let totalElapsed = 0;
let lines = [];
let scene = null;
const canvas = document.getElementById('scene');
let nextFrame;

export function createScene(options) {
    lines = options.lines;
    algorithmName = options.algorithm;
    scene = prepare();
    draw();
    return {
        dispose
    }
}

export function dispose() {
    wgl.scene(canvas);
    if (nextFrame) {
        cancelAnimationFrame(nextFrame);
        nextFrame = 0;
    }
    scene.dispose();
}

export function prepare() {
    const scene = wgl.scene(canvas);
    scene.setClearColor(0x0C / 255, 0x18 / 255, 0x34 / 255, 1);
    const bounds = new BBox();
    lines.forEach(line => {
        bounds.addPoint(line.from);
        bounds.addPoint(line.to);
    });
    const pixelRatio = scene.getPixelRatio();
    const left = bounds.left / pixelRatio;
    const top = bounds.top / pixelRatio;
    scene.setViewBox({
        left, top, right: left + bounds.width / pixelRatio, bottom: top + bounds.height / pixelRatio
    });
    return scene;
}

function draw() {
    const linesEl = new wgl.WireCollection(lines.length);
    linesEl.color.r = 0xee / 255;
    linesEl.color.g = 0xee / 255;
    linesEl.color.b = 0xee / 255;
    linesEl.color.a = 0.9;
    lines.forEach(line => {
        linesEl.add({
            from: {
                x: -1 * line.from.x,
                y: line.from.y
            },
            to: {
                x: -1 * line.to.x,
                y: line.to.y
            }
        });
    });
    scene.appendChild(linesEl);
}

function formatWithDecimalSeparator(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function start() {
    bus.fire('start-app')
    appStatus.error = null;
    run();
    appStatus.showLoading = false;
    appStatus.showMetrics = true;
}

function run() {
    const start = performance.now();
    // only sweep line supports async running at the moment
    iSector = isect[algorithmName](lines, {onError});
    const end = performance.now();
    totalElapsed += (end - start);
    updateSearchMetrics(totalElapsed);
    nextFrame = requestAnimationFrame(frame);
    // for console driven debugging
    window.next = () => {
        const hasMore = iSector.step();
        if (iSector.sweepStatus) {
            drawSweepStatus(iSector.sweepStatus, appStatus.mode);
        }
        drawIntersections(iSector.results, appStatus.mode)
        return hasMore;
    }
}

function onError(err) {
    appStatus.error = 'Rounding error detected';
    drawSweepStatus(iSector.sweepStatus, appStatus.mode);
    drawIntersections(iSector.results, appStatus.mode);
    throw new Error(err);
}

function frame() {
    let hasMore;
    const start = performance.now();
    for (let i = 0; i < 1; ++i) {
        hasMore = iSector.step();
    }
    const end = performance.now();
    totalElapsed += end - start;
    updateSearchMetrics(totalElapsed);
    drawSweepStatus(iSector.sweepStatus, appStatus.mode);
    iSector.sweepStatus.printStatus();
    drawIntersections(iSector.results, appStatus.mode)
    if (hasMore) {
        nextFrame = requestAnimationFrame(frame);
    } else {
        nextFrame = null;
        bus.fire('chunks-sent', iSector.results);
    }
}

function drawSweepStatus(sweepStatus, mode) {
    if (!sweepStatus) return;
    const pt = sweepStatus.getLastPoint();
    if (mode !== 'manual') {
        if (status.point) {
            scene.removeChild(status.point);
        }
        status.point = new wgl.PointCollection(1);
        const ui = status.point.add({
            x: -1 * pt,
            y: pt.y
        });
        ui.setColor({r: 1, g: 0, b: 0});
        scene.appendChild(status.point);
    }
    // status line
    if (status.line) {
        scene.removeChild(status.line);
    }
    status.line = new wgl.WireCollection(1);
    status.line.color = {r: 0.1, g: 1.0, b: 1.0, a: 0.9};
    status.line.add({
        from: {
            x: -1000, y: pt.y
        }, to: {x: 1000, y: pt.y}
    });
    scene.appendChild(status.line);
    // lines
    if (status.segments) {
        scene.removeChild(status.segments);
    }
    const segments = sweepStatus.status.keys();
    status.segments = new wgl.WireCollection(segments.length);
    status.segments.color = {r: 0.1, g: 1.0, b: 0.0, a: 0.9};
    segments.forEach(s => {
        status.segments.add({from: -1 * s.from, to: s.to});
    })
    scene.appendChild(status.segments);
}

function drawIntersections(intersections, mode) {
    if (mode === 'manual') {
        return;
    }
    if (nodeCollection) {
        scene.removeChild(nodeCollection)
        nodeCollection = null;
    }
    if (intersections.length > 0) {
        nodeCollection = new wgl.PointCollection(intersections.length);
        intersections.forEach((intersect, id) => {
            const ui = nodeCollection.add({
                x: -1 * intersect.point.x,
                y: intersect.point.y
            }, id);
            ui.setColor({
                r: 0xA3 / 244, g: 0x255 / 255, b: 0x255 / 255
            })
        })
        scene.appendChild(nodeCollection);
    }
}

function updateSearchMetrics(elapsed) {
    appStatus.found = formatWithDecimalSeparator(iSector.results.length);
    appStatus.elapsed = (Math.round(elapsed * 100) / 100) + 'ms';
    appStatus.linesCount = formatWithDecimalSeparator(lines.length);
}
