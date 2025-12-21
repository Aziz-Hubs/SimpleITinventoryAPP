/**
 * @file csv-helper.ts
 * @description Server-side utility for converting CSV files to JSON format.
 * Uses Node.js fs module for file operations.
 * @path /lib/csv-helper.ts
 */

import fs from 'fs';

export interface CsvConversionResult {
  success: boolean;
  message: string;
  count: number;
}

export function convertCsvToJson(csvPath: string, jsonPath: string): CsvConversionResult {
  try {
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return { success: false, message: 'CSV file is empty or missing headers', count: 0 };
    }

    // Skip first line (title) and get headers from second line
    const headers = lines[1].split(',').map(h => h.trim());
    const data: Record<string, string>[] = [];

    // Process data rows (skip first 2 lines)
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        const key = header
          .replace(/\s+/g, '')
          .replace(/^(.)/, (m) => m.toLowerCase())
          .replace(/([A-Z])/g, (m) => m.toLowerCase());
        obj[key] = values[index] || '';
      });
      
      data.push(obj);
    }
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    return { success: true, message: `Successfully converted ${data.length} records`, count: data.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during CSV conversion';
    return { success: false, message, count: 0 };
  }
}
