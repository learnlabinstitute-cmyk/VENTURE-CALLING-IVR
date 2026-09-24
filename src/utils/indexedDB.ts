import { SupportTicket, SupportPlan } from "../types";

const DB_NAME = "VentureInfotechSupportDB";
const DB_VERSION = 1;

export interface StoredCallRecord {
  id: string;
  ticketId: string;
  clientName: string;
  clientPhone: string;
  plan: SupportPlan;
  durationSeconds: number;
  date: string;
  transcriptCount: number;
  summary: string;
  backupPlanTriggered: boolean;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Tickets Store
      if (!db.objectStoreNames.contains("tickets")) {
        const ticketStore = db.createObjectStore("tickets", { keyPath: "id" });
        ticketStore.createIndex("plan", "plan", { unique: false });
        ticketStore.createIndex("status", "status", { unique: false });
        ticketStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // Calls Store
      if (!db.objectStoreNames.contains("calls")) {
        const callStore = db.createObjectStore("calls", { keyPath: "id" });
        callStore.createIndex("date", "date", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCallRecordDB(record: StoredCallRecord): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("calls", "readwrite");
      const store = tx.objectStore("calls");
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Could not save call record to IndexedDB:", err);
  }
}

export async function getAllCallsDB(): Promise<StoredCallRecord[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("calls", "readonly");
      const store = tx.objectStore("calls");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Could not fetch calls from IndexedDB:", err);
    return [];
  }
}
