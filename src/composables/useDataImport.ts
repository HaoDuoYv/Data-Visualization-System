// src/composables/useDataImport.ts
import { ref, readonly } from 'vue';
import { useDuckDB } from './useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';

export function useDataImport() {
  const { createTableFromCSV, getTablePreview } = useDuckDB();
  const store = useDuckDBStore();

  const isImporting = ref(false);
  const importError = ref<string | null>(null);

  /**
   * 导入 CSV 文件
   * @param file CSV 文件
   * @param tableName 表名（可选，默认使用文件名）
   */
  async function importCSV(file: File, tableName?: string) {
    try {
      isImporting.value = true;
      importError.value = null;

      // 读取文件内容
      const content = await readFileAsText(file);

      // 生成表名
      const name = tableName || file.name.replace(/\.csv$/i, '').replace(/[^a-zA-Z0-9_]/g, '_');

      // 调用 DuckDB 创建表
      const result = await createTableFromCSV(name, content);
      if (!result) {
        return null;
      }

      // 更新 store
      store.addTable(name);

      // 获取预览数据
      const preview = await getTablePreview(name, 10);
      if (preview) {
        store.setPreviewData(preview, result.columns, name, result.rowCount);
      }

      return {
        tableName: name,
        rowCount: result.rowCount,
        columns: result.columns,
      };
    } catch (e) {
      importError.value = (e as Error).message;
      console.error('CSV import error:', e);
      return null;
    } finally {
      isImporting.value = false;
    }
  }

  /**
   * 读取文件内容
   */
  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * 清除预览数据
   */
  function clearPreview() {
    store.clearPreviewData();
  }

  return {
    isImporting: readonly(isImporting),
    importError: readonly(importError),
    importCSV,
    clearPreview,
  };
}
