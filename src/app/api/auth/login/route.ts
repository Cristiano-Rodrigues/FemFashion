import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasConfig, SEED_USERS } from '@/services/db-server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e password são obrigatórios.' }, { status: 400 });
  }

  if (hasConfig && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      const { data: profile } = await supabase.from('usuarios').select('*').eq('id', data.user.id).single();
      if (profile) {
        const cookieStore = await cookies();
        cookieStore.set('femfashion_user_id', profile.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
        return NextResponse.json({ user: profile });
      }
    }
    if (error) {
      // Fallback to seed users for demo
    }
  }

  // Seed data fallback (demo mode)
  const user = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === password);
  if (!user) return NextResponse.json({ error: 'Email ou palavra-passe incorretos!' }, { status: 401 });

  const cookieStore = await cookies();
  cookieStore.set('femfashion_user_id', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return NextResponse.json({ user });
}
