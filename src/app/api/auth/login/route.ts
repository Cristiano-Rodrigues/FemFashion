import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e password são obrigatórios.' }, { status: 400 });
  }

  if (!hasConfig || !supabase) {
    return NextResponse.json({ error: 'Erro de configuração do servidor ou serviço indisponível.' }, { status: 500 });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');

  const { data: profile, error } = await supabase
    .from('usuarios')
    .select('*')
    .ilike('email', email)
    .single();
  
  if (error || !profile || profile.password_hash !== hash) {
    return NextResponse.json({ error: 'Email ou palavra-passe incorretos!' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set('femfashion_user_id', profile.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return NextResponse.json({ user: profile });
}
