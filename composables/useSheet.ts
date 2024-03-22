import * as fs from 'node:fs';
import * as xl from 'xlsx';
import dayjs from 'dayjs';

xl.set_fs(fs);

export function useSheet() {
  async function exportToSheet<T>(data: T[], sheetName?: string, fileName?: string) {
    const newSheetName = sheetName || 'Sheet1';
    const newFileName = fileName || `export_${dayjs()}.xlsx`;

    const workbook = xl.utils.book_new();
    const worksheet = xl.utils.json_to_sheet(data);

    xl.utils.book_append_sheet(workbook, worksheet, newSheetName);

    await xl.writeFile(workbook, newFileName);
  }

  return {
    exportToSheet,
  };
}
