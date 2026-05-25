export function formatNumber(value: string | number): string {
    const numStr = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value.toString();
    const num = parseInt(numStr) || 0;

    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
}

export function formatRelativeDate(dateString: string): string {
    if (!dateString || dateString === 'Unknown') return 'Unknown';

    const numeric = Number(dateString);
    const date = isNaN(numeric) ? new Date(dateString) : new Date(numeric);

    if (isNaN(date.getTime())) return dateString;

    const diffDays = Math.floor(Math.abs(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

