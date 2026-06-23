import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback/Toast';
import { bookingService } from '@/shared/services/booking.service';
import type { GetBookingsParams } from '@/shared/types';

type ExportFilters = Omit<GetBookingsParams, 'page' | 'size'>;

type StartExportArgs = {
  filters: ExportFilters;
  includeSummary: boolean;
  includePaymentColumn: boolean;
};

type PendingMeta = {
  filename: string;
  startDate?: string;
  endDate?: string;
  includeSummary: boolean;
  includePaymentColumn: boolean;
};

export function useExportBookings() {
  const { toast } = useToast();
  const [exportId, setExportId] = useState<string | null>(null);
  const [pendingMeta, setPendingMeta] = useState<PendingMeta>({
    filename: '',
    includeSummary: true,
    includePaymentColumn: true,
  });
  const handledRef = useRef<string | null>(null);

  const startMutation = useMutation({
    mutationFn: ({ filters, includeSummary, includePaymentColumn }: StartExportArgs) =>
      bookingService.startExport(filters, includeSummary, includePaymentColumn),
    onSuccess: (data, { filters, includeSummary, includePaymentColumn }) => {
      setExportId(data.exportId);
      setPendingMeta({
        filename: data.filename,
        startDate: filters.startDate,
        endDate: filters.endDate,
        includeSummary,
        includePaymentColumn,
      });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || 'Không thể bắt đầu xuất file', 'error');
    },
  });

  const statusQuery = useQuery({
    queryKey: ['bookingExportStatus', exportId],
    queryFn: () => bookingService.getExportStatus(exportId!),
    enabled: !!exportId,
    refetchInterval: (query) =>
      query.state.data?.status === 'IN_PROGRESS' ? 5000 : false,
  });

  useEffect(() => {
    const data = statusQuery.data;
    if (!data || !exportId || handledRef.current === exportId) return;

    if (data.status === 'COMPLETED' && data.downloadReady) {
      handledRef.current = exportId;
      const filename = data.filename || pendingMeta.filename;
      const capturedExportId = exportId;
      (async () => {
        await bookingService.downloadExport(capturedExportId, filename);
      })();
      toast(`Xuất file thành công`, 'success');
      setExportId(null);
    } else if (data.status === 'FAILED') {
      handledRef.current = exportId;
      toast(data.error || 'Xuất file thất bại', 'error');
      setExportId(null);
    }
  }, [statusQuery.data?.status, exportId]);

  return {
    startExport: (filters: ExportFilters, includeSummary = true, includePaymentColumn = true) =>
      startMutation.mutate({ filters, includeSummary, includePaymentColumn }),
    isExporting: startMutation.isPending || !!exportId,
  };
}
