import { buildPaginationMeta, getPaginationParams } from '@/utils/pagination';

describe('getPaginationParams', () => {
  it('defaults to page 1 limit 20', () => {
    expect(getPaginationParams()).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('clamps page to minimum 1', () => {
    expect(getPaginationParams(-4, 10)).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it('clamps limit between 1 and 100', () => {
    expect(getPaginationParams(1, 0)).toEqual({ page: 1, limit: 1, skip: 0 });
    expect(getPaginationParams(1, 500)).toEqual({ page: 1, limit: 100, skip: 0 });
  });

  it('computes skip from page and limit', () => {
    expect(getPaginationParams(4, 25)).toEqual({ page: 4, limit: 25, skip: 75 });
  });

  it('floors fractional inputs', () => {
    expect(getPaginationParams(2.9, 15.7)).toEqual({ page: 2, limit: 15, skip: 15 });
  });
});

describe('buildPaginationMeta', () => {
  const params = { page: 2, limit: 10, skip: 10 };

  it('computes totalPages and navigation flags', () => {
    expect(buildPaginationMeta(45, params)).toEqual({
      page: 2,
      limit: 10,
      total: 45,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('marks last page with no next', () => {
    expect(buildPaginationMeta(20, { page: 2, limit: 10, skip: 10 })).toMatchObject({
      hasNext: false,
      hasPrev: true,
    });
  });

  it('handles empty result', () => {
    expect(buildPaginationMeta(0, { page: 1, limit: 10, skip: 0 })).toMatchObject({
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });
});
