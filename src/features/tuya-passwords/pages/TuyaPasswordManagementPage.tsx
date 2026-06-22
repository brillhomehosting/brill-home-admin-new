import { useMemo, useState, type ReactNode } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui';
import { cn, formatDate } from '@/shared/utils';
import type { TuyaPasswordItem, TuyaSyncStatus, TuyaSyncStatusResult } from '@/shared/types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  KeyRound,
  Loader2,
  RefreshCw,
  Trash2,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSyncAllFailedPasswords, useSyncTuyaPassword, useTuyaDevicePasswords, useTuyaPasswordOverview } from '../hooks/useTuyaPasswords';

const LIMIT = 20;
type PasswordTab = 'alreadySet' | 'failed' | 'pendingRemove';

const statusMap: Record<TuyaSyncStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ đồng bộ', className: 'bg-warning-100 text-warning-700' },
  SYNCED: { label: 'Đã đồng bộ', className: 'bg-success-100 text-success-700' },
  FAILED: { label: 'Đồng bộ lỗi', className: 'bg-danger-100 text-danger-700' },
  DELETE_PENDING: { label: 'Chờ xóa', className: 'bg-warning-100 text-warning-700' },
  DELETED: { label: 'Đã xóa', className: 'bg-secondary-100 text-secondary-700' },
  DELETE_FAILED: { label: 'Xóa lỗi', className: 'bg-danger-100 text-danger-700' },
  SKIPPED: { label: 'Bỏ qua (quá khứ)', className: 'bg-secondary-100 text-secondary-700' },
};

export default function TuyaPasswordManagementPage() {
  const { data, isLoading } = useTuyaPasswordOverview(LIMIT);
  const { data: devicePasswords, isLoading: devicePasswordsLoading } = useTuyaDevicePasswords();
  const syncPassword = useSyncTuyaPassword(LIMIT);
  const syncAllFailed = useSyncAllFailedPasswords(LIMIT);
  const [activeTab, setActiveTab] = useState<PasswordTab>('alreadySet');

  return (
    <div className="flex h-full flex-col bg-surface-dim/30">
      <Header
        title="Tuya Passwords"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Tuya Passwords' },
        ]}
        actions={
          <Button
            size="sm"
            variant="danger"
            icon={RefreshCw}
            loading={syncAllFailed.isStarting || syncAllFailed.isPolling}
            disabled={syncAllFailed.isStarting || syncAllFailed.isPolling}
            onClick={() => syncAllFailed.start()}
          >
            {syncAllFailed.isPolling ? 'Đang đồng bộ...' : 'Sync All Failed'}
          </Button>
        }
      />

      <PageWrapper className="flex-1 space-y-6 pt-4 pb-10 px-4 sm:pt-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Đã set password"
            value={data?.counts.alreadySetPasswords ?? 0}
            icon={KeyRound}
            tone="primary"
          />
          <SummaryCard
            title="Đồng bộ lỗi"
            value={data?.counts.failedSyncPasswords ?? 0}
            icon={AlertTriangle}
            tone="danger"
          />
          <SummaryCard
            title="Chờ xóa"
            value={data?.counts.pendingRemovePasswords ?? 0}
            icon={Trash2}
            tone="warning"
          />
        </div>

        {syncAllFailed.isPolling && syncAllFailed.status && (
          <SyncProgressBanner status={syncAllFailed.status} />
        )}

        <DevicePasswordSection
          deviceId={devicePasswords?.deviceId}
          passwords={devicePasswords?.passwords}
          databasePasswords={data?.alreadySetPasswords ?? []}
          loading={devicePasswordsLoading}
        />

        <DatabasePasswordTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alreadySetRows={data?.alreadySetPasswords ?? []}
          failedRows={data?.failedSyncPasswords ?? []}
          pendingRemoveRows={data?.pendingRemovePasswords ?? []}
          counts={data?.counts}
          loading={isLoading}
          syncPassword={syncPassword}
        />
      </PageWrapper>
    </div>
  );
}

function DevicePasswordSection({
  deviceId,
  passwords,
  databasePasswords,
  loading,
}: {
  deviceId?: string;
  passwords: unknown;
  databasePasswords: TuyaPasswordItem[];
  loading: boolean;
}) {
  const byTuyaPasswordId = new Map(
    databasePasswords
      .filter((item) => item.tuyaPasswordId)
      .map((item) => [item.tuyaPasswordId, item]),
  );
  const rows = extractDevicePasswordRows(passwords).map((row) => ({
    ...row,
    booking: row.id ? byTuyaPasswordId.get(row.id) : undefined,
  }));

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-1 border-b border-border bg-surface-dim px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Device Passwords</h2>
          <p className="text-xs text-secondary-400">
            Mật khẩu tạm thời đang được Tuya trả về trực tiếp từ thiết bị{deviceId ? ` ${deviceId}` : ''}.
          </p>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-400">
          {rows.length} items
        </span>
      </div>

      <div className="hidden max-h-[800px] overflow-auto lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-secondary-50/60 text-xs font-semibold uppercase tracking-wider text-secondary-500">
            <tr>
              <th className="px-5 py-3">Tuya Password ID</th>
              <th className="px-5 py-3">Device Password</th>
              <th className="px-5 py-3">Booking</th>
              <th className="px-5 py-3">Effective</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Raw</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <LoadingRow colSpan={6} />
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6} message="Tuya chưa trả về mật khẩu nào trên thiết bị" />
            ) : (
              rows.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-secondary-50/50">
                  <td className="px-5 py-4">
                    <p className="font-mono text-base font-black tracking-wider text-foreground">
                      {row.id || '-'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className={cn(
                      'font-mono text-xl font-black tracking-[0.22em]',
                      row.booking?.gatePassword ? 'text-foreground' : 'text-secondary-300 tracking-normal text-sm font-semibold'
                    )}>
                      {row.booking?.gatePassword || 'Unknown'}
                    </p>
                    {!row.booking?.gatePassword && (
                      <p className="mt-0.5 text-[11px] text-secondary-400">Không tìm thấy trong database</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {row.booking ? (
                      <div className="flex items-center gap-2">
                        <Link to={`/apps/bookings/${row.booking.bookingId}`} className="font-bold text-primary-600 hover:text-primary-700">
                          #{row.booking.bookingCode}
                        </Link>
                        <Link
                          to={`/apps/bookings/${row.booking.bookingId}`}
                          className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-border bg-white px-2 text-[11px] font-medium text-secondary-700 hover:bg-secondary-50"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : (
                      <span className="text-xs text-secondary-400">No booking match</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-secondary-600">
                    <DeviceTimeRange row={row} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-secondary-100 px-2.5 py-0.5 text-[11px] font-bold text-secondary-700">
                      {row.status || row.phase || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <pre className="max-h-24 max-w-[320px] overflow-auto rounded-lg bg-secondary-950 p-2 text-[10px] leading-relaxed text-secondary-50">
                      {JSON.stringify(row.raw, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="max-h-[800px] overflow-y-auto bg-surface-dim/40 p-3 lg:hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-secondary-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải...
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-secondary-400">
            Tuya chưa trả về mật khẩu nào trên thiết bị
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={row.id || index} className="rounded-xl border border-border bg-surface p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Device Password</p>
                    <p className={cn(
                      'mt-0.5 font-mono text-xl font-black tracking-[0.18em]',
                      row.booking?.gatePassword ? 'text-foreground' : 'text-secondary-300 tracking-normal text-sm font-semibold'
                    )}>
                      {row.booking?.gatePassword || 'Unknown'}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-bold text-secondary-700">
                    {row.status || row.phase || '-'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-secondary-50/70 p-2.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-secondary-400">Tuya ID</span>
                    <span className="truncate font-mono font-bold text-secondary-700">{row.id || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-secondary-400">Booking</span>
                    {row.booking ? (
                      <Link to={`/apps/bookings/${row.booking.bookingId}`} className="shrink-0 font-bold text-primary-600">
                        #{row.booking.bookingCode}
                      </Link>
                    ) : (
                      <span className="text-secondary-400">No match</span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <DeviceTimeRange row={row} />
                </div>

                {row.booking ? (
                  <Link
                    to={`/apps/bookings/${row.booking.bookingId}`}
                    className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-white text-xs font-bold text-secondary-700 hover:bg-secondary-50"
                  >
                    Open booking
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DatabasePasswordTabs({
  activeTab,
  onTabChange,
  alreadySetRows,
  failedRows,
  pendingRemoveRows,
  counts,
  loading,
  syncPassword,
}: {
  activeTab: PasswordTab;
  onTabChange: (tab: PasswordTab) => void;
  alreadySetRows: TuyaPasswordItem[];
  failedRows: TuyaPasswordItem[];
  pendingRemoveRows: TuyaPasswordItem[];
  counts?: {
    alreadySetPasswords: number;
    failedSyncPasswords: number;
    pendingRemovePasswords: number;
  };
  loading: boolean;
  syncPassword: ReturnType<typeof useSyncTuyaPassword>;
}) {
  const tabs = useMemo(() => [
    {
      key: 'alreadySet' as const,
      label: 'Already Set Password',
      description: `Danh sách ${LIMIT} mật khẩu mới nhất đã được set trong hệ thống.`,
      count: counts?.alreadySetPasswords ?? alreadySetRows.length,
      rows: alreadySetRows,
      emptyMessage: 'Chưa có mật khẩu nào được set',
    },
    {
      key: 'failed' as const,
      label: 'Failed Sync Password',
      description: 'Mật khẩu tạo thất bại trên Tuya, có thể thử đồng bộ lại.',
      count: counts?.failedSyncPasswords ?? failedRows.length,
      rows: failedRows,
      emptyMessage: 'Không có mật khẩu đồng bộ lỗi',
    },
    {
      key: 'pendingRemove' as const,
      label: 'Pending Remove Password',
      description: 'Booking đã hủy và mật khẩu đang chờ scheduler xóa khỏi Tuya.',
      count: counts?.pendingRemovePasswords ?? pendingRemoveRows.length,
      rows: pendingRemoveRows,
      emptyMessage: 'Không có mật khẩu chờ xóa',
    },
  ], [alreadySetRows, counts, failedRows, pendingRemoveRows]);

  const current = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-surface-dim px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Database Passwords</h2>
            <p className="text-xs text-secondary-400">{current.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={cn(
                    'shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition-colors',
                    activeTab === tab.key
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700',
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-secondary-100 text-secondary-500',
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <DatabasePasswordTable
        rows={current.rows}
        loading={loading}
        emptyMessage={current.emptyMessage}
        action={activeTab === 'failed'
          ? (row) => (
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              loading={syncPassword.isPending && syncPassword.variables === row.bookingId}
              onClick={() => syncPassword.mutate(row.bookingId)}
            >
              Sync password
            </Button>
          )
          : undefined}
      />
    </section>
  );
}

function SyncProgressBanner({ status }: { status: TuyaSyncStatusResult }) {
  const percent = status.total > 0 ? Math.round((status.processed / status.total) * 100) : 0;

  return (
    <div className="mt-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
          <span className="text-sm font-bold text-primary-700">
            Đang đồng bộ... {status.processed}/{status.total} mật khẩu
          </span>
        </div>
        <span className="text-xs font-bold text-primary-600">{percent}%</span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex gap-4 text-xs text-primary-700">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-success-500" />
          <span className="font-bold text-success-600">{status.synced}</span> thành công
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="h-3.5 w-3.5 text-danger-500" />
          <span className="font-bold text-danger-600">{status.failed}</span> thất bại
        </span>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  tone: 'primary' | 'success' | 'danger' | 'warning';
}) {
  const toneClass = {
    primary: 'bg-primary-50 text-primary-600 border-primary-100',
    success: 'bg-success-50 text-success-600 border-success-100',
    danger: 'bg-danger-50 text-danger-600 border-danger-100',
    warning: 'bg-warning-50 text-warning-600 border-warning-100',
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">{title}</p>
        <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
      </div>
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border', toneClass)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function DatabasePasswordTable({
  rows,
  loading,
  emptyMessage,
  action,
}: {
  rows: TuyaPasswordItem[];
  loading: boolean;
  emptyMessage: string;
  action?: (row: TuyaPasswordItem) => ReactNode;
}) {
  return (
    <>
      <div className="hidden max-h-[800px] overflow-auto lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-secondary-50/60 text-xs font-semibold uppercase tracking-wider text-secondary-500">
            <tr>
              <th className="px-5 py-3">Password</th>
              <th className="px-5 py-3">Validity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Linked Booking</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <LoadingRow colSpan={5} />
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={5} message={emptyMessage} />
            ) : (
              rows.map((row) => (
                <tr key={`db-password-${row.bookingId}`} className="hover:bg-secondary-50/50">
                  <td className="px-5 py-4">
                    <p className="font-mono text-2xl font-black tracking-[0.22em] text-foreground">{row.gatePassword || '-'}</p>
                    {row.tuyaPasswordId && (
                      <p className="mt-1 max-w-[220px] truncate text-[11px] text-secondary-400" title={row.tuyaPasswordId}>
                        Tuya ID: {row.tuyaPasswordId}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-secondary-600">
                    <TimeRange row={row} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={row.tuyaSyncStatus} />
                    {row.tuyaSyncError && (
                      <p className="mt-1 max-w-[260px] truncate text-[11px] text-danger-600" title={row.tuyaSyncError}>
                        {row.tuyaSyncError}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/apps/bookings/${row.bookingId}`} className="font-bold text-primary-600 hover:text-primary-700">
                        #{row.bookingCode}
                      </Link>
                      <Link
                        to={`/apps/bookings/${row.bookingId}`}
                        className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-border bg-white px-2 text-[11px] font-medium text-secondary-700 hover:bg-secondary-50"
                      >
                        Open
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {action?.(row)}
                      <Link
                        to={`/apps/bookings/${row.bookingId}`}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-white px-3 text-xs font-medium text-secondary-700 hover:bg-secondary-50"
                      >
                        Booking
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="max-h-[800px] overflow-y-auto bg-surface-dim/40 p-3 lg:hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-secondary-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải...
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-secondary-400">{emptyMessage}</div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={`db-password-mobile-${row.bookingId}`} className="rounded-xl border border-border bg-surface p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Password</p>
                    <p className="mt-0.5 font-mono text-xl font-black tracking-[0.18em] text-foreground">{row.gatePassword || '-'}</p>
                  </div>
                  <StatusBadge status={row.tuyaSyncStatus} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-secondary-50/70 p-2.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-secondary-400">Tuya ID</span>
                    <span className="truncate font-mono font-bold text-secondary-700">{row.tuyaPasswordId || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-secondary-400">Booking</span>
                    <Link to={`/apps/bookings/${row.bookingId}`} className="shrink-0 font-bold text-primary-600">
                      #{row.bookingCode}
                    </Link>
                  </div>
                </div>

                <div className="mt-3">
                  <TimeRange row={row} />
                </div>
                {row.tuyaSyncError && (
                  <p className="mt-2 rounded-lg bg-danger-50 px-2.5 py-2 text-xs text-danger-600">{row.tuyaSyncError}</p>
                )}

                <div className="mt-3 flex flex-col gap-2">
                  {action?.(row)}
                  <Link
                    to={`/apps/bookings/${row.bookingId}`}
                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-white text-xs font-bold text-secondary-700 hover:bg-secondary-50"
                  >
                    Open booking
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: TuyaSyncStatus }) {
  const statusConfig = statusMap[status] || { label: status, className: 'bg-secondary-100 text-secondary-700' };
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold', statusConfig.className)}>
      {statusConfig.label}
    </span>
  );
}

function TimeRange({ row }: { row: TuyaPasswordItem }) {
  const start = formatValidityDate(row.passwordEffectiveAt || row.checkInAt);
  const end = formatValidityDate(row.passwordExpiredAt || row.checkOutAt);
  return <ValidityRange start={start} end={end} />;
}

function ValidityRange({ start, end }: { start?: string; end?: string }) {
  if (!start && !end) {
    return <span className="text-xs text-secondary-400">Không có thời gian hiệu lực</span>;
  }

  return (
    <div className="inline-flex min-w-[180px] items-center gap-2 rounded-lg border border-border bg-secondary-50/70 px-2.5 py-2 text-xs text-secondary-600">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-secondary-400 shadow-sm">
        <Clock className="h-3.5 w-3.5 text-secondary-400" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-foreground">{start || '-'}</span>
          <span className="text-secondary-300">→</span>
          <span className="font-bold text-foreground">{end || '-'}</span>
        </div>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-400">Validity window</p>
      </div>
    </div>
  );
}

type DevicePasswordRow = {
  id?: string;
  name?: string;
  status?: string;
  phase?: string;
  effectiveTime?: string | number;
  invalidTime?: string | number;
  raw: Record<string, unknown>;
  booking?: TuyaPasswordItem;
};

function DeviceTimeRange({ row }: { row: DevicePasswordRow }) {
  const effective = formatDeviceTime(row.effectiveTime);
  const invalid = formatDeviceTime(row.invalidTime);
  return <ValidityRange start={effective} end={invalid} />;
}

function extractDevicePasswordRows(payload: unknown): DevicePasswordRow[] {
  const list = findFirstArray(payload);
  if (!list) {
    return [];
  }

  return list
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      id: readText(item, ['id', 'password_id', 'passwordId', 'temp_password_id']),
      name: readText(item, ['name', 'password_name', 'alias']),
      status: readText(item, ['status', 'password_status']),
      phase: readText(item, ['phase', 'schedule_status']),
      effectiveTime: readValue(item, ['effective_time', 'effectiveTime', 'begin_time', 'start_time']),
      invalidTime: readValue(item, ['invalid_time', 'invalidTime', 'end_time', 'expire_time']),
      raw: item,
    }));
}

function findFirstArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) {
    return value;
  }
  if (!isRecord(value)) {
    return null;
  }

  for (const key of ['list', 'records', 'items', 'data', 'passwords']) {
    const child = value[key];
    if (Array.isArray(child)) {
      return child;
    }
  }

  for (const child of Object.values(value)) {
    const found = findFirstArray(child);
    if (found) {
      return found;
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readText(source: Record<string, unknown>, keys: string[]) {
  const value = readValue(source, keys);
  return value === undefined || value === null || value === '' ? undefined : String(value);
}

function readValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key] as string | number;
    }
  }
  return undefined;
}

function formatDeviceTime(value: string | number | undefined) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const millis = numeric > 10_000_000_000 ? numeric : numeric * 1000;
    return formatDate(new Date(millis).toISOString(), {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  return String(value);
}

function formatValidityDate(value: string | undefined) {
  if (!value) {
    return '';
  }

  return formatDate(value, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-secondary-500">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-500" />
        <p className="mt-2 text-sm font-medium">Đang tải dữ liệu...</p>
      </td>
    </tr>
  );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-sm font-medium text-secondary-500">
        {message}
      </td>
    </tr>
  );
}
