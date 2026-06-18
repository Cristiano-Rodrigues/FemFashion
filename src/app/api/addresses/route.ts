import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig, serverGetAddresses } from '@/services/db-server';
import { Endereco } from '@/types';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ addresses: [] });

  const addresses = await serverGetAddresses(userId);
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const { id_usuario, provincia, municipio, bairro, rua, padrao } = await req.json();

  const newAddr: Endereco = {
    id: crypto.randomUUID(), id_usuario,
    provincia, municipio, bairro, rua, padrao: !!padrao,
  };

  if (hasConfig && supabase) {
    if (padrao) await supabase.from('enderecos').update({ padrao: false }).eq('id_usuario', id_usuario);
    const { error } = await supabase.from('enderecos').insert([newAddr]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ address: newAddr }, { status: 201 });
}
