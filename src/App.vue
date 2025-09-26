<script setup lang="ts">
// TODO: api 报错时候提示停止使用
// 定时停止刷新，防止api滥用
import AlertComponent from './component/Item.vue';
</script>

<template>
  <h3 class="title">最近 10 秒波动告警</h3>
  <div class="container">
      <AlertComponent 
      currencySymbol="WOD" 
      :fluctuation="0.5" 
      :amount="150000"
      class="item"
    />
      <AlertComponent 
      currencySymbol="WOD" 
      :fluctuation="5.5" 
      :amount="150000"
      class="item"
    />

  </div>
</template>

<style scoped>
h3 {
  text-align: center;
}
.container {
  display: flex;
  flex-wrap: wrap;
}

.item {
  flex: 1 1 48%; /* 关键属性 */
  min-width: 48%; /* 确保每行最多两个 */
  box-sizing: border-box; /* 包含padding和border */
  margin: 1%;
}
</style>
