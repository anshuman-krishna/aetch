import { z } from 'zod';

// auth

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z.string().email('Invalid email address').toLowerCase(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens, and underscores',
    )
    .toLowerCase(),
});

// user profile

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim()
    .optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .toLowerCase()
    .optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').trim().optional(),
  image: z.string().url('Invalid image URL').optional(),
});

// reviews

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  content: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review must be at most 2000 characters')
    .trim()
    .optional(),
  artistId: z.string().cuid('Invalid artist ID').optional(),
  shopId: z.string().cuid('Invalid shop ID').optional(),
});

// bookings

export const bookingRequestSchema = z.object({
  artistId: z.string().cuid('Invalid artist ID'),
  date: z.string().datetime('Invalid date format'),
  duration: z.number().int().positive().max(480).optional(),
  tattooIdea: z.string().min(10, 'Describe your tattoo idea').max(2000).trim(),
  placement: z.string().max(100).trim().optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']).optional(),
  description: z.string().max(2000).trim().optional(),
  reference: z.string().url('Invalid reference URL').optional(),
});

export const bookingSchema = z.object({
  artistId: z.string().cuid('Invalid artist ID'),
  shopId: z.string().cuid('Invalid shop ID').optional(),
  date: z.string().datetime('Invalid date format'),
  duration: z.number().int().positive().max(480).optional(),
  description: z.string().max(2000).trim().optional(),
  reference: z.string().url('Invalid reference URL').optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
  artistNotes: z.string().max(2000).trim().optional(),
  price: z.number().positive().max(100000).optional(),
});

// availability

export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
});

export const availabilityBulkSchema = z.object({
  slots: z.array(availabilitySchema).max(7),
});

// posts

export const createPostSchema = z.object({
  caption: z
    .string()
    .max(2000, 'Caption must be at most 2000 characters')
    .trim()
    .optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  tattooId: z.string().cuid('Invalid tattoo ID').optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// comments

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be at most 1000 characters')
    .trim(),
  postId: z.string().cuid('Invalid post ID'),
  parentId: z.string().cuid('Invalid parent comment ID').optional(),
});

// artist profile

export const updateArtistSchema = z.object({
  displayName: z.string().min(2).max(100).trim().optional(),
  bio: z.string().max(2000).trim().optional(),
  specialties: z.array(z.string()).max(10).optional(),
  hourlyRate: z.number().positive().max(10000).optional(),
  currency: z.string().length(3).optional(),
  location: z.string().max(200).optional(),
  website: z.string().url().optional(),
  instagram: z
    .string()
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, 'Invalid Instagram handle')
    .optional(),
});

// shop

export const createShopSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .toLowerCase(),
  description: z.string().max(2000).trim().optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export const updateShopSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export const shopFilterSchema = z.object({
  city: z.string().max(100).optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['latest', 'popular', 'name']).default('latest'),
});

// tattoo

export const TATTOO_STYLES = [
  'TRADITIONAL',
  'NEO_TRADITIONAL',
  'JAPANESE',
  'BLACKWORK',
  'FINE_LINE',
  'MINIMALIST',
  'REALISM',
  'TRIBAL',
  'BIOMECHANICAL',
  'ABSTRACT',
  'WATERCOLOR',
  'GEOMETRIC',
  'DOTWORK',
  'CHICANO',
  'OTHER',
] as const;

export const BODY_PLACEMENTS = [
  'arm',
  'forearm',
  'upper-arm',
  'leg',
  'thigh',
  'calf',
  'back',
  'chest',
  'neck',
  'hand',
  'foot',
  'shoulder',
  'ribs',
  'hip',
  'wrist',
  'ankle',
  'finger',
  'behind-ear',
  'full-sleeve',
  'half-sleeve',
  'other',
] as const;

export const COLOR_TYPES = ['COLOR', 'BLACK_AND_GREY', 'MIXED'] as const;

export const STYLE_LABELS: Record<string, string> = {
  TRADITIONAL: 'Traditional',
  NEO_TRADITIONAL: 'Neo-Traditional',
  JAPANESE: 'Japanese',
  BLACKWORK: 'Blackwork',
  FINE_LINE: 'Fine Line',
  MINIMALIST: 'Minimalist',
  REALISM: 'Realism',
  TRIBAL: 'Tribal',
  BIOMECHANICAL: 'Biomechanical',
  ABSTRACT: 'Abstract',
  WATERCOLOR: 'Watercolor',
  GEOMETRIC: 'Geometric',
  DOTWORK: 'Dotwork',
  CHICANO: 'Chicano',
  OTHER: 'Other',
};

export const PLACEMENT_LABELS: Record<string, string> = {
  arm: 'Arm',
  forearm: 'Forearm',
  'upper-arm': 'Upper Arm',
  leg: 'Leg',
  thigh: 'Thigh',
  calf: 'Calf',
  back: 'Back',
  chest: 'Chest',
  neck: 'Neck',
  hand: 'Hand',
  foot: 'Foot',
  shoulder: 'Shoulder',
  ribs: 'Ribs',
  hip: 'Hip',
  wrist: 'Wrist',
  ankle: 'Ankle',
  finger: 'Finger',
  'behind-ear': 'Behind Ear',
  'full-sleeve': 'Full Sleeve',
  'half-sleeve': 'Half Sleeve',
  other: 'Other',
};

export const createTattooSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(120, 'Title must be at most 120 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional(),
  styles: z
    .array(z.enum(TATTOO_STYLES))
    .min(1, 'Select at least one style')
    .max(5, 'Maximum 5 styles'),
  bodyPlacement: z.enum(BODY_PLACEMENTS).optional(),
  colorType: z.enum(COLOR_TYPES).default('COLOR'),
});

export const tattooFilterSchema = z.object({
  styles: z.array(z.enum(TATTOO_STYLES)).optional(),
  bodyPlacement: z.enum(BODY_PLACEMENTS).optional(),
  colorType: z.enum(COLOR_TYPES).optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['latest', 'popular', 'trending']).default('latest'),
});

// ai generation

export const AI_COMPLEXITIES = ['simple', 'moderate', 'detailed', 'complex'] as const;

export const aiGenerateSchema = z.object({
  idea: z.string().min(5, 'Describe your idea').max(500).trim(),
  style: z.enum(TATTOO_STYLES).optional(),
  placement: z.enum(BODY_PLACEMENTS).optional(),
  colorType: z.enum(COLOR_TYPES).optional(),
  complexity: z.enum(AI_COMPLEXITIES).default('moderate'),
});

// ar preview

export const savePreviewSchema = z.object({
  bodyImageUrl: z.string().url('Invalid body image URL'),
  tattooImageUrl: z.string().url('Invalid tattoo image URL'),
  previewImageUrl: z.string().url('Invalid preview image URL').optional(),
  placement: z.enum(BODY_PLACEMENTS).optional(),
  positionX: z.number().min(0).max(100).default(50),
  positionY: z.number().min(0).max(100).default(50),
  scale: z.number().min(0.1).max(5).default(1),
  rotation: z.number().min(-360).max(360).default(0),
  opacity: z.number().min(0).max(1).default(0.85),
});

// feed

export const feedFilterSchema = z.object({
  type: z.enum(['following', 'trending', 'latest']).default('latest'),
  tag: z.string().max(50).optional(),
});

// pagination

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// types

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type AvailabilityBulkInput = z.infer<typeof availabilityBulkSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>;
export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type ShopFilterInput = z.infer<typeof shopFilterSchema>;
export type CreateTattooInput = z.infer<typeof createTattooSchema>;
export type TattooFilterInput = z.infer<typeof tattooFilterSchema>;
export type AIGenerateInput = z.infer<typeof aiGenerateSchema>;
export type SavePreviewInput = z.infer<typeof savePreviewSchema>;
export type FeedFilterInput = z.infer<typeof feedFilterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
