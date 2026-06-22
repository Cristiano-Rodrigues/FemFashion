import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_visitante, tipo_dispositivo } = body;

    if (!id_visitante) {
      return NextResponse.json({ error: 'id_visitante required' }, { status: 400 });
    }

    if (!hasConfig || !supabase) {
      return NextResponse.json({ sessionId: 'local-' + id_visitante.substring(0, 8) });
    }

    const { data: existing } = await supabase
      .from('sessao')
      .select('id')
      .eq('id_visitante', id_visitante)
      .gte('inicio', new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .order('inicio', { ascending: false })
      .limit(1)
      .single();

    if (existing?.id) {
      return NextResponse.json({ sessionId: existing.id });
    }

    const { data: newSession, error } = await supabase
      .from('sessao')
      .insert([{
        id_visitante,
        tipo_dispositivo: tipo_dispositivo || 'desktop',
        pais: 'Angola',
      }])
      .select('id')
      .single();

    if (error || !newSession) {
      return NextResponse.json({ sessionId: 'fallback-' + id_visitante.substring(0, 8) });
    }

    return NextResponse.json({ sessionId: newSession.id });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
