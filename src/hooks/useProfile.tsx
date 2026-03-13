import { useState } from 'react';

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
