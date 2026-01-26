<script setup lang="ts">
// TODO: api 报错时候提示停止使用
// 定时停止刷新，防止api滥用
// 收集使用者ip，统计pv
// 放主人推广信息
// 加使用说明
import { ref, onMounted, onUnmounted } from 'vue'
import { Analytics } from '@vercel/analytics/vue';
import { SpeedInsights } from '@vercel/speed-insights/vue';
import AlertComponent from '../../component/Item.vue'
import FooterInfo from '../../component/Footer.vue';
import { fetchData, getAlphaIds } from '../../service'
import { tokenUrl, defaultCoins } from '../../constants';
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
  return symbolsParam ? symbolsParam.split(',') : defaultCoins;
}
const errorMessage = ref('')
function checkDataAbnormalities(results: any[]) {
  for (const result of results) {
    const coin = result?.currencySymbol || '';
    try {
      const fluctuation = parseFloat(result.fluctuation)
      if (isNaN(fluctuation)) {
        errorMessage.value = coin + '无数据，卖出' + coin;
      } else if (fluctuation > 1000) {
        errorMessage.value = coin + '波动巨大，卖出' + coin;
      }
    } catch {
      errorMessage.value = coin + '出错，卖出' + coin;
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
  if (confirm('自动刷新已暂停，点击继续自动刷新')) {
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

const toggleStop = () => {
  if (isFetching.value === true) {
    handleStopClick();
  } else {
    startFetching();
  }
}

const handleKeyPress = (event) => {
  if (event.code === 'Space') {
    toggleStop();
  }
}

// 修改onMounted中的调用
onMounted(() => {
  startTime.value = Date.now()
  fetchDataForSymbols()
  timer.value = setInterval(fetchDataForSymbols, 1000)
  window.addEventListener('keydown', handleKeyPress)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopFetching();
  window.removeEventListener('keydown', handleKeyPress)
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
  <Analytics />
  <SpeedInsights />
  <h3 class="title">Winter 1秒波动</h3>
  <h2 class="sub-title">所有的出发都是为了更好的回来</h2></br>
  <button style="margin: 0 auto;" onclick="document.getElementById('modal').showModal();">加入群聊</button><dialog id="modal" style="position:relative;">
    <span onclick="this.parentElement.close();" style="position:absolute;top:0;right:0;cursor:pointer;">&times;</span>
    <img src="https://youke.xn--y7xa690gmna.cn/s1/2026/01/26/69776f771a8a5.webp" alt="图片" style="width:100%;height:auto;">
</dialog>
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
      :mulPoint="alertData.mulPoint"
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
.title {
  
}
.sub-title {
  text-align: center;
  font-size: 16px;
  color: cornflowerblue;
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
