// src/core/duckdb.ts
import * as duckdb from '@duckdb/duckdb-wasm';
import type { QueryResult } from '@/types';

export class DuckDBManager {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;

  /**
   * 初始化 DuckDB 数据库
   * 使用 CDN 加载 WASM 文件
   */
  async initialize(): Promise<void> {
    if (this.isInitialized()) {
      console.warn('DuckDB already initialized, skipping');
      return;
    }

    try {
      // 选择 WASM 配置（支持 MVP 和 EH 两种版本）
      const DUCKDB_CONFIG = await duckdb.selectBundle({
        mvp: {
          mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.33.1/dist/duckdb-mvp.wasm',
          mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.33.1/dist/duckdb-browser-mvp.worker.js',
        },
        eh: {
          mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.33.1/dist/duckdb-eh.wasm',
          mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.33.1/dist/duckdb-browser-eh.worker.js',
        },
      });

      // 检查 WASM 配置是否完整
      if (!DUCKDB_CONFIG.mainWorker || !DUCKDB_CONFIG.mainModule) {
        throw new Error('No compatible DuckDB WASM bundle found for this environment');
      }

      // 创建 Worker
      const worker = new Worker(DUCKDB_CONFIG.mainWorker);

      // 初始化 DuckDB 实例
      const logger = new duckdb.ConsoleLogger();
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(DUCKDB_CONFIG.mainModule);

      // 获取数据库连接
      this.conn = await this.db.connect();

      console.log('DuckDB initialized successfully');
    } catch (error) {
      // 清理部分初始化的资源
      if (this.db) {
        try { await this.db.terminate(); } catch (_) {}
        this.db = null;
      }
      console.error('Failed to initialize DuckDB:', error);
      throw error;
    }
  }

  /**
   * 执行 SQL 查询
   * @param sql SQL 查询语句
   * @returns 查询结果数组
   */
  async query(sql: string): Promise<QueryResult[]> {
    if (!this.conn) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    try {
      const result = await this.conn.query(sql);
      // 将 Arrow 表转换为普通 JavaScript 数组
      return result.toArray().map(row => row.toJSON());
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    try {
      if (this.conn) {
        await this.conn.close();
        this.conn = null;
      }
      if (this.db) {
        await this.db.terminate();
        this.db = null;
      }
      console.log('DuckDB connection closed');
    } catch (error) {
      console.error('Failed to close DuckDB connection:', error);
      throw error;
    }
  }

  /**
   * 检查数据库是否已初始化
   */
  isInitialized(): boolean {
    return this.db !== null && this.conn !== null;
  }
}
