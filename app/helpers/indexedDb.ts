import { openDB } from "idb";

const DB_NAME = "VRMCacheDB";
const STORE_NAME = "vrmFiles";

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export const getCachedVRM = async (
  key: string
): Promise<ArrayBuffer | undefined> => {
  const db = await dbPromise;
  return db.get(STORE_NAME, key);
};

export const cacheVRM = async (
  key: string,
  data: ArrayBuffer
): Promise<void> => {
  const db = await dbPromise;
  await db.put(STORE_NAME, data, key);
};
