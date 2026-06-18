import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';
import { Pedido } from '@/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json() as { status: Pedido['status'] };

  if (hasConfig && supabase) {
    const { error } = await supabase.from('pedidos').update({ status }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
