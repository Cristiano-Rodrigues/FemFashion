import { NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('femfashion_user_id')?.value;

  if (!userId) return NextResponse.json({ user: null });

  if (hasConfig && supabase) {
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single();
    if (data) return NextResponse.json({ user: data });
  }

  return NextResponse.json({ user: null });
}
