import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Input } from '@/shared/components/ui/Input';
import { getCaches, getCacheStats, clearAllCaches, deleteCacheEntry, createCacheEntry, updateCacheEntry } from '@/shared/services/cache.service';
import type { CacheEntry } from '@/shared/services/cache.service';
import { Loader2, Trash2, Edit, Plus, RefreshCw, Database } from 'lucide-react';
import { useToast } from '@/shared/components/feedback/Toast';

export default function CacheManagerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pattern, setPattern] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CacheEntry | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['cache', 'stats'],
    queryFn: getCacheStats,
  });

  const { data: cachesData, isLoading: cachesLoading, refetch: refetchCaches } = useQuery({
    queryKey: ['cache', 'list', pattern],
    queryFn: () => getCaches({ size: 50, pattern: pattern || undefined }),
  });

  const clearMutation = useMutation({
    mutationFn: (p?: string) => clearAllCaches(p),
    onSuccess: () => {
      toast('Xóa cache thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['cache'] });
      setIsClearModalOpen(false);
    },
    onError: () => toast('Xóa cache thất bại', 'error'),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: deleteCacheEntry,
    onSuccess: () => {
      toast('Xóa entry thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['cache'] });
    },
    onError: () => toast('Xóa entry thất bại', 'error'),
  });

  const handleRefresh = () => {
    refetchStats();
    refetchCaches();
  };

  return (
    <div className="flex h-full flex-col bg-surface-dim/30">
      <Header title="Quản lý Cache" />

      <PageWrapper className="flex-1 space-y-6 pt-4 pb-10 px-4 sm:pt-6 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Tổng số đối tượng" value={statsLoading ? '...' : stats?.total} />
          <StatCard title="Object Cache" value={statsLoading ? '...' : stats?.objectCount} />
          <StatCard title="Counter Cache" value={statsLoading ? '...' : stats?.counterCount} />
          <StatCard title="Lock Cache" value={statsLoading ? '...' : stats?.lockCount} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Lọc theo pattern (vd: auth:*)..."
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="max-w-md"
            />
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setEditingEntry(null); setIsEntryModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Cache
            </Button>
            <Button variant="danger" onClick={() => setIsClearModalOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa nhiều Cache
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          {cachesLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
          ) : cachesData?.content?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-secondary-500">
                <thead className="bg-secondary-50 text-xs uppercase text-secondary-700">
                  <tr>
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">TTL (s)</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cachesData.content.map((entry: CacheEntry) => (
                    <tr key={entry.key} className="hover:bg-secondary-50">
                      <td className="px-4 py-3 font-medium text-foreground">{entry.key}</td>
                      <td className="px-4 py-3">{entry.type}</td>
                      <td className="px-4 py-3">
                        {entry.remainingTtlSeconds > 0 ? entry.remainingTtlSeconds : 'Vĩnh viễn'}
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingEntry(entry); setIsEntryModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-danger-500" onClick={() => {
                          if (confirm('Chắc chắn xóa cache này?')) {
                            deleteEntryMutation.mutate(entry.key);
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-secondary-500">Không tìm thấy cache nào.</div>
          )}
        </div>
      </PageWrapper>

      <ClearCacheModal 
        open={isClearModalOpen} 
        onClose={() => setIsClearModalOpen(false)} 
        onConfirm={(p) => clearMutation.mutate(p)}
        isLoading={clearMutation.isPending}
      />

      <EntryCacheModal
        open={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        entry={editingEntry}
      />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-border p-4 rounded-xl flex items-center gap-4">
      <div className="p-3 bg-primary-50 rounded-lg text-primary-500">
        <Database className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-secondary-500 font-medium uppercase">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ClearCacheModal({ open, onClose, onConfirm, isLoading }: { open: boolean, onClose: () => void, onConfirm: (pattern: string) => void, isLoading: boolean }) {
  const [pattern, setPattern] = useState('');
  
  return (
    <Modal open={open} onClose={onClose} title="Xóa nhiều Cache">
      <div className="space-y-4">
        <p className="text-sm text-secondary-500">Nhập pattern để xóa (để trống sẽ xóa toàn bộ cache).</p>
        <Input 
          placeholder="Ví dụ: room:*" 
          value={pattern} 
          onChange={(e) => setPattern(e.target.value)} 
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button variant="danger" onClick={() => onConfirm(pattern)} loading={isLoading}>Xác nhận xóa</Button>
        </div>
      </div>
    </Modal>
  );
}

function EntryCacheModal({ open, onClose, entry }: { open: boolean, onClose: () => void, entry: CacheEntry | null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [ttl, setTtl] = useState(0);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (entry) {
        return updateCacheEntry(entry.key, { value: JSON.parse(payload.value), ttlSeconds: payload.ttl });
      }
      return createCacheEntry({ fullKey: payload.key, value: JSON.parse(payload.value), ttlSeconds: payload.ttl });
    },
    onSuccess: () => {
      toast(entry ? 'Cập nhật thành công' : 'Thêm mới thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['cache'] });
      onClose();
    },
    onError: () => toast('Có lỗi xảy ra, kiểm tra lại JSON', 'error'),
  });

  return (
    <Modal open={open} onClose={() => {
      setKey('');
      setValue('');
      setTtl(0);
      onClose();
    }} title={entry ? 'Cập nhật Cache' : 'Thêm Cache'}>
      <div className="space-y-4">
        {!entry && (
          <div>
            <label className="text-sm font-medium mb-1 block">Key</label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} />
          </div>
        )}
        <div>
          <label className="text-sm font-medium mb-1 block">Value (JSON)</label>
          <Textarea rows={6} value={value} onChange={(e) => setValue(e.target.value)} placeholder='{"prop": "value"}' />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">TTL Seconds (0 = Vĩnh viễn)</label>
          <Input type="number" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Hủy</Button>
          <Button variant="primary" onClick={() => mutation.mutate({ key, value, ttl })} loading={mutation.isPending}>Lưu Cache</Button>
        </div>
      </div>
    </Modal>
  );
}
