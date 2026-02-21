import type {
  UserInvestmentData,
  NAVData,
  MutualFundScheme,
  PortfolioReturnMetrics,
} from "../types/mutual-funds";

const DB_NAME = "fin-tools-mf-db";
const DB_VERSION = 1;

// Store names
const STORES = {
  INVESTMENTS: "investments",
  WATCHLIST: "watchlist",
  SCHEME_INFO: "schemeInfo",
  NAV_HISTORY: "navHistory",
  CALCULATED_RETURNS: "calculatedReturns",
  SYNC_METADATA: "syncMetadata",
} as const;

interface SyncMetadata {
  schemeCode: number;
  lastUpdated: number; // timestamp
  dataType: "nav" | "scheme-info";
}

interface CalculatedReturnsData {
  schemeCode: number;
  date: string; // Date when calculation was done
  overallReturns: PortfolioReturnMetrics;
  fyReturns: Array<{
    fy: string; // e.g., "2020-21"
    startDate: string;
    endDate: string;
    totalInvested: number;
    currentValue: number;
    absoluteGain: number;
    percentageReturn: number;
    xirr?: number;
    cagr?: number;
    oneDayChange?: {
      absoluteChange: number;
      percentageChange: number;
    };
  }>;
  portfolioLevel?: boolean; // true for portfolio-level calculations
}

export class IndexedDBService {
  private static db: IDBDatabase | null = null;

  /**
   * Initialize database with schema
   */
  static async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createSchema(db);
      };
    });
  }

  /**
   * Create database schema
   */
  private static createSchema(db: IDBDatabase): void {
    // Investments store
    if (!db.objectStoreNames.contains(STORES.INVESTMENTS)) {
      const invStore = db.createObjectStore(STORES.INVESTMENTS, {
        keyPath: "schemeCode",
      });
      invStore.createIndex("schemeCode", "schemeCode", { unique: true });
    }

    // Watchlist store
    if (!db.objectStoreNames.contains(STORES.WATCHLIST)) {
      db.createObjectStore(STORES.WATCHLIST, {
        keyPath: "id",
        autoIncrement: true,
      });
    }

    // Scheme Info store
    if (!db.objectStoreNames.contains(STORES.SCHEME_INFO)) {
      const schemeStore = db.createObjectStore(STORES.SCHEME_INFO, {
        keyPath: "schemeCode",
      });
      schemeStore.createIndex("schemeCode", "schemeCode", { unique: true });
    }

    // NAV History store
    if (!db.objectStoreNames.contains(STORES.NAV_HISTORY)) {
      const navStore = db.createObjectStore(STORES.NAV_HISTORY, {
        keyPath: ["schemeCode", "date"],
      });
      navStore.createIndex("schemeCode", "schemeCode", { unique: false });
      navStore.createIndex("date", "date", { unique: false });
    }

    // Calculated Returns store
    if (!db.objectStoreNames.contains(STORES.CALCULATED_RETURNS)) {
      const returnsStore = db.createObjectStore(STORES.CALCULATED_RETURNS, {
        keyPath: "id",
        autoIncrement: true,
      });
      returnsStore.createIndex("schemeCode", "schemeCode", { unique: false });
      returnsStore.createIndex("date", "date", { unique: false });
      returnsStore.createIndex("portfolioLevel", "portfolioLevel", {
        unique: false,
      });
    }

    // Sync Metadata store
    if (!db.objectStoreNames.contains(STORES.SYNC_METADATA)) {
      const syncStore = db.createObjectStore(STORES.SYNC_METADATA, {
        keyPath: ["schemeCode", "dataType"],
      });
      syncStore.createIndex("schemeCode", "schemeCode", { unique: false });
      syncStore.createIndex("lastUpdated", "lastUpdated", { unique: false });
    }
  }

  /**
   * Get database instance
   */
  private static getDB(): IDBDatabase {
    if (!this.db) {
      throw new Error("IndexedDB not initialized. Call init() first.");
    }
    return this.db;
  }

  // ==================== INVESTMENTS ====================

  /**
   * Get all investments
   */
  static async getInvestments(): Promise<UserInvestmentData[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.INVESTMENTS, "readonly")
        .objectStore(STORES.INVESTMENTS);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get investments for a specific scheme
   */
  static async getSchemeInvestments(
    schemeCode: number,
  ): Promise<UserInvestmentData | null> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.INVESTMENTS, "readonly")
        .objectStore(STORES.INVESTMENTS);
      const request = store.get(schemeCode);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Add or update investment
   */
  static async setInvestments(data: UserInvestmentData): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.INVESTMENTS, "readwrite")
        .objectStore(STORES.INVESTMENTS);
      const request = store.put(data);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Delete investment for a scheme
   */
  static async deleteInvestment(schemeCode: number): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.INVESTMENTS, "readwrite")
        .objectStore(STORES.INVESTMENTS);
      const request = store.delete(schemeCode);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // ==================== WATCHLIST ====================

  /**
   * Get all watchlist items
   */
  static async getWatchlist(): Promise<number[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.WATCHLIST, "readonly")
        .objectStore(STORES.WATCHLIST);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const items = request.result as Array<{ schemeCode: number }>;
        resolve(items.map((item) => item.schemeCode));
      };
    });
  }

  /**
   * Add to watchlist
   */
  static async addToWatchlist(schemeCode: number): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.WATCHLIST, "readwrite")
        .objectStore(STORES.WATCHLIST);
      const request = store.add({ schemeCode });
      request.onerror = () => {
        if ((request.error as any)?.name === "ConstraintError") {
          // Already exists, just resolve
          resolve();
        } else {
          reject(request.error);
        }
      };
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Remove from watchlist
   */
  static async removeFromWatchlist(schemes: number | number[]): Promise<void> {
    const db = this.getDB();
    if (!Array.isArray(schemes)) {
      schemes = [schemes];
    }
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.WATCHLIST, "readwrite")
        .objectStore(STORES.WATCHLIST);

      // First get all items to find the one to delete
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const items = getAllRequest.result as Array<{
          id?: number;
          schemeCode: number;
        }>;
        const itemsToDelete = items.filter((item) =>
          schemes.includes(item.schemeCode),
        );

        if (itemsToDelete.length > 0) {
          const deletePromises = itemsToDelete.map((item) => {
            if (item.id) {
              const deleteRequest = store.delete(item.id);
              return new Promise((resolve, reject) => {
                deleteRequest.onerror = () => reject(deleteRequest.error);
                deleteRequest.onsuccess = () => resolve(undefined);
              });
            }
            return Promise.resolve(undefined);
          });

          Promise.all(deletePromises).then(() => resolve());
        } else {
          resolve();
        }
      };
      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  }

  // ==================== SCHEME INFO ====================

  /**
   * Get scheme info
   */
  static async getSchemeInfo(
    schemeCode: number,
  ): Promise<MutualFundScheme | null> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.SCHEME_INFO, "readonly")
        .objectStore(STORES.SCHEME_INFO);
      const request = store.get(schemeCode);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Save scheme info
   */
  static async setSchemeInfo(scheme: MutualFundScheme): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.SCHEME_INFO, "readwrite")
        .objectStore(STORES.SCHEME_INFO);
      const request = store.put(scheme);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // ==================== NAV HISTORY ====================

  /**
   * Get NAV history for a scheme
   */
  static async getNavHistory(schemeCode: number): Promise<NAVData[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.NAV_HISTORY, "readonly")
        .objectStore(STORES.NAV_HISTORY);
      const index = store.index("schemeCode");
      const range = IDBKeyRange.only(schemeCode);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const navs = request.result as Array<NAVData & { schemeCode: number }>;
        // Remove schemeCode before returning
        resolve(navs.map(({ schemeCode: _, ...nav }) => nav));
      };
    });
  }

  /**
   * Get NAV data for a specific date
   */
  static async getNavOnDate(
    schemeCode: number,
    date: string,
  ): Promise<NAVData | null> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.NAV_HISTORY, "readonly")
        .objectStore(STORES.NAV_HISTORY);
      const request = store.get([schemeCode, date]);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as
          | (NAVData & { schemeCode: number })
          | undefined;
        if (result) {
          const { schemeCode: _, ...navData } = result;
          resolve(navData);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * Save NAV data
   */
  static async setNavData(schemeCode: number, navData: NAVData): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.NAV_HISTORY, "readwrite")
        .objectStore(STORES.NAV_HISTORY);
      const request = store.put({ schemeCode, ...navData });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Save multiple NAV data entries
   */
  static async setNavHistoryBatch(
    schemeCode: number,
    navHistory: NAVData[],
  ): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.NAV_HISTORY, "readwrite")
        .objectStore(STORES.NAV_HISTORY);

      for (const nav of navHistory) {
        store.put({ schemeCode, ...nav });
      }

      store.transaction.onerror = () => reject(store.transaction.error);
      store.transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Get NAV history for a date range
   */
  static async getNavHistoryInRange(
    schemeCode: number,
    startDate: string,
    endDate: string,
  ): Promise<NAVData[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.NAV_HISTORY, "readonly")
        .objectStore(STORES.NAV_HISTORY);
      const index = store.index("schemeCode");

      const request = index.getAll(IDBKeyRange.only(schemeCode));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const navs = request.result as Array<NAVData & { schemeCode: number }>;
        const filtered = navs
          .map(({ schemeCode: _, ...nav }) => nav)
          .filter((nav) => nav.date >= startDate && nav.date <= endDate)
          .sort((a, b) => a.date.localeCompare(b.date));
        resolve(filtered);
      };
    });
  }

  // ==================== CALCULATED RETURNS ====================

  /**
   * Get latest calculated returns for a scheme
   */
  static async getLatestReturns(
    schemeCode: number,
    portfolioLevel: boolean = false,
  ): Promise<CalculatedReturnsData | null> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.CALCULATED_RETURNS, "readonly")
        .objectStore(STORES.CALCULATED_RETURNS);
      const index = store.index("schemeCode");

      const request = index.getAll(IDBKeyRange.only(schemeCode));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result as CalculatedReturnsData[];
        // Filter by portfolioLevel if specified
        let filtered = results;
        if (portfolioLevel !== null) {
          filtered = results.filter(
            (r) => (r.portfolioLevel ?? false) === portfolioLevel,
          );
        }
        // Return the one with the most recent date
        if (filtered.length > 0) {
          filtered.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
          resolve(filtered[0]);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * Save calculated returns
   */
  static async setCalculatedReturns(
    returns: CalculatedReturnsData,
  ): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.CALCULATED_RETURNS, "readwrite")
        .objectStore(STORES.CALCULATED_RETURNS);
      const request = store.add(returns); // Using add instead of put to always create new entry
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all calculated returns entries for a scheme
   */
  static async getAllReturnsForScheme(
    schemeCode: number,
  ): Promise<CalculatedReturnsData[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.CALCULATED_RETURNS, "readonly")
        .objectStore(STORES.CALCULATED_RETURNS);
      const index = store.index("schemeCode");

      const request = index.getAll(IDBKeyRange.only(schemeCode));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result as CalculatedReturnsData[];
        resolve(
          results.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        );
      };
    });
  }

  // ==================== SYNC METADATA ====================

  /**
   * Get sync metadata
   */
  static async getSyncMetadata(
    schemeCode: number,
    dataType: "nav" | "scheme-info",
  ): Promise<SyncMetadata | null> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.SYNC_METADATA, "readonly")
        .objectStore(STORES.SYNC_METADATA);
      const request = store.get([schemeCode, dataType]);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Update sync metadata
   */
  static async setSyncMetadata(
    schemeCode: number,
    dataType: "nav" | "scheme-info",
  ): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(STORES.SYNC_METADATA, "readwrite")
        .objectStore(STORES.SYNC_METADATA);
      const request = store.put({
        schemeCode,
        dataType,
        lastUpdated: Date.now(),
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Check if data needs update (older than 1 day)
   */
  static async needsUpdate(
    schemeCode: number,
    dataType: "nav" | "scheme-info",
  ): Promise<boolean> {
    const metadata = await this.getSyncMetadata(schemeCode, dataType);
    if (!metadata) return true; // No metadata means never synced

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return metadata.lastUpdated < oneDayAgo;
  }

  /**
   * Clear calculated returns for a specific scheme to force recalculation
   */
  static async clearCalculatedReturnsForScheme(schemeCode: number): Promise<void> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CALCULATED_RETURNS, "readwrite");
      const store = transaction.objectStore(STORES.CALCULATED_RETURNS);
      const index = store.index("schemeCode");

      const request = index.getAll(IDBKeyRange.only(schemeCode));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result as Array<CalculatedReturnsData & { id: number }>;
        for (const result of results) {
          store.delete(result.id);
        }
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Clear all data
   */
  static async clearAll(): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction(
      [
        STORES.INVESTMENTS,
        STORES.WATCHLIST,
        STORES.SCHEME_INFO,
        STORES.NAV_HISTORY,
        STORES.CALCULATED_RETURNS,
        STORES.SYNC_METADATA,
      ],
      "readwrite",
    );

    return new Promise((resolve, reject) => {
      const stores = [
        STORES.INVESTMENTS,
        STORES.WATCHLIST,
        STORES.SCHEME_INFO,
        STORES.NAV_HISTORY,
        STORES.CALCULATED_RETURNS,
        STORES.SYNC_METADATA,
      ];

      for (const storeName of stores) {
        transaction.objectStore(storeName).clear();
      }

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }
}
