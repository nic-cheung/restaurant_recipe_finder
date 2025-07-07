export interface ApiUsageStats {
    googlePlaces: {
        daily: {
            [date: string]: number;
        };
        monthly: {
            [month: string]: number;
        };
        total: number;
    };
    lastUpdated: string;
}
export declare class ApiUsageTracker {
    private statsFile;
    private stats;
    constructor();
    initialize(): Promise<void>;
    trackGooglePlacesUsage(): Promise<void>;
    getUsageStats(): ApiUsageStats;
    getCurrentMonthAnalysis(): {
        usage: number;
        limit: number;
        remainingCalls: number;
        percentageUsed: number;
        estimatedCost: number;
        withinFreeLimit: boolean;
    };
    private saveStats;
    private cleanupOldData;
    private logUsageInfo;
}
export declare const apiUsageTracker: ApiUsageTracker;
//# sourceMappingURL=apiUsageTracker.d.ts.map