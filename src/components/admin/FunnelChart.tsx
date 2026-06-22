'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, Users } from 'lucide-react';

interface FunnelStep {
  label: string;
  tipo: string;
  color: string;
}

const FUNNEL_STEPS: FunnelStep[] = [
  { label: 'Visualizou Produto', tipo: 'visualizar_produto', color: '#d97706' },
  { label: 'Adicionou ao Carrinho', tipo: 'adicionar_carrinho', color: '#92400e' },
  { label: 'Iniciou Checkout', tipo: 'iniciar_checkout', color: '#78350f' },
  { label: 'Pedido Concluído', tipo: 'compra_sucesso', color: '#451a03' },
];

export default function FunnelChart() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/track/event')
      .then(r => r.json())
      .then(data => {
        const events: { tipo_evento: string }[] = data.events || [];
        const c: Record<string, number> = {};
        FUNNEL_STEPS.forEach(s => { c[s.tipo] = 0; });
        events.forEach(e => {
          if (c[e.tipo_evento] !== undefined) c[e.tipo_evento]++;
        });
        setCounts(c);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const topCount = Math.max(...FUNNEL_STEPS.map(s => counts[s.tipo] || 0), 1);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
        <TrendingDown className="w-4 h-4 text-amber-600" />
        <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest">Funil de Conversão</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-amber-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {FUNNEL_STEPS.map((step, i) => {
            const count = counts[step.tipo] || 0;
            const pct = topCount > 0 ? Math.round((count / topCount) * 100) : 0;
            const dropFromPrev = i > 0
              ? (() => {
                  const prev = counts[FUNNEL_STEPS[i - 1].tipo] || 0;
                  return prev > 0 ? Math.round(((prev - count) / prev) * 100) : 0;
                })()
              : 0;

            return (
              <div key={step.tipo} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-[9px] font-mono font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-serif font-bold text-stone-800">{step.label}</span>
                    {i > 0 && dropFromPrev > 0 && (
                      <span className="text-[9px] font-mono text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                        -{dropFromPrev}% abandono
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{count.toLocaleString()}</span>
                    <span className="text-[10px] text-stone-400 font-mono">({pct}%)</span>
                  </div>
                </div>
                <div className="relative h-7 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: step.color }}
                  >
                    {pct > 15 && (
                      <span className="text-[9px] font-mono text-white font-bold">{pct}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-stone-100 pt-4 grid grid-cols-2 gap-3">
        <div className="bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Taxa de Conversão</p>
          <p className="text-xl font-serif font-black text-amber-600 font-mono mt-1">
            {topCount > 0 && counts['compra_sucesso'] > 0
              ? ((counts['compra_sucesso'] / topCount) * 100).toFixed(1)
              : '0.0'}%
          </p>
        </div>
        <div className="bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Visitas ao Produto</p>
          <p className="text-xl font-serif font-black text-stone-900 font-mono mt-1 flex items-center justify-center gap-1">
            <Users className="w-4 h-4 text-stone-500" />
            {(counts['visualizar_produto'] || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
