<script setup lang="ts">
// TODO: api 报错时候提示停止使用
// 定时停止刷新，防止api滥用
import { ref, onMounted, onUnmounted } from 'vue'
import AlertComponent from './component/Item.vue'
import { fetchData, getAlphaIds } from './service'
import { tokenUrl } from './constants';
// 类型定义
interface TokenInfo {
  id: string
  symbol: string
}

interface CurrencyData {
  id: string
  currencySymbol: string
  prefix: string
  fluctuation: string
  amount: string
  price: string
  duration: string
}

// 响应式数据
const alertDataList = ref<CurrencyData[]>([])
const timer = ref<number | null>(null)
const startTime = ref<number>(0)
const MAX_DURATION = 5 * 60 * 1000 // 5分钟

// 从URL查询参数获取币种列表
function getSymbolsFromQuery(): string[] {
  const urlParams = new URLSearchParams(window.location.search)
  const symbolsParam = urlParams.get('symbols')
  return symbolsParam ? symbolsParam.split(',') : []
}
const errorMessage = ref('')
function checkDataAbnormalities(results: any[]) {
  for (const result of results) {
    const fluctuation = parseFloat(result.fluctuation)
    
    if (isNaN(fluctuation) || fluctuation > 1000) {
      errorMessage.value = '数据可能出错了，请立即卖出'
      break
    }
  }
}
// 获取币种实时数据
async function fetchDataForSymbols() {
  const symbols = getSymbolsFromQuery()
  if (symbols.length === 0) return

  try {
    // 获取alphaIds（只在第一次调用）
    if (!window.alphaIdsCache) {
      window.alphaIdsCache = await getAlphaIds(symbols, tokenUrl)
    }

    const fetchPromises = window.alphaIdsCache.map((currency: TokenInfo) => 
      fetchData(currency)
    )

    const results = await Promise.all(fetchPromises)
    alertDataList.value = results.filter(Boolean) as CurrencyData[]
        // 检查数据异常
    checkDataAbnormalities(results)
    // 检查是否超时
    if (Date.now() - startTime.value > MAX_DURATION) {
      stopFetching()
      showTimeoutAlert()
      return
    }
  } catch (error) {
    errorMessage.value = '数据可能出错了，请立即卖出';
    console.error('获取币种数据失败:', error)
  }
}

const isFetching = ref(true)
const isManualStopped = ref(false)

// 修改停止函数
function stopFetching() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
    isFetching.value = false
  }
}

// 新增开始函数
function startFetching() {
  if (!isFetching.value) {
    isFetching.value = true
    errorMessage.value = '';
    timer.value = setInterval(fetchDataForSymbols, 1000)
  }
}

// 修改超时提示函数
function showTimeoutAlert() {
  if (confirm('为避免API滥用，数据获取已自动停止。是否继续轮询？')) {
    startTime.value = Date.now() // 重置计时
    startFetching()
  } else {
    isManualStopped.value = true
  }
}

// 新增手动停止按钮处理
function handleStopClick() {
  stopFetching()
  isManualStopped.value = true
  errorMessage.value = '已停止，数据不可参考'
}

// 修改onMounted中的调用
onMounted(() => {
  startTime.value = Date.now()
  fetchDataForSymbols()
  timer.value = setInterval(fetchDataForSymbols, 1000)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopFetching()
})

// 声明全局缓存变量
declare global {
  interface Window {
    alphaIdsCache?: TokenInfo[]
  }
}

// API函数声明（需要根据实际情况实现）
// declare function getAlphaIds(symbols: string[], tokenUrl: string): Promise<TokenInfo[]>
// declare function fetchData(currency: TokenInfo): Promise<CurrencyData>
// const tokenUrl = '你的tokenUrl' // 需要设置实际的tokenUrl
</script>

<template>
  <h3 class="title">最近 10 秒波动告警</h3>
    <div id="errorDisplay" v-if="errorMessage" class="error-message error-style-1 fade-in">
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
