<template>
  <div class="alert-component">
    <div class="currency-info">
      <span class="currency-symbol">{{ currencySymbol }}</span>
      <span 
        v-if="showAlert" 
        class="alert-symbol"
        :class="alertClass"
      >!</span>
    <div class="hint" :class="hintClass">{{ hintText }}</div>
    </div>
    <div class="details">
      <span class="fluctuation">万分之{{ fluctuation.toFixed(2) }}</span>
      <span class="amount">额{{ formatAmount(amount) }}</span>
    </div>
    <div class="details">
    <span class="fluctuation"> </span>
      <span class="amount">价{{ formatPrice(price) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withDefaults, defineProps, computed } from 'vue';
import { formatWithUnits } from '../utils';
// 定义组件props类型
interface Props {
  currencySymbol: string;
  fluctuation: number;
  amount: string;
  price: string;
}

// 定义props
const props = withDefaults(defineProps<Props>(), {
  currencySymbol: '',
  fluctuation: 0,
  amount: '0',
  price: '0',
});

// 计算是否显示告警符号
const showAlert = computed(() => props.fluctuation >= 1);

// 计算告警符号的样式类
const alertClass = computed(() => {
  if (props.fluctuation >= 5) {
    return 'alert-high';
  } else if (props.fluctuation >= 1) {
    return 'alert-medium';
  }
  return '';
});

const formatPrice = (price) => {
    console.log(price);
    return formatWithUnits(price)
}

// 格式化金额显示
const formatAmount = (amount: string): string => {
    // console.log(amount)
    return amount;
//   if (amount >= 1000000) {
//     return `${(amount / 1000000).toFixed(1)}M`;
//   } else if (amount >= 1000) {
//     return `${(amount / 1000).toFixed(0)}k`;
//   }
//   return amount.toString();
};

// 计算提示文字
const hintText = computed(() => {
  if (props.fluctuation >= 1) {
    return '卖出';
  }
  return '刷分';
});

// 计算提示文字的样式类
const hintClass = computed(() => {
  if (props.fluctuation >= 5) {
    return 'hint-high';
  } else if (props.fluctuation >= 1) {
    return 'hint-medium';
  }
  return 'hint-normal';
});

// 为告警符号添加tooltip
const alertTooltip = computed(() => {
  if (props.fluctuation >= 1) {
    return '卖出';
  }
  return '';
});
</script>

<style scoped>
.alert-component {
  font-family: 'Arial', sans-serif;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-width: 300px;
  background-color: #f9f9f9;
}

.currency-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.currency-symbol {
  font-size: 20px;
  font-weight: bold;
  margin-right: 8px;
}

.alert-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.alert-medium {
  background-color: #ffc107; /* 黄色 */
}

.alert-high {
  background-color: #f44336; /* 红色 */
}

.details {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.fluctuation, .amount {
  color: #666;
}
.hint {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  font-weight: bold;
}

.hint-normal {
  background-color: #e8f5e9; /* 浅绿色 */
  color: #2e7d32;
}

.hint-medium {
  background-color: #fff8e1; /* 浅黄色 */
  color: #ff8f00;
}

.hint-high {
  background-color: #ffebee; /* 浅红色 */
  color: #c62828;
}
</style>