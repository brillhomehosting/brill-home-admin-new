export const systemConfigKeys = {
  all: ['system-configs'] as const,
  lists: () => [...systemConfigKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...systemConfigKeys.lists(), filters] as const,
};
