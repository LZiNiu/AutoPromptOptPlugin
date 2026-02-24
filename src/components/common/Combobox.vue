<template>
  <div class="combobox" ref="comboboxRef">
    <input
      v-model="inputValue"
      type="text"
      :placeholder="placeholder"
      class="combobox-input"
      @focus="showDropdown = true"
      @blur="handleBlur"
      @input="handleInput"
      @keydown="handleKeydown"
    />
    <button
      v-if="inputValue"
      @click="clearInput"
      type="button"
      class="combobox-clear"
      :title="t('common.clear')"
    >
      ✕
    </button>
    <Transition name="dropdown">
      <div v-if="showDropdown && filteredOptions.length > 0" class="combobox-dropdown" ref="dropdownRef">
        <div
          v-for="(option, index) in filteredOptions"
          :key="option"
          :ref="(el) => setOptionRef(el, index)"
          class="combobox-option"
          :class="{ 
            selected: option === inputValue,
            highlighted: index === selectedIndex 
          }"
          @mousedown="selectOption(option)"
        >
          {{ option }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

// 获取国际化翻译函数
const { t } = useI18n();

// 定义组件的 props 类型
const props = defineProps<{
  modelValue: string;    // v-model 绑定的值
  options: string[];     // 可选选项列表
  placeholder?: string;  // 输入框占位符文本
}>();

// 定义组件的 emit 事件
const emit = defineEmits<{
  'update:modelValue': [value: string];  // v-model 更新事件
}>();

// 组件引用，用于访问 DOM 元素
const comboboxRef = ref<HTMLElement | null>(null);

// 下拉菜单的引用，用于滚动控制
const dropdownRef = ref<HTMLElement | null>(null);

// 存储每个选项的 DOM 元素引用
const optionRefs = ref<(HTMLElement | null)[]>([]);

// 输入框的当前值，与 modelValue 同步
const inputValue = ref(props.modelValue);

// 控制下拉菜单的显示/隐藏状态
const showDropdown = ref(false);

// 当前高亮的选项索引，用于键盘导航
const selectedIndex = ref(-1);

// 设置选项的 DOM 引用
function setOptionRef(el: any, index: number) {
  if (el) {
    optionRefs.value[index] = el;
  }
}

// 将高亮的选项滚动到可视区域
function scrollIntoView() {
  if (selectedIndex.value >= 0 && optionRefs.value[selectedIndex.value]) {
    const option = optionRefs.value[selectedIndex.value];
    const dropdown = dropdownRef.value;
    
    if (option && dropdown) {
      const optionTop = option.offsetTop;
      const optionBottom = optionTop + option.offsetHeight;
      const dropdownTop = dropdown.scrollTop;
      const dropdownBottom = dropdownTop + dropdown.offsetHeight;
      
      // 如果选项在可视区域上方，向上滚动
      if (optionTop < dropdownTop) {
        dropdown.scrollTop = optionTop;
      }
      // 如果选项在可视区域下方，向下滚动
      else if (optionBottom > dropdownBottom) {
        dropdown.scrollTop = optionBottom - dropdown.offsetHeight;
      }
    }
  }
}

// 计算属性：根据输入值过滤选项列表
const filteredOptions = computed(() => {
  // 如果没有输入值，返回所有选项
  if (!inputValue.value) {
    return props.options;
  }
  // 过滤出包含输入值的选项（不区分大小写）
  return props.options.filter(option =>
    option.toLowerCase().includes(inputValue.value.toLowerCase())
  );
});

// 处理输入框失去焦点事件
// 使用 setTimeout 延迟关闭下拉菜单，以便处理点击选项事件
function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

// 处理输入事件
// 更新 modelValue，显示下拉菜单，并重置选中索引
function handleInput() {
  emit('update:modelValue', inputValue.value);
  showDropdown.value = true;
  selectedIndex.value = -1;
}

// 选择一个选项
// 更新输入值和 modelValue，然后关闭下拉菜单
function selectOption(option: string) {
  inputValue.value = option;
  emit('update:modelValue', option);
  showDropdown.value = false;
}

// 清空输入框
// 重置输入值和 modelValue，并显示下拉菜单
function clearInput() {
  inputValue.value = '';
  emit('update:modelValue', '');
  showDropdown.value = true;
}

// 处理键盘导航事件
// 支持上下箭头选择、回车确认、ESC 关闭
function handleKeydown(event: KeyboardEvent) {
  // 如果下拉菜单未显示或没有选项，不处理键盘事件
  if (!showDropdown.value || filteredOptions.value.length === 0) {
    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      // 向下箭头：移动到下一个选项
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredOptions.value.length - 1);
      // 滚动到高亮选项
      nextTick(() => scrollIntoView());
      break;
    case 'ArrowUp':
      // 向上箭头：移动到上一个选项
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      // 滚动到高亮选项
      nextTick(() => scrollIntoView());
      break;
    case 'Enter':
      // 回车键：选择当前高亮的选项
      event.preventDefault();
      if (selectedIndex.value >= 0 && filteredOptions.value[selectedIndex.value]) {
        selectOption(filteredOptions.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      // ESC 键：关闭下拉菜单并重置选中索引
      showDropdown.value = false;
      selectedIndex.value = -1;
      break;
  }
}
</script>

<style scoped>
.combobox {
  position: relative;
  width: 100%;
}

.combobox-input {
  width: 100%;
  padding: 10px 32px 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background-color: white;
  transition: border-color 0.2s;
  font-family: inherit;
}

.combobox-input:hover {
  border-color: #9ca3af;
}

.combobox-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.combobox-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.combobox-clear:hover {
  color: #ef4444;
}

.combobox-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

.combobox-option {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 14px;
  color: #374151;
}

.combobox-option:hover,
.combobox-option.highlighted {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.combobox-option.selected {
  font-weight: 500;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
