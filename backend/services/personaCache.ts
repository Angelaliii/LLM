import { readFile, stat, readdir } from 'fs/promises';
import { join } from 'path';
import { watch, FSWatcher } from 'fs';

/**
 * PersonaCache 介面定義
 */
export interface PersonaCache {
  get(personaId: string): Promise<{ id: string; content: string }>;
  preloadAll?(): Promise<void>;
  stats(): { hits: number; misses: number; loadsInFlight: number };
  invalidate(personaId?: string): void;
}

/**
 * 快取設定介面
 */
export interface PersonaCacheConfig {
  strategy?: 'lazy' | 'preload';
  ttlMs?: number;
  preload?: boolean;
  watchFs?: boolean;
  baseDir?: string;
}

/**
 * 快取項目結構
 */
interface CacheEntry {
  content: string;
  expiresAt: number;
  mtimeMs: number;
}

/**
 * 統計資訊
 */
interface CacheStats {
  hits: number;
  misses: number;
  loadsInFlight: number;
}

/**
 * 預設設定
 */
const DEFAULT_CONFIG: Required<PersonaCacheConfig> = {
  strategy: 'lazy',
  ttlMs: 5 * 60 * 1000, // 5 分鐘
  preload: false,
  watchFs: false,
  baseDir: join(__dirname, '../data/persona')
};

/**
 * PersonaCache 實作
 * 
 * 特性：
 * - 非同步 I/O（fs/promises）
 * - TTL 過期機制
 * - In-flight promise 去重（高併發時共享讀檔 promise）
 * - 可選預載（preload）
 * - 可選檔案監控（watchFs）
 * - 結構化日誌
 */
export class PersonaCacheImpl implements PersonaCache {
  private cache: Map<string, CacheEntry> = new Map();
  private inFlight: Map<string, Promise<CacheEntry>> = new Map();
  private _stats: CacheStats = { hits: 0, misses: 0, loadsInFlight: 0 };
  private config: Required<PersonaCacheConfig>;
  private watchers: Map<string, FSWatcher> = new Map();
  private personaIdToFile: Map<string, string> = new Map();

  constructor(config: PersonaCacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializePersonaMapping();
    
    // 若設定為預載或 preload=true，啟動時預載
    if (this.config.strategy === 'preload' || this.config.preload) {
      this.preloadAll().catch(err => {
        console.warn('[PersonaCache] Preload failed, falling back to lazy loading:', err.message);
      });
    }
  }

  /**
   * 初始化 persona ID 到檔案名稱的映射
   * 支援自動掃描 persona 目錄
   */
  private async initializePersonaMapping(): Promise<void> {
    try {
      const files = await readdir(this.config.baseDir);
      
      // 建立檔名到 ID 的映射（從 NPC_JP01_Student.md 推導出 student）
      for (const file of files) {
        if (file.endsWith('.md')) {
          // 提取 ID：NPC_JP01_Student.md -> student
          // NPC_JP02_Police.md -> police_officer
          // NPC_JP03_LandSurveyor.md -> land_surveyor
          let id = file.replace('.md', '').replace('NPC_JP0', '').replace('NPC_JP', '');
          
          // 轉換為 snake_case
          if (id.includes('Student')) id = 'student';
          else if (id.includes('Police')) id = 'police_officer';
          else if (id.includes('LandSurveyor')) id = 'land_surveyor';
          else {
            // 一般規則：轉為 snake_case
            id = id.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
          }
          
          this.personaIdToFile.set(id, file);
          console.log(`[PersonaCache] Mapped persona ID '${id}' -> '${file}'`);
        }
      }
    } catch (err: any) {
      console.warn('[PersonaCache] Failed to initialize persona mapping:', err.message);
    }
  }

  /**
   * 取得 persona 內容（核心方法）
   */
  async get(personaId: string): Promise<{ id: string; content: string }> {
    const now = Date.now();

    // 1. 檢查快取是否命中且未過期
    const cached = this.cache.get(personaId);
    if (cached && cached.expiresAt > now) {
      this._stats.hits++;
      console.log(`[PersonaCache] cache_hit: ${personaId} (hits: ${this._stats.hits})`);
      return { id: personaId, content: cached.content };
    }

    // 2. 快取過期或未命中
    this._stats.misses++;
    console.log(`[PersonaCache] cache_miss: ${personaId} (misses: ${this._stats.misses})`);

    // 3. 檢查是否已有 in-flight 請求（併發去重）
    const existingPromise = this.inFlight.get(personaId);
    if (existingPromise) {
      console.log(`[PersonaCache] Waiting for in-flight load: ${personaId}`);
      const entry = await existingPromise;
      return { id: personaId, content: entry.content };
    }

    // 4. 建立新的載入 promise
    const loadPromise = this.loadPersonaFromDisk(personaId);
    this.inFlight.set(personaId, loadPromise);
    this._stats.loadsInFlight++;

    try {
      const entry = await loadPromise;
      this.cache.set(personaId, entry);
      
      // 若啟用 watchFs，建立檔案監控
      if (this.config.watchFs && !this.watchers.has(personaId)) {
        this.setupFileWatcher(personaId);
      }

      return { id: personaId, content: entry.content };
    } finally {
      this.inFlight.delete(personaId);
      this._stats.loadsInFlight--;
    }
  }

  /**
   * 從磁碟載入 persona（非同步）
   */
  private async loadPersonaFromDisk(personaId: string): Promise<CacheEntry> {
    const fileName = this.personaIdToFile.get(personaId);
    if (!fileName) {
      throw new Error(`Unknown persona ID: ${personaId}. Available: ${Array.from(this.personaIdToFile.keys()).join(', ')}`);
    }

    const filePath = join(this.config.baseDir, fileName);

    try {
      console.log(`[PersonaCache] Loading from disk: ${filePath}`);
      
      const [content, fileStat] = await Promise.all([
        readFile(filePath, 'utf-8'),
        stat(filePath)
      ]);

      const entry: CacheEntry = {
        content,
        expiresAt: Date.now() + this.config.ttlMs,
        mtimeMs: fileStat.mtimeMs
      };

      console.log(`[PersonaCache] Loaded successfully: ${personaId} (${content.length} chars, TTL: ${this.config.ttlMs}ms)`);
      return entry;
    } catch (err: any) {
      console.warn(`[PersonaCache] Failed to load persona '${personaId}':`, err.message);
      throw new Error(`Persona file not found: ${filePath}`);
    }
  }

  /**
   * 預載所有 persona
   */
  async preloadAll(): Promise<void> {
    console.log('[PersonaCache] Starting preload...');
    
    const personaIds = Array.from(this.personaIdToFile.keys());
    console.log(`[PersonaCache] Preloading ${personaIds.length} personas: ${personaIds.join(', ')}`);

    const results = await Promise.allSettled(
      personaIds.map(id => this.get(id))
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[PersonaCache] Preload complete: ${succeeded} succeeded, ${failed} failed`);

    if (failed > 0) {
      const errors = results
        .filter(r => r.status === 'rejected')
        .map((r: any) => r.reason.message)
        .join('; ');
      console.warn(`[PersonaCache] Preload errors: ${errors}`);
    }
  }

  /**
   * 設定檔案監控（當檔案變動時自動失效快取）
   */
  private setupFileWatcher(personaId: string): void {
    const fileName = this.personaIdToFile.get(personaId);
    if (!fileName) return;

    const filePath = join(this.config.baseDir, fileName);

    try {
      const watcher = watch(filePath, (eventType) => {
        if (eventType === 'change') {
          console.log(`[PersonaCache] cache_watch_event: ${personaId} file changed, invalidating cache`);
          this.invalidate(personaId);
        }
      });

      this.watchers.set(personaId, watcher);
      console.log(`[PersonaCache] Watching file: ${filePath}`);
    } catch (err: any) {
      console.warn(`[PersonaCache] Failed to setup watcher for ${personaId}:`, err.message);
    }
  }

  /**
   * 手動失效快取
   */
  invalidate(personaId?: string): void {
    if (personaId) {
      // 失效單一 persona
      const existed = this.cache.has(personaId);
      this.cache.delete(personaId);
      
      // 關閉檔案監控
      const watcher = this.watchers.get(personaId);
      if (watcher) {
        watcher.close();
        this.watchers.delete(personaId);
      }

      if (existed) {
        console.log(`[PersonaCache] cache_invalidate: ${personaId}`);
      }
    } else {
      // 清空全部快取
      const count = this.cache.size;
      this.cache.clear();
      
      // 關閉所有檔案監控
      for (const watcher of this.watchers.values()) {
        watcher.close();
      }
      this.watchers.clear();

      console.log(`[PersonaCache] cache_invalidate: all (${count} entries cleared)`);
    }
  }

  /**
   * 取得統計資訊
   */
  stats(): CacheStats {
    return { ...this._stats };
  }

  /**
   * 清理資源（關閉所有檔案監控）
   */
  destroy(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    this.cache.clear();
    this.inFlight.clear();
    console.log('[PersonaCache] Destroyed');
  }
}

/**
 * 建立快取實例的工廠函式
 */
export function createPersonaCache(config?: PersonaCacheConfig): PersonaCache {
  return new PersonaCacheImpl(config);
}
