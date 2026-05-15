/**
 * Formats a number into a readable string with abbreviations (K, M, B)
 */
export const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null) return '0';
    
    let n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
    if (isNaN(n)) return '0';

    if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
};

/**
 * Formats a percentage
 */
export const formatPercent = (val: number | string | undefined): string => {
    if (val === undefined || val === null) return '0%';
    let n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) return '0%';
    return n.toFixed(1).replace(/\.0$/, '') + '%';
};
