import Vue from 'vue'
import App from './App.vue'
import {createScene, dispose, prepare, start} from './scene';

import queryState from 'query-state';

import bus from './bus';

let whitelistedAlgorithms = new Set(['brute', 'bush', 'sweep']);

let qs = queryState({
    isAsync: true,
    p0: 150,
    p1: 4,
}, {
    useSearch: true
});

let handle = null

qs.onChange(updateScene);
bus.on('start', () => {
    handle = setTimeout(start, 80);
})
bus.on('change-qs', (newState) => {
    let link = document.getElementById("download-report");
    link.style.visibility = 'hidden';
    qs.set(newState);
    updateScene(newState);
});
bus.on('clear-scene', () => {
    let link = document.getElementById("download-report");
    link.style.visibility = 'hidden';
    let results = document.getElementById('results');
    results.style.visibility = 'hidden';
    onClear();
})

bus.on('start-app', () => {
    let link = document.getElementById("download-report");
    link.style.visibility = 'hidden';
    let results = document.getElementById('results');
    results.style.visibility = 'visible';
});

bus.on('prepare-report', intersections => {
    let csv = "";
    intersections.forEach(function (intersection) {
        let point = intersection.point;
        let row = `(${point.x};${point.y})`;
        csv += row + "\r\n";
    });
    let blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    let link = document.getElementById("download-report");
    if (!link) {
        return;
    }
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "intersections.csv");
    link.style.visibility = 'visible';
});

bus.on('chunks-sent', chunks => {
    bus.fire('prepare-report', chunks);
});

let sceneOptions = getSceneOptions(qs.get());
let currentScene;

Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')

export function updateScene(appState) {
    sceneOptions = getSceneOptions(appState);
    if (currentScene) {
        currentScene.dispose();
    }
    currentScene = createScene(sceneOptions);
}

function onClear() {
    dispose();
    if (handle) {
        clearTimeout(handle);
        handle = 0;
    }
    prepare();
    bus.fire('change-qs', {
        dirty: false,
        mode: null,
        x1: null,
        x2: null,
        y1: null,
        y2: null,
        segments: [],
        error: null,
        showMetrics: false,
        showLoading: false,
        elapsed: 0,
        found: 0,
        linesCount: 0,
        algorithm: 'Please select algorithm',
        generator: 'Please select generator'
    });
}

function getSceneOptions(state) {
    const lines = state.segments;
    window.lines = state.segments;
    const isAsync = state.isAsync;
    const stepsPerFrame = getNumber(state.stepsPerFrame, 20);
    return {
        lines,
        isAsync,
        stepsPerFrame,
        algorithm: whitelistedAlgorithms.has(state.algorithm) ? state.algorithm : 'bush'
    }
}

function getNumber(x, defaultValue) {
    const num = Number.parseFloat(x);
    return Number.isFinite(num) ? num : defaultValue;
}
