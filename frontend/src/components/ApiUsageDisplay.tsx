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
        setError('Failed to fetch usage data');
      }
    } catch (err) {
      setError('Error loading usage statistics');
      console.error('API usage fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error Loading Usage Data</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={fetchUsageData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Google Places API Usage</h3>
        <button 
          onClick={fetchUsageData}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {/* Warnings */}
      {warnings.exceededLimit && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div>
              <p className="font-semibold text-red-800">Free Limit Exceeded</p>
              <p className="text-sm text-red-700">
                You've exceeded your free tier limit. Additional costs: ${analysis.estimatedCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {warnings.approachingLimit && !warnings.exceededLimit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div>
              <p className="font-semibold text-yellow-800">Approaching Free Limit</p>
              <p className="text-sm text-yellow-700">
                You've used {analysis.percentageUsed.toFixed(1)}% of your free tier limit
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentMonth} Usage
            </span>
            <span className={`text-sm font-semibold ${getUsageColor(analysis.percentageUsed)}`}>
              {analysis.usage.toLocaleString()} / {analysis.limit.toLocaleString()} calls
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(analysis.percentageUsed)}`}
              style={{ width: `${Math.min(analysis.percentageUsed, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{analysis.percentageUsed.toFixed(1)}% used</span>
            <span>{analysis.remainingCalls.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-500">Total Calls</div>
            <div className="text-lg font-semibold text-gray-800">
              {usageData.stats.googlePlaces.total.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Est. Cost</div>
            <div className="text-lg font-semibold text-gray-800">
              ${analysis.estimatedCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
          <p className="text-xs text-blue-700">
            <strong>Free Tier:</strong> Google provides $200 monthly credit (~6,250 restaurant searches). 
            After that, it's $32 per 1,000 additional requests.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiUsageDisplay; 