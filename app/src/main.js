import Vue from 'vue'
import App from './App.vue'
import createScene from './scene';

import * as gen from './generators';
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

qs.onChange(updateScene);
bus.on('app-loaded', renderFirstTime);
bus.on('change-qs', (newState) => {
    let link = document.getElementById("download-report");
    link.style.visibility = 'hidden';
    qs.set(newState);
    updateScene(newState);
});

bus.on('start-app', () => {
    let link = document.getElementById("download-report");
    link.style.visibility = 'hidden';
});

bus.on('prepare-report', intersections => {
    let csv = "";
    intersections.forEach(function(intersection) {
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

var sceneOptions = getSceneOptions(qs.get());
var currentScene;

Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')


function renderFirstTime() {
    currentScene = createScene(sceneOptions, document.getElementById('scene'));
}

function updateScene(appState) {
    appState.showLoading = true;
    appState.showMetrics = false;
    sceneOptions = getSceneOptions(appState);
    if (currentScene) {
        currentScene.dispose();
    }
    currentScene = createScene(sceneOptions, document.getElementById('scene'));
}

function getSceneOptions(state) {
    var generator = state.generator;
    if (!(generator in gen)) {
        generator = 'drunkgrid'
    }
    var p0 = getNumber(state.p0, 50);
    var p1 = getNumber(state.p1, 4);

    var lines = gen[generator](p0, p1);
    window.lines = lines;
    var isAsync = state.isAsync;
    var stepsPerFrame = getNumber(state.stepsPerFrame, 20);
    return {
        lines,
        isAsync,
        stepsPerFrame,
        algorithm: whitelistedAlgorithms.has(state.algorithm) ? state.algorithm : 'bush'
    }
}

function getNumber(x, defaultValue) {
    var num = Number.parseFloat(x);
    return Number.isFinite(num) ? num : defaultValue;
}
