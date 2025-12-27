
export const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1Luw0KU1LHyVnrOKzMvqWWFNHhMd5BJICpEuSN0z2Gsc/edit?usp=drivesdk";
export const DEFAULT_SHEET_ID = "1Luw0KU1LHyVnrOKzMvqWWFNHhMd5BJICpEuSN0z2Gsc";

export const INITIAL_CONFIGS = {
  'BC_GIỜ': {
    sheetName: 'BC_GIỜ',
    rangeStart: 'A1',
    rangeEndCol: 'J',
    lastRow: 20,
    isVisible: true
  },
  'Việt_Ads': {
    sheetName: 'Việt_Ads',
    rangeStart: 'A1',
    rangeEndCol: 'Z',
    lastRow: 20,
    isVisible: true
  },
  '%Hòa_TT': {
    sheetName: '%Hòa_TT',
    rangeStart: 'A1',
    rangeEndCol: 'O',
    lastRow: 50,
    isVisible: true
  }
};

export const POLLING_INTERVAL_MS = 30000; // 30 seconds as requested
