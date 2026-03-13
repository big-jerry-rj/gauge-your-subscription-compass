import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';

export type Subscription = Tables<'subscriptions'>;

// Local-only state (no auth required) — will be replaced with Supabase when auth is added back
export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading] = useState(false);

  const addSubscription = {
    mutateAsync: async (sub: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { name: string; amount: number }) => {
      const now = new Date().toISOString();
      const newSub: Subscription = {
        id: crypto.randomUUID(),
        user_id: 'local',
        created_at: now,
        updated_at: now,
        name: sub.name,
        amount: sub.amount,
        currency: sub.currency ?? 'EUR',
        billing_cycle: sub.billing_cycle ?? 'monthly',
        category: sub.category ?? null,
        start_date: sub.start_date ?? now.split('T')[0],
        status: sub.status ?? 'active',
        logo_url: sub.logo_url ?? null,
        next_billing_date: sub.next_billing_date ?? null,
        notes: sub.notes ?? null,
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

  return { subscriptions, isLoading, addSubscription, updateSubscription, deleteSubscription };
}
