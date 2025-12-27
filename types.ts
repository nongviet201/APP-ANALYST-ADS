
export interface SheetConfig {
  sheetName: string;
  rangeStart: string; // e.g., "A1" or "A"
  rangeEndCol: string; // e.g., "J"
  lastRow: number; // e.g., 20
  isVisible?: boolean; // New: Controls visibility of the tab
}

export interface AppMemory {
  sheetUrl: string;
  sheetId: string;
  urlHistory: string[];
  configs: {
    [key: string]: SheetConfig;
  };
  productKnowledgeCache: any[][] | null;
  lastKnowledgeUpdate: number | null;
}

export enum TabView {
  HOURLY = 'BC_GIỜ',
  ADS = 'Việt_Ads',
  KNOWLEDGE = '%Hòa_TT',
  SETTINGS = 'SETTINGS'
}

export interface RowData {
  [key: string]: string | number;
}
