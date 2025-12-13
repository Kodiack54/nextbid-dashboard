import { NextRequest, NextResponse } from 'next/server';

/**
 * Engine Redirect API
 *
 * Redirects to engine server directly.
 * The engine has its own auth service on port 7000 and will
 * redirect to login if the user isn't authenticated on that droplet.
 *
 * Usage: /api/engine-redirect?port=31006
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const port = searchParams.get('port');

  if (!port) {
    return NextResponse.json({ error: 'Port is required' }, { status: 400 });
  }

  // Redirect directly to engine - it has its own auth on port 7000
  // If user isn't authenticated there, engine will redirect to its login
  const engineUrl = `http://64.23.151.201:${port}/`;

  return NextResponse.redirect(engineUrl);
}
