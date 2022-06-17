<template>
  <div id="app">
    <h3>WSB project by</h3>
    <ul>
      <li>Tomasz Czermiński</li>
      <li>Tomasz Juszkiewicz</li>
      <li>Grażyna Górka</li>
    </ul>
    <div v-if='!showLoading'>
      <div id="mode-selector">
        <div>Input mode:</div>
        <span>
        <input type="radio" id="random" value="random" v-model="mode"/>
        <label for="random">Random</label>
        </span>
        <span>
          <input type="radio" id="manual" value="manual" v-model="mode"/>
        <label for="manual">Manual</label>
        </span>
      </div>
      <div style="clear: both"></div>
      <a href='#' @click.prevent='generateNew()' v-if="mode == 'random'" class='action'>Generate</a>
      <form v-if="mode == 'manual'">
        <div>
          <label for="x1">x1:</label>
          <input id="x1" type="number" v-model.number="x1"/>
          <label for="y1">y1:</label>
          <input id="y1" type="number" v-model.number="y1"/>
        </div>
        <div>
          <label for="x2">x2:</label>
          <input id="x2" type="number" v-model.number="x2"/>
          <label for="y2">y2:</label>
          <input id="y2" type="number" v-model.number="y2"/>
        </div>
        <a href='#' @click.prevent='addSegment()' v-if="x1 != null && x2 != null && y1 != null && y2 != null" class='action'>Add segment</a>
      </form>
      <a href='#' @click.prevent='start()' v-if="segments.length >= 2" class='action'>Start</a>
      <a href='#' @click.prevent='clear()' v-if="segments.length > 0" class='action'>Clear</a>
    </div>
    <a id="download-report" href='#' style="visibility: hidden" class='action' download>Download CSV</a>
    <div style="visibility: hidden" id='results'>
      <div id="metrics"><strong>{{ linesCount }}</strong> segments. Found <strong>{{ found }}</strong> intersections in
        <strong>{{ elapsed }}</strong></div>
    </div>
    <div v-if='showLoading' class='loading-container'>
      <div class='loader'>Finding intersections...</div>
      <div class='label'>Finding intersections...</div>
    </div>
    <div class='error' v-if='error'>
      Asserting failed in sweep line.
    </div>

  </div>
</template>

<script>
import appState from './appStatus.js';
import generateRandomExample from './generateRandomExample';
import bus from './bus';

export default {
  name: 'app',
  props: ['state'],
  data() {
    return appState;
  },
  mounted() {
    bus.fire('app-loaded');
  },
  methods: {
    generateNew() {
      let newState = generateRandomExample();
      const diff = {
        ...appState,
        ...newState
      }
      bus.fire('change-qs', diff);
    },
    start() {
      bus.fire('start')
    },
    clear() {
      this.segments.splice(0, this.segments.length)
      bus.fire('clear-scene', {});
    },
    addSegment() {
      const segment = {
        from: {
          x: this.x1,
          y: this.y1
        },
        to: {
          x: this.x2,
          y: this.y2
        }
      };
      this.x1 = null;
      this.x2 = null;
      this.y1 = null;
      this.y2 = null;
      this.segments.push(segment);
      const newState = {
        ...appState,
        generator: 'manual',
        algorithm: 'sweep'
      }
      bus.fire('change-qs', newState);
    }
  },
}
</script>

<style>
#app {
  width: 400px;
  position: absolute;
  padding: 8px;
  background: #101830;
}

a.action {
  color: #fff;
  font-size: 16px;
  padding: 8px;
  flex: 1;
  border: 1px solid #99c5f1;
  justify-content: center;
  align-items: center;
  display: flex;
}

h3 {
  font-weight: normal;
  text-align: center;
  margin: 25px 0 7px;
}

h3 strong {
  font-weight: bold;
}

a {
  text-decoration: none;
  margin-top: 10px;
}

#results {
  margin-top: 7px;
}

.error {
  background: orangered;
  margin: 0 -8px;
  padding: 0 8px;
}

@media (max-width: 600px) {
  #app {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  #results {
    font-size: 12px;
    margin: 7px;
  }

  h3 {
    margin: 7px;
  }

  .error {
    padding: 0 7px;
    margin: 0;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px;
  border: 1px solid #777;
}

.loading-container .label {
  margin-left: 8px;
}

.loader,
.loader:before,
.loader:after {
  border-radius: 50%;
}

.loader {
  color: #ffffff;
  font-size: 2px;
  text-indent: -99999em;
  position: relative;
  width: 10em;
  height: 10em;
  box-shadow: inset 0 0 0 1em;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}

.loader:before,
.loader:after {
  position: absolute;
  content: '';
}

.loader:before {
  width: 5.2em;
  height: 10.2em;
  background: #101830;
  border-radius: 10.2em 0 0 10.2em;
  top: -0.1em;
  left: -0.1em;
  -webkit-transform-origin: 5.2em 5.1em;
  transform-origin: 5.2em 5.1em;
  -webkit-animation: load2 2s infinite ease 1.5s;
  animation: load2 2s infinite ease 1.5s;
}

.loader:after {
  width: 5.2em;
  height: 10.2em;
  background: #101830;
  border-radius: 0 10.2em 10.2em 0;
  top: -0.1em;
  left: 5.1em;
  -webkit-transform-origin: 0px 5.1em;
  transform-origin: 0px 5.1em;
  -webkit-animation: load2 2s infinite ease;
  animation: load2 2s infinite ease;
}

@-webkit-keyframes load2 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes load2 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

#metrics {
  margin-top: 25px;
}

#mode-selector {
  text-align: center;
  margin-bottom: 25px;
}

#mode-selector div {
  margin-bottom: 5px;
}

#mode-selector span {
  min-width: 50%;
  float: left;
}

form {
  margin-top: 15px;
}

form a {
  margin-top: 15px;
}

form label:first-of-type {
  margin-left: 25px;
  margin-right: 5px;
}

form label:last-of-type {
  margin-left: 25px;
  margin-right: 5px;
}

form input {
  width: 30%;
}

</style>
