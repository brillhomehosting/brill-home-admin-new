import { Header, PageWrapper } from '@/shared/components/layout';

export default function SystemConfigPage() {
  return (
    <div className="flex h-full flex-col bg-surface-dim/30">
      <Header title="System Config" />
      <PageWrapper className="flex-1 space-y-6 pt-4 pb-10 px-4 sm:pt-6 sm:px-6">
        <div className="bg-white p-6 rounded-xl border border-border">
          <p className="text-secondary-500">Giao diện quản lý System Config đang được xây dựng (Cần thống nhất API).</p>
        </div>
      </PageWrapper>
    </div>
  );
}
