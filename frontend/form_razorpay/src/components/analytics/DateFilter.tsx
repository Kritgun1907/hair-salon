/**
 * @file DateFilter.tsx
 * @description Date-range selector with quick presets and custom inputs.
 *
 * Presets: Today, This Week, This Month, Last Month, Last 3 Months.
 * Also provides manual `from` / `to` date pickers.
 */

import dayjs from "dayjs";

interface Props {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

const presets = [
  { label: "Today", from: () => dayjs(), to: () => dayjs() },
  { label: "This Week", from: () => dayjs().startOf("week"), to: () => dayjs() },
  { label: "This Month", from: () => dayjs().startOf("month"), to: () => dayjs() },
  { label: "Last Month", from: () => dayjs().subtract(1, "month").startOf("month"), to: () => dayjs().subtract(1, "month").endOf("month") },
  { label: "Last 3 Months", from: () => dayjs().subtract(3, "month").startOf("month"), to: () => dayjs() },
];

export default function DateFilter({ from, to, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {presets.map((p) => {
        const pFrom = p.from().format("YYYY-MM-DD");
        const pTo = p.to().format("YYYY-MM-DD");
        const active = from === pFrom && to === pTo;
        return (
          <button
            key={p.label}
            onClick={() => onChange(pFrom, pTo)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active
                ? "bg-stone-900 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            {p.label}
          </button>
        );
      })}

      {/* Custom date range */}
      <div className="flex items-center gap-2 ml-auto">
        <input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-300"
        />
        <span className="text-stone-400">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-300"
        />
      </div>
    </div>
  );
}
