<template xmlns="http://www.w3.org/1999/html">
  <abs-overlay v-if="chosenClimb !== null" @unclick="chosenClimb = null">
    <div id="dialog" :style="{width: isLargeScreen ? '500px' : '100%'}">
      <div v-if="!chosenClimb.completion">
        <span id="d-user">Søren Balje&nbsp;</span>har <strong>ikke</strong> gennemført <em>{{ chosenClimb.name }}</em>
      </div>
      <div v-else>
        <span id="d-user">Søren Balje&nbsp;</span>har gennemført <em>{{ chosenClimb.name }}</em>: {{ chosenClimb.completion }}
      </div>
        <fieldset>
          <legend>Hvordan er ruten gennemført?</legend>
          <div class="completion-option">
            <input type="radio" name="completion" value="none" id="none" checked />
            <label for="none">Ikke gennemført</label>
          </div>
          <div v-for="point in chosenClimb.points" class="completion-option">
            <input type="radio" name="completion" :value="point.value" :id="point.key" checked />
            <label :for="point.key">{{ point.key }}</label>
          </div>
        </fieldset>
    </div>
  </abs-overlay>
  <header>
    <div id="top">
      <div id="title">Slå Klubben</div>
      <ul id="tabs">
        <li @click="tab = 'routes'" :class="{active: tab==='routes'}">
          Ruter
        </li>
        <li @click="tab = 'problems'" :class="{active: tab==='problems'}">
          Problemer
        </li>
      </ul>
      <div id="user">
        <div v-if="isLargeScreen">Søren Balje</div>
        <div class="user-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    </div>
  </header>
  <main>
    <div>
      <h2>ALLE {{ tab === 'routes' ? 'RUTER' : 'PROBLEMER' }}</h2>
      <ul class="completelist">
        <li v-for="r in climbs.filter(c => c.type === 'route')">
          <!--          <span class="status ok" v-if="true">✔</span>-->
          <!--          <span class="status" v-else>✖</span>-->
          <div class="name">{{ r.name }}</div>
          <button @click="select(r)">Vælg ›</button>
        </li>
      </ul>
    </div>
  </main>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue';
import AbsOverlay from "@/AbsOverlay.vue";

const tab = ref('routes')

const climbs = ref([])

const chosenClimb = ref(null)

const isLargeScreen = ref(false);

const climbTypeDanish = function (climbType, singular = true, definite = true) {
  if (climbType === 'route') {
    if (singular) {
      return definite ? 'ruten' : 'rute'
    } else {
      return definite ? 'ruterne' : 'ruter'
    }
  } else if (climbType === 'problem') {
    if (singular) {
      return definite ? 'problemet' : 'problem'
    } else {
      return definite ? 'problemerne' : 'problemer'
    }
  }
}

const select = function (climb) {
  console.log(climb)
  chosenClimb.value = climb
}
const deviceId = ref(null)

const register = async function () {
  return fetch('https://script.google.com/macros/s/AKfycbzQVsQezkpdKA9QZIaamndJ4QofY1k5a7Kggf5pxPNoLZdC1eSj5eWBBf_C3fHyZYUjcA/dev', {
    method: 'POST',
    body: JSON.stringify({
      device_id: deviceId.value,
      user_name: 'Steffen Balje',
      completed: true,
      climb_id: 'R1',
      climb_completion: 'Zone',
    }),
  })
}

const loadClimbs = async function () {
  const res = await fetch('https://script.google.com/macros/s/AKfycbzQVsQezkpdKA9QZIaamndJ4QofY1k5a7Kggf5pxPNoLZdC1eSj5eWBBf_C3fHyZYUjcA/dev');
  if (!res.ok) {
    throw new Error('Failed to get climbs')
  }
  const loadedClimbs = await res.json();
  climbs.value = loadedClimbs.data;
}

loadClimbs()

// Function to check screen size
const checkScreenSize = () => {
  isLargeScreen.value = window.matchMedia('(min-width: 768px)').matches;
};


// Setup event listeners for screen resize
onMounted(() => {
  checkScreenSize(); // Initial check
  window.addEventListener('resize', checkScreenSize);
  deviceId.value = window.localStorage.getItem('device-id')
  if (deviceId.value === null) {
    window.localStorage.setItem('device-id', crypto.randomUUID())
  }
  console.debug('Device id', deviceId.value)

});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});

</script>

<style>
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #efefef;
  color: #333;
}

/* Reset some default styles */
body, h1, p {
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  --large-width: 768px;
  position: relative;
}

#top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-items: stretch;
  margin-left: auto;
  margin-right: auto;
}

/* Top Bar */
header {
  position: fixed;
  background-color: rgb(56, 56, 56);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  display: flex;
  align-items: center;
  height: 4rem;
  padding-left: .8em;
  padding-right: .8rem;
}

#title {
  font-size: 1.2rem;
  flex: 1;
  margin-left: .5rem;
}

#tabs {
  display: flex;
  height: 100%;
  flex: 0;
  padding: 0;
}

#tabs li {
  height: 100%;
  margin-left: 1rem;
  margin-right: 1rem;
  padding-bottom: 4px;
  list-style-type: none;
  cursor: pointer;
  border-bottom: 4px solid rgba(239, 239, 239, .1);
}

#tabs li.active {
  border-bottom: 4px solid #efefef;
}

#user {
  display: flex;
  align-items: center;
  justify-content: end;
  flex: 1;
}

.user-icon {
  margin-left: 1rem;
  width: 2rem;
  height: 2rem;
}

/* Main Content */
main {
  padding-top: 4rem;
  display: flex;
  justify-content: center;
}

.completelist {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  min-width: 140px;
  max-width: var(--large-width);
}

.completelist li {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  justify-content: space-between;
}

.completelist .name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Prevents text from overflowing */
  flex-grow: 1;
  flex-shrink: 1;
  font-size: 1.5rem;
  margin-right: 2rem;
}

.completelist input {
  cursor: pointer;
  zoom: 1.3;
}

.completelist button {
  padding: .4rem .6rem;
  border-radius: 0;
  border: 1px solid black;
}

.completelist .status {
  margin-right: .5rem;
}

.completelist .status.ok {
  color: green;
}

h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 90%;
  opacity: .3;
}

#d-user {
  font-size: 110%;
  font-weight: bold;
}

#dialog fieldset {
  margin-top: 1rem;
}

#dialog .completion-option {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

#dialog .completion-option label {
  margin-left: 1rem;
  flex: 1;
}

</style>
