/**
 * @file EmployeeLeaderboard.tsx
 * @description Ranked table of artists sorted by revenue.
 *
 * Fetches data from GET /api/analytics/employees.
 * Highlights the top performer and provides key insights.
 */

import { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";

interface Employee {
  rank: number;
  name: string;
  customersServed: number;
  uniqueCustomers: number;
  revenue: number;
  hoursWorked: number;
}

interface Props {
  api: string;
  qs: string;
}

const RANK_STYLES: Record<number, string> = {
  1: "text-amber-500",
  2: "text-stone-400",
  3: "text-orange-500",
};

export default function EmployeeLeaderboard({ api, qs }: Props) {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${api}/api/analytics/employees?${qs}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData)
      .catch((err) => { console.error(err); setData([]); })
      .finally(() => setLoading(false));
  }, [api, qs]);

  if (loading) {
    return <div className="bg-white border border-stone-200 rounded-xl p-6 animate-pulse h-64 shadow-sm" />;
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Employee Leaderboard</h2>
        <p className="text-stone-400 text-center py-12">No data available</p>
      </div>
    );
  }

  const topEmployee = data[0];

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Employee Leaderboard</h2>
          <p className="text-sm text-stone-500">Ranked by revenue generated</p>
        </div>
        {topEmployee && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">
              Top Performer: {topEmployee.name}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left py-3 px-2 text-stone-500 font-medium">Rank</th>
              <th className="text-left py-3 px-2 text-stone-500 font-medium">Artist</th>
              <th className="text-right py-3 px-2 text-stone-500 font-medium">Customers</th>
              <th className="text-right py-3 px-2 text-stone-500 font-medium">Revenue</th>
              <th className="text-right py-3 px-2 text-stone-500 font-medium">Hours</th>
              <th className="text-right py-3 px-2 text-stone-500 font-medium">₹/Customer</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.name} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                <td className="py-3 px-2">
                  <span className={`font-bold ${RANK_STYLES[e.rank] || "text-stone-500"}`}>
                    {e.rank <= 3 ? (
                      <span className="flex items-center gap-1">
                        <Medal className="w-4 h-4" /> {e.rank}
                      </span>
                    ) : (
                      `#${e.rank}`
                    )}
                  </span>
                </td>
                <td className="py-3 px-2 font-medium text-stone-900">{e.name}</td>
                <td className="py-3 px-2 text-right text-stone-600">{e.customersServed}</td>
                <td className="py-3 px-2 text-right font-medium text-emerald-600">
                  ₹{e.revenue.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-2 text-right text-stone-600">{e.hoursWorked}h</td>
                <td className="py-3 px-2 text-right text-stone-600">
                  ₹{e.customersServed > 0 ? Math.round(e.revenue / e.customersServed).toLocaleString("en-IN") : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Written insights */}
      <div className="mt-4 p-4 bg-stone-50 border border-stone-100 rounded-lg space-y-1.5">
        <p className="text-sm font-medium text-stone-700">Key Insights:</p>
        <p className="text-sm text-stone-600">
          <span className="text-stone-900 font-medium">{topEmployee.name}</span> leads with ₹{topEmployee.revenue.toLocaleString("en-IN")} revenue across {topEmployee.customersServed} customers.
        </p>
        {data.length > 1 && (
          <p className="text-sm text-stone-600">
            Revenue gap between #{1} and #{data.length}: ₹{(data[0].revenue - data[data.length - 1].revenue).toLocaleString("en-IN")}
          </p>
        )}
        {(() => {
          const topHours = [...data].sort((a, b) => b.hoursWorked - a.hoursWorked)[0];
          return (
            <p className="text-sm text-stone-600">
              Most hours worked: <span className="text-stone-900 font-medium">{topHours.name}</span> ({topHours.hoursWorked}h)
            </p>
          );
        })()}
      </div>
    </div>
  );
}
