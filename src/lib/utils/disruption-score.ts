export interface DisruptionScore {
    score: number;
    label: string;
    color: string;
}

export function calculateDisruptionScore(
    lastUpdated: string,
    score: number,
    installs: string,
): DisruptionScore {
    let disruptionScore = 0;

    const lastUpdateDate = new Date(lastUpdated);
    const monthsSinceUpdate =
        (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsSinceUpdate >= 12) disruptionScore += 30;
    else if (monthsSinceUpdate >= 6) disruptionScore += 20;
    else if (monthsSinceUpdate >= 3) disruptionScore += 10;

    if (score < 3.0) disruptionScore += 30;
    else if (score < 3.5) disruptionScore += 25;
    else if (score < 4.0) disruptionScore += 15;
    else if (score < 4.5) disruptionScore += 5;

    const installCount = parseInt(installs.replace(/[^0-9]/g, '')) || 0;
    if (installCount >= 1_000_000) {
        if (score < 3.5) disruptionScore += 40;
        else if (score < 4.0) disruptionScore += 25;
        else if (score < 4.5) disruptionScore += 15;
    } else if (installCount >= 100_000) {
        if (score < 3.5) disruptionScore += 20;
        else if (score < 4.0) disruptionScore += 10;
    }

    let label: string;
    let color: string;
    if (disruptionScore >= 70) {
        label = 'Highly Vulnerable';
        color = 'text-red-600 bg-red-50 border-red-200';
    } else if (disruptionScore >= 50) {
        label = 'Vulnerable';
        color = 'text-orange-600 bg-orange-50 border-orange-200';
    } else if (disruptionScore >= 30) {
        label = 'Moderate Opportunity';
        color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
    } else {
        label = 'Low Opportunity';
        color = 'text-green-600 bg-green-50 border-green-200';
    }

    return { score: Math.min(disruptionScore, 100), label, color };
}

export function disruptionDescription(score: number): string {
    if (score >= 70) return '🎯 Excellent opportunity! This app has significant weaknesses that make it vulnerable to disruption.';
    if (score >= 50) return '⚡ Good opportunity. Users are frustrated, and there\'s room for a better solution.';
    if (score >= 30) return '💡 Moderate opportunity. Some pain points exist, but the app is relatively stable.';
    return '✅ Low opportunity. This app is well-maintained and users are generally satisfied.';
}
