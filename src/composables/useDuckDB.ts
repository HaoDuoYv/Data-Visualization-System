// src/composables/useDuckDB.ts
import { ref, readonly } from 'vue';
import { DuckDBManager } from '@/core/duckdb';

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
    } catch (e) {
      error.value = (e as Error).message;
      console.error('DuckDB initialization error:', e);
    } finally {
      isLoading.value = false;
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
  };
}
