import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';
import { cookies } from 'next/headers';
import { Usuario } from '@/types';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { nome, email, password, telefone } = await req.json();

  if (!nome || !email || !password) {
    return NextResponse.json({ error: 'Nome, email e password são obrigatórios.' }, { status: 400 });
  }

  if (!hasConfig || !supabase) {
    return NextResponse.json({ error: 'Erro de configuração do servidor ou serviço indisponível.' }, { status: 500 });
  }

  const { data: existingUser } = await supabase.from('usuarios').select('id').ilike('email', email).maybeSingle();
  if (existingUser) {
    return NextResponse.json({ error: 'Este e-mail já se encontra registado.' }, { status: 409 });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');

  const newProfile: Partial<Usuario> = { 
    nome, 
    email, 
    password_hash: hash, 
    telefone, 
    role: 'cliente' 
  };

  const { data: profile, error: insertError } = await supabase
    .from('usuarios')
    .insert([newProfile])
    .select()
    .single();

  if (insertError || !profile) {
    console.error('Error inserting user profile:', insertError);
    return NextResponse.json({ error: 'Erro ao criar o perfil do utilizador.' }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set('femfashion_user_id', profile.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return NextResponse.json({ user: profile }, { status: 201 });
}
