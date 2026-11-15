// static/pwa/db.js — Capa de almacenamiento local IndexedDB con fallback a localStorage y sincronización resiliente
class GasAzulOfflineDB {
  constructor() {
    this.dbName = 'GasAzulChoferDB';
    this.version = 1;
    this.db = null;
    this.useLocalStorageFallback = false;
    this.STORAGE_KEYS = {
      pending: 'gasazul_offline_pending_deliveries',
      locations: 'gasazul_offline_location_queue',
      cached: 'gasazul_offline_cached_deliveries'
    };
  }

  async init() {
    if (this.db) return this.db;
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[OfflineDB] IndexedDB no disponible, activando fallback localStorage.');
      this.useLocalStorageFallback = true;
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(this.dbName, this.version);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('pending_deliveries')) {
            db.createObjectStore('pending_deliveries', { keyPath: 'id', autoIncrement: true });
          }
          if (!db.objectStoreNames.contains('location_queue')) {
            db.createObjectStore('location_queue', { keyPath: 'id', autoIncrement: true });
          }
          if (!db.objectStoreNames.contains('cached_deliveries')) {
            db.createObjectStore('cached_deliveries', { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.useLocalStorageFallback = false;
          console.log('[IndexedDB] Conectado exitosamente a la base offline.');
          this._emitChange();
          resolve(this.db);
        };

        request.onerror = (event) => {
          console.warn('[IndexedDB] Error al abrir la base, activando fallback localStorage:', event.target.error);
          this.useLocalStorageFallback = true;
          resolve(null);
        };

        request.onblocked = () => {
          console.warn('[IndexedDB] Base de datos bloqueada temporalmente.');
          this.useLocalStorageFallback = true;
          resolve(null);
        };
      } catch (err) {
        console.warn('[IndexedDB] Excepción abriendo IndexedDB, activando fallback localStorage:', err);
        this.useLocalStorageFallback = true;
        resolve(null);
      }
    });
  }

  _emitChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gasazul:offlineDataChanged'));
    }
  }

  // ── Fallback Helpers para LocalStorage ──────────────────────────────────
  _readLS(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[LocalStorage] Error leyendo clave:', key, e);
      return [];
    }
  }

  _writeLS(key, items) {
    try {
      localStorage.setItem(key, JSON.stringify(items));
      return true;
    } catch (e) {
      console.error('[LocalStorage] Error guardando clave:', key, e);
      return false;
    }
  }

  // ── Entregas Pendientes (Offline Queue) ──────────────────────────────────
  async savePendingDelivery(deliveryData) {
    await this.init();
    const item = {
      ...deliveryData,
      local_id: 'offline-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      synced: false
    };

    if (this.useLocalStorageFallback || !this.db) {
      const list = this._readLS(this.STORAGE_KEYS.pending);
      item.id = Date.now();
      list.push(item);
      this._writeLS(this.STORAGE_KEYS.pending, list);
      this._emitChange();
      return item.id;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('pending_deliveries', 'readwrite');
        const store = tx.objectStore('pending_deliveries');
        const req = store.add(item);
        req.onsuccess = () => {
          this._emitChange();
          resolve(req.result);
        };
        req.onerror = () => {
          // Fallback en error de transacción
          const list = this._readLS(this.STORAGE_KEYS.pending);
          item.id = Date.now();
          list.push(item);
          this._writeLS(this.STORAGE_KEYS.pending, list);
          this._emitChange();
          resolve(item.id);
        };
      } catch (e) {
        const list = this._readLS(this.STORAGE_KEYS.pending);
        item.id = Date.now();
        list.push(item);
        this._writeLS(this.STORAGE_KEYS.pending, list);
        this._emitChange();
        resolve(item.id);
      }
    });
  }

  async getPendingDeliveries() {
    await this.init();
    if (this.useLocalStorageFallback || !this.db) {
      return this._readLS(this.STORAGE_KEYS.pending);
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('pending_deliveries', 'readonly');
        const store = tx.objectStore('pending_deliveries');
        const req = store.getAll();
        req.onsuccess = () => {
          const idbList = req.result || [];
          const lsList = this._readLS(this.STORAGE_KEYS.pending);
          // Mezclar sin duplicados si hubo migración transitoria
          const seen = new Set();
          const merged = [];
          for (const item of [...idbList, ...lsList]) {
            const key = item.local_id || item.transaction_uuid || (item.id + '_' + item.createdAt);
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }
          resolve(merged);
        };
        req.onerror = () => {
          resolve(this._readLS(this.STORAGE_KEYS.pending));
        };
      } catch (e) {
        resolve(this._readLS(this.STORAGE_KEYS.pending));
      }
    });
  }

  async countPendingDeliveries() {
    const list = await this.getPendingDeliveries();
    return list.length;
  }

  async deletePendingDelivery(id) {
    await this.init();
    // Limpiar siempre de localStorage por consistencia
    const lsList = this._readLS(this.STORAGE_KEYS.pending).filter(item => item.id !== id && item.local_id !== id);
    this._writeLS(this.STORAGE_KEYS.pending, lsList);

    if (this.useLocalStorageFallback || !this.db) {
      this._emitChange();
      return true;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('pending_deliveries', 'readwrite');
        const store = tx.objectStore('pending_deliveries');
        const req = store.delete(id);
        req.onsuccess = () => {
          this._emitChange();
          resolve(true);
        };
        req.onerror = () => {
          this._emitChange();
          resolve(true);
        };
      } catch (e) {
        this._emitChange();
        resolve(true);
      }
    });
  }

  // ── Cola de Ubicaciones GPS ──────────────────────────────────────────────
  async queueLocation(locData) {
    await this.init();
    const item = { ...locData, queuedAt: new Date().toISOString() };

    if (this.useLocalStorageFallback || !this.db) {
      const list = this._readLS(this.STORAGE_KEYS.locations);
      item.id = Date.now();
      // Limitar a los últimos 150 puntos para evitar saturar almacenamiento local
      if (list.length >= 150) list.shift();
      list.push(item);
      this._writeLS(this.STORAGE_KEYS.locations, list);
      return item.id;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('location_queue', 'readwrite');
        const store = tx.objectStore('location_queue');
        const req = store.add(item);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          const list = this._readLS(this.STORAGE_KEYS.locations);
          item.id = Date.now();
          list.push(item);
          this._writeLS(this.STORAGE_KEYS.locations, list);
          resolve(item.id);
        };
      } catch (e) {
        const list = this._readLS(this.STORAGE_KEYS.locations);
        item.id = Date.now();
        list.push(item);
        this._writeLS(this.STORAGE_KEYS.locations, list);
        resolve(item.id);
      }
    });
  }

  async getQueuedLocations() {
    await this.init();
    if (this.useLocalStorageFallback || !this.db) {
      return this._readLS(this.STORAGE_KEYS.locations);
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('location_queue', 'readonly');
        const store = tx.objectStore('location_queue');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this._readLS(this.STORAGE_KEYS.locations));
      } catch (e) {
        resolve(this._readLS(this.STORAGE_KEYS.locations));
      }
    });
  }

  async countQueuedLocations() {
    const list = await this.getQueuedLocations();
    return list.length;
  }

  async clearQueuedLocations() {
    await this.init();
    this._writeLS(this.STORAGE_KEYS.locations, []);

    if (this.useLocalStorageFallback || !this.db) {
      return true;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('location_queue', 'readwrite');
        const store = tx.objectStore('location_queue');
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(true);
      } catch (e) {
        resolve(true);
      }
    });
  }

  // ── Caché de Entregas Asignadas ───────────────────────────────────────────
  async cacheDeliveries(deliveriesList) {
    await this.init();
    const safeList = Array.isArray(deliveriesList) ? deliveriesList : [];
    this._writeLS(this.STORAGE_KEYS.cached, safeList);

    if (this.useLocalStorageFallback || !this.db) {
      return true;
    }

    try {
      const tx = this.db.transaction('cached_deliveries', 'readwrite');
      const store = tx.objectStore('cached_deliveries');
      store.clear();
      for (const d of safeList) {
        if (d && (d.id || d.order_id)) {
          store.put(d);
        }
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  async getCachedDeliveries() {
    await this.init();
    if (this.useLocalStorageFallback || !this.db) {
      return this._readLS(this.STORAGE_KEYS.cached);
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('cached_deliveries', 'readonly');
        const store = tx.objectStore('cached_deliveries');
        const req = store.getAll();
        req.onsuccess = () => {
          const res = req.result;
          if (res && res.length > 0) resolve(res);
          else resolve(this._readLS(this.STORAGE_KEYS.cached));
        };
        req.onerror = () => resolve(this._readLS(this.STORAGE_KEYS.cached));
      } catch (e) {
        resolve(this._readLS(this.STORAGE_KEYS.cached));
      }
    });
  }
}

window.gasAzulDB = new GasAzulOfflineDB();
