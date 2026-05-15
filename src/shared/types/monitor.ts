export type MonitorApplication = {
  status: string;
  applicationName: string;
  javaVersion: string;
  activeProfiles: string;
  processId: string;
  startedAt: string;
  uptimeMillis: number;
};

export type MonitorJvm = {
  heapUsedBytes: number;
  heapCommittedBytes: number;
  heapMaxBytes: number;
  nonHeapUsedBytes: number;
  threadCount: number;
  daemonThreadCount: number;
  totalStartedThreadCount: number;
  gcCollectionCount: number;
  gcCollectionTimeMillis: number;
};

export type MonitorSystem = {
  availableProcessors: number;
  processCpuLoad?: number | null;
  systemCpuLoad?: number | null;
  totalPhysicalMemoryBytes?: number | null;
  freePhysicalMemoryBytes?: number | null;
  diskTotalBytes: number;
  diskFreeBytes: number;
  diskUsableBytes: number;
};

export type MonitorDatabase = {
  status: string;
  error?: string | null;
  activeConnections?: number | null;
  idleConnections?: number | null;
  totalConnections?: number | null;
  threadsAwaitingConnection?: number | null;
  maximumPoolSize?: number | null;
  minimumIdle?: number | null;
};

export type MonitorCache = {
  objectCount: number;
  counterCount: number;
  lockCount: number;
  total: number;
};

export type MonitorExecutor = {
  name: string;
  activeCount: number;
  poolSize: number;
  corePoolSize: number;
  maxPoolSize: number;
  queueSize: number;
  completedTaskCount: number;
};

export type MonitorOverview = {
  generatedAt: string;
  application: MonitorApplication;
  jvm: MonitorJvm;
  system: MonitorSystem;
  database: MonitorDatabase;
  cache: MonitorCache;
  executors: MonitorExecutor[];
};
