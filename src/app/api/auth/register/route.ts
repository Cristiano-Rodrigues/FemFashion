import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig, SEED_USERS } from '@/services/db-server';
import { cookies } from 'next/headers';
import { Usuario } from '@/types';

export async function POST(req: NextRequest) {
  const { nome, email, password, telefone } = await req.json();

  if (!nome || !email || !password) {
    return NextResponse.json({ error: 'Nome, email e password são obrigatórios.' }, { status: 400 });
  }

  if (hasConfig && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { nome, telefone } }
    });
    if (!error && data.user) {
      const newProfile: Usuario = { id: data.user.id, nome, email, password_hash: password, telefone, role: 'cliente' };
      await supabase.from('usuarios').insert([newProfile]);
      const cookieStore = await cookies();
      cookieStore.set('femfashion_user_id', newProfile.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      return NextResponse.json({ user: newProfile }, { status: 201 });
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Seed fallback — check if email already exists
  if (SEED_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: 'Este e-mail já se encontra registado.' }, { status: 409 });
  }

  const newUser: Usuario = {
    id: crypto.randomUUID(), nome, email, password_hash: password, telefone, role: 'cliente',
    criado_em: new Date().toISOString(),
  };
  const cookieStore = await cookies();
  cookieStore.set('femfashion_user_id', newUser.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return NextResponse.json({ user: newUser }, { status: 201 });
}
