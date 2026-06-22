'use client';

import { useState, useEffect } from 'react';
import { useTracking } from '@/contexts/TrackingContext';

export function useABTest(testName: string): 'A' | 'B' | null {
  const [variant, setVariant] = useState<'A' | 'B' | null>(null);
  const { consentGiven } = useTracking();

  useEffect(() => {
    if (consentGiven === null) return;

    if (!consentGiven) {
      setVariant('A');
      return;
    }

    const cacheKey = `ab_${testName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached === 'A' || cached === 'B') {
      setVariant(cached);
      return;
    }

    const visitorId = localStorage.getItem('femfashion_visitor_id') || '';
    fetch(`/api/track/ab/assign?test=${encodeURIComponent(testName)}&visitor=${encodeURIComponent(visitorId)}`)
      .then(r => r.json())
      .then(data => {
        const v = data.variant === 'B' ? 'B' : 'A';
        setVariant(v);
        localStorage.setItem(cacheKey, v);
      })
      .catch(() => setVariant('A'));
  }, [testName, consentGiven]);

  return variant;
}
