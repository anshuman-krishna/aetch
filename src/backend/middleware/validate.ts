import { type NextRequest, NextResponse } from 'next/server';
import { type ZodSchema } from 'zod';

export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      const zodError = err as { issues: Array<{ path: (string | number)[]; message: string }> };
      return {
        data: null,
        error: NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: zodError.issues.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 },
        ),
      };
    }
    return {
      data: null,
      error: NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 },
      ),
    };
  }
}
