import { useState, useEffect, useCallback } from 'react';
import { fetchRates, convertAmount } from '@/lib/exchangeRates';

export function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRates().then(setRates);
  }, []);

  const convert = useCallback(
    (amount: number, from: string, to: string) => convertAmount(amount, from, to, rates),
    [rates],
  );

  return { rates, convert };
}
