/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Eye, BadgeAlert, ShoppingCart } from 'lucide-react';
import { ProdutoDetalhado } from '../types';

interface ProductCardProps {
  product: ProdutoDetalhado;
  onViewProduct: (slug: string) => void;
  key?: any;
}

export default function ProductCard({ product, onViewProduct }: ProductCardProps) {
  // Find highest ranking image or first image
  const displayImage = product.imagens.length > 0 
    ? product.imagens.sort((a, b) => a.ranking - b.ranking)[0].url
    : 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=800'; // Default wig

  // Calculate total stock remaining across variants
  const totalStock = product.variantes.reduce((sum, v) => sum + v.quantidade_stock, 0);

  // Safely format price in Angolan Kwanzas (Kz)
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('AOA', 'Kz');
  };

  return (
    <div 
      onClick={() => onViewProduct(product.slug)}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
        <img
          src={displayImage}
          alt={product.nome}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Categories Pill badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-semibold font-mono tracking-widest px-2.5 py-1 rounded-full uppercase border border-stone-100 shadow-sm">
          {product.categoria?.nome.split(' & ')[0] || 'Moda'}
        </span>

        {/* Stock Warnings */}
        {totalStock === 0 ? (
          <div className="absolute top-3 right-3 bg-red-600/95 text-white text-[9px] font-mono tracking-wider font-bold px-2 py-1 rounded-md shadow-sm uppercase flex items-center gap-1 animate-pulse">
            <BadgeAlert className="w-3 h-3" />
            Esgotado
          </div>
        ) : totalStock <= 5 ? (
          <div className="absolute top-3 right-3 bg-amber-500/95 text-white text-[9px] font-mono tracking-wider font-bold px-2 py-1 rounded-md shadow-sm uppercase flex items-center gap-1">
            Últimas Peças
          </div>
        ) : null}

        {/* Quick View Interactive Action Hover Overlay */}
        <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/95 text-stone-900 font-mono text-xs tracking-wider font-bold uppercase py-2.5 px-5 rounded-full shadow-lg border border-stone-100 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-4 h-4 text-amber-600" />
            Ver Detalhes
          </div>
        </div>
      </div>

      {/* Product Information Details */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        <div className="flex-grow">
          <h3 className="text-sm font-serif font-bold text-stone-900 tracking-wide line-clamp-1 group-hover:text-amber-700 transition-colors">
            {product.nome}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 h-8 leading-relaxed font-light">
            {product.descricao}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-50 flex items-baseline justify-between">
          <p className="text-xs text-stone-400 font-mono uppercase tracking-widest">Preço base</p>
          <span className="text-base font-serif font-black text-amber-600 tracking-tight">
            {formatKz(product.preco)}
          </span>
        </div>
      </div>
    </div>
  );
}
