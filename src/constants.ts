export const alertLevel = {
    normal: 1,
    warning: 2,
    alert: 3
};
export const dataUrl = 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades';
export const tokenUrl = 'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list';
const bestMarker = 'https://www.binance.com/fapi/v1/ticker/bookTicker?symbol=BTCUSDC'
const prefix = 'https://fapi.binance.com';
export const bestPriceUrl = prefix + '/fapi/v1/ticker/bookTicker';
// {
//     "symbol": "BTCUSDT", // 交易对
//     "bidPrice": "4.00000000", //最优买单价
//     "bidQty": "431.00000000", //挂单量
//     "askPrice": "4.00000200", //最优卖单价
//     "askQty": "9.00000000", //挂单量
//     "time": 1589437530011   // 撮合引擎时间
//   }
export const defaultCoins = ['KGEN', 'TIMI', 'IR'];
