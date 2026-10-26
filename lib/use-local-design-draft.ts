'use client';

import { useEffect } from 'react';
import { useHeadstoneStore } from './headstone-store';
import {
  applyDesignSnapshot,
  captureDesignSnapshot,
} from './project-serializer';
import type { DesignerSnapshot } from './project-schemas';

const DATABASE_NAME = 'forever-shining-designer';
const STORE_NAME = 'drafts';
const DRAFT_KEY = 'active-design';

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readDraft(): Promise<DesignerSnapshot | null> {
  const database = await openDraftDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(DRAFT_KEY);
    request.onsuccess = () =>
      resolve((request.result as DesignerSnapshot | undefined) ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function writeDraft(snapshot: DesignerSnapshot): Promise<void> {
  const database = await openDraftDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(snapshot, DRAFT_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearLocalDesignDraft(): Promise<void> {
  const database = await openDraftDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(DRAFT_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export function useLocalDesignDraft() {
  useEffect(() => {
    let disposed = false;
    let hydrated = false;
    let dirty = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const restore = async () => {
      try {
        // A normal visit (including a reload) starts a fresh design. IndexedDB
        // survives browser cache clearing and must not silently replace it.
        // Only resume the draft when returning to an explicit save/checkout
        // action after authentication.
        const action = new URLSearchParams(window.location.search).get(
          'action',
        );
        if (action !== 'save-design' && action !== 'proceed-purchase') return;

        const draft = await readDraft();
        if (disposed || !draft?.productId) return;
        const currentProductId = useHeadstoneStore.getState().productId;
        if (!currentProductId || currentProductId === draft.productId) {
          await applyDesignSnapshot(draft);
          window.dispatchEvent(new CustomEvent('design-draft-restored'));
        }
      } catch (error) {
        console.warn('[local-design-draft] Could not restore draft', error);
      } finally {
        hydrated = true;
      }
    };

    void restore();
    const unsubscribe = useHeadstoneStore.subscribe(() => {
      if (!hydrated) return;
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        void writeDraft(captureDesignSnapshot())
          .then(() => {
            dirty = false;
          })
          .catch((error) =>
            console.warn('[local-design-draft] Could not save draft', error),
          );
      }, 800);
    });
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);

    return () => {
      disposed = true;
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener('beforeunload', warnBeforeUnload);
    };
  }, []);
}
