import React, { useMemo, useState } from "react";

/**
 * HospitalDashboard.js
 * Simple hospital dashboard using Tailwind CSS.
 * Place this file at /src/Components/Hospital/HospitalDashbord.js
 *
 * Notes:
 * - Self-contained React component with sample data and basic UI.
 * - Tailwind CSS must be configured in your project for styling to work.
 */

const sampleStats = {
  patientsToday: 86,
  bedsOccupied: 72,
  surgeriesToday: 8,
  revenue: 12450,
};

const recentAdmissions = [
  {
    id: "PT-2001",
    name: "Alice Johnson",
    ward: "Cardiology",
    bed: "A12",
    date: "2025-11-20",
    time: "09:30",
    status: "Admitted",
  },
  {
    id: "PT-2002",
    name: "Robert Smith",
    ward: "Orthopedics",
    bed: "B04",
    date: "2025-11-20",
    time: "10:15",
    status: "Under Observation",
  },
  {
    id: "PT-2003",
    name: "Maria Gomez",
    ward: "Emergency",
    bed: "E01",
    date: "2025-11-19",
    time: "16:40",
    status: "Discharged",
  },
  {
    id: "PT-2004",
    name: "Chen Wei",
    ward: "Surgery",
    bed: "S03",
    date: "2025-11-20",
    time: "11:05",
    status: "In Surgery",
  },
];

const statusColor = (s) =>
  ({
    Admitted: "bg-blue-100 text-blue-800",
    "Under Observation": "bg-yellow-100 text-yellow-800",
    "In Surgery": "bg-indigo-100 text-indigo-800",
    Discharged: "bg-green-100 text-green-800",
    Critical: "bg-red-100 text-red-800",
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

export default function HospitalDashboard() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return recentAdmissions.filter((p) => {
      const matchesFilter = filter === "All" || p.status === filter;
      const matchesQuery =
        !query ||
        p.id.toLowerCase().includes(query.toLowerCase()) ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.ward.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  const sparkData = [20, 28, 24, 30, 36, 33, 38, 34];

return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
        <div className="flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 hidden md:block">
                <div className="text-2xl font-semibold mb-6">MedLink Clinic</div>
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
                        href="#patients"
                    >
                        <svg
                            className="w-5 h-5 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 2a4 4 0 110 8 4 4 0 010-8zM2 18a8 8 0 1116 0H2z" />
                        </svg>
                        My Patients
                    </a>
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
                        href="#appointments"
                    >
                        <svg
                            className="w-5 h-5 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M6 2h8v2H6V2zm-2 4h12v12H4V6z" />
                        </svg>
                        Appointments
                    </a>
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
                        href="#messages"
                    >
                        <svg
                            className="w-5 h-5 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V5z" />
                        </svg>
                        Messages
                    </a>
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
                        href="#prescriptions"
                    >
                        <svg
                            className="w-5 h-5 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M4 3h12v4H4V3zm0 6h12v8H4V9z" />
                        </svg>
                        Prescriptions
                    </a>
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">Doctor Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Overview of appointments, patients and tasks
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
                                placeholder="Search patient, appointment..."
                                className="outline-none text-sm"
                            />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-3">
                            <span className="text-sm">Dr. Smith</span>
                            <div className="w-8 h-8 bg-indigo-600 rounded-full text-white flex items-center justify-center text-sm">
                                D
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500">Appointments Today</div>
                                <div className="text-2xl font-semibold">
                                    {sampleStats.patientsToday}
                                </div>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded">
                                <svg
                                    className="w-6 h-6 text-indigo-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M6 2h8v2H6V2zm-2 4h12v12H4V6z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Sparkline data={sparkData} stroke="#6366F1" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500">Patients</div>
                                <div className="text-2xl font-semibold">
                                    {sampleStats.bedsOccupied}
                                </div>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded">
                                <svg
                                    className="w-6 h-6 text-yellow-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M3 8h14v8H3zM3 6a2 2 0 012-2h10a2 2 0 012 2v2H3V6z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xs text-gray-400">Active follow-ups: 12</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500">On Call</div>
                                <div className="text-2xl font-semibold">
                                    {sampleStats.surgeriesToday}
                                </div>
                            </div>
                            <div className="p-2 bg-green-50 rounded">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M4 4h12v2H4zM4 8h12v8H4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xs text-gray-400">Emergencies: 1</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500">Earnings</div>
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
                                Projected next month $13.5k
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent appointments */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">Recent Appointments</h2>
                            <div className="flex items-center gap-2">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="border border-gray-200 rounded px-2 py-1 text-sm bg-white"
                                >
                                    <option>All</option>
                                    <option>Admitted</option>
                                    <option>Under Observation</option>
                                    <option>In Surgery</option>
                                    <option>Discharged</option>
                                    <option>Critical</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-gray-500">
                                    <tr>
                                        <th className="py-2">Appt ID</th>
                                        <th className="py-2">Patient</th>
                                        <th className="py-2">Ward / Bed</th>
                                        <th className="py-2">Time</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr key={p.id} className="border-t">
                                            <td className="py-3 text-sm text-gray-700">{p.id}</td>
                                            <td className="py-3">{p.name}</td>
                                            <td className="py-3">
                                                {p.ward} · {p.bed}
                                            </td>
                                            <td className="py-3 text-gray-500">
                                                {p.date} · {p.time}
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${statusColor(
                                                        p.status
                                                    )}`}
                                                >
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-2">
                                                    <button className="text-indigo-600 text-sm hover:underline">
                                                        Message
                                                    </button>
                                                    <button className="text-gray-500 text-sm hover:underline">
                                                        Reschedule
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
                                                No appointments found
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
                                    New Prescription
                                </button>
                                <button className="w-full text-left px-3 py-2 border border-gray-200 rounded text-sm">
                                    Send Message
                                </button>
                                <button className="w-full text-left px-3 py-2 border border-gray-200 rounded text-sm">
                                    Add Note
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded border border-gray-100 p-4 shadow-sm">
                            <h3 className="text-sm font-medium mb-2">Patient Load</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-semibold">72%</div>
                                    <div className="text-xs text-gray-500">
                                        Current patient load
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
