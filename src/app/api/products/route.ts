import { NextRequest, NextResponse } from 'next/server';
import { serverGetProducts, supabase, hasConfig, SEED_CATEGORIES, SEED_IMAGES, SEED_VARIANTS } from '@/services/db-server';
import { Produto } from '@/types';

export async function GET() {
  const products = await serverGetProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id_categoria, nome, descricao, preco, imagens, variantes } = body;

  if (!nome || !id_categoria) {
    return NextResponse.json({ error: 'Nome e categoria são obrigatórios.' }, { status: 400 });
  }

  const newId = crypto.randomUUID();
  const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const newProd: Produto = {
    id: newId, id_categoria, nome, slug, descricao,
    preco: Number(preco), ativo: true,
    criado_em: new Date().toISOString(),
  };

  const newImgs = (imagens || []).map((img: any, i: number) => ({
    id: crypto.randomUUID(), id_produto: newId, url: img.url, ranking: i + 1,
  }));

  const newVars = (variantes || []).map((v: any) => ({
    id: crypto.randomUUID(), id_produto: newId,
    designativo: v.designativo, tamanho: v.tamanho, cor: v.cor,
    preco: Number(v.preco), quantidade_stock: Number(v.quantidade_stock),
  }));

  if (hasConfig && supabase) {
    const { error } = await supabase.from('produtos').insert([newProd]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (newImgs.length) await supabase.from('imagens_produto').insert(newImgs);
    if (newVars.length) await supabase.from('variantes_produto').insert(newVars);
  }

  const cat = SEED_CATEGORIES.find(c => c.id === id_categoria);
  return NextResponse.json({ product: { ...newProd, categoria: cat, imagens: newImgs, variantes: newVars } }, { status: 201 });
}
