import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { FiSearch, FiChevronDown } from "react-icons/fi";

// Component: MedicalHistoryFull
// Fetches the full medical history object for the current user and renders
// Top analytics + 3 sections: General info, Lab results, Past appointments.

export default function MedicalHistory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // get current userId (from localStorage or fallback)
  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

  // Fetch medical history data

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`http://localhost:8000/api/user/${userId}`, {
          headers,
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message || e);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
    else {
      setError("No userId found in localStorage");
      setLoading(false);
    }
  }, [userId]);

  // Derived lists (appointments, labResults). Ensure array types.
  const appointments = useMemo(() => data?.appointments || [], [data]);
  const labResults = useMemo(() => data?.labResults || [], [data]);

  // Filtering logic for appointments & labs
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      !search ||
      a.doctor?.toLowerCase().includes(search.toLowerCase()) ||
      a.type?.toLowerCase().includes(search.toLowerCase()) ||
      a.notes?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || a.type === typeFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    const date = a.date ? new Date(a.date) : null;
    const fromOk = !dateFrom || (date && date >= new Date(dateFrom));
    const toOk = !dateTo || (date && date <= new Date(dateTo));

    return matchesSearch && matchesType && matchesStatus && fromOk && toOk;
  });

  const filteredLabResults = labResults.filter((l) => {
    const matchesSearch =
      !search ||
      l.type?.toLowerCase().includes(search.toLowerCase()) ||
      (l.notes || "").toLowerCase().includes(search.toLowerCase());

    const date = l.date ? new Date(l.date) : null;
    const fromOk = !dateFrom || (date && date >= new Date(dateFrom));
    const toOk = !dateTo || (date && date <= new Date(dateTo));

    return matchesSearch && fromOk && toOk;
  });

  // Chart data: visits per month
  const visitsChart = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      const month = a.date ? a.date.slice(0, 7) : "unknown"; // YYYY-MM
      const existing = map.get(month) || 0;
      map.set(month, existing + 1);
    });
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, visits: count }))
      .sort((a, b) => (a.month < b.month ? -1 : 1));
  }, [appointments]);

  // Chart data: lab counts per month
  const labsChart = useMemo(() => {
    const map = new Map();
    labResults.forEach((l) => {
      const month = l.date ? l.date.slice(0, 7) : "unknown";
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, labs: count }))
      .sort((a, b) => (a.month < b.month ? -1 : 1));
  }, [labResults]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        Loading medical history...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-6">
        <div className="bg-white/5 p-6 rounded-xl">Error: {String(error)}</div>
      </div>
    );

  // Helper to render a simple key/value row
  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between border-b border-white/10 py-3">
      <div className="text-gray-300">{label}</div>
      <div className="font-medium text-white">{value ?? "—"}</div>
    </div>
  );

  return (
    <div className="bg-[#0f172a] min-h-screen text-white font-roboto">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#4addbf] mb-6">
          My Medical History
        </h1>

        {/* Top: Filters + Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/5 p-6 rounded-3xl shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 w-full md:w-1/2">
                <FiSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments or labs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder-gray-400 text-white"
                />
              </div>

              <div className="flex gap-3 items-center">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white/5 text-white p-2 rounded-xl"
                >
                  <option value="all">All Types</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Lab Test">Lab Test</option>
                  <option value="Vaccination">Vaccination</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 text-white p-2 rounded-xl"
                >
                  <option value="all">All Status</option>
                  <option value="done">Done</option>
                  <option value="requested">Requested</option>
                  <option value="pending">Pending</option>
                </select>

                <input
                  type="month"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value + "-01")}
                  className="bg-white/5 text-white p-2 rounded-xl"
                />
                <input
                  type="month"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value + "-31")}
                  className="bg-white/5 text-white p-2 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-tr from-[#06202a] to-[#042231] rounded-2xl p-4">
                <h3 className="text-sm text-gray-300 mb-2">Visits Overview</h3>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={visitsChart}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="month"
                        stroke="#67e8f9"
                        tick={{ fill: "#67e8f9" }}
                      />
                      <YAxis stroke="#67e8f9" tick={{ fill: "#67e8f9" }} />
                      <Tooltip />
                      <Bar
                        dataKey="visits"
                        fill="#4addbf"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gradient-to-tr from-[#041927] to-[#041f2b] rounded-2xl p-4">
                <h3 className="text-sm text-gray-300 mb-2">
                  Lab Results Count
                </h3>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={labsChart}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="month"
                        stroke="#67e8f9"
                        tick={{ fill: "#67e8f9" }}
                      />
                      <YAxis stroke="#67e8f9" tick={{ fill: "#67e8f9" }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="labs"
                        stroke="#67e8f9"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-3xl shadow-md">
            <h3 className="text-xl font-semibold text-[#67e8f9] mb-4">
              Quick Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <div>Full name</div>
                <div className="font-medium text-white">
                  {data?.user?.username}
                </div>
              </div>
              <div className="flex justify-between text-gray-300">
                <div>Email</div>
                <div className="font-medium text-white">
                  {data?.user?.email}
                </div>
              </div>
              <div className="flex justify-between text-gray-300">
                <div>Conditions</div>
                <div className="font-medium text-white">
                  {data?.conditions || "—"}
                </div>
              </div>
              <div className="flex justify-between text-gray-300">
                <div>Allergies</div>
                <div className="font-medium text-white">
                  {data?.allergies || "—"}
                </div>
              </div>
              <div className="flex justify-between text-gray-300">
                <div>Blood Type</div>
                <div className="font-medium text-white">
                  {data?.bloodType || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections: General Info | Lab Results | Past Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General Info */}
          <div className="lg:col-span-1 bg-white/5 p-6 rounded-3xl shadow-md">
            <h2 className="text-2xl font-semibold text-[#4addbf] mb-4">
              General Information
            </h2>
            <InfoRow label="Date of Birth" value={data?.dateOfBirth} />
            <InfoRow label="Gender" value={data?.gender} />
            <InfoRow label="Height (cm)" value={data?.heightCm} />
            <InfoRow label="Weight (kg)" value={data?.weightKg} />
            <InfoRow label="Medications" value={data?.medications || "—"} />
            <InfoRow label="Smoking" value={data?.smokingStatus || "—"} />
            <InfoRow label="Alcohol" value={data?.alcoholConsumption || "—"} />
            <InfoRow label="Notes" value={data?.notesDaySingIn || "—"} />
          </div>

          {/* Lab Results */}
          <div className="lg:col-span-1 bg-white/5 p-6 rounded-3xl shadow-md">
            <h2 className="text-2xl font-semibold text-[#4addbf] mb-4">
              Lab Results
            </h2>
            {filteredLabResults.length === 0 ? (
              <div className="text-gray-400">No lab results found.</div>
            ) : (
              <div className="space-y-4">
                {filteredLabResults.map((lab, idx) => (
                  <details key={idx} className="bg-white/3 p-4 rounded-xl">
                    <summary className="flex justify-between cursor-pointer">
                      <div>
                        <div className="font-semibold">{lab.type}</div>
                        <div className="text-sm text-gray-300">{lab.date}</div>
                      </div>
                      <div className="text-sm text-gray-300">
                        {lab.location || "—"}
                      </div>
                    </summary>

                    <div className="mt-3 text-gray-200">
                      {/* values: object of metrics */}
                      {lab.values ? (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(lab.values).map(([k, v]) => (
                            <div key={k} className="p-2 bg-white/5 rounded-lg">
                              <div className="text-xs text-gray-300">{k}</div>
                              <div className="font-medium">{String(v)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          No numeric values available.
                        </div>
                      )}

                      {lab.notes && (
                        <p className="mt-3 text-gray-300">Notes: {lab.notes}</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          <div className="lg:col-span-1 bg-white/5 p-6 rounded-3xl shadow-md">
            <h2 className="text-2xl font-semibold text-[#4addbf] mb-4">
              Past Appointments
            </h2>
            {filteredAppointments.length === 0 ? (
              <div className="text-gray-400">No appointments found.</div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((a) => (
                  <div key={a.id} className="bg-white/3 p-4 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{a.type}</div>
                        <div className="text-sm text-gray-300">{a.date}</div>
                        <div className="text-sm text-gray-300">
                          Doctor: {a.doctor || "—"}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-black font-semibold ${
                            a.status === "done"
                              ? "bg-green-300"
                              : a.status === "requested"
                              ? "bg-yellow-300"
                              : "bg-red-300"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>
                    {a.notes && (
                      <p className="mt-3 text-gray-300">Notes: {a.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
