// src/core/dataStore.ts
// IndexedDB 封装：持久化存储导入的 CSV 原始数据

const DB_NAME = 'flexviz-data';
const DB_VERSION = 1;
const STORE_NAME = 'csv-files';

export interface StoredCSV {
  tableName: string;
  csvContent: string;
  columns: { name: string; type: string }[];
  rowCount: number;
  importedAt: number;
}

// 单例连接：IndexedDB 连接设计为长生命周期，复用同一连接
let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'tableName' });
      }
    };
    request.onsuccess = () => {
      dbInstance = request.result;
      // 连接被浏览器关闭时（如版本升级、清除站点数据）重置引用
      dbInstance.onclose = () => { dbInstance = null; };
      resolve(dbInstance);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveCSV(record: StoredCSV): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCSV(tableName: string): Promise<StoredCSV | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(tableName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllCSVs(): Promise<StoredCSV[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCSV(tableName: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(tableName);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
