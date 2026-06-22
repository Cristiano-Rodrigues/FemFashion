'use client';

import { useState } from 'react';
import { ArrowLeft, ShoppingBag, Zap, Star } from 'lucide-react';
import { ProdutoDetalhado, VarianteProduto } from '@/types';
import ProductZoom from '@/components/ProductZoom';

interface ProductLayoutProps {
  product: ProdutoDetalhado;
  onNavigateBack: () => void;
  onAddToCart: (variant: VarianteProduto, qty: number) => void;
  formatKz: (v: number) => string;
}

export default function ProductLayoutB({ product, onNavigateBack, onAddToCart, formatKz }: ProductLayoutProps) {
  const [selectedVariant, setSelectedVariant] = useState<VarianteProduto | null>(
    product.variantes[0] || null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.imagens[0]?.url || null
  );
  const [quantity, setQuantity] = useState(1);

  const imgUrl = selectedImage || product.imagens[0]?.url || '';
  const stockCount = selectedVariant?.quantidade_stock ?? 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-350">
      <button
        onClick={onNavigateBack}
        className="mb-6 flex items-center gap-1.5 text-stone-500 hover:text-amber-800 text-xs font-mono uppercase tracking-widest"
        id="back-to-catalog-btn-b"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        <div className="order-2 md:order-1 flex flex-col justify-center py-2 space-y-5">

          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-700 uppercase font-bold bg-amber-500/10 px-2.5 py-1 rounded">
              {product.categoria?.nome || 'Coleção de Destaque'}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 tracking-wide mt-3">{product.nome}</h1>

            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-[10px] text-stone-400 font-mono ml-1">(127 avaliações)</span>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Preço final da opção seleccionada</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-serif font-black text-amber-600 font-mono">
                {formatKz(selectedVariant ? selectedVariant.preco : product.preco)}
              </span>
            </div>
            {isLowStock && (
              <p className="text-[10px] font-mono text-red-600 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Apenas {stockCount} {stockCount === 1 ? 'unidade' : 'unidades'} disponíveis!
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Seleccionar opção:</p>
            <select
              value={selectedVariant?.id || ''}
              onChange={e => {
                const v = product.variantes.find(v => v.id === e.target.value) || null;
                setSelectedVariant(v);
                setQuantity(1);
              }}
              className="w-full border border-stone-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-amber-600 bg-white shadow-sm"
              id="variant-select-b"
            >
              {product.variantes.map(v => (
                <option key={v.id} value={v.id} disabled={v.quantidade_stock === 0}>
                  {v.designativo || 'Padrão'} — {v.tamanho || 'Único'} / {v.cor || 'Único'} — {formatKz(v.preco)}{v.quantidade_stock === 0 ? ' (Esgotado)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 border-t border-stone-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-200 rounded-full py-2 px-4 bg-white shadow-sm font-mono text-xs">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-stone-500 hover:text-stone-900" id="qty-dec-btn-b">-</button>
                <span className="px-5 font-bold text-stone-950 min-w-[24px] text-center">{quantity}</span>
                <button
                  onClick={() => { const max = selectedVariant?.quantidade_stock ?? 1; setQuantity(q => Math.min(max, q + 1)); }}
                  className="text-stone-500 hover:text-stone-900"
                  id="qty-inc-btn-b"
                >+</button>
              </div>
            </div>

            <button
              onClick={() => selectedVariant && onAddToCart(selectedVariant, quantity)}
              disabled={!selectedVariant || selectedVariant.quantidade_stock === 0}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-sm font-mono uppercase tracking-widest font-bold flex justify-center items-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
              id="buy-now-action-btn-b"
            >
              <Zap className="w-4 h-4" />
              {!selectedVariant || selectedVariant.quantidade_stock === 0 ? 'Esgotado na Plataforma' : 'Comprar Agora'}
            </button>

            <button
              onClick={() => selectedVariant && onAddToCart(selectedVariant, quantity)}
              disabled={!selectedVariant || selectedVariant.quantidade_stock === 0}
              className="w-full py-3 border border-stone-900 text-stone-900 hover:bg-stone-50 rounded-2xl text-xs font-mono uppercase tracking-widest flex justify-center items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              id="add-to-cart-action-btn-b"
            >
              <ShoppingBag className="w-4 h-4" />
              Adicionar ao Carrinho
            </button>
          </div>

          <p className="text-sm text-stone-500 font-light leading-relaxed border-t border-stone-100 pt-4">{product.descricao}</p>
          <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest text-center">
            ✓ Levantamentos expressos e devoluções gratuitas até 7 dias em Luanda.
          </p>
        </div>

        <div className="order-1 md:order-2 flex gap-3">
          {product.imagens.length > 1 && (
            <div className="flex flex-col gap-2 shrink-0">
              {product.imagens.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-16 h-16 border rounded-lg overflow-hidden shrink-0 cursor-pointer transition ${
                    selectedImage === img.url
                      ? 'border-amber-600 shadow-sm ring-2 ring-amber-600/20'
                      : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <img src={img.url} alt={`Miniatura ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          )}
          <div className="flex-grow">
            <ProductZoom src={imgUrl} alt={product.nome} />
          </div>
        </div>
      </div>
    </div>
  );
}
