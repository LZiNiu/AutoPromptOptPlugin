<template>
  <div class="api-key-input">
    <div class="input-wrapper">
      <input
        :type="showKey ? 'text' : 'password'"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder || t('settings.apiKeyPlaceholder')"
        class="api-key-field"
        :class="{ compact }"
      />
      <button
        @click="showKey = !showKey"
        type="button"
        class="toggle-visibility"
        :title="showKey ? 'Hide' : 'Show'"
      >
        {{ showKey ? '🙈' : '👁️' }}
      </button>
      <button
        v-if="modelValue"
        @click="handleClear"
        type="button"
        class="clear-key"
        title="Clear"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  compact?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const showKey = ref(false);

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function handleClear() {
  emit('update:modelValue', '');
}
</script>

<style scoped>
.api-key-input {
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.api-key-field {
  width: 100%;
  padding: 10px 48px 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background-color: white;
  transition: border-color 0.2s;
  font-family: 'Courier New', monospace;
}

.api-key-field.compact {
  padding: 8px 44px 8px 10px;
  font-size: 13px;
}

.api-key-field:hover {
  border-color: #9ca3af;
}

.api-key-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-visibility,
.clear-key {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.toggle-visibility:hover,
.clear-key:hover {
  transform: scale(1.1);
}

.clear-key {
  right: 40px;
  font-size: 14px;
  color: #6b7280;
}

.clear-key:hover {
  color: #ef4444;
}
</style>
