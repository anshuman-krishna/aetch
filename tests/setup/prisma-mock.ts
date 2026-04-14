// minimal prisma mock helper for service-layer tests
export function mockPrisma<T extends Record<string, Record<string, unknown>>>(models: T) {
  const built: Record<string, Record<string, jest.Mock>> = {};
  for (const model of Object.keys(models)) {
    built[model] = {};
    for (const method of Object.keys(models[model])) {
      built[model][method] = jest.fn().mockResolvedValue(models[model][method]);
    }
  }
  return built;
}
