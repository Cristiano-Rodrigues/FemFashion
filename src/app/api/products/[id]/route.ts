import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { id_categoria, nome, descricao, preco, ativo, imagens, variantes } = body;

  const slug = nome?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  if (hasConfig && supabase) {
    const { error } = await supabase.from('produtos').update({ id_categoria, nome, slug, descricao, preco: Number(preco), ativo }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from('imagens_produto').delete().eq('id_produto', id);
    await supabase.from('variantes_produto').delete().eq('id_produto', id);

    const newImgs = (imagens || []).map((img: any, i: number) => ({ id: crypto.randomUUID(), id_produto: id, url: img.url, ranking: i + 1 }));
    const newVars = (variantes || []).map((v: any) => ({ id: crypto.randomUUID(), id_produto: id, designativo: v.designativo, tamanho: v.tamanho, cor: v.cor, preco: Number(v.preco), quantidade_stock: Number(v.quantidade_stock) }));

    if (newImgs.length) await supabase.from('imagens_produto').insert(newImgs);
    if (newVars.length) await supabase.from('variantes_produto').insert(newVars);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (hasConfig && supabase) {
    await supabase.from('imagens_produto').delete().eq('id_produto', id);
    await supabase.from('variantes_produto').delete().eq('id_produto', id);
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (hasConfig && supabase) {
    const { error } = await supabase.from('produtos').update({ ativo: body.ativo }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
