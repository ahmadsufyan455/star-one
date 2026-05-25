export function formatNumber(value: string | number): string {
    const numStr = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value.toString();
    const num = parseInt(numStr) || 0;

    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
}
