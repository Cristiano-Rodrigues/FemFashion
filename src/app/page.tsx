'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';
import { Categoria, ProdutoDetalhado } from '@/types';

export default function HomePage() {
  const { navigate, formatKz, searchQuery, setSearchQuery, selectedCategorySlug, setSelectedCategorySlug } = useStore();
  const [products, setProducts] = useState<ProdutoDetalhado[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([prodData, catData]) => {
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategorySlug ? p.categoria?.slug === selectedCategorySlug : true;
    if (!searchQuery.trim()) return matchesCategory && p.ativo;
    const terms = searchQuery.toLowerCase().trim().split(/\s+/);
    const matchesSearch = terms.every(term =>
      p.nome?.toLowerCase().includes(term) ||
      p.descricao?.toLowerCase().includes(term) ||
      p.categoria?.nome?.toLowerCase().includes(term) ||
      p.variantes?.some(v =>
        v.designativo?.toLowerCase().includes(term) ||
        v.cor?.toLowerCase().includes(term) ||
        v.tamanho?.toLowerCase().includes(term)
      )
    );
    return matchesCategory && matchesSearch && p.ativo;
  });

  const fallbackImages = [
    'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=200',
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* HERO BANNER */}
      <header className="relative bg-stone-950 overflow-hidden py-16 md:py-32 text-white px-4 shadow-2xl rounded-b-[2rem]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-1000 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-stone-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-medium">Nova Coleção de Luxo</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-white max-w-3xl font-serif drop-shadow-lg">
            Destaque a sua <br className="hidden md:block" />
            <span className="text-amber-500 italic font-sans font-light">Beleza</span> Natural
          </h1>
          <p className="text-stone-300 max-w-xl text-sm md:text-base font-sans leading-relaxed font-light">
            Explore o luxo em perucas front lace HD realistas, alta-costura sofisticada de Luanda, sandálias cravejadas de brilhantes e acessórios exclusivos.
          </p>

          {/* Enhanced Search Bar in Hero */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Pesquise por vestidos, batons, perucas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white/15 transition-all text-sm shadow-inner"
              />
            </div>
            <button 
              onClick={() => {
                const elem = document.getElementById('vitrine-produtos');
                elem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] whitespace-nowrap"
            >
              Explorar
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORIES + PRODUCTS */}
      <section id="vitrine-produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-6 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-wide uppercase text-stone-900">
              {selectedCategorySlug ? categories.find(c => c.slug === selectedCategorySlug)?.nome : 'Nossas Categorias'}
            </h2>
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">
              {selectedCategorySlug ? 'Filtro por departamento' : 'Exclusividade em cada detalhe'}
            </p>
          </div>
          {selectedCategorySlug && (
            <button onClick={() => setSelectedCategorySlug(null)} className="text-xs uppercase font-mono text-amber-700 font-semibold">
              Ver Tudo ×
            </button>
          )}
        </div>

        {/* Category grid */}
        {!selectedCategorySlug && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
            {categories.map((cat, idx) => (
              <div key={cat.id} onClick={() => setSelectedCategorySlug(cat.slug)}
                className="group flex flex-col items-center p-4 bg-white border border-stone-100 rounded-2xl hover:border-amber-200 transition cursor-pointer text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-2.5 border border-stone-200/50">
                  <img src={fallbackImages[idx] || fallbackImages[0]} alt={cat.nome} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <h3 className="font-serif font-black text-xs text-stone-900 tracking-wide leading-none">{cat.nome.split(' & ')[0]}</h3>
              </div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-stone-400 font-mono text-xs uppercase tracking-widest animate-pulse">A carregar vitrina...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-stone-50 rounded-3xl border border-stone-100">
            <p className="font-bold text-stone-800">Nenhum produto em vitrine encontrado</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategorySlug(null); }}
              className="mt-4 px-4 py-2 bg-[#171512] text-white text-xs font-mono rounded">
              Redefinir Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onViewProduct={slug => navigate(`/product/${slug}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
