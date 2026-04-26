import { prisma } from '@/lib/prisma';
import type { AdminAuditAction, Prisma } from '@prisma/client';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';

interface RecordInput {
  actorId: string;
  action: AdminAuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

// extract client ip + ua from request
export function clientContext(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? undefined;
  const userAgent = req.headers.get('user-agent') ?? undefined;
  return { ipAddress, userAgent };
}

// persist a single admin action
export async function recordAuditEvent(input: RecordInput) {
  return prisma.adminAuditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}

interface AuditFilters {
  actorId?: string;
  action?: AdminAuditAction;
  targetId?: string;
}

// list audit events for dashboard
export async function listAuditEvents(filters: AuditFilters, pagination: PaginationParams) {
  const where: Prisma.AdminAuditLogWhereInput = {
    ...(filters.actorId ? { actorId: filters.actorId } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.targetId ? { targetId: filters.targetId } : {}),
  };

  const [events, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return { events, pagination: buildPaginationMeta(total, pagination) };
}
