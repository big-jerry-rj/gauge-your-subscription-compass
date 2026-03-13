import { useState } from 'react';

// Local-only profile (no auth required) — will be replaced with Supabase when auth is added back
export function useProfile() {
  const [profile, setProfile] = useState({
    preferred_currency: 'EUR',
    display_name: null as string | null,
  });

  const updateProfile = {
    mutateAsync: async (updates: { preferred_currency?: string; display_name?: string }) => {
      setProfile(prev => ({ ...prev, ...updates }));
    },
  };

  return { profile, isLoading: false, updateProfile };
}
