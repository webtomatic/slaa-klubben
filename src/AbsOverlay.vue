<script setup>
const emit = defineEmits(['unclick'])
const unclick = function (event) {

  if (event.target.classList.contains('abs-overlay')) {
    emit('unclick')
  }
}

</script>

<template>
  <div class="abs-overlay" @click="unclick">
    <slot name="default"/>
  </div>
</template>

<style>
.abs-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, .4);
  z-index: 5;
  display: flex;
  align-items: start;
  justify-content: center;
}

#dialog {
  z-index: 7;
  background-color: white;
  margin-top: 6rem;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  display: flex;
  flex-direction: column;
}

</style>
