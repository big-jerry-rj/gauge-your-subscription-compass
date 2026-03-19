import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface Profile {
  preferred_currency: string;
  display_name: string | null;
}

// ── Guest mode: local-only ────────────────────────────────────────────────────
function useLocalProfile() {
  const [profile, setProfile] = useState<Profile>({ preferred_currency: 'EUR', display_name: null });
  const updateProfile = {
    mutateAsync: async (updates: Partial<Profile>) => {
      setProfile(prev => ({ ...prev, ...updates }));
    },
  };
  return { profile, isLoading: false, updateProfile };
}

// ── Authenticated mode: Supabase ──────────────────────────────────────────────
function useRemoteProfile(userId: string) {
  const qc = useQueryClient();
  const KEY = ['profile', userId];

  const { data: profile, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!data) {
        // First sign-in: create the profile row
        await supabase.from('profiles').insert({ id: userId, preferred_currency: 'EUR' });
        return { preferred_currency: 'EUR', display_name: null } as Profile;
      }
      return data as Profile;
    },
    enabled: !!userId,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { profile: profile ?? { preferred_currency: 'EUR', display_name: null }, isLoading, updateProfile };
}

// ── Public hook ───────────────────────────────────────────────────────────────
export function useProfile() {
  const { user, isGuest } = useAuth();
  const local = useLocalProfile();
  const remote = useRemoteProfile(user?.id ?? '');
  return isGuest || !user ? local : remote;
}
