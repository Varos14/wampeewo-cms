import { create } from 'zustand';
import * as apiServices from '../services/api';
import { useAppDataStore } from './appDataStore';

export interface SyncItem {
  id: string;
  serviceName: string;
  methodName: string;
  args: any[];
  tempId: string | null;
  description: string;
  status: 'pending' | 'syncing' | 'failed';
  error: string | null;
  timestamp: number;
}

interface SyncState {
  isOnline: boolean;
  syncQueue: SyncItem[];
  isSyncing: boolean;
  setOnline: (online: boolean) => void;
  addToQueue: (item: Omit<SyncItem, 'id' | 'status' | 'error' | 'timestamp'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  flushQueue: () => Promise<void>;
}

// Helper to replace temporary IDs with actual database IDs in remaining queue items
function replaceTempId(obj: any, tempId: string, realId: string): any {
  if (obj === tempId) return realId;
  if (Array.isArray(obj)) {
    return obj.map(item => replaceTempId(item, tempId, realId));
  }
  if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = replaceTempId(obj[key], tempId, realId);
    }
    return newObj;
  }
  return obj;
}

const QUEUE_STORAGE_KEY = 'wampeewo_sync_queue';

const loadSavedQueue = (): SyncItem[] => {
  try {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load sync queue", e);
    return [];
  }
};

const saveQueue = (queue: SyncItem[]) => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to save sync queue", e);
  }
};

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncQueue: loadSavedQueue(),
  isSyncing: false,

  setOnline: (online) => {
    const wasOffline = !get().isOnline;
    set({ isOnline: online });
    if (online && wasOffline) {
      // Trigger automatic flush when connection is restored
      get().flushQueue();
    }
  },

  addToQueue: (item) => {
    const newItem: SyncItem = {
      ...item,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      status: 'pending',
      error: null,
      timestamp: Date.now(),
    };
    const updatedQueue = [...get().syncQueue, newItem];
    set({ syncQueue: updatedQueue });
    saveQueue(updatedQueue);
  },

  removeFromQueue: (id) => {
    const updatedQueue = get().syncQueue.filter(item => item.id !== id);
    set({ syncQueue: updatedQueue });
    saveQueue(updatedQueue);
  },

  clearQueue: () => {
    set({ syncQueue: [] });
    saveQueue([]);
  },

  flushQueue: async () => {
    const { syncQueue, isSyncing, isOnline } = get();
    if (isSyncing || !isOnline || syncQueue.length === 0) return;

    set({ isSyncing: true });

    // Enable special bypass flag in apiServices so actual network requests are made
    if ((apiServices as any).setBypassOffline) {
      (apiServices as any).setBypassOffline(true);
    }

    let currentQueue = [...syncQueue];

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      if (item.status === 'syncing') continue;

      // Update item status to syncing
      currentQueue[i] = { ...item, status: 'syncing', error: null };
      set({ syncQueue: [...currentQueue] });
      saveQueue(currentQueue);

      try {
        const service = (apiServices as any)[item.serviceName];
        if (!service || typeof service[item.methodName] !== 'function') {
          throw new Error(`Service ${item.serviceName} or method ${item.methodName} not found`);
        }

        // Call the service method with args
        const result = await service[item.methodName](...item.args);

        // If this item created an entity with a temporary ID, resolve it
        if (item.tempId && result && (result.id || result._id)) {
          const realId = result.id || result._id;
          
          // Propagate the real ID to remaining items in the queue
          for (let j = i + 1; j < currentQueue.length; j++) {
            currentQueue[j] = {
              ...currentQueue[j],
              args: replaceTempId(currentQueue[j].args, item.tempId, realId)
            };
          }
        }

        // Remove item from queue upon successful sync
        currentQueue.splice(i, 1);
        i--; // Adjust index due to deletion
        set({ syncQueue: [...currentQueue] });
        saveQueue(currentQueue);

      } catch (err: any) {
        console.error(`Failed to sync item ${item.id}:`, err);
        currentQueue[i] = { 
          ...item, 
          status: 'failed', 
          error: err.message || 'Network request failed' 
        };
        set({ syncQueue: [...currentQueue] });
        saveQueue(currentQueue);
        // Pause sync execution if an error occurs to preserve order (FIFO constraint)
        break;
      }
    }

    // Disable bypass flag
    if ((apiServices as any).setBypassOffline) {
      (apiServices as any).setBypassOffline(false);
    }

    set({ isSyncing: false });

    // Trigger app data refresh to pull the latest state from the backend
    try {
      await useAppDataStore.getState().fetchData(true);
    } catch (e) {
      console.error("Failed to refresh app data after sync", e);
    }
  }
}));

// Setup window listener for online/offline events and global wrappers to prevent circular imports
if (typeof window !== 'undefined') {
  (window as any).__isOnline = () => useSyncStore.getState().isOnline;
  (window as any).__addToSyncQueue = (item: any) => useSyncStore.getState().addToQueue(item);

  window.addEventListener('online', () => useSyncStore.getState().setOnline(true));
  window.addEventListener('offline', () => useSyncStore.getState().setOnline(false));
}
