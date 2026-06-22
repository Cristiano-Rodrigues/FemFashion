'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, TrendingUp, CheckCircle2 } from 'lucide-react';

interface ABTestSummary {
  testName: string;
  variantA: { atribuicoes: number; conversoes: number };
  variantB: { atribuicoes: number; conversoes: number };
}

export default function ABTestResults() {
  const [summary, setSummary] = useState<ABTestSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/track/event')
      .then(r => r.json())
      .then(eventsData => {
        const events: { tipo_evento: string; metadados?: Record<string, unknown> | null }[] = eventsData.events || [];

        const getVariant = (e: { metadados?: Record<string, unknown> | null }): string | null => {
          const v = e.metadados?.ab_variant;
          if (v === 'A' || v === 'B') return v;
          return null;
        };

        const aViews = events.filter(e => e.tipo_evento === 'visualizar_produto' && getVariant(e) === 'A').length;
        const bViews = events.filter(e => e.tipo_evento === 'visualizar_produto' && getVariant(e) === 'B').length;
        const aConverts = events.filter(e => e.tipo_evento === 'adicionar_carrinho' && getVariant(e) === 'A').length;
        const bConverts = events.filter(e => e.tipo_evento === 'adicionar_carrinho' && getVariant(e) === 'B').length;

        setSummary({
          testName: 'Layout Página de Produto',
          variantA: { atribuicoes: aViews, conversoes: aConverts },
          variantB: { atribuicoes: bViews, conversoes: bConverts },
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const convRate = (conversoes: number, atribuicoes: number) =>
    atribuicoes > 0 ? ((conversoes / atribuicoes) * 100).toFixed(1) : '0.0';

  const winner = summary && summary.variantA.atribuicoes > 0 && summary.variantB.atribuicoes > 0
    ? parseFloat(convRate(summary.variantB.conversoes, summary.variantB.atribuicoes)) >
      parseFloat(convRate(summary.variantA.conversoes, summary.variantA.atribuicoes))
      ? 'B'
      : 'A'
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
        <FlaskConical className="w-4 h-4 text-purple-600" />
        <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest">Resultados A/B Testing</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-amber-600 animate-spin" />
        </div>
      ) : summary ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-serif font-bold text-stone-800">Teste: {summary.testName}</h4>
            {winner && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                winner === 'B' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
              }`}>
                Variante {winner} em destaque
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {([
              { label: 'Layout A (Controlo)', data: summary.variantA, variant: 'A', desc: 'Imagem esquerda · Botão "Adicionar"', color: 'amber' },
              { label: 'Layout B (Variante)', data: summary.variantB, variant: 'B', desc: 'Imagem direita · Botão "Comprar Agora"', color: 'purple' },
            ] as const).map(({ label, data, variant, desc, color }) => {
              const rate = convRate(data.conversoes, data.atribuicoes);
              const isWinner = winner === variant && data.atribuicoes > 0;
              return (
                <div
                  key={variant}
                  className={`rounded-2xl border p-4 space-y-3 relative ${
                    isWinner
                      ? color === 'amber' ? 'border-amber-300 bg-amber-50/30' : 'border-purple-300 bg-purple-50/30'
                      : 'border-stone-100 bg-white'
                  }`}
                >
                  {isWinner && (
                    <div className="absolute -top-2 -right-2">
                      <CheckCircle2 className={`w-5 h-5 ${color === 'amber' ? 'text-amber-500' : 'text-purple-500'}`} />
                    </div>
                  )}
                  <div>
                    <p className={`text-[10px] font-mono uppercase tracking-wider font-bold ${color === 'amber' ? 'text-amber-700' : 'text-purple-700'}`}>
                      {label}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{desc}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500 font-mono">Visualizações</span>
                      <span className="font-bold text-stone-900 font-mono">{data.atribuicoes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500 font-mono">Add ao Carrinho</span>
                      <span className="font-bold text-stone-900 font-mono">{data.conversoes.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-stone-100 pt-2 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-stone-400 uppercase">Taxa Conv.</span>
                      <span className={`text-lg font-serif font-black font-mono ${color === 'amber' ? 'text-amber-600' : 'text-purple-600'}`}>
                        {rate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-stone-500" />
              <p className="text-xs font-serif font-bold text-stone-700">Uplift da Variante B vs A</p>
            </div>
            <p className="text-xs text-stone-500 font-mono leading-relaxed">
              {summary.variantA.atribuicoes === 0 && summary.variantB.atribuicoes === 0
                ? 'Aguardando dados suficientes para análise estatística. Os visitantes precisam de aceitar o consentimento de cookies para serem rastreados.'
                : (() => {
                    const rateA = parseFloat(convRate(summary.variantA.conversoes, summary.variantA.atribuicoes));
                    const rateB = parseFloat(convRate(summary.variantB.conversoes, summary.variantB.atribuicoes));
                    const uplift = rateA > 0 ? (((rateB - rateA) / rateA) * 100).toFixed(1) : 'N/A';
                    return uplift === 'N/A'
                      ? 'Dados insuficientes para calcular uplift.'
                      : `A Variante B tem um uplift de ${uplift}% em relação ao controlo A.`;
                  })()
              }
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-stone-400 font-mono text-center py-8">Sem dados de A/B Testing disponíveis.</p>
      )}
    </div>
  );
}
