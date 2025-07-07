"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiUsageTracker = exports.ApiUsageTracker = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class ApiUsageTracker {
    constructor() {
        this.statsFile = path_1.default.join(process.cwd(), 'api-usage-stats.json');
        this.stats = {
            googlePlaces: {
                daily: {},
                monthly: {},
                total: 0,
            },
            lastUpdated: new Date().toISOString(),
        };
    }
    async initialize() {
        try {
            const data = await promises_1.default.readFile(this.statsFile, 'utf-8');
            this.stats = JSON.parse(data);
        }
        catch (error) {
            await this.saveStats();
        }
    }
    async trackGooglePlacesUsage() {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.substring(0, 7);
        this.stats.googlePlaces.daily[today] = (this.stats.googlePlaces.daily[today] || 0) + 1;
        this.stats.googlePlaces.monthly[currentMonth] = (this.stats.googlePlaces.monthly[currentMonth] || 0) + 1;
        this.stats.googlePlaces.total += 1;
        this.stats.lastUpdated = new Date().toISOString();
        this.cleanupOldData();
        await this.saveStats();
        this.logUsageInfo(today, currentMonth);
    }
    getUsageStats() {
        return { ...this.stats };
    }
    getCurrentMonthAnalysis() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const usage = this.stats.googlePlaces.monthly[currentMonth] || 0;
        const freeLimit = 6250;
        const remainingCalls = Math.max(0, freeLimit - usage);
        const percentageUsed = (usage / freeLimit) * 100;
        const estimatedCost = Math.max(0, (usage - freeLimit) * 0.032);
        const withinFreeLimit = usage <= freeLimit;
        return {
            usage,
            limit: freeLimit,
            remainingCalls,
            percentageUsed: Math.round(percentageUsed * 100) / 100,
            estimatedCost: Math.round(estimatedCost * 100) / 100,
            withinFreeLimit,
        };
    }
    async saveStats() {
        try {
            await promises_1.default.writeFile(this.statsFile, JSON.stringify(this.stats, null, 2));
        }
        catch (error) {
            console.error('Failed to save API usage stats:', error);
        }
    }
    cleanupOldData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
        for (const date in this.stats.googlePlaces.daily) {
            if (date < cutoffDate) {
                delete this.stats.googlePlaces.daily[date];
            }
        }
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const cutoffMonth = twelveMonthsAgo.toISOString().substring(0, 7);
        for (const month in this.stats.googlePlaces.monthly) {
            if (month < cutoffMonth) {
                delete this.stats.googlePlaces.monthly[month];
            }
        }
    }
    logUsageInfo(today, currentMonth) {
        const todayUsage = this.stats.googlePlaces.daily[today];
        const monthUsage = this.stats.googlePlaces.monthly[currentMonth];
        const analysis = this.getCurrentMonthAnalysis();
        console.log(`📊 Google Places API Usage:`, {
            today: todayUsage,
            thisMonth: monthUsage,
            remaining: analysis.remainingCalls,
            percentUsed: `${analysis.percentageUsed}%`,
            withinFreeLimit: analysis.withinFreeLimit,
            estimatedCost: analysis.estimatedCost > 0 ? `$${analysis.estimatedCost}` : '$0.00',
        });
        if (analysis.percentageUsed > 80) {
            console.warn(`⚠️  WARNING: You've used ${analysis.percentageUsed}% of your free Google Places API limit this month!`);
        }
        if (!analysis.withinFreeLimit) {
            console.warn(`💰 You've exceeded the free limit. Estimated additional cost this month: $${analysis.estimatedCost}`);
        }
    }
}
exports.ApiUsageTracker = ApiUsageTracker;
exports.apiUsageTracker = new ApiUsageTracker();
exports.apiUsageTracker.initialize().catch(console.error);
//# sourceMappingURL=apiUsageTracker.js.map