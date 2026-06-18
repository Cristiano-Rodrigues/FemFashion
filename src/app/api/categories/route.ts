import { NextRequest, NextResponse } from 'next/server';
import { serverGetCategories, supabase, hasConfig } from '@/services/db-server';

export async function GET() {
  const categories = await serverGetCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nome, descricao } = body;

  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });

  const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newCat = { id: crypto.randomUUID(), nome, slug, descricao: descricao || '' };

  if (hasConfig && supabase) {
    const { error } = await supabase.from('categorias').insert([newCat]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: newCat }, { status: 201 });
}
