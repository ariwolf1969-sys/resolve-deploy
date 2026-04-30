import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  return NextResponse.redirect(new URL(`/?payment=failure&status=${status || ''}`, request.url));
}
