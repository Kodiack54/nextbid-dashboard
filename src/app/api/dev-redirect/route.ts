import { NextRequest, NextResponse } from 'next/server';

/**
 * Dev Redirect API
 *
 * Passes gateway token to dev droplet auth for auto-login, redirects to Dev Studio (5000).
 * No re-login needed - dev auth verifies gateway token and issues its own.
 *
 * Usage: /api/dev-redirect
 */
export async function GET(request: NextRequest) {
  // Get gateway token
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    // No token - send to gateway login
    return NextResponse.redirect('http://134.199.209.140:7000/login');
  }

  // Send to dev auth with token for auto-login, then redirect to Dev Studio (5000)
  const devAuthUrl = `http://161.35.229.220:7000/auto-login?token=${encodeURIComponent(accessToken)}&redirect=5000`;

  return NextResponse.redirect(devAuthUrl);
}
