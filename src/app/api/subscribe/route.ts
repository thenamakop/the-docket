import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Pass the visitor's real IP to Buttondown so their firewall evaluates
    // the subscriber's IP rather than Vercel's shared outbound IP.
    // Vercel sets x-forwarded-for; fall back to x-real-ip, then omit.
    const visitorIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      undefined;

    const bdRes = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        // type: regular bypasses double opt-in — subscriber is confirmed immediately.
        type: 'regular',
        ...(visitorIp ? { ip_address: visitorIp } : {}),
      }),
    });

    if (bdRes.ok) {
      // 201 — subscriber created and confirmed immediately (no confirmation email).
      return NextResponse.json({ success: true });
    }

    // Non-2xx: inspect the error code before deciding what to return.
    const errBody = (await bdRes.json().catch(() => ({}))) as {
      code?: string;
    };

    // Duplicate submission — already subscribed, treat as success.
    if (errBody.code === 'email_already_exists') {
      return NextResponse.json({ success: true });
    }

    // Log the full body server-side; never surface it to the client.
    console.error(
      `[subscribe] Buttondown error ${bdRes.status} (${errBody.code ?? 'unknown'}) for ${email}:`,
      errBody
    );

    if (bdRes.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests — please try again in a little while.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to subscribe right now. Please try again shortly.',
      },
      { status: 502 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to process subscription.' },
      { status: 500 }
    );
  }
}
