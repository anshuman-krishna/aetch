import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { createPost, getLatestPosts, getFollowingFeed, getTrendingPosts } from '@/backend/services/post-service';
import { createPostSchema, feedFilterSchema, paginationSchema } from '@/lib/validations';
import { getPaginationParams } from '@/utils/pagination';
import { rateLimit } from '@/backend/middleware/rate-limit';

export async function GET(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { searchParams } = new URL(req.url);

  const pageParsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const page = pageParsed.success ? pageParsed.data.page : 1;
  const limit = pageParsed.success ? pageParsed.data.limit : 20;

  const filterParsed = feedFilterSchema.safeParse({
    type: searchParams.get('type') || undefined,
    tag: searchParams.get('tag') || undefined,
  });
  const feedType = filterParsed.success ? filterParsed.data.type : 'latest';
  const pagination = getPaginationParams(page, limit);

  let result;
  switch (feedType) {
    case 'following':
      result = await getFollowingFeed(session!.user.id, pagination);
      break;
    case 'trending':
      result = await getTrendingPosts(pagination);
      break;
    default:
      result = await getLatestPosts(pagination);
  }

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const rl = await rateLimit(session!.user.id, 'api');
  if (!rl.success) return rl.error;

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const post = await createPost({
    authorId: session!.user.id,
    ...parsed.data,
  });

  return NextResponse.json({ post }, { status: 201 });
}
