import axios from "axios";
import { dataUrl } from "./constants";
/**
 * 格式化数字为易读的字符串（K、M、B等单位）
 * @param {number|string} num - 要格式化的数字
 * @param {number} decimals - 保留的小数位数（默认1位）
 * @param {boolean} includeDecimalForSmallNumbers - 小数字是否也包含小数（默认false）
 * @returns {string} 格式化后的字符串
 */
 function formatNumber(num, decimals = 0, includeDecimalForSmallNumbers = false) {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) {
        throw new Error('输入的不是有效数字');
    }
    const units = [
        { threshold: 1e9, suffix: 'B' },  // 十亿
        { threshold: 1e6, suffix: 'M' },  // 百万
        { threshold: 1e3, suffix: 'K' },  // 千
        { threshold: 1, suffix: '' }      // 无单位
    ];
    // 处理负数
    const absNumber = Math.abs(number);
    const isNegative = number < 0;
    // 查找合适的单位
    const unit = units.find(u => absNumber >= u.threshold) || units[units.length - 1];
    // 计算格式化后的值
    let formattedValue = absNumber / unit.threshold;
    // 判断是否需要显示小数部分
    const shouldShowDecimal = unit.threshold > 1 || (includeDecimalForSmallNumbers && formattedValue !== Math.floor(formattedValue));
    // 格式化数字
    if (shouldShowDecimal) {
        // 使用toFixed并去除末尾的0
        formattedValue = formattedValue.toFixed(decimals).replace(/\.?0+$/, '');
    } else {
        formattedValue = Math.round(formattedValue).toString();
    }
    // 添加负号并返回结果
    return (isNegative ? '-' : '') + formattedValue + unit.suffix;
  }
  const simpleFetch = async (url, params) => {
    const response = await axios.get(url, {
      params: params,
      timeout: 5000, // 设置超时时间
      headers: {
          // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      proxy: {
          host: '127.0.0.1',
          port: 7890,
          protocol: 'http'
      }
  });
    return response.data;
  };
export async function getAlphaIds(symbols, url) {
      try {
        const response = await simpleFetch(url);
        if (response.code !== '000000') {
          throw new Error(`API error: ${response.message || response.messageDetail}`);
        }
        const result = [];
        const symbolSet = new Set(symbols.map(s => s.toUpperCase()));
        for (const token of response.data) {
          if (symbolSet.has(token.symbol.toUpperCase())) {
            if (token.offline) {
              continue;
            }
            result.push({
              id: token.alphaId,
              symbol: token.symbol,
              mulPoint: token.mulPoint
            });
          }
        }
        return result;
      } catch (error) {
        console.error('Error fetching alpha IDs:', error);
        throw error;
      }
    }
  
export async function fetchData(currency) {
      try {
          const currentTime = Date.now();
          const tenSecondsAgo = currentTime - 10 * 1000; // 9秒前的时间戳
          const id = currency.id;
          const params = {
              symbol: `${id}USDT`, // 根据实际情况修改
              startTime: tenSecondsAgo,
              endTime: currentTime
          };
          const response = await simpleFetch(dataUrl, params);
          const data = response.data;
          
          if (data && data.length > 0) {
              // 获取第一个和最后一个交易的时间戳
              const firstTradeTime = data[0].T;  // 第一个交易的时间戳（毫秒）
              const lastTradeTime = data[data.length - 1].T;  // 最后一个交易的时间戳（毫秒）
              
              // 计算时间差（秒）
              const timeDiffSeconds = (lastTradeTime - firstTradeTime) / 1000;
              
              // 将最后一个时间戳转换为日期对象
              const lastTradeDate = new Date(lastTradeTime);
              
              // 获取分钟和秒数
              const minutes = lastTradeDate.getMinutes();
              const seconds = lastTradeDate.getSeconds();
  
              const firstTradeDate = new Date(firstTradeTime);
              // 获取分钟和秒数
              const firstMinutes = firstTradeDate.getMinutes();
              const firstSeconds = firstTradeDate.getSeconds();
              
              let prices = data.map(trade => parseFloat(trade.p));
              let quantities = data.map(trade => parseFloat(trade.q));
              
              let maxPrice = Math.max(...prices);
              let minPrice = Math.min(...prices);
              let lastPrice = prices[data.length - 1];
              let totalVolume = quantities.reduce((sum, qty) => sum + qty, 0);
              let totalAmount = data.reduce((sum, trade) => sum + parseFloat(trade.p) * parseFloat(trade.q), 0);
              const formattedTotalAmount = formatNumber(totalAmount);
              
              // 计算最高价与最低价之间的万分比差异
              // myPrint(`最后一个交易时间: ${minutes}分${seconds}秒`);
              // myPrint(`第一个交易时间: ${firstMinutes}分${firstSeconds}秒`);
              // myPrint(`总成交数量: ${totalVolume}`);
              let priceDiffPerTenThousand = ((maxPrice - minPrice) / minPrice) * 10000;
              const alert = '\x1b[41m!!\x1b[0m';
              const warn = '\x1b[30;43m!\x1b[0m';
              const normal = '\x1b[0m';
              const isAlert = priceDiffPerTenThousand > 5;
              const isWarn = priceDiffPerTenThousand > 1;
              const prefix = isAlert ? alert : isWarn ? warn : normal;
              // return prefix + [`万分: ${priceDiffPerTenThousand.toFixed(4)}`, `额: ${formattedTotalAmount}`, `价: ${maxPrice}`,  `${timeDiffSeconds.toFixed(0)}秒`].join('\t');
              return {
                id,
                currencySymbol: currency.symbol,
                mulPoint: currency.mulPoint,
                prefix,
                fluctuation: priceDiffPerTenThousand.toFixed(4),
                amount: formattedTotalAmount,
                price: minPrice,
                lastPrice,
                duration: timeDiffSeconds.toFixed(0)
              }
  
              // myPrint(`最高价: ${maxPrice}`);
              // myPrint(`最低价: ${minPrice}`);
              // myPrint(`万分之: ${priceDiffPerTenThousand.toFixed(4)}`);
              // myPrint(`总成交额度: ${totalAmount}`);
              // console.log('--------------------------------------');
          } else {
              console.log('未获取到交易数据', currency.symbol);
              return {
                id,
                currencySymbol: currency.symbol,
              }
          }
      } catch (error) {
          console.error('请求API时出错:', error.message, error.code, JSON.stringify(error));
          return {
            id: currency.id,
            currencySymbol: currency.symbol,
          }
      }
  }