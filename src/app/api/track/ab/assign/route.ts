import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testName = searchParams.get('test');
  const visitorId = searchParams.get('visitor');

  if (!testName || !visitorId) {
    return NextResponse.json({ variant: 'A' });
  }

  if (!hasConfig || !supabase) {
    return NextResponse.json({ variant: 'A' });
  }

  const { data: teste } = await supabase
    .from('testes_ab')
    .select('id, percentual_teste')
    .eq('nome', testName)
    .eq('estado', 'ativo')
    .single();

  if (!teste) {
    return NextResponse.json({ variant: 'A' });
  }

  const { data: existing } = await supabase
    .from('atribuicoes_ab')
    .select('id_variante, variantes_ab(nome)')
    .eq('id_teste', teste.id)
    .eq('id_visitante', visitorId)
    .single();

  if (existing) {
    const raw = existing.variantes_ab;
    const variantName = (Array.isArray(raw) ? (raw[0] as { nome: string } | undefined)?.nome : (raw as unknown as { nome: string } | null)?.nome) || 'A';
    return NextResponse.json({ variant: variantName });
  }

  const { data: variantes } = await supabase
    .from('variantes_ab')
    .select('id, nome')
    .eq('id_teste', teste.id)
    .order('nome', { ascending: true });

  if (!variantes || variantes.length === 0) {
    return NextResponse.json({ variant: 'A' });
  }

  const roll = Math.random() * 100;
  const chosenIndex = roll < teste.percentual_teste ? 0 : variantes.length - 1;
  const chosen = variantes[chosenIndex];

  await supabase.from('atribuicoes_ab').insert([{
    id_teste: teste.id,
    id_variante: chosen.id,
    id_visitante: visitorId,
  }]);

  return NextResponse.json({ variant: chosen.nome });
}
