import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo_evento, pagina, id_produto, metadados, id_sessao, id_visitante } = body;

    if (!tipo_evento || !pagina) {
      return NextResponse.json({ success: false });
    }

    if (hasConfig && supabase) {
      supabase.from('eventos').insert([{
        id_sessao: id_sessao || null,
        id_visitante: id_visitante || 'anon',
        tipo_evento,
        pagina,
        id_produto: id_produto || null,
        metadados: metadados || {},
      }]).then();
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}

export async function GET() {
  if (hasConfig && supabase) {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(500);
    return NextResponse.json({ events: data || [] });
  }
  return NextResponse.json({ events: [] });
}
