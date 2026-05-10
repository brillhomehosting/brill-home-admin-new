export const comboConfigKeys = {
  all: ['combo-configs'] as const,
  lists: () => [...comboConfigKeys.all, 'list'] as const,
};
