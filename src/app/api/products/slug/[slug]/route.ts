import { NextRequest, NextResponse } from 'next/server';
import { serverGetProductBySlug } from '@/services/db-server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await serverGetProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ product: null }, { status: 404 });
  }

  return NextResponse.json({ product });
}
