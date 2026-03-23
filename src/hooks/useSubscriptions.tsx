import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export type Subscription = Tables<'subscriptions'>;

// ── Guest mode: local-only store ──────────────────────────────────────────────
function useLocalSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const addSubscription = {
    mutateAsync: async (sub: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { name: string; amount: number }) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      setSubscriptions(prev => [{
        id, user_id: 'guest', created_at: now, updated_at: now,
        name: sub.name, amount: sub.amount, currency: sub.currency ?? 'EUR',
        billing_cycle: sub.billing_cycle ?? 'monthly', category: sub.category ?? null,
        start_date: sub.start_date ?? now.split('T')[0], status: sub.status ?? 'active',
        logo_url: sub.logo_url ?? null, next_billing_date: sub.next_billing_date ?? null,
        notes: sub.notes ?? null,
      }, ...prev]);
      return { id };
    },
  };

  const updateSubscription = {
    mutateAsync: async ({ id, ...updates }: Partial<Subscription> & { id: string }) => {
      setSubscriptions(prev =>
        prev.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s)
      );
    },
  };

  const deleteSubscription = {
    mutateAsync: async (id: string) => {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    },
  };

  return { subscriptions, isLoading: false, addSubscription, updateSubscription, deleteSubscription };
}

// ── Authenticated mode: Supabase ──────────────────────────────────────────────
function useRemoteSubscriptions(userId: string) {
  const qc = useQueryClient();
  const KEY = ['subscriptions', userId];

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Subscription[];
    },
  });

  const addSubscription = useMutation({
    mutationFn: async (sub: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { name: string; amount: number }) => {
      const id = crypto.randomUUID();
      const { error } = await supabase.from('subscriptions').insert({ ...sub, id, user_id: userId });
      if (error) throw error;
      return { id };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const updateSubscription = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subscription> & { id: string }) => {
      const { error } = await supabase.from('subscriptions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { subscriptions, isLoading, addSubscription, updateSubscription, deleteSubscription };
}

// ── Public hook — picks the right implementation ──────────────────────────────
export function useSubscriptions() {
  const { user, isGuest } = useAuth();
  const local = useLocalSubscriptions();
  const remote = useRemoteSubscriptions(user?.id ?? '');
  return isGuest || !user ? local : remote;
}
