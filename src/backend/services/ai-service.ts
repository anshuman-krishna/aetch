import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { buildTattooPrompt } from '@/utils/ai-prompt-builder';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { isFeatureEnabled } from '@/lib/feature-flags';

// openai client (lazy)
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  _openai = new OpenAI({ apiKey });
  return _openai;
}

interface GenerateInput {
  userId: string;
  idea: string;
  style?: string;
  placement?: string;
  colorType?: string;
  complexity?: string;
}

// generate tattoo design via openai
export async function generateTattooDesign(input: GenerateInput) {
  if (!isFeatureEnabled('AI_GENERATION_ENABLED')) {
    throw new Error('AI generation is disabled');
  }

  // check daily limit
  const allowed = await checkDailyLimit(input.userId);
  if (!allowed) {
    throw new Error('Daily generation limit reached');
  }

  const prompt = buildTattooPrompt(input);
  const model = process.env.AI_IMAGE_MODEL ?? 'dall-e-3';

  // create pending record
  const generation = await prisma.aIGeneration.create({
    data: {
      userId: input.userId,
      prompt,
      style: input.style,
      placement: input.placement,
      colorType: input.colorType,
      status: 'PENDING',
    },
  });

  try {
    const openai = getOpenAI();
    const response = await openai.images.generate({
      model,
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error('No image generated');

    // update with result
    const updated = await prisma.aIGeneration.update({
      where: { id: generation.id },
      data: { imageUrl, status: 'COMPLETED' },
    });

    return updated;
  } catch (err) {
    // mark as failed
    await prisma.aIGeneration.update({
      where: { id: generation.id },
      data: { status: 'FAILED' },
    });
    throw err;
  }
}

// check daily generation limit
async function checkDailyLimit(userId: string): Promise<boolean> {
  const maxPerHour = Number(process.env.AI_MAX_REQUESTS_PER_HOUR ?? 10);
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const count = await prisma.aIGeneration.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  });

  return count < maxPerHour;
}

// get user generation history
export async function getUserGenerations(userId: string, pagination: PaginationParams) {
  const where = { userId };
  const [generations, total] = await Promise.all([
    prisma.aIGeneration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.aIGeneration.count({ where }),
  ]);

  return {
    generations,
    pagination: buildPaginationMeta(total, pagination),
  };
}

// get single generation
export async function getGenerationById(id: string) {
  return prisma.aIGeneration.findUnique({ where: { id } });
}
