import { NextResponse } from 'next/server';
import { supabase, hasConfig } from '@/services/db-server';
import { cookies } from 'next/headers';

export async function POST() {
  if (hasConfig && supabase) {
    await supabase.auth.signOut();
  }
  const cookieStore = await cookies();
  cookieStore.delete('femfashion_user_id');
  return NextResponse.json({ success: true });
}
