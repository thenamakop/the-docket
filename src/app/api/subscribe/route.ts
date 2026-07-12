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

    // TODO: replace with <provider> API call once one is chosen.
    // For now we log the address and return success so the UI can be tested.
    console.log('[subscribe] new subscriber:', email);

    return NextResponse.json({ success: true, email });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to process subscription.' },
      { status: 500 }
    );
  }
}
