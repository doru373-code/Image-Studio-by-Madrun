
import { ApiUsage, ImageModel } from '../types';

const USAGE_KEY = 'studio-usage-stats';

const DEFAULT_STATS: ApiUsage = {
  totalRequests: 0,
  successCount: 0,
  failureCount: 0,
  flashRequests: 0,
  proRequests: 0,
  estimatedCost: 0
};

// Prețuri estimate per imagine (ajustabile conform Google Cloud Billing)
const COSTS = {
  [ImageModel.Flash]: 0.0001,
  [ImageModel.Pro]: 0.015,
  [ImageModel.Veo]: 0.05
};

export const getUsageStats = (): ApiUsage => {
  const saved = localStorage.getItem(USAGE_KEY);
  return saved ? JSON.parse(saved) : DEFAULT_STATS;
};

export const recordUsage = (model: ImageModel, success: boolean) => {
  const stats = getUsageStats();
  
  stats.totalRequests += 1;
  if (success) {
    stats.successCount += 1;
    stats.estimatedCost += COSTS[model] || 0;
  } else {
    stats.failureCount += 1;
  }

  if (model === ImageModel.Flash) {
    stats.flashRequests += 1;
  } else if (model === ImageModel.Pro || model === ImageModel.Veo) {
    stats.proRequests += 1;
  }

  localStorage.setItem(USAGE_KEY, JSON.stringify(stats));
  return stats;
};

export const resetUsageStats = (): ApiUsage => {
  localStorage.setItem(USAGE_KEY, JSON.stringify(DEFAULT_STATS));
  return DEFAULT_STATS;
};
