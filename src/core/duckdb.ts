// src/core/duckdb.ts
import * as duckdb from '@duckdb/duckdb-wasm';
import type { QueryResult } from '@/types';

export class DuckDBManager {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;

  /**
   * 将 BigInt 转换为 Number
   */
  private convertBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(item => this.convertBigInt(item));
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = this.convertBigInt(obj[key]);
      }
      return result;
    }
    return obj;
  }

  /**
   * 初始化 DuckDB 数据库
   * 使用本地 WASM 文件
   */
  async initialize(): Promise<void> {
    if (this.isInitialized()) {
      console.warn('DuckDB already initialized, skipping');
      return;
    }

    try {
      // 直接使用本地文件路径，不使用 selectBundle
      const mainModule = '/duckdb/duckdb-eh.wasm';
      const mainWorker = '/duckdb/duckdb-browser-eh.worker.js';

      // 创建 Worker
      const worker = new Worker(mainWorker);

      // 初始化 DuckDB 实例
      const logger = new duckdb.ConsoleLogger();
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(mainModule);

      // 获取数据库连接
      this.conn = await this.db.connect();

      console.log('DuckDB initialized successfully');
    } catch (error) {
      // 清理部分初始化的资源
      if (this.conn) {
        try { await this.conn.close(); } catch (_) {}
        this.conn = null;
      }
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
      return result.toArray().map(row => this.convertBigInt(row.toJSON()));
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  /**
   * 从 CSV 内容创建表
   * @param tableName 表名
   * @param csvContent CSV 内容字符串
   * @returns 表的行数和列信息
   */
  async createTableFromCSV(tableName: string, csvContent: string): Promise<{
    rowCount: number;
    columns: { name: string; type: string }[];
  }> {
    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error('CSV content cannot be empty');
    }

    if (!this.conn || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const escapedTableName = this.validateTableName(tableName);

    try {
      // 将 CSV 内容写入临时文件
      await this.db.registerFileText(`${tableName}.csv`, csvContent);

      // 创建表
      await this.conn.query(`
        CREATE TABLE ${escapedTableName} AS
        SELECT * FROM read_csv('${tableName}.csv', auto_detect=true)
      `);

      // 获取表信息
      const rowCountResult = await this.conn.query(
        `SELECT COUNT(*) as count FROM ${escapedTableName}`
      );
      const rowCount = Number(rowCountResult.toArray()[0].toJSON().count);

      const columnsResult = await this.conn.query(
        `DESCRIBE ${escapedTableName}`
      );
      const columns = columnsResult.toArray().map(row => {
        const json = row.toJSON();
        return { name: json.column_name, type: json.column_type };
      });

      return { rowCount, columns };
    } catch (error) {
      console.error('Failed to create table from CSV:', error);
      throw error;
    }
  }

  /**
   * 删除表
   */
  async deleteTable(tableName: string): Promise<void> {
    if (!this.conn) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    const escapedTableName = this.validateTableName(tableName);
    await this.conn.query(`DROP TABLE IF EXISTS ${escapedTableName}`);
  }

  /**
   * 获取表的预览数据
   * @param tableName 表名
   * @param limit 限制行数
   * @returns 预览数据
   */
  async getTablePreview(tableName: string, limit: number = 10): Promise<QueryResult[]> {
    if (!Number.isInteger(limit) || limit <= 0 || limit > 10000) {
      throw new Error(`Invalid limit: ${limit}. Must be a positive integer between 1 and 10000.`);
    }

    if (!this.conn) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const escapedTableName = this.validateTableName(tableName);

    try {
      const result = await this.conn.query(
        `SELECT * FROM ${escapedTableName} LIMIT ${limit}`
      );
      return result.toArray().map(row => this.convertBigInt(row.toJSON()));
    } catch (error) {
      console.error('Failed to get table preview:', error);
      throw error;
    }
  }

  /**
   * 验证并转义表名
   * @param name 表名
   * @returns 转义后的表名
   */
  private validateTableName(name: string): string {
    if (!name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid table name: "${name}"`);
    }
    return `"${name}"`;
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
