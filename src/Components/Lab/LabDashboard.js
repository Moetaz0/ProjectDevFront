import React, { useMemo, useState } from "react";

/**
 * LabDashboard.js
 * Simple laboratory dashboard using Tailwind CSS.
 * Place this file at /src/Components/Lab/LabDashboard.js
 *
 * Notes:
 * - This is a self-contained React component with sample data and basic UI.
 * - Tailwind CSS must be configured in your project for styling to work.
 */

const sampleStats = {
  testsToday: 128,
  pending: 24,
  completed: 1024,
  revenue: 8520,
};

const recentTests = [
  {
    id: "LT-1001",
    patient: "Alice Johnson",
    test: "Complete Blood Count",
    date: "2025-11-20",
    time: "09:30",
    status: "Completed",
  },
  {
    id: "LT-1002",
    patient: "Robert Smith",
    test: "Lipid Profile",
    date: "2025-11-20",
    time: "10:15",
    status: "Pending",
  },
  {
    id: "LT-1003",
    patient: "Maria Gomez",
    test: "COVID-19 PCR",
    date: "2025-11-19",
    time: "16:40",
    status: "Completed",
  },
  {
    id: "LT-1004",
    patient: "Chen Wei",
    test: "Urinalysis",
    date: "2025-11-20",
    time: "11:05",
    status: "In Progress",
  },
];

const statusColor = (s) =>
  ({
    Completed: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Cancelled: "bg-red-100 text-red-800",
  }[s] || "bg-gray-100 text-gray-800");

function Sparkline({
  data = [],
  width = 120,
  height = 40,
  stroke = "#4F46E5",
}) {
  const points = useMemo(() => {
    if (!data.length) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const step = width / Math.max(1, data.length - 1);
    return data
      .map((v, i) => {
        const normalized = max === min ? 0.5 : (v - min) / (max - min);
        const x = i * step;
        const y = height - normalized * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <polyline
        points={points}
        stroke={stroke}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LabDashboard() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return recentTests.filter((t) => {
      const matchesFilter = filter === "All" || t.status === filter;
      const matchesQuery =
        !query ||
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.patient.toLowerCase().includes(query.toLowerCase()) ||
        t.test.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  const sparkData = [10, 18, 14, 22, 30, 27, 32, 28];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 hidden md:block">
          <div className="text-2xl font-semibold mb-6">MedLink Lab</div>
          <nav className="space-y-2 text-sm">
            <a
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
              href="#dashboard"
            >
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 3h14v4H3V3zm0 6h8v8H3V9z" />
              </svg>
              Dashboard
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
              href="#tests"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2v6H3l6-6zM11 2l6 6h-6V2zM3 8l6 6H3V8zm14 0v6h-6l6-6z" />
              </svg>
              Tests
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
              href="#patients"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a4 4 0 110 8 4 4 0 010-8zM2 18a8 8 0 1116 0H2z" />
              </svg>
              Patients
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
              href="#reports"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 3h14v12H3zM7 7h6v2H7V7z" />
              </svg>
              Reports
            </a>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Laboratory Dashboard</h1>
              <p className="text-sm text-gray-500">
                Overview of tests, workload and revenue
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded px-3 py-1 gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                  />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tests, patient..."
                  className="outline-none text-sm"
                />
              </div>
              <div className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-3">
                <span className="text-sm">Admin</span>
                <div className="w-8 h-8 bg-indigo-600 rounded-full text-white flex items-center justify-center text-sm">
                  A
                </div>
              </div>
            </div>
          </header>

          {/* Stats cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Tests Today</div>
                  <div className="text-2xl font-semibold">
                    {sampleStats.testsToday}
                  </div>
                </div>
                <div className="p-2 bg-indigo-50 rounded">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 3h14v4H3V3zm0 6h8v8H3V9z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <Sparkline data={sparkData} />
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Pending</div>
                  <div className="text-2xl font-semibold">
                    {sampleStats.pending}
                  </div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a6 6 0 100 12A6 6 0 0010 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-gray-400">
                  Avg turnaround: 4h 20m
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Completed</div>
                  <div className="text-2xl font-semibold">
                    {sampleStats.completed}
                  </div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M7 10l3 3 7-7-1.5-1.5L10 10 8.5 8.5 7 10z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-gray-400">This month +12%</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Revenue</div>
                  <div className="text-2xl font-semibold">
                    ${sampleStats.revenue}
                  </div>
                </div>
                <div className="p-2 bg-indigo-50 rounded">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2l3 6-3 1-3-1 3-6zM3 12h14v6H3v-6z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-gray-400">
                  Projected next month $9.2k
                </div>
              </div>
            </div>
          </section>

          {/* Recent tests */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Recent Tests</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm bg-white"
                  >
                    <option>All</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="py-2">Test ID</th>
                      <th className="py-2">Patient</th>
                      <th className="py-2">Test</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-t">
                        <td className="py-3 text-sm text-gray-700">{t.id}</td>
                        <td className="py-3">{t.patient}</td>
                        <td className="py-3">{t.test}</td>
                        <td className="py-3 text-gray-500">
                          {t.date} · {t.time}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${statusColor(
                              t.status
                            )}`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button className="text-indigo-600 text-sm hover:underline">
                              View
                            </button>
                            <button className="text-gray-500 text-sm hover:underline">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-6 text-center text-gray-400"
                        >
                          No tests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar widgets */}
            <aside className="space-y-4">
              <div className="bg-white rounded border border-gray-100 p-4 shadow-sm">
                <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <button className="w-full text-left px-3 py-2 bg-indigo-600 text-white rounded text-sm">
                    New Test
                  </button>
                  <button className="w-full text-left px-3 py-2 border border-gray-200 rounded text-sm">
                    Upload Results
                  </button>
                  <button className="w-full text-left px-3 py-2 border border-gray-200 rounded text-sm">
                    Generate Report
                  </button>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-100 p-4 shadow-sm">
                <h3 className="text-sm font-medium mb-2">Lab Load</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">72%</div>
                    <div className="text-xs text-gray-500">
                      Capacity used today
                    </div>
                  </div>
                  <div>
                    <svg width="48" height="48" viewBox="0 0 36 36">
                      <path
                        d="M18 2a16 16 0 1016 16A16 16 0 0018 2zm0 0"
                        fill="#EEF2FF"
                      />
                      <path
                        d="M18 2a16 16 0 1016 16A16 16 0 0018 2zm0 0"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="2"
                        strokeDasharray="113"
                        strokeDashoffset={(113 * (100 - 72)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
