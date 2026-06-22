'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface TrackingContextType {
  sessionId: string | null;
  consentGiven: boolean | null;
  trackEvent: (tipo: string, id_produto?: string | null, metadados?: Record<string, unknown>) => void;
  setCurrentVariant: (variant: string | null) => void;
  giveConsent: () => void;
  denyConsent: () => void;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('femfashion_visitor_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 'v-' + Math.random().toString(36).substring(2, 18);
    localStorage.setItem('femfashion_visitor_id', id);
  }
  return id;
}

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function normalizePath(path: string): string {
  if (path.startsWith('/product/')) return '/product';
  return path;
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const currentVariantRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const initSession = useCallback(async () => {
    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;
    try {
      const res = await fetch('/api/track/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_visitante: visitorId, tipo_dispositivo: getDeviceType() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sessionId) {
          setSessionId(data.sessionId);
          sessionIdRef.current = data.sessionId;
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('femfashion_consent');
    if (stored === 'true') {
      setConsentGiven(true);
      initSession();
    } else if (stored === 'false') {
      setConsentGiven(false);
    }
  }, [initSession]);

  useEffect(() => {
    if (!consentGiven) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const path = normalizePath(window.location.pathname);
      const payload = {
        id_sessao: sessionIdRef.current || null,
        pagina: path,
        pagina_normalizada: path,
        variante_ab: currentVariantRef.current || null,
        componente_raw: target?.id || target?.className?.toString().substring(0, 80) || null,
        x: Math.round((e.clientX / window.innerWidth) * 1000) / 10,
        y: Math.round((e.clientY / window.innerHeight) * 1000) / 10,
        largura_tela: window.innerWidth,
        altura_tela: window.innerHeight,
      };
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/track/heatmap', blob)) {
        return;
      }
      fetch('/api/track/heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [consentGiven]);

  const trackEvent = useCallback((
    tipo: string,
    id_produto?: string | null,
    metadados?: Record<string, unknown>
  ) => {
    if (!consentGiven) return;
    const visitorId = getOrCreateVisitorId();
    fetch('/api/track/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_evento: tipo,
        pagina: normalizePath(window.location.pathname),
        id_produto: id_produto || null,
        metadados: metadados || {},
        id_sessao: sessionIdRef.current || null,
        id_visitante: visitorId,
      }),
    }).catch(() => {});
  }, [consentGiven]);

  const setCurrentVariant = useCallback((variant: string | null) => {
    currentVariantRef.current = variant;
  }, []);

  const giveConsent = useCallback(() => {
    localStorage.setItem('femfashion_consent', 'true');
    setConsentGiven(true);
    initSession();
  }, [initSession]);

  const denyConsent = useCallback(() => {
    localStorage.setItem('femfashion_consent', 'false');
    setConsentGiven(false);
  }, []);

  return (
    <TrackingContext.Provider value={{ sessionId, consentGiven, trackEvent, setCurrentVariant, giveConsent, denyConsent }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used within TrackingProvider');
  return ctx;
}
