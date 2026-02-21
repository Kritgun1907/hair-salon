/**
 * @file ExportButton.tsx
 * @description Button that downloads salon visits as an Excel (.xlsx) file.
 *
 * Opens GET /api/analytics/export in a new tab to trigger the download.
 */

import { Download } from "lucide-react";

interface Props {
  api: string;
  qs: string;
}

export default function ExportButton({ api, qs }: Props) {
  const handleExport = () => {
    window.open(`${api}/api/analytics/export?${qs}`, "_blank");
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors"
    >
      <Download className="w-4 h-4" />
      Export Excel
    </button>
  );
}
