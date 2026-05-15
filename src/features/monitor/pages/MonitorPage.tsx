import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Clock,
  Cpu,
  Database,
  HardDrive,
  Loader2,
  MemoryStick,
  RefreshCw,
  Server,
  ShieldCheck,
  TerminalSquare,
  Timer,
} from 'lucide-react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { getMonitorOverview } from '@/shared/services/monitor.service';
import type { MonitorExecutor, MonitorOverview } from '@/shared/types';
import { cn, formatDate } from '@/shared/utils';

const REFRESH_INTERVAL_MS = 15_000;

export default function MonitorPage() {
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['monitor', 'overview'],
    queryFn: getMonitorOverview,
    refetchInterval: REFRESH_INTERVAL_MS,
  });

  return (
    <div className="flex h-full flex-col bg-surface-dim/30">
      <Header
        title="System Monitor"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Developer' },
          { label: 'System Monitor' },
        ]}
        actions={
          <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching && !isLoading}>
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        }
      />

      <PageWrapper className="flex-1 space-y-6 px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-secondary-500">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <p className="text-sm font-medium">Đang tải monitor...</p>
            </div>
          </div>
        ) : error || !data ? (
          <div className="rounded-xl border border-danger-100 bg-danger-50 p-6 text-sm font-medium text-danger-700">
            Không thể tải dữ liệu monitor. Vui lòng thử lại sau.
          </div>
        ) : (
          <MonitorContent data={data} />
        )}
      </PageWrapper>
    </div>
  );
}

function MonitorContent({ data }: { data: MonitorOverview }) {
  const heapPercent = percent(data.jvm.heapUsedBytes, data.jvm.heapMaxBytes);
  const memoryUsed = data.system.totalPhysicalMemoryBytes && data.system.freePhysicalMemoryBytes
    ? data.system.totalPhysicalMemoryBytes - data.system.freePhysicalMemoryBytes
    : null;
  const memoryPercent = memoryUsed && data.system.totalPhysicalMemoryBytes
    ? percent(memoryUsed, data.system.totalPhysicalMemoryBytes)
    : null;
  const diskUsed = data.system.diskTotalBytes - data.system.diskFreeBytes;
  const diskPercent = percent(diskUsed, data.system.diskTotalBytes);
  const dbPoolPercent = data.database.totalConnections && data.database.maximumPoolSize
    ? percent(data.database.totalConnections, data.database.maximumPoolSize)
    : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatusCard
          title="Application"
          value={data.application.status}
          detail={data.application.applicationName}
          icon={ShieldCheck}
          tone={data.application.status === 'UP' ? 'success' : 'danger'}
        />
        <StatusCard
          title="Database"
          value={data.database.status}
          detail={data.database.error || 'Connection healthy'}
          icon={Database}
          tone={data.database.status === 'UP' ? 'success' : 'danger'}
        />
        <MetricCard title="CPU" value={formatPercent(data.system.systemCpuLoad)} detail="System load" icon={Cpu} />
        <MetricCard title="Heap" value={formatPercentValue(heapPercent)} detail={formatBytes(data.jvm.heapUsedBytes)} icon={MemoryStick} />
        <MetricCard title="Disk" value={formatPercentValue(diskPercent)} detail={formatBytes(diskUsed)} icon={HardDrive} />
        <MetricCard title="Uptime" value={formatDuration(data.application.uptimeMillis)} detail={`PID ${data.application.processId}`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Application" icon={Server}>
          <InfoGrid
            items={[
              ['App name', data.application.applicationName],
              ['Java', data.application.javaVersion],
              ['Profiles', data.application.activeProfiles],
              ['Started', formatDate(data.application.startedAt, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false })],
              ['Last sample', formatDate(data.generatedAt, { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false })],
            ]}
          />
        </Panel>

        <Panel title="JVM & Threads" icon={TerminalSquare}>
          <div className="space-y-4">
            <Meter label="Heap used" value={heapPercent} detail={`${formatBytes(data.jvm.heapUsedBytes)} / ${formatBytes(data.jvm.heapMaxBytes)}`} />
            <InfoGrid
              items={[
                ['Heap committed', formatBytes(data.jvm.heapCommittedBytes)],
                ['Non-heap used', formatBytes(data.jvm.nonHeapUsedBytes)],
                ['Threads', data.jvm.threadCount],
                ['Daemon threads', data.jvm.daemonThreadCount],
                ['Started threads', data.jvm.totalStartedThreadCount],
                ['GC collections', data.jvm.gcCollectionCount],
                ['GC time', `${data.jvm.gcCollectionTimeMillis} ms`],
              ]}
            />
          </div>
        </Panel>

        <Panel title="System" icon={Activity}>
          <div className="space-y-4">
            <Meter label="Physical memory" value={memoryPercent} detail={memoryUsed ? `${formatBytes(memoryUsed)} / ${formatBytes(data.system.totalPhysicalMemoryBytes)}` : '—'} />
            <Meter label="Disk used" value={diskPercent} detail={`${formatBytes(diskUsed)} / ${formatBytes(data.system.diskTotalBytes)}`} />
            <InfoGrid
              items={[
                ['Processors', data.system.availableProcessors],
                ['Process CPU', formatPercent(data.system.processCpuLoad)],
                ['System CPU', formatPercent(data.system.systemCpuLoad)],
                ['Disk usable', formatBytes(data.system.diskUsableBytes)],
              ]}
            />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Database Pool" icon={Database}>
          <div className="space-y-4">
            <Meter
              label="Pool usage"
              value={dbPoolPercent}
              detail={`${displayNumber(data.database.totalConnections)} / ${displayNumber(data.database.maximumPoolSize)} connections`}
            />
            <InfoGrid
              items={[
                ['Active', displayNumber(data.database.activeConnections)],
                ['Idle', displayNumber(data.database.idleConnections)],
                ['Waiting', displayNumber(data.database.threadsAwaitingConnection)],
                ['Minimum idle', displayNumber(data.database.minimumIdle)],
              ]}
            />
          </div>
        </Panel>

        <Panel title="Cache" icon={HardDrive}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SmallStat label="Total" value={data.cache.total} />
            <SmallStat label="Object" value={data.cache.objectCount} />
            <SmallStat label="Counter" value={data.cache.counterCount} />
            <SmallStat label="Lock" value={data.cache.lockCount} />
          </div>
        </Panel>
      </div>

      <Panel title="Background Workers" icon={Timer}>
        {data.executors.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface-dim p-4 text-sm text-secondary-500">
            Không có executor metrics.
          </div>
        ) : (
          <ExecutorTable executors={data.executors} />
        )}
      </Panel>
    </>
  );
}

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

function StatusCard({ title, value, detail, icon: Icon, tone }: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  tone: Tone;
}) {
  const toneClasses: Record<Tone, string> = {
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
    neutral: 'bg-secondary-100 text-secondary-600',
  };
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn('rounded-lg p-2.5', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-secondary-400">{title}</p>
          <p className="text-lg font-black text-foreground">{value || '—'}</p>
          <p className="truncate text-xs text-secondary-500">{detail || '—'}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, detail, icon: Icon }: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary-50 p-2.5 text-primary-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-secondary-400">{title}</p>
          <p className="text-lg font-black text-foreground">{value}</p>
          <p className="truncate text-xs text-secondary-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-surface-dim px-5 py-4 text-sm font-bold text-secondary-700">
        <Icon className="h-5 w-5 text-accent-500" />
        {title}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoGrid({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border bg-surface-dim px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">{label}</p>
          <p className="mt-0.5 break-words text-sm font-semibold text-foreground">{value ?? '—'}</p>
        </div>
      ))}
    </div>
  );
}

function Meter({ label, value, detail }: { label: string; value?: number | null; detail: string }) {
  const safeValue = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="font-bold text-secondary-600">{label}</span>
        <span className="font-medium text-secondary-500">{detail}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary-100">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            safeValue > 85 ? 'bg-danger-500' : safeValue > 70 ? 'bg-warning-500' : 'bg-accent-500',
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-dim p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}

function ExecutorTable({ executors }: { executors: MonitorExecutor[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-dim text-[10px] font-bold uppercase tracking-wider text-secondary-500">
          <tr>
            <th className="px-4 py-3">Executor</th>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3">Pool</th>
            <th className="px-4 py-3">Queue</th>
            <th className="px-4 py-3">Completed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {executors.map((executor) => (
            <tr key={executor.name} className="hover:bg-secondary-50/60">
              <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{executor.name}</td>
              <td className="px-4 py-3 text-secondary-700">{executor.activeCount}</td>
              <td className="px-4 py-3 text-secondary-700">
                {executor.poolSize} / {executor.maxPoolSize}
              </td>
              <td className="px-4 py-3 text-secondary-700">{executor.queueSize}</td>
              <td className="px-4 py-3 text-secondary-700">{executor.completedTaskCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function percent(value?: number | null, total?: number | null) {
  if (!value || !total || total <= 0) return null;
  return (value / total) * 100;
}

function formatPercent(value?: number | null) {
  if (value == null) return '—';
  return `${Math.round(value * 100)}%`;
}

function formatPercentValue(value?: number | null) {
  if (value == null) return '—';
  return `${Math.round(value)}%`;
}

function formatBytes(value?: number | null) {
  if (value == null || value < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size >= 10 || index === 0 ? Math.round(size) : size.toFixed(1)} ${units[index]}`;
}

function formatDuration(milliseconds: number) {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function displayNumber(value?: number | null) {
  return value == null ? '—' : value;
}
