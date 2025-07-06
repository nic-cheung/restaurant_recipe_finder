import fs from 'fs/promises';
import path from 'path';

export interface ApiUsageStats {
  googlePlaces: {
    daily: { [date: string]: number };
    monthly: { [month: string]: number };
    total: number;
  };
  lastUpdated: string;
}

export class ApiUsageTracker {
  private statsFile: string;
  private stats: ApiUsageStats;

  constructor() {
    this.statsFile = path.join(process.cwd(), 'api-usage-stats.json');
    this.stats = {
      googlePlaces: {
        daily: {},
        monthly: {},
        total: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Initialize and load existing usage data
   */
  async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(this.statsFile, 'utf-8');
      this.stats = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or invalid JSON, use default stats
      await this.saveStats();
    }
  }

  /**
   * Track a Google Places API call
   */
  async trackGooglePlacesUsage(): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD
    const currentMonth = today.substring(0, 7); // YYYY-MM

    // Update daily count
    this.stats.googlePlaces.daily[today] = (this.stats.googlePlaces.daily[today] || 0) + 1;

    // Update monthly count
    this.stats.googlePlaces.monthly[currentMonth] = (this.stats.googlePlaces.monthly[currentMonth] || 0) + 1;

    // Update total count
    this.stats.googlePlaces.total += 1;

    // Update last updated timestamp
    this.stats.lastUpdated = new Date().toISOString();

    // Clean up old daily data (keep last 30 days)
    this.cleanupOldData();

    // Save to file
    await this.saveStats();

    // Log usage information
    this.logUsageInfo(today, currentMonth);
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): ApiUsageStats {
    return { ...this.stats };
  }

  /**
   * Get current month usage with free tier analysis
   */
  getCurrentMonthAnalysis(): {
    usage: number;
    limit: number;
    remainingCalls: number;
    percentageUsed: number;
    estimatedCost: number;
    withinFreeLimit: boolean;
  } {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const usage = this.stats.googlePlaces.monthly[currentMonth] || 0;
    const freeLimit = 6250; // Approximately 6,250 requests with $200 credit at $32/1000
    const remainingCalls = Math.max(0, freeLimit - usage);
    const percentageUsed = (usage / freeLimit) * 100;
    const estimatedCost = Math.max(0, (usage - freeLimit) * 0.032); // $32 per 1000 requests
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

  /**
   * Save stats to file
   */
  private async saveStats(): Promise<void> {
    try {
      await fs.writeFile(this.statsFile, JSON.stringify(this.stats, null, 2));
    } catch (error) {
      console.error('Failed to save API usage stats:', error);
    }
  }

  /**
   * Clean up old daily data to keep file size manageable
   */
  private cleanupOldData(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0]!;

    // Remove daily data older than 30 days
    for (const date in this.stats.googlePlaces.daily) {
      if (date < cutoffDate) {
        delete this.stats.googlePlaces.daily[date];
      }
    }

    // Keep only last 12 months of monthly data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const cutoffMonth = twelveMonthsAgo.toISOString().substring(0, 7);

    for (const month in this.stats.googlePlaces.monthly) {
      if (month < cutoffMonth) {
        delete this.stats.googlePlaces.monthly[month];
      }
    }
  }

  /**
   * Log usage information to console
   */
  private logUsageInfo(today: string, currentMonth: string): void {
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

    // Warning if approaching limits
    if (analysis.percentageUsed > 80) {
      console.warn(`⚠️  WARNING: You've used ${analysis.percentageUsed}% of your free Google Places API limit this month!`);
    }

    if (!analysis.withinFreeLimit) {
      console.warn(`💰 You've exceeded the free limit. Estimated additional cost this month: $${analysis.estimatedCost}`);
    }
  }
}

// Export singleton instance
export const apiUsageTracker = new ApiUsageTracker();

// Initialize on module load
apiUsageTracker.initialize().catch(console.error); 