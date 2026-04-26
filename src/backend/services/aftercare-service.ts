import OpenAI from 'openai';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { buildAftercareSystemPrompt } from '@/utils/ai-prompt-builder';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  _openai = new OpenAI({ apiKey });
  return _openai;
}

interface AftercareInput {
  question: string;
  daysSinceTattoo?: number;
  bookingId?: string;
}

export interface AftercareReply {
  answer: string;
  disclaimer: string;
}

const STANDARD_DISCLAIMER =
  'Not medical advice. See a doctor for fever, spreading redness, pus, or red streaks.';

// chat completion scoped to aftercare guidance — short answers only
export async function askAftercare(input: AftercareInput): Promise<AftercareReply> {
  if (!isFeatureEnabled('AFTERCARE_AI_ENABLED')) {
    throw new Error('Aftercare AI is disabled');
  }

  const openai = getOpenAI();
  const userPrompt = input.daysSinceTattoo !== undefined
    ? `Day ${input.daysSinceTattoo} of healing. ${input.question}`
    : input.question;

  const completion = await openai.chat.completions.create({
    model: process.env.AFTERCARE_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: buildAftercareSystemPrompt() },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 400,
  });

  const answer = completion.choices[0]?.message?.content?.trim() ?? 'No response';
  return { answer, disclaimer: STANDARD_DISCLAIMER };
}
