import * as XLSX from 'xlsx';
import type { BookingExportRow } from '@/shared/types';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER_VP: 'VPBank',
  BANK_TRANSFER_TECH: 'Techcombank',
  OTHER: 'Khác',
};

type ExportOptions = {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  includeSummary?: boolean;
};

function toDisplayDate(d?: string): string | undefined {
  if (!d) return undefined;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function cell(ws: XLSX.WorkSheet, r: number, c: number, v: string | number, s?: object) {
  const addr = XLSX.utils.encode_cell({ r, c });
  ws[addr] = { v, t: typeof v === 'number' ? 'n' : 's', s: s ?? {} };
}

function currencyCell(ws: XLSX.WorkSheet, r: number, c: number, v: number, s?: object) {
  const addr = XLSX.utils.encode_cell({ r, c });
  ws[addr] = { v, t: 'n', z: '#,##0', s: s ?? {} };
}

// ── Brand color tokens (accent scale from index.css) ──
const ACCENT_900 = '5F3E27'; // darkest — header bg
const ACCENT_800 = '744B2D'; // header bg alt
const ACCENT_600 = 'A97340'; // border / accent
const ACCENT_200 = 'F0D5AD'; // total row bg
const ACCENT_100 = 'F9EDD9'; // sub-header bg
const ACCENT_50  = 'FDF8F0'; // lightest row stripe
const GRAY_ROW_A = 'F9FAFB'; // table data row stripe (neutral)
const EXPORT_FONT = { name: 'Arial', sz: 11 };
const THIN_BORDER = {
  top: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
};
const MONTH_END_BORDER = {
  top: { style: 'medium', color: { rgb: ACCENT_600 } },
  right: { style: 'medium', color: { rgb: ACCENT_600 } },
  bottom: { style: 'medium', color: { rgb: ACCENT_600 } },
  left: { style: 'medium', color: { rgb: ACCENT_600 } },
};

export function exportBookingsToExcel(
  rows: BookingExportRow[],
  filename: string,
  options: ExportOptions = {},
) {
  const { startDate, endDate, includeSummary = true } = options;

  const HEADERS = ['STT', 'Ngày', 'Phòng', 'Phương thức thanh toán', 'Thành tiền'];

  const dataRows = rows.map((r) => [
    r.stt,
    r.date,
    r.room,
    PAYMENT_METHOD_LABEL[r.paymentMethod] ?? r.paymentMethod,
    r.amount,
  ]);

  const totalAmount = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const totalRow = ['', '', '', 'TỔNG CỘNG', totalAmount];

  const wsData = [HEADERS, ...dataRows, totalRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 6 },  // A
    { wch: 14 }, // B
    { wch: 20 }, // C
    { wch: 28 }, // D
    { wch: 16 }, // E
    ...(includeSummary ? [{ wch: 3 }, { wch: 3 }, { wch: 28 }, { wch: 18 }] : []),
  ];

  // ── Main table header row ──
  for (let c = 0; c <= 4; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { ...EXPORT_FONT, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { patternType: 'solid', fgColor: { rgb: ACCENT_900 } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
      border: { ...THIN_BORDER, bottom: { style: 'medium', color: { rgb: ACCENT_600 } } },
    };
  }

  // ── Main table data rows: alternating stripe ──
  for (let r = 1; r < wsData.length - 1; r++) {
    const bg = r % 2 === 0 ? GRAY_ROW_A : 'FFFFFF';
    for (let c = 0; c <= 4; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      ws[addr].s = {
        ...(ws[addr].s ?? {}),
        font: EXPORT_FONT,
        fill: { patternType: 'solid', fgColor: { rgb: bg } },
        border: THIN_BORDER,
      };
    }
  }

  // ── Total row ──
  const totalRowIdx = wsData.length - 1;
  for (let c = 0; c <= 4; c++) {
    const addr = XLSX.utils.encode_cell({ r: totalRowIdx, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { ...EXPORT_FONT, bold: true, color: { rgb: ACCENT_900 } },
      fill: { patternType: 'solid', fgColor: { rgb: ACCENT_200 } },
      border: MONTH_END_BORDER,
    };
  }

  // ── Price column: right-align + number format ──
  for (let r = 1; r < wsData.length; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: 4 });
    if (!ws[addr]) continue;
    ws[addr].s = { ...(ws[addr].s ?? {}), alignment: { horizontal: 'right' } };
    ws[addr].z = '#,##0';
  }

  // ── Summary section ──
  if (includeSummary) {
    const SL = 7;
    const SV = 8;

    // Style presets
    const S_TITLE: object = {
      font: { ...EXPORT_FONT, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { patternType: 'solid', fgColor: { rgb: ACCENT_900 } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: THIN_BORDER,
    };
    const S_TITLE_VALUE: object = {
      fill: { patternType: 'solid', fgColor: { rgb: ACCENT_900 } },
      font: EXPORT_FONT,
      border: THIN_BORDER,
    };
    const S_SUBHEADER: object = {
      font: { ...EXPORT_FONT, bold: true, color: { rgb: ACCENT_900 } },
      fill: { patternType: 'solid', fgColor: { rgb: ACCENT_100 } },
      border: THIN_BORDER,
    };
    const S_SUBHEADER_VALUE: object = {
      fill: { patternType: 'solid', fgColor: { rgb: ACCENT_100 } },
      font: EXPORT_FONT,
      border: THIN_BORDER,
    };
    const rowStyle = (idx: number) => ({
      label: {
        font: { ...EXPORT_FONT, color: { rgb: ACCENT_800 } },
        fill: { patternType: 'solid', fgColor: { rgb: idx % 2 === 0 ? ACCENT_50 : 'FFFFFF' } },
        border: THIN_BORDER,
      } as object,
      value: {
        font: { ...EXPORT_FONT, color: { rgb: '374151' } },
        fill: { patternType: 'solid', fgColor: { rgb: idx % 2 === 0 ? ACCENT_50 : 'FFFFFF' } },
        alignment: { horizontal: 'right' },
        border: THIN_BORDER,
      } as object,
    });
    const S_TOTAL_LABEL: object = {
      font: { ...EXPORT_FONT, bold: true, color: { rgb: ACCENT_900 } },
      fill: { patternType: 'solid', fgColor: { rgb: ACCENT_200 } },
      border: THIN_BORDER,
    };
    const S_TOTAL_VALUE: object = {
      font: { ...EXPORT_FONT, bold: true, color: { rgb: ACCENT_900 } },
      fill: { patternType: 'solid', fgColor: { rgb: ACCENT_200 } },
      alignment: { horizontal: 'right' },
      border: THIN_BORDER,
    };

    const now = new Date();
    const exportDate =
      now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const byPayment: Record<string, number> = {};
    rows.forEach((r) => {
      const label = PAYMENT_METHOD_LABEL[r.paymentMethod] ?? r.paymentMethod;
      byPayment[label] = (byPayment[label] ?? 0) + r.amount;
    });

    const byRoom: Record<string, number> = {};
    rows.forEach((r) => {
      byRoom[r.room] = (byRoom[r.room] ?? 0) + r.amount;
    });

    let sr = 0;
    let dataIdx = 0; // tracks alternating row color

    // Title row
    cell(ws, sr, SL, 'TỔNG KẾT', S_TITLE);
    cell(ws, sr++, SV, '', S_TITLE_VALUE);

    // General info rows
    const start = toDisplayDate(startDate);
    const end = toDisplayDate(endDate);

    const generalRows: [string, string | number, boolean][] = [
      ['Ngày xuất', exportDate, false],
      ...(start || end ? [['Khoảng thời gian', `${start ?? '—'} → ${end ?? '—'}`, false] as [string, string, boolean]] : []),
      ['Tổng số dòng', rows.length, false],
    ];

    for (const [label, value, _isCurrency] of generalRows) {
      const s = rowStyle(dataIdx++);
      cell(ws, sr, SL, label, s.label);
      if (_isCurrency) {
        currencyCell(ws, sr++, SV, value as number, s.value);
      } else {
        cell(ws, sr++, SV, value, s.value);
      }
    }

    // Total revenue — highlighted
    cell(ws, sr, SL, 'Tổng doanh thu', S_TOTAL_LABEL);
    currencyCell(ws, sr++, SV, totalAmount, S_TOTAL_VALUE);

    sr++; // blank row

    // Payment breakdown
    cell(ws, sr, SL, 'Theo hình thức thanh toán', S_SUBHEADER);
    cell(ws, sr++, SV, '', S_SUBHEADER_VALUE);
    dataIdx = 0;
    for (const [label, amount] of Object.entries(byPayment)) {
      const s = rowStyle(dataIdx++);
      cell(ws, sr, SL, label, s.label);
      currencyCell(ws, sr++, SV, amount, s.value);
    }

    sr++; // blank row

    // Room breakdown
    cell(ws, sr, SL, 'Theo phòng', S_SUBHEADER);
    cell(ws, sr++, SV, '', S_SUBHEADER_VALUE);
    dataIdx = 0;
    for (const [room, amount] of Object.entries(byRoom)) {
      const s = rowStyle(dataIdx++);
      cell(ws, sr, SL, room, s.label);
      currencyCell(ws, sr++, SV, amount, s.value);
    }

    const lastDataRow = wsData.length - 1;
    ws['!ref'] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: Math.max(lastDataRow, sr - 1), c: SV });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sach dat phong');
  XLSX.writeFile(wb, filename);
}
