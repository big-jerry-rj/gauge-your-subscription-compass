import { useCallback } from 'react';

export type NotificationReminder = 'none' | '1_day' | '3_days' | '1_and_3_days';

export interface SubscriptionMeta {
  addon?: string;
  free_trial?: boolean;
  display_label?: string;
  notification_reminder?: NotificationReminder;
  notes?: string;
}

export const NOTIFICATION_OPTIONS: { value: NotificationReminder; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: '1_day', label: '1 day before' },
  { value: '3_days', label: '3 days before' },
  { value: '1_and_3_days', label: '1 & 3 days before' },
];

const STORAGE_KEY = 'gauge-sub-meta';

function readAll(): Record<string, SubscriptionMeta> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useSubscriptionMeta() {
  const getMeta = useCallback((id: string): SubscriptionMeta => {
    return readAll()[id] ?? {};
  }, []);

  const setMeta = useCallback((id: string, updates: Partial<SubscriptionMeta>) => {
    const all = readAll();
    all[id] = { ...(all[id] ?? {}), ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }, []);

  const deleteMeta = useCallback((id: string) => {
    const all = readAll();
    delete all[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }, []);

  return { getMeta, setMeta, deleteMeta };
}
