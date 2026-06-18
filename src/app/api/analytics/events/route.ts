import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tipo_evento, pagina, id_produto, metadados, id_usuario, id_visitante } = body;

  const eventObj = {
    id: crypto.randomUUID(),
    id_sessao: 's-' + (id_visitante || 'anon').substring(0, 8),
    id_usuario: id_usuario || null,
    id_visitante: id_visitante || 'anon',
    tipo_evento, pagina,
    id_produto: id_produto || null,
    metadados: metadados || {},
    criado_em: new Date().toISOString(),
  };

  if (hasConfig && supabase) {
    // Fire and forget — analytics shouldn't block user flow
    supabase.from('eventos').insert([eventObj]).then();
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  if (hasConfig && supabase) {
    const { data } = await supabase.from('eventos').select('*').order('criado_em', { ascending: false }).limit(200);
    return NextResponse.json({ events: data || [] });
  }
  return NextResponse.json({ events: [] });
}
