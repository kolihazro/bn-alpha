// 如果需要带单位的格式化（如K、M等）
export function formatWithUnits(num) {
    const absNum = Math.abs(num);
    
    // 处理大数字
    // if (absNum >= 1e9) {
    //     return (num / 1e9).toPrecision(5) + 'G';
    // }
    // if (absNum >= 1e6) {
    //     return (num / 1e6).toPrecision(5) + 'M';
    // }
    // if (absNum >= 1e3) {
    //     return (num / 1e3).toPrecision(5) + 'K';
    // }
    
    // // 处理小数字
    // if (absNum < 1e-9) {
    //     return (num * 1e12).toPrecision(5) + 'p';
    // }
    // if (absNum < 1e-6) {
    //     return (num * 1e9).toPrecision(5) + 'n';
    // }
    // if (absNum < 1e-3) {
    //     return (num * 1e6).toPrecision(5) + 'μ';
    // }
    // if (absNum < 1) {
    //     return (num * 1e3).toPrecision(5) + 'm';
    // }
    
    // 正常范围内的数字
    return num.toPrecision(5);
}
// 更简洁的版本，适用于大多数场景
export function formatCompact(num) {
    if (num === null || num === undefined || isNaN(num)) return 'NaN';
    
    const absNum = Math.abs(num);
    
    if (absNum === 0) return '0';
    
    // 极小数字：科学计数法
    if (absNum < 0.0001) {
        return num.toExponential(3);
    }
    
    // 大数字：科学计数法或千分位分隔
    if (absNum >= 10000) {
        if (absNum >= 1000000) {
            return num.toExponential(3);
        }
        return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    
    // 中等数字：普通显示，自动去除不必要的尾随零
    const formatted = parseFloat(num.toPrecision(4));
    return formatted.toString();
}