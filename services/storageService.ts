
import { AppMemory, SheetConfig } from '../types';
import { INITIAL_CONFIGS, DEFAULT_SHEET_URL, DEFAULT_SHEET_ID } from '../constants';

const MEMORY_KEY = 'campaign_tracker_memory_v3'; 

// Helper to extract ID from URL
export const extractSheetId = (url: string): string | null => {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

export const getMemory = (): AppMemory => {
  const stored = localStorage.getItem(MEMORY_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      sheetUrl: parsed.sheetUrl || DEFAULT_SHEET_URL,
      sheetId: parsed.sheetId || DEFAULT_SHEET_ID,
      urlHistory: parsed.urlHistory || [DEFAULT_SHEET_URL],
      configs: { ...INITIAL_CONFIGS, ...parsed.configs },
      productKnowledgeCache: parsed.productKnowledgeCache || null,
      lastKnowledgeUpdate: parsed.lastKnowledgeUpdate || null,
      productBlockLocations: parsed.productBlockLocations || null,
      hourlyCache: parsed.hourlyCache || null,
      lastHourlyUpdate: parsed.lastHourlyUpdate || null,
      adsCache: parsed.adsCache || null,
      lastAdsUpdate: parsed.lastAdsUpdate || null
    };
  }
  return {
    sheetUrl: DEFAULT_SHEET_URL,
    sheetId: DEFAULT_SHEET_ID,
    urlHistory: [DEFAULT_SHEET_URL],
    configs: INITIAL_CONFIGS,
    productKnowledgeCache: null,
    lastKnowledgeUpdate: null,
    productBlockLocations: null,
    hourlyCache: null,
    lastHourlyUpdate: null,
    adsCache: null,
    lastAdsUpdate: null
  };
};

export const saveMemory = (memory: AppMemory) => {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
};

export const updateSheetConfig = (sheetName: string, config: Partial<SheetConfig>) => {
  const current = getMemory();
  const updatedConfigs = {
    ...current.configs,
    [sheetName]: { ...current.configs[sheetName], ...config }
  };
  saveMemory({ ...current, configs: updatedConfigs });
  return updatedConfigs;
};