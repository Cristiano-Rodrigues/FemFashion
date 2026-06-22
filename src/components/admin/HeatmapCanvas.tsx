'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, Monitor, Smartphone, FlaskConical } from 'lucide-react';

interface ClickPoint {
  x: number;
  y: number;
  variante_ab: string | null;
  largura_tela: number;
  altura_tela: number;
}

const LAYOUT_A_ELEMENTS = [
  { x: 2, y: 2, w: 46, h: 52, label: 'Imagem Principal', fill: '#e7e5e4', stroke: '#d4d4d4' },
  { x: 2, y: 56, w: 46, h: 8, label: 'Thumbnails', fill: '#f5f5f4', stroke: '#d4d4d4' },
  { x: 52, y: 2, w: 46, h: 7, label: 'Categoria', fill: '#fef3c7', stroke: '#fde68a' },
  { x: 52, y: 11, w: 46, h: 9, label: 'Título', fill: '#e7e5e4', stroke: '#d4d4d4' },
  { x: 52, y: 22, w: 28, h: 8, label: 'Preço', fill: '#fde68a', stroke: '#f59e0b' },
  { x: 52, y: 32, w: 46, h: 8, label: 'Descrição', fill: '#f5f5f4', stroke: '#d4d4d4' },
  { x: 52, y: 42, w: 46, h: 18, label: 'Variantes (Grid)', fill: '#e7e5e4', stroke: '#d4d4d4' },
  { x: 52, y: 62, w: 12, h: 8, label: 'Qtd', fill: '#f5f5f4', stroke: '#d4d4d4' },
  { x: 66, y: 62, w: 32, h: 8, label: 'Adicionar ao Carrinho', fill: '#1c1917', stroke: '#1c1917', textColor: '#fff' },
  { x: 52, y: 72, w: 46, h: 4, label: 'Nota envio', fill: '#f5f5f4', stroke: '#d4d4d4' },
];

const LAYOUT_B_ELEMENTS = [
  { x: 2, y: 2, w: 46, h: 7, label: 'Categoria + Título', fill: '#fef3c7', stroke: '#fde68a' },
  { x: 2, y: 11, w: 46, h: 8, label: 'Título', fill: '#e7e5e4', stroke: '#d4d4d4' },
  { x: 2, y: 21, w: 46, h: 4, label: 'Rating ★★★★★', fill: '#fef3c7', stroke: '#fde68a' },
  { x: 2, y: 27, w: 46, h: 12, label: 'Preço Proeminente', fill: '#fde68a', stroke: '#f59e0b' },
  { x: 2, y: 41, w: 46, h: 8, label: 'Dropdown Variantes', fill: '#e7e5e4', stroke: '#d4d4d4' },
  { x: 2, y: 51, w: 46, h: 9, label: 'Comprar Agora (CTA)', fill: '#d97706', stroke: '#b45309', textColor: '#fff' },
  { x: 2, y: 62, w: 46, h: 8, label: 'Adicionar ao Carrinho', fill: '#f5f5f4', stroke: '#1c1917' },
  { x: 2, y: 72, w: 46, h: 8, label: 'Descrição', fill: '#f5f5f4', stroke: '#d4d4d4' },
  { x: 52, y: 2, w: 10, h: 70, label: 'Thumbs', fill: '#e7e5e4', stroke: '#d4d4d4' },
  { x: 64, y: 2, w: 34, h: 70, label: 'Imagem Principal', fill: '#d4d4d4', stroke: '#a8a29e' },
];

function drawWireframe(
  ctx: CanvasRenderingContext2D,
  elements: typeof LAYOUT_A_ELEMENTS,
  W: number,
  H: number
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(0, 0, W, H);

  elements.forEach(el => {
    const x = (el.x / 100) * W;
    const y = (el.y / 100) * H;
    const w = (el.w / 100) * W;
    const h = (el.h / 100) * H;

    ctx.fillStyle = el.fill;
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = el.textColor || '#78716c';
    ctx.font = `${Math.max(9, Math.min(12, w / 8))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(el.label, x + w / 2, y + h / 2);
  });
}

function drawHeatPoints(
  ctx: CanvasRenderingContext2D,
  points: ClickPoint[],
  W: number,
  H: number,
  deviceFilter: string
) {
  const filtered = deviceFilter === 'all'
    ? points
    : points.filter(p => deviceFilter === 'mobile' ? p.largura_tela < 768 : p.largura_tela >= 768);

  filtered.forEach(p => {
    const cx = (p.x / 100) * W;
    const cy = (p.y / 100) * H;
    const r = Math.max(22, W * 0.05);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(239,68,68,0.65)');
    g.addColorStop(0.35, 'rgba(249,115,22,0.3)');
    g.addColorStop(0.7, 'rgba(234,179,8,0.12)');
    g.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  });
}

export default function HeatmapCanvas() {
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const [clicksA, setClicksA] = useState<ClickPoint[]>([]);
  const [clicksB, setClicksB] = useState<ClickPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'mobile' | 'desktop'>('all');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/track/heatmap?pagina=/product&variante=A'),
        fetch('/api/track/heatmap?pagina=/product&variante=B'),
      ]);
      const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);
      setClicksA(dataA.clicks || []);
      setClicksB(dataB.clicks || []);
      setLastUpdated(new Date().toLocaleTimeString('pt-PT'));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderPanel = useCallback((
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    elements: typeof LAYOUT_A_ELEMENTS,
    points: ClickPoint[]
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (W === 0 || H === 0) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawWireframe(ctx, elements, W, H);
    drawHeatPoints(ctx, points, W, H, deviceFilter);
  }, [deviceFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      renderPanel(canvasARef, LAYOUT_A_ELEMENTS, clicksA);
      renderPanel(canvasBRef, LAYOUT_B_ELEMENTS, clicksB);
    }, 50);
    return () => clearTimeout(timeout);
  }, [clicksA, clicksB, deviceFilter, renderPanel]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      renderPanel(canvasARef, LAYOUT_A_ELEMENTS, clicksA);
      renderPanel(canvasBRef, LAYOUT_B_ELEMENTS, clicksB);
    });
    if (canvasARef.current) observer.observe(canvasARef.current);
    return () => observer.disconnect();
  }, [clicksA, clicksB, renderPanel]);

  const totalA = clicksA.length;
  const totalB = clicksB.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden text-xs font-mono">
            {([
              { key: 'all', label: 'Todos', icon: <FlaskConical className="w-3.5 h-3.5" /> },
              { key: 'desktop', label: 'Desktop', icon: <Monitor className="w-3.5 h-3.5" /> },
              { key: 'mobile', label: 'Mobile', icon: <Smartphone className="w-3.5 h-3.5" /> },
            ] as const).map(d => (
              <button
                key={d.key}
                onClick={() => setDeviceFilter(d.key)}
                className={`flex items-center gap-1 px-3 py-1.5 transition ${deviceFilter === d.key ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                {d.icon}
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-mono text-stone-600 hover:bg-stone-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-stone-400">
          {lastUpdated && <span className="text-stone-400">Actualizado: {lastUpdated}</span>}
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> Poucos
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" /> Médio
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Hotspot
          </span>
        </div>
      </div>

      {totalA === 0 && totalB === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs font-mono text-amber-700 text-center">
          Sem dados de heatmap para páginas de produto. Navega para uma página de produto com o consentimento activo para registar cliques.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {([
          { label: 'Layout A — Controlo', sub: 'Imagem esq. · Variantes em grid · "Adicionar ao Carrinho"', ref: canvasARef, elements: LAYOUT_A_ELEMENTS, count: totalA, color: 'amber' },
          { label: 'Layout B — Variante', sub: 'Imagem dir. · Dropdown · "Comprar Agora"', ref: canvasBRef, elements: LAYOUT_B_ELEMENTS, count: totalB, color: 'purple' },
        ] as const).map(({ label, sub, ref, count, color }) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] font-mono uppercase tracking-wider font-bold ${color === 'amber' ? 'text-amber-700' : 'text-purple-700'}`}>{label}</p>
                <p className="text-[10px] text-stone-400">{sub}</p>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${color === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                {count} cliques
              </span>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50" style={{ height: '420px' }}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-200 border-t-amber-600 animate-spin" />
                </div>
              )}
              <canvas
                ref={ref}
                className="w-full h-full"
                style={{ display: 'block' }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-mono text-stone-400 text-center">
        Wireframe representa a estrutura visual de cada layout. Os pontos mostram onde os visitantes clicaram (X,Y como % do ecrã). Cliques nas duas variantes são separados automaticamente.
      </p>
    </div>
  );
}
