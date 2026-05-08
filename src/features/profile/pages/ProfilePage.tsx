import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useState } from 'react';
import { useToast } from '@/shared/components/feedback/Toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('Mật khẩu mới không khớp', 'error');
      return;
    }
    toast('Đổi mật khẩu thành công (Demo)', 'success');
  };

  return (
    <div className="flex h-full flex-col bg-surface-dim/30">
      <Header title="Hồ sơ cá nhân" />
      <PageWrapper className="flex-1 space-y-6 pt-4 pb-10 px-4 sm:pt-6 sm:px-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl border border-border">
          <h2 className="text-lg font-bold mb-4">Đổi mật khẩu</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Mật khẩu cũ</label>
              <Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mật khẩu mới</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Xác nhận mật khẩu mới</label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Cập nhật mật khẩu</Button>
          </form>
        </div>
      </PageWrapper>
    </div>
  );
}
