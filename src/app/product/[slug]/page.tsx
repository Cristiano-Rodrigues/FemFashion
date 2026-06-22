'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import { useTracking } from '@/contexts/TrackingContext';
import { useABTest } from '@/hooks/useABTest';
import ProductLayoutA from './ProductLayoutA';
import ProductLayoutB from './ProductLayoutB';
import { ProdutoDetalhado } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { navigate, formatKz, handleAddToCart } = useStore();
  const { trackEvent, setCurrentVariant } = useTracking();
  const abVariant = useABTest('layout_pagina_produto');

  const [product, setProduct] = useState<ProdutoDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!slug) return;
    trackedRef.current = false;
    fetch(`/api/products/slug/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (!data.product) { setNotFound(true); setLoading(false); return; }
        setProduct(data.product);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    setCurrentVariant(abVariant);
  }, [abVariant, setCurrentVariant]);

  useEffect(() => {
    if (!product || abVariant === null || trackedRef.current) return;
    trackedRef.current = true;
    trackEvent('visualizar_produto', product.id, { slug: product.slug, ab_variant: abVariant });
  }, [product, abVariant]);

  if (loading || abVariant === null) return (
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

  const sharedProps = {
    product,
    onNavigateBack: () => navigate('/'),
    onAddToCart: (variant: import('@/types').VarianteProduto, qty: number) => {
      handleAddToCart(product, variant, qty);
      trackEvent('adicionar_carrinho', product.id, { variant_id: variant.id, qty, ab_variant: abVariant });
    },
    formatKz,
  };

  return abVariant === 'B' ? <ProductLayoutB {...sharedProps} /> : <ProductLayoutA {...sharedProps} />;
}
