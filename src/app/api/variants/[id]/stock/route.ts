import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { quantidade_stock } = await req.json();

  if (hasConfig && supabase) {
    const { error } = await supabase.from('variantes_produto')
      .update({ quantidade_stock: Number(quantidade_stock) })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
