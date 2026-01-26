<script setup lang="ts">

import { ref, onMounted, onUnmounted } from 'vue'

import FooterInfo from '../../component/Footer.vue';
import { fetchData, getAlphaIds } from '../../service'
import { tokenUrl } from '../../constants';

</script>

<template>
  <Analytics />
  <SpeedInsights />
  <h3 class="title">Winter 1秒波动</h3>
    <div id="errorDisplay" v-if="errorMessage " class="error-message error-style-1 fade-in">
      <div class="error-icon">⚠️</div>
      <div>{{ errorMessage }}</div>
      <!-- <button class="close-btn">×</button> -->
    </div>
  <div class="container">
    <AlertComponent 
      v-for="alertData in alertDataList"
      :key="alertData.id"
      :currencySymbol="alertData.currencySymbol"
      :fluctuation="parseFloat(alertData.fluctuation)"
      :amount="alertData.amount"
      :price="alertData.lastPrice"
      class="item"
    />

  </div>
  <div class="button-container">
      <button v-if="isFetching" @click="handleStopClick" class="stop-btn base-btn">
          停止自动刷新
      </button>
      <button v-else @click="startFetching" class="start-btn base-btn">
          开始自动刷新
      </button>
  </div>
  <FooterInfo />
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
  max-width: 48%;
  box-sizing: border-box; /* 包含padding和border */
  margin: 1%;
}

.error-message {
    padding: 15px 20px;
    border-radius: 8px;
    margin: 15px 0;
    display: flex;
    align-items: center;
    font-weight: 500;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}
        .error-style-1 {
    background-color: #ffeaea;
    border: 1px solid #ffcdd2;
    color: #d32f2f;
    box-shadow: 0 2px 5px rgba(244, 67, 54, 0.1);
}
        .error-icon {
    margin-right: 12px;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 按钮容器样式 - 实现居中 */
  .button-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      padding: 20px;
  }
  
  /* 基础按钮样式 */
  .base-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-width: 140px;
  }
  
  /* 开始按钮样式 */
  .start-btn {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
  }
  
  .start-btn:hover {
      background: linear-gradient(135deg, #45a049, #3d8b40);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .start-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* 停止按钮样式 */
  .stop-btn {
      background: #6c757d;
      color: white;
  }
  
  .stop-btn:hover {
      background: #5a6268;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .stop-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* 响应式设计 */
  @media (max-width: 480px) {
      .base-btn {
          padding: 10px 20px;
          font-size: 14px;
          min-width: 120px;
      }
  }
</style>
