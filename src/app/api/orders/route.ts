import { NextRequest, NextResponse } from 'next/server';
import { serverGetOrders, supabase, hasConfig } from '@/services/db-server';
import { CartItem, Pedido, ItemPedido } from '@/types';

export async function GET() {
  const orders = await serverGetOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id_usuario, id_endereco, cartItems, subtotal, taxa_entrega, total, metodo_pagamento } = body as {
    id_usuario: string; id_endereco: string; cartItems: CartItem[];
    subtotal: number; taxa_entrega: number; total: number; metodo_pagamento: string;
  };

  const newOrderId = crypto.randomUUID();
  const newOrder: Pedido = {
    id: newOrderId, id_usuario, id_endereco,
    status: 'pago', subtotal, taxa_entrega, total,
    metodo_pagamento, criado_em: new Date().toISOString(),
  };

  const newItems: ItemPedido[] = cartItems.map((item, i) => ({
    id: crypto.randomUUID(), id_pedido: newOrderId,
    id_variante: item.variante.id,
    nome_produto: `${item.produto.nome} (${item.variante.designativo || item.variante.tamanho || ''})`,
    preco_unitario: item.variante.preco,
    quantidade: item.quantidade,
  }));

  if (hasConfig && supabase) {
    // Validate stock server-side
    for (const item of cartItems) {
      const { data: v } = await supabase.from('variantes_produto').select('quantidade_stock').eq('id', item.variante.id).single();
      if (!v || v.quantidade_stock < item.quantidade) {
        return NextResponse.json({ error: `Stock insuficiente para ${item.produto.nome}.` }, { status: 409 });
      }
    }

    const { error } = await supabase.from('pedidos').insert([newOrder]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from('itens_pedido').insert(newItems);

    // Deduct stock
    for (const item of cartItems) {
      const { error: rpcErr } = await supabase.rpc('decrement_stock', { variant_id: item.variante.id, qty: item.quantidade });
      if (rpcErr) {
        // Fallback: manual decrement
        const { data: vData } = await supabase.from('variantes_produto')
          .select('quantidade_stock').eq('id', item.variante.id).single();
        if (vData) {
          await supabase.from('variantes_produto')
            .update({ quantidade_stock: vData.quantidade_stock - item.quantidade })
            .eq('id', item.variante.id);
        }
      }
    }
  }

  return NextResponse.json({ order: newOrder, items: newItems }, { status: 201 });
}
