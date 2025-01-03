<template xmlns="http://www.w3.org/1999/html">
  <abs-overlay @unclick="editUsers = false" v-if="users.size === 0 || editUsers">
    <div id="dialog">
      <svg style="display: none;" xmlns="http://www.w3.org/2000/svg">
        <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
        <symbol id="delete-icon" viewBox="0 0 512 512">
          <path
            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/>
        </symbol>
      </svg>
      <div class="title">
        <span>Bruger{{ isFirstUser ? '' : 'e' }}</span>
        <span v-if="!isFirstUser" class="close" :style="{opacity: users.size === 0 ? '.1' : undefined}"
              @click="editUsers = false">LUK</span>
      </div>
      <div class="add" :style="{padding: isFirstUser ? '1.4rem' : undefined}">
        <form onsubmit="return false">
          <input type="text" size="16" name="name" :placeholder="isFirstUser ? 'Dit fulde navn' : 'Indtast fuldt navn'"
                 v-model="enteredName"/>
          <input type="submit" class="btn" :style="{opacity: enteredName === '' ? .5 : 1}"
                 @click="addUser(enteredName, isFirstUser)"
                 :value="isFirstUser ? 'Start' : 'Opret'"/>
        </form>
      </div>
      <ol class="user-list" v-if="!isFirstUser">
        <li v-for="user of users" :class="{chosen: user === currentUser}">
          <span class="mark">✔</span>
          <span class="name" @click="currentUser = user">{{ user }}</span>
          <svg class="delete-icon" @click="deleteUser(user)">
            <use xlink:href="#delete-icon"></use>
          </svg>
        </li>
      </ol>
    </div>
  </abs-overlay>
  <header>
    <div id="top">
      <div id="title" v-if="isLargeScreen">Slå Klubben</div>
      <div id="title" v-else></div>
      <ul id="tabs">
        <li @click="tab = 'routes'" :class="{active: tab==='routes'}">
          Ruter
        </li>
        <li @click="tab = 'problems'" :class="{active: tab==='problems'}">
          Problemer
        </li>
      </ul>
      <div id="user">
        <div v-if="isLargeScreen">
          <span v-if="users.size === 1">{{ currentUser }}</span>
          <select v-else class="chosen-user" v-model="currentUser">
            <option v-for="user in users" :value="user">{{ user }}</option>
          </select>
        </div>
        <div class="user-icon" @click="editUsers = true">
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
        <li
          v-for="climb in climbs.filter(c => c.type === 'route' && tab === 'routes' || c.type === 'problem' && tab === 'problems')">
          <span class="status ok" v-if="true">✔</span>
          <span class="status" v-else>✖</span>
          <label class="name" :for="'select-' + climb.id">{{ climb.name }}</label>
          <select
            :id="'select-' + climb.id"
            :value="userCompletion.find(c => c.climb === climb.id)?.completion"
            @change="val => changeCompletion(climb.id, val.target.value === '' ? null : val.target.value)"
          >
            <optgroup :label="currentUser">
              <option selected value="">Ikke gennemført</option>
              <option v-for="point in climb.points" :value="point.key">{{ point.key }}</option>
            </optgroup>
          </select>
        </li>
      </ul>
    </div>
  </main>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed, watch} from 'vue';
import AbsOverlay from "@/AbsOverlay.vue";

const randomUUID = function () {
  if (crypto?.randomUUID) {
    return crypto.randomUUID()
  } else {
    console.debug('No crypto. Using Math.random')
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
  }
}

const deviceId = ref(null)
if (window.localStorage.getItem('device-id') === null) {
  window.localStorage.setItem('device-id', randomUUID())
}
deviceId.value = window.localStorage.getItem('device-id')

console.debug('Device id', deviceId.value)

const tab = ref('routes')

let storedUsers = []
if (window.localStorage.getItem('sk-users') !== null) {
  storedUsers = JSON.parse(window.localStorage.getItem('sk-users'))
}
const users = ref(new Set(storedUsers))
const editUsers = ref(users.value.size === 0)
const enteredName = ref('')
const addUser = function (name) {
  if (isFirstUser.value) {
    editUsers.value = false
    currentUser.value = name
  } else {
    editUsers.value = true
  }
  users.value.add(name)
  enteredName.value = ''
}
const currentUser = ref(null)
if (window.localStorage.getItem('current-user') !== null) {
  currentUser.value = window.localStorage.getItem('current-user')
}
const isFirstUser = computed(() => users.value.size === 0)
const deleteUser = function (name) {
  users.value.delete(name)
  if (currentUser.value === name) {
    if (users.value.size > 0) {
      currentUser.value = users.value.values().next().value
    } else {
      currentUser.value = null
    }

  }
}
watch(users,  newUsersSet => {
  console.log('users changed')
  window.localStorage.setItem('sk-users', JSON.stringify([...newUsersSet.values()]))
}, { deep: true })

watch(currentUser,  user => {
  window.localStorage.setItem('current-user', user)
})

const climbs = ref([])
const completion = ref([])

const userCompletion = computed(() => completion.value.filter(c => c.device_id === deviceId.value && c.user_name === currentUser.value))

const isLargeScreen = ref(false)

const changeCompletion = async function (climbId, climbCompletion) {
  return fetch(`https://script.google.com/macros/s/${import.meta.env.VITE_GOOGLE_APPS_SCRIPT_DEPLOYMENT_ID}/exec`, {
    method: 'POST',
    body: JSON.stringify({
      device_id: deviceId.value,
      user_name: currentUser.value,
      climb: climbId,
      completion: climbCompletion,
    }),
  })
}

const loadClimbs = async () => {
  const res = await fetch(`https://script.google.com/macros/s/${import.meta.env.VITE_GOOGLE_APPS_SCRIPT_DEPLOYMENT_ID}/exec?action=climbs`);
  if (!res.ok) {
    throw new Error('Failed to get climbs.')
  }
  const loadedClimbs = await res.json();
  climbs.value = loadedClimbs.data;
}

loadClimbs()

const loadCompletion = async () => {
  const res = await fetch(`https://script.google.com/macros/s/${import.meta.env.VITE_GOOGLE_APPS_SCRIPT_DEPLOYMENT_ID}/exec?action=completion`);
  if (!res.ok) {
    throw new Error('Failed to get completion.')
  }
  const loadedCompletion = await res.json();
  completion.value = loadedCompletion.data;
}

loadCompletion()


// Function to check screen size
const checkScreenSize = () => {
  isLargeScreen.value = window.matchMedia('(min-width: 768px)').matches;
};


// Setup event listeners for screen resize
onMounted(() => {
  checkScreenSize(); // Initial check
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});

const clog = console.log

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

#user .chosen-user {
  padding: .3rem;
}

.user-icon {
  margin-left: 1rem;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
}

.delete-icon {
  margin-left: 1rem;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  opacity: .4;
}

.delete-icon:hover {
  opacity: 1;
}

.delete-icon:active {
  transform: scale(.96);
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

#dialog .add .btn {
  background-color: #bbb;
  color: white;
  margin-left: 1rem;
  padding: .4rem .6rem;
  border: none;
  cursor: pointer;
}

#dialog .add .btn:hover {
  background-color: #999;
}

#dialog .add .btn:active {
  color: #eee;
}

.completelist .status {
  margin-right: .5rem;
}

.completelist .status.ok {
  color: green;
}

h2 {
  font-size: 90%;
  opacity: .3;
}

main h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}


#dialog .title {
  background-color: #7da0cd;
  padding: 1rem 1.7rem;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#dialog .title .close {
  font-size: .7rem;
  opacity: .6;
  cursor: pointer;
  padding: .3rem;
  margin-right: -.3rem;
  user-select: none;
}

#dialog .title .close:hover {
  opacity: .8;
}

#dialog .title .close:active {
  opacity: .9;
}

#dialog .add {
  background-color: #e4e4e4;
  padding: .5rem 1.0rem .5rem 1.3rem;

  color: white;
  font-weight: bold;
}

#dialog .add input {
  padding: .3rem;
}

#dialog .user-list {
  margin: 0;
  padding-left: 0;
}

#dialog .user-list li {
  font-size: 105%;
  list-style-type: none;
  margin: 0;
  padding: 0rem 1.0rem 0rem .5rem;
  display: flex;
  align-items: center;
  justify-content: start;
}

#dialog .user-list li:hover {
  background-color: #eee;
}

#dialog .user-list li input {
  font-size: 110%;
}

#dialog .user-list li .mark {
  margin-right: .5rem;
  visibility: hidden;
}

#dialog .user-list li .name {
  flex: 1;
  cursor: pointer;
  padding: 1rem 0;
}

#dialog .user-list li.chosen .name {
  font-weight: bold;
}

#dialog .user-list li.chosen .mark {
  visibility: visible;
}

</style>
