import type { UserRole, TattooStyle, ColorType, BookingStatus } from '@prisma/client';

export type { UserRole, TattooStyle, ColorType, BookingStatus };

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
