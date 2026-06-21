'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import ProductZoom from '@/components/ProductZoom';
import { ProdutoDetalhado, VarianteProduto } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { navigate, formatKz, handleAddToCart } = useStore();

  const [product, setProduct] = useState<ProdutoDetalhado | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VarianteProduto | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/slug/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (!data.product) { setNotFound(true); setLoading(false); return; }
        setProduct(data.product);
        if (data.product.imagens?.length > 0) {
          setSelectedImage(data.product.imagens[0].url);
        }
        if (data.product.variantes?.length > 0) {
          setSelectedVariant(data.product.variantes[0]);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <p className="text-stone-400 font-mono text-xs uppercase tracking-widest animate-pulse">A carregar produto...</p>
    </div>
  );

  if (notFound || !product) return (
    <div className="flex flex-col items-center py-40 text-center">
      <p className="font-bold text-stone-800">Produto não encontrado.</p>
      <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-mono rounded">
        Voltar à Vitrina
      </button>
    </div>
  );

  const imgUrl = selectedImage || product.imagens[0]?.url || 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-350">
      <button onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-1.5 text-stone-500 hover:text-amber-800 text-xs font-mono uppercase tracking-widest"
        id="back-to-catalog-btn">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <ProductZoom src={imgUrl} alt={product.nome} />
          {product.imagens.length > 1 && (
            <div className="flex gap-2 justify-start overflow-x-auto py-1">
              {product.imagens.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-16 h-16 border rounded-lg overflow-hidden shrink-0 cursor-pointer transition ${
                    selectedImage === img.url ? 'border-amber-600 shadow-sm ring-2 ring-amber-600/20' : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <img src={img.url} alt={`Miniatura ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-amber-700 uppercase font-bold bg-amber-500/10 px-2.5 py-1 rounded">
              {product.categoria?.nome || 'Coleção de Destaque'}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 tracking-wide mt-2">{product.nome}</h1>
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-4xl font-serif font-black text-amber-600 tracking-tight font-mono">
                {formatKz(selectedVariant ? selectedVariant.preco : product.preco)}
              </span>
              <span className="text-xs text-stone-400 font-mono uppercase tracking-wider">
                (Preço Final {selectedVariant?.designativo ? `opção: ${selectedVariant.designativo}` : 'base'})
              </span>
            </div>
            <p className="text-sm text-stone-500 font-light leading-relaxed max-w-lg border-t border-stone-100 pt-4">{product.descricao}</p>

            {/* Variants */}
            <div className="space-y-3 pt-4">
              <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block">Escolha as Opções Disponíveis:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
                {product.variantes.map(v => (
                  <button key={v.id} onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                    disabled={v.quantidade_stock === 0}
                    className={`p-3 text-left border rounded-xl flex flex-col transition font-mono ${
                      selectedVariant?.id === v.id
                        ? 'border-amber-600 bg-amber-50/20 text-[#151210] font-bold shadow-sm'
                        : v.quantidade_stock === 0
                          ? 'border-stone-150 bg-stone-100 text-stone-400 opacity-50 cursor-not-allowed'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                    id={`variant-btn-${v.id}`}>
                    <span className="text-[11px] uppercase tracking-wide truncate block">{v.designativo || 'Especificações'}</span>
                    <span className="text-[10px] text-stone-500 mt-1 block">Tamanho: {v.tamanho || 'Único'} - Cor: {v.cor || 'Único'}</span>
                    <div className="flex justify-between items-center w-full mt-2 font-serif">
                      <span className="text-xs text-amber-700 font-black font-mono">{formatKz(v.preco)}</span>
                      <span className={`text-[9px] font-mono px-1.5 rounded ${v.quantidade_stock <= 3 ? 'bg-red-50 text-red-650 font-bold' : 'bg-emerald-50 text-emerald-800'}`}>
                        {v.quantidade_stock === 0 ? 'Esgotado' : `${v.quantidade_stock} disp.`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-stone-100 pt-6 space-y-4 max-w-md font-serif">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-200 rounded-full py-2 px-4 bg-white shadow-sm font-mono text-xs">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-stone-500 hover:text-stone-900" id="qty-dec-btn">-</button>
                <span className="px-5 font-bold text-stone-950 min-w-[24px] text-center">{quantity}</span>
                <button onClick={() => { const max = selectedVariant?.quantidade_stock ?? 1; setQuantity(q => Math.min(max, q + 1)); }}
                  className="text-stone-500 hover:text-stone-900" id="qty-inc-btn">+</button>
              </div>
              <button
                onClick={() => selectedVariant && handleAddToCart(product, selectedVariant, quantity)}
                disabled={!selectedVariant || selectedVariant.quantidade_stock === 0}
                className="flex-grow py-3 px-6 bg-stone-950 hover:bg-amber-600 text-white rounded-full text-xs font-mono uppercase tracking-widest font-bold flex justify-center items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                id="add-to-cart-action-btn">
                <ShoppingBag className="w-4 h-4 text-white" />
                {!selectedVariant || selectedVariant.quantidade_stock === 0 ? 'Esgotado na Plataforma' : 'Adicionar ao Carrinho'}
              </button>
            </div>
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest text-center mt-2">
              ✓ Levantamentos expressos e devoluções gratuitas até 7 dias em Luanda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
