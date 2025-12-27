import { SheetConfig } from '../types';

// Simple CSV parser that handles basic quotes
const parseCSV = (str: string): string[][] => {
  const arr: string[][] = [];
  let quote = false;
  let col = 0, row = 0;

  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';

    if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
    if (cc == '"') { quote = !quote; continue; }
    if (cc == ',' && !quote) { ++col; continue; }
    if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc == '\n' && !quote) { ++row; col = 0; continue; }
    if (cc == '\r' && !quote) { ++row; col = 0; continue; }
    arr[row][col] += cc;
  }
  return arr;
};

export const fetchSheetData = async (sheetId: string, config: SheetConfig) => {
  if (!sheetId) throw new Error("Chưa có Sheet ID. Vui lòng cập nhật URL.");

  // Using Google Visualization API CSV export
  // tq?tqx=out:csv -> Output as CSV
  // sheet=[name] -> Sheet name
  // range=[A1:J20] -> Specific range
  const range = `${config.rangeStart}:${config.rangeEndCol}${config.lastRow}`;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(config.sheetName)}&range=${range}`;

  const response = await fetch(url);
  
  if (!response.ok) {
     throw new Error("Không thể kết nối tới Sheet. Hãy chắc chắn Sheet đã được chia sẻ 'Bất kỳ ai có liên kết' (Anyone with the link).");
  }

  const text = await response.text();
  return parseCSV(text);
};

export const parseTableData = (values: any[][]) => {
  if (!values || values.length < 1) return [];
  // Ensure we trim whitespace from headers to avoid key mismatches
  const headers = values[0].map(h => h.toString().trim());
  const rows = values.slice(1);

  return rows.map((row) => {
    const obj: any = {};
    headers.forEach((header: string, index: number) => {
      // Clean header key or fallback
      const key = header || `Col_${index}`;
      obj[key] = row[index] || "";
    });
    return obj;
  });
};
