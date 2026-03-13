import { useState, useCallback } from 'react';
import { Tables } from '@/integrations/supabase/types';

export type Subscription = Tables<'subscriptions'>;

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading] = useState(false);

  const addSubscription = {
    mutateAsync: async (sub: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { name: string; price: number }) => {
      const now = new Date().toISOString();
      const newSub: Subscription = {
        id: crypto.randomUUID(),
        user_id: 'local',
        created_at: now,
        updated_at: now,
        name: sub.name,
        price: sub.price,
        currency: sub.currency ?? 'EUR',
        billing_cycle: sub.billing_cycle ?? 'monthly',
        category: sub.category ?? null,
        start_date: sub.start_date ?? now.split('T')[0],
        status: sub.status ?? 'active',
        next_billing_date: sub.next_billing_date ?? null,
        notes: sub.notes ?? null,
        is_free_trial: sub.is_free_trial ?? false,
        trial_end_date: sub.trial_end_date ?? null,
        cancellation_url: sub.cancellation_url ?? null,
      };
      setSubscriptions(prev => [newSub, ...prev]);
    },
  };

  const updateSubscription = {
    mutateAsync: async ({ id, ...updates }: Partial<Subscription> & { id: string }) => {
      setSubscriptions(prev =>
        prev.map(s => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
      );
    },
  };

  const deleteSubscription = {
    mutateAsync: async (id: string) => {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    },
  };

  const importSubscriptions = useCallback((subs: Subscription[]) => {
    setSubscriptions(subs);
  }, []);

  return { subscriptions, isLoading, addSubscription, updateSubscription, deleteSubscription, importSubscriptions };
}
