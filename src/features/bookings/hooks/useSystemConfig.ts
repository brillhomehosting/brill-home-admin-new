import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/services/api';

type SystemConfigResponse = {
  success: boolean;
  data: {
    id: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    configKey: string;
    configValue: string;
    description: string;
    isSystemDefined: boolean;
    isPublic: boolean;
  };
  message: string;
};

export function useSystemConfig(configKey: string) {
  return useQuery({
    queryKey: ['system-config', configKey],
    queryFn: async () => {
      try {
        const response = await api.get<SystemConfigResponse>(`/system-configs/key/${configKey}`);
        return response.data;
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
