import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/posts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchPosts(query, 8);
  return NextResponse.json({ results });
}
