import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_sessao, pagina, pagina_normalizada, variante_ab, componente_raw, x, y, largura_tela, altura_tela } = body;

    if (!pagina || x === undefined || y === undefined) {
      return NextResponse.json({ success: false });
    }

    if (hasConfig && supabase) {
      supabase.from('heatmap_clicks').insert([{
        id_sessao: id_sessao || null,
        pagina: pagina_normalizada || pagina,
        pagina_normalizada: pagina_normalizada || pagina,
        variante_ab: variante_ab || null,
        componente_raw: componente_raw || null,
        x: parseFloat(x.toFixed(1)),
        y: parseFloat(y.toFixed(1)),
        largura_tela: largura_tela || 0,
        altura_tela: altura_tela || 0,
      }]).then();
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pagina = searchParams.get('pagina') || '/product';
  const variante = searchParams.get('variante');

  if (!hasConfig || !supabase) {
    return NextResponse.json({ clicks: [] });
  }

  let query = supabase
    .from('heatmap_clicks')
    .select('x, y, variante_ab, largura_tela, altura_tela')
    .order('criado_em', { ascending: false })
    .limit(5000);

  if (pagina === '/product') {
    query = query.or('pagina.eq./product,pagina.like./product/%');
  } else {
    query = query.eq('pagina', pagina);
  }

  if (variante) {
    query = query.eq('variante_ab', variante);
  }

  const { data } = await query;
  return NextResponse.json({ clicks: data || [] });
}
