'use client';

import { Cookie, X, ShieldCheck } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

export default function ConsentBanner() {
  const { consentGiven, giveConsent, denyConsent } = useTracking();

  if (consentGiven !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-[#1D1B18] text-white rounded-2xl shadow-2xl border border-stone-700/50 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6">
          <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-amber-400" />
          </div>

          <div className="flex-grow min-w-0">
            <p className="text-xs font-serif font-bold text-white tracking-wide">
              A FemFashion usa análise interna para melhorar a sua experiência
            </p>
            <p className="text-[10px] text-stone-400 mt-1 leading-relaxed font-mono">
              Recolhemos dados de navegação anónimos (páginas visitadas, cliques) para optimizar a loja. Os seus dados nunca são partilhados com terceiros.{' '}
              <span className="inline-flex items-center gap-1 text-stone-500">
                <ShieldCheck className="w-3 h-3" />
                Política 100% interna
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={denyConsent}
              className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-stone-400 hover:text-white border border-stone-700 hover:border-stone-500 rounded-full transition"
              id="consent-deny-btn"
            >
              Recusar
            </button>
            <button
              onClick={giveConsent}
              className="flex-1 sm:flex-none px-5 py-2 text-[10px] font-mono uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-full transition shadow-md"
              id="consent-accept-btn"
            >
              Aceitar
            </button>
            <button
              onClick={denyConsent}
              className="p-1.5 text-stone-600 hover:text-stone-300 transition"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
