import { GlassButton } from '@/components/ui/glass-button';
import Link from 'next/link';
import type { PaginationMeta } from '@/utils/pagination';

interface PaginationProps {
  pagination: PaginationMeta;
  basePath: string;
  paramName?: string;
}

export function Pagination({ pagination, basePath, paramName = 'page' }: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  const separator = basePath.includes('?') ? '&' : '?';
  const href = (page: number) => `${basePath}${separator}${paramName}=${page}`;

  return (
    <div className="flex justify-center gap-2 mt-8">
      {pagination.hasPrev && (
        <Link href={href(pagination.page - 1)}>
          <GlassButton variant="default" size="sm">Previous</GlassButton>
        </Link>
      )}
      <span className="flex items-center px-3 text-sm text-muted">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      {pagination.hasNext && (
        <Link href={href(pagination.page + 1)}>
          <GlassButton variant="default" size="sm">Next</GlassButton>
        </Link>
      )}
    </div>
  );
}
