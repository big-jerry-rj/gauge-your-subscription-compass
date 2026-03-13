import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Subscription = Tables<'subscriptions'>;

export function useSubscriptions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addSubscription = useMutation({
    mutationFn: async (sub: Omit<TablesInsert<'subscriptions'>, 'user_id'>) => {
      const { error } = await supabase
        .from('subscriptions')
        .insert({ ...sub, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const updateSubscription = useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'subscriptions'> & { id: string }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  return { subscriptions, isLoading, addSubscription, updateSubscription, deleteSubscription };
}
