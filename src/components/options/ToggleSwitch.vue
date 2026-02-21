<template>
  <button
    @click="toggle"
    :class="['toggle-switch', { active: modelValue }]"
    :aria-checked="modelValue"
    role="switch"
    type="button"
  >
    <span class="toggle-slider"></span>
  </button>
</template>

<script setup lang="ts">

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function toggle() {
  emit('update:modelValue', !props.modelValue);
}

const props = defineProps<{
  modelValue: boolean;
}>();
</script>

<style scoped>
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #d1d5db;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0;
}

.toggle-switch:hover {
  background-color: #9ca3af;
}

.toggle-switch.active {
  background-color: #3b82f6;
}

.toggle-switch.active:hover {
  background-color: #2563eb;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

.toggle-switch:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
</style>
