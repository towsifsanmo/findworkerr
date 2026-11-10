import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { serverErrorResponse } from '@/server/utils/response';

export async function POST(req: NextRequest) {
  try {
    const authRes = await auth.api.signOut({
      asResponse: true,
      headers: req.headers,
    });

    const nextResponse = NextResponse.json(
      {
        success: true,
        message: 'Signed out successfully.',
      },
      { status: 200 }
    );

    // Forward Set-Cookie header (which expires/clears session cookie)
    const setCookie = authRes.headers.get('set-cookie');
    if (setCookie) {
      nextResponse.headers.set('set-cookie', setCookie);
    }

    return nextResponse;
  } catch (err) {
    return serverErrorResponse(err, 'Failed to sign out session.');
  }
}

