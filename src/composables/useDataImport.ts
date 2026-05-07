// src/composables/useDataImport.ts
import { ref, readonly } from 'vue';
import { useDuckDB } from './useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';
import { saveCSV } from '@/core/dataStore';
import * as XLSX from 'xlsx';

export function useDataImport() {
  const { createTableFromCSV, getTablePreview } = useDuckDB();
  const store = useDuckDBStore();

  const isImporting = ref(false);
  const importError = ref<string | null>(null);

  /**
   * 核心导入逻辑：将 CSV 内容写入 DuckDB + IndexedDB
   */
  async function importCSVContent(csvContent: string, tableName: string) {
    const result = await createTableFromCSV(tableName, csvContent);
    if (!result) return null;

    store.addTable(tableName);
    store.setTableMeta(tableName, { rowCount: result.rowCount, columns: result.columns });

    const preview = await getTablePreview(tableName, 10);
    if (preview) {
      store.setPreviewData(preview, result.columns, tableName, result.rowCount);
    }

    await saveCSV({
      tableName,
      csvContent,
      columns: result.columns,
      rowCount: result.rowCount,
      importedAt: Date.now(),
    });

    return { tableName, rowCount: result.rowCount, columns: result.columns };
  }

  /**
   * 导入 CSV 文件
   */
  async function importCSV(file: File, tableName?: string) {
    try {
      isImporting.value = true;
      importError.value = null;
      const content = await readFileAsText(file);
      const name = tableName || file.name.replace(/\.csv$/i, '').replace(/[^a-zA-Z0-9_]/g, '_');
      return await importCSVContent(content, name);
    } catch (e) {
      importError.value = (e as Error).message;
      console.error('CSV import error:', e);
      return null;
    } finally {
      isImporting.value = false;
    }
  }

  /**
   * 获取 Excel 文件的工作表名称列表
   */
  async function getExcelSheets(file: File): Promise<string[]> {
    const buffer = await readFileAsArrayBuffer(file);
    const workbook = XLSX.read(buffer, { type: 'array' });
    return workbook.SheetNames;
  }

  /**
   * 导入 Excel 文件
   * @param file Excel 文件
   * @param tableName 表名（可选）
   * @param sheetName 工作表名称（可选，默认第一个）
   */
  async function importExcel(file: File, tableName?: string, sheetName?: string) {
    try {
      isImporting.value = true;
      importError.value = null;
      const buffer = await readFileAsArrayBuffer(file);
      const workbook = XLSX.read(buffer, { type: 'array' });
      const targetSheet = sheetName || workbook.SheetNames[0];
      if (!targetSheet) throw new Error('Excel 文件无工作表');
      const sheet = workbook.Sheets[targetSheet];
      if (!sheet) throw new Error(`无法读取工作表: ${targetSheet}`);
      const csvContent = XLSX.utils.sheet_to_csv(sheet);
      const baseName = file.name.replace(/\.xlsx?$/i, '').replace(/[^a-zA-Z0-9_]/g, '_');
      const name = tableName || (sheetName ? `${baseName}_${sheetName}` : baseName);
      return await importCSVContent(csvContent, name);
    } catch (e) {
      importError.value = (e as Error).message;
      console.error('Excel import error:', e);
      return null;
    } finally {
      isImporting.value = false;
    }
  }

  /**
   * 导入 JSON 文件（数组 of 对象）
   */
  async function importJSON(file: File, tableName?: string) {
    try {
      isImporting.value = true;
      importError.value = null;
      const text = await readFileAsText(file);
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) throw new Error('JSON 数据为空');

      // 扁平化嵌套对象
      const flatArr = arr.map(item => flattenObject(item));
      const headers = [...new Set(flatArr.flatMap(Object.keys))];
      const csvLines = [
        headers.join(','),
        ...flatArr.map(row =>
          headers.map(h => {
            const val = row[h] ?? '';
            const str = String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"` : str;
          }).join(',')
        ),
      ];
      const csvContent = csvLines.join('\n');
      const name = tableName || file.name.replace(/\.json$/i, '').replace(/[^a-zA-Z0-9_]/g, '_');
      return await importCSVContent(csvContent, name);
    } catch (e) {
      importError.value = (e as Error).message;
      console.error('JSON import error:', e);
      return null;
    } finally {
      isImporting.value = false;
    }
  }

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  function clearPreview() {
    store.clearPreviewData();
  }

  return {
    isImporting: readonly(isImporting),
    importError: readonly(importError),
    importCSV,
    importExcel,
    importJSON,
    getExcelSheets,
    clearPreview,
  };
}

/**
 * 扁平化嵌套对象，用 . 连接键名
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
  }
  return result;
}
