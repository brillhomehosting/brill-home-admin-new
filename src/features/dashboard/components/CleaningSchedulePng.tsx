import type { CleaningScheduleItem } from '@/shared/types';

function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function isRedRow(item: CleaningScheduleItem): boolean {
  return !!item.isConsecutive && !item.isLastConsecutiveSlot;
}

function rowBg(item: CleaningScheduleItem): string {
  if (isRedRow(item)) return '#fee2e2';
  if (item.isOvernight) return '#fefce8';
  return '#ffffff';
}

export function CleaningSchedulePng({ items, date }: { items: CleaningScheduleItem[]; date: string }) {
  // Group by date, preserve insertion order
  const groups: Record<string, CleaningScheduleItem[]> = {};
  for (const item of items) {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  }
  const sortedDates = Object.keys(groups).sort();

  const thStyle: React.CSSProperties = {
    padding: '0px 3px',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 10,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#ffffff',
    background: '#1e3a5f',
    border: '2px solid #1e3a5f',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '0px 3px',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
    border: '1px solid #d1d5db',
    whiteSpace: 'nowrap',
  };

  const greenBadge: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#16a34a',
    color: '#ffffff',
    borderRadius: 6,
    padding: '1px 5px',
    fontWeight: 800,
    fontSize: 10,
    whiteSpace: 'nowrap',
  };

  const redBadge: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#dc2626',
    color: '#ffffff',
    borderRadius: 6,
    padding: '1px 5px',
    fontWeight: 800,
    fontSize: 10,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ background: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '4px 14px 8px', width: 600 }}>

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{ fontSize: 15, fontWeight: 900, color: '#111827', letterSpacing: '-0.01em' }}>
          LỊCH DỌN PHÒNG
        </span>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: '#eff6ff', border: '1.5px solid #bfdbfe',
          borderRadius: 5, padding: '1px 6px',
          fontSize: 10, fontWeight: 700, color: '#1d4ed8',
        }}>
          <span>📅</span>
          <span>{formatDisplayDate(date)}</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={greenBadge}>✓ CẦN DỌN</span>
          <span style={{ fontSize: 10, color: '#6b7280' }}>Phòng cần dọn (khách trả)</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={redBadge}>✗ KHÔNG CẦN DỌN (KHUNG ĐÔI)</span>
          <span style={{ fontSize: 10, color: '#6b7280' }}>Phòng khách ở tiếp</span>
        </span>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '2px solid #1e3a5f' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 16, width: '32%' }}>Ngày</th>
            <th style={{ ...thStyle, width: '14%' }}>Bắt đầu</th>
            <th style={{ ...thStyle, width: '14%' }}>Kết thúc</th>
            <th style={{ ...thStyle, width: '16%' }}>Phòng</th>
            <th style={{ ...thStyle, width: '24%' }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((groupDate) => (
            <>
              {groups[groupDate].map((item, idx) => (
                <tr key={`${item.roomId}-${item.startTime}-${idx}`} style={{ background: rowBg(item) }}>
                  <td style={{ ...tdStyle, textAlign: 'left', paddingLeft: 16, fontSize: 16, fontWeight: 700 }}>{formatDisplayDate(item.date)}</td>
                  <td style={tdStyle}>{item.startTime.slice(0, 5)}</td>
                  <td style={tdStyle}>{item.endTime.slice(0, 5)}</td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: '#000000', fontSize: 14 }}>{item.roomName}</td>
                  <td style={tdStyle}>
                    {item.isBooked && (
                      isRedRow(item)
                        ? <span style={redBadge}>✗ KHÔNG CẦN DỌN</span>
                        : <span style={greenBadge}>✓ CẦN DỌN</span>
                    )}
                  </td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
