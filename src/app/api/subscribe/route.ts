import { NextResponse } from 'next/server';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
});

export async function POST(request: Request) {
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

    const bdRes = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email }),
    });

    if (!bdRes.ok) {
      // Log full body server-side for debugging, never surface it to the client.
      const errText = await bdRes.text();
      console.error(
        `[subscribe] Buttondown error ${bdRes.status} for ${email}:`,
        errText
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
    }

    // 2xx — new subscriber or already-subscribed (Buttondown returns 201 either way).
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to process subscription.' },
      { status: 500 }
    );
  }
}
