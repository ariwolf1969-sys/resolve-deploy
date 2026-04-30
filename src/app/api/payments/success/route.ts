import { NextRequest, NextResponse } from 'next/server';

// Payment success callback page
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalRef = searchParams.get('external_reference');

  // In SPA mode, redirect to home with params
  return NextResponse.redirect(new URL(`/?payment=success&status=${status}&ref=${externalRef || ''}`, request.url));
}
