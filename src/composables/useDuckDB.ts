// src/composables/useDuckDB.ts
import { ref, readonly } from 'vue';
import { DuckDBManager } from '@/core/duckdb';
import { getAllCSVs, deleteCSV } from '@/core/dataStore';
import { useDuckDBStore } from '@/stores/duckdb';

// 单例模式：全局共享一个 DuckDB 实例
const dbManager = new DuckDBManager();
const isInitialized = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useDuckDB() {
  /**
   * 初始化数据库
   */
  async function initialize() {
    try {
      isLoading.value = true;
      error.value = null;
      await dbManager.initialize();
      isInitialized.value = true;
      await restoreTables();
    } catch (e) {
      error.value = (e as Error).message;
      console.error('DuckDB initialization error:', e);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 从 IndexedDB 恢复所有已持久化的表
   */
  async function restoreTables() {
    try {
      const stored = await getAllCSVs();
      const store = useDuckDBStore();
      for (const record of stored) {
        const result = await dbManager.createTableFromCSV(record.tableName, record.csvContent);
        if (result) {
          store.addTable(record.tableName);
          store.setTableMeta(record.tableName, {
            rowCount: result.rowCount,
            columns: result.columns,
          });
        }
      }
    } catch (e) {
      console.error('Restore tables error:', e);
    }
  }

  /**
   * 执行 SQL 查询
   * @param sql SQL 查询语句
   * @returns 查询结果数组，失败时返回 null
   */
  async function query(sql: string) {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await dbManager.query(sql);
      return result;
    } catch (e) {
      error.value = (e as Error).message;
      console.error('Query error:', e);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 从 CSV 内容创建表
   * @param tableName 表名
   * @param csvContent CSV 内容字符串
   * @returns 表信息，失败时返回 null
   */
  async function createTableFromCSV(tableName: string, csvContent: string) {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await dbManager.createTableFromCSV(tableName, csvContent);
      return result;
    } catch (e) {
      error.value = (e as Error).message;
      console.error('CSV import error:', e);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 获取表的预览数据
   * @param tableName 表名
   * @param limit 限制行数
   * @returns 预览数据，失败时返回 null
   */
  async function getTablePreview(tableName: string, limit: number = 10) {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await dbManager.getTablePreview(tableName, limit);
      return result;
    } catch (e) {
      error.value = (e as Error).message;
      console.error('Table preview error:', e);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 删除表（同时删除 DuckDB 表和 IndexedDB 记录）
   */
  async function deleteTable(tableName: string) {
    try {
      isLoading.value = true;
      error.value = null;
      await dbManager.deleteTable(tableName);
      await deleteCSV(tableName);
      const store = useDuckDBStore();
      store.removeTable(tableName);
    } catch (e) {
      error.value = (e as Error).message;
      console.error('Delete table error:', e);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 关闭数据库连接
   */
  async function close() {
    try {
      await dbManager.close();
      isInitialized.value = false;
    } catch (e) {
      error.value = (e as Error).message;
      console.error('Close error:', e);
    }
  }

  return {
    // 只读状态
    isInitialized: readonly(isInitialized),
    isLoading: readonly(isLoading),
    error: readonly(error),
    // 方法
    initialize,
    query,
    close,
    createTableFromCSV,
    getTablePreview,
    deleteTable,
  };
}
