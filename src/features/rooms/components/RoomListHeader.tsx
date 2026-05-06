import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Header } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants';

// ================================================================
// RoomListHeader — breadcrumb + title + action button
// ================================================================

export function RoomListHeader() {
  const navigate = useNavigate();

  return (
    <Header
      title="Danh sách phòng"
      breadcrumbs={[
        { label: 'Dashboard', path: ROUTES.HOME },
        { label: 'Phòng' },
      ]}
      actions={
        <Button
          onClick={() => navigate(ROUTES.ROOM_ADD)}
          icon={Plus}
          className="bg-accent-400 hover:bg-accent-500"
        >
          Thêm phòng mới
        </Button>
      }
    />
  );
}
