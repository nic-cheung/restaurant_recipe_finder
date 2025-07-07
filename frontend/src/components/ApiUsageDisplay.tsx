import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface ApiUsageStats {
  googlePlaces: {
    daily: { [date: string]: number };
    monthly: { [month: string]: number };
    total: number;
  };
  lastUpdated: string;
}

interface ApiUsageAnalysis {
  usage: number;
  limit: number;
  remainingCalls: number;
  percentageUsed: number;
  estimatedCost: number;
  withinFreeLimit: boolean;
}

interface ApiUsageResponse {
  stats: ApiUsageStats;
  analysis: ApiUsageAnalysis;
  warnings: {
    approachingLimit: boolean;
    exceededLimit: boolean;
  };
}

const ApiUsageDisplay: React.FC = () => {
  const [usageData, setUsageData] = useState<ApiUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{ success: boolean; data: ApiUsageResponse }>('/preferences/api-usage');
      if (response.success) {
        setUsageData(response.data);
      } else {
        setError('failed to fetch usage data');
      }
    } catch (err) {
      setError('error loading usage statistics');
      console.error('API usage fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 50) return 'var(--flambé-forest)';
    if (percentage < 80) return 'var(--flambé-ember)';
    return 'var(--flambé-rust)';
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage < 50) return 'var(--flambé-forest)';
    if (percentage < 80) return 'var(--flambé-ember)';
    return 'var(--flambé-rust)';
  };

  if (loading) {
    return (
      <div className="preference-card">
        <div className="animate-pulse">
          <div className="h-4 rounded w-3/4 mb-4" style={{ backgroundColor: 'var(--flambé-stone)' }}></div>
          <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--flambé-stone)' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preference-card">
        <div className="text-center" style={{ color: 'var(--flambé-rust)' }}>
          <p className="flambé-heading font-semibold">error loading usage data</p>
          <p className="flambé-body text-sm mt-2">{error}</p>
          <button 
            onClick={fetchUsageData}
            className="btn-primary mt-4"
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return null;
  }

  const { analysis, warnings } = usageData;
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="preference-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flambé-heading text-lg">google places api usage</h3>
        <button 
          onClick={fetchUsageData}
          className="flambé-body text-sm transition-colors duration-200"
          style={{ color: 'var(--flambé-ash)' }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--flambé-charcoal)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--flambé-ash)'}
        >
          refresh
        </button>
      </div>

      {/* Warnings */}
      {warnings.exceededLimit && (
        <div className="p-4 mb-4 rounded-sm border" style={{ 
          backgroundColor: 'rgba(166, 124, 82, 0.1)', 
          borderColor: 'var(--flambé-rust)' 
        }}>
          <div className="flex items-center">
            <div className="mr-2" style={{ color: 'var(--flambé-rust)' }}>⚠️</div>
            <div>
              <p className="flambé-heading font-semibold" style={{ color: 'var(--flambé-rust)' }}>
                free limit exceeded
              </p>
              <p className="flambé-body text-sm" style={{ color: 'var(--flambé-rust)' }}>
                you've exceeded your free tier limit. additional costs: ${analysis.estimatedCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {warnings.approachingLimit && !warnings.exceededLimit && (
        <div className="p-4 mb-4 rounded-sm border" style={{ 
          backgroundColor: 'rgba(212, 165, 116, 0.1)', 
          borderColor: 'var(--flambé-ember)' 
        }}>
          <div className="flex items-center">
            <div className="mr-2" style={{ color: 'var(--flambé-ember)' }}>⚠️</div>
            <div>
              <p className="flambé-heading font-semibold" style={{ color: 'var(--flambé-ember)' }}>
                approaching free limit
              </p>
              <p className="flambé-body text-sm" style={{ color: 'var(--flambé-ember)' }}>
                you've used {analysis.percentageUsed.toFixed(1)}% of your free tier limit
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="flambé-body text-sm font-medium" style={{ color: 'var(--flambé-ash)' }}>
              {currentMonth.toLowerCase()} usage
            </span>
            <span className="flambé-body text-sm font-semibold" style={{ color: getUsageColor(analysis.percentageUsed) }}>
              {analysis.usage.toLocaleString()} / {analysis.limit.toLocaleString()} calls
            </span>
          </div>
          
          <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--flambé-stone)' }}>
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(analysis.percentageUsed, 100)}%`,
                backgroundColor: getProgressBarColor(analysis.percentageUsed)
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs mt-1 flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            <span>{analysis.percentageUsed.toFixed(1)}% used</span>
            <span>{analysis.remainingCalls.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--flambé-stone)' }}>
          <div className="text-center">
            <div className="flambé-body text-sm" style={{ color: 'var(--flambé-smoke)' }}>
              total calls
            </div>
            <div className="flambé-heading text-lg font-semibold">
              {usageData.stats.googlePlaces.total.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flambé-body text-sm" style={{ color: 'var(--flambé-smoke)' }}>
              est. cost
            </div>
            <div className="flambé-heading text-lg font-semibold">
              ${analysis.estimatedCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 mt-4 rounded-sm border" style={{ 
          backgroundColor: 'rgba(168, 181, 160, 0.1)', 
          borderColor: 'var(--flambé-sage)' 
        }}>
          <p className="flambé-body text-xs" style={{ color: 'var(--flambé-ash)' }}>
            <strong>free tier:</strong> google provides $200 monthly credit (~6,250 restaurant searches). 
            after that, it's $32 per 1,000 additional requests.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiUsageDisplay; 