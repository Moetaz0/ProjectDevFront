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
import {
  getLabResultSignedUrl,
  getClientAppointments,
} from "../../services/api";

// Component: MedicalHistoryFull
// Fetches the full medical history object for the current user and renders
// Top analytics + 3 sections: General info, Lab results, Past appointments.

export default function MedicalHistory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientAppointments, setClientAppointments] = useState([]);
  const [preview, setPreview] = useState({
    open: false,
    url: null,
    type: null,
    filename: null,
    loading: true,
  });

  // UI state
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [labResultPage, setLabResultPage] = useState(1);
  const itemsPerPage = 3;

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

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error Response:", errorText);
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        // Get the response text first
        const responseText = await res.text();
        console.log("Raw API Response:", responseText);

        // Try to parse it as JSON
        let json;
        try {
          json = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          console.error(
            "Invalid JSON text (first 500 chars):",
            responseText.substring(0, 500)
          );

          // Check if it's a circular reference issue
          if (
            responseText.includes('"results":[{"id":1') &&
            responseText.length > 10000
          ) {
            throw new Error(
              "Backend API has a circular reference issue in labResults. Please add @JsonIgnoreProperties to the Lab entity in your Spring Boot backend to exclude the 'results' field when serializing."
            );
          }

          throw new Error(
            "Server returned invalid JSON. Please check the backend API."
          );
        }

        setData(json);

        // Fetch client appointments and filter for CONFIRMED status
        try {
          const appointments = await getClientAppointments(userId);
          const confirmedAppointments = Array.isArray(appointments)
            ? appointments.filter((apt) => apt.status === "CONFIRMED")
            : [];
          setClientAppointments(confirmedAppointments);
          console.log("Confirmed Appointments:", confirmedAppointments);
        } catch (appointmentError) {
          console.warn(
            "Failed to fetch client appointments:",
            appointmentError
          );
          // Don't fail the entire component if appointments fail
        }
      } catch (e) {
        console.error("Fetch error:", e);
        setError(e.message || String(e));
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
  const appointments = useMemo(
    () =>
      clientAppointments.length > 0
        ? clientAppointments
        : data?.appointments || [],
    [data, clientAppointments]
  );
  const labResults = useMemo(() => data?.labResults || [], [data]);
  console.log("Appointments:", appointments);
  console.log("Lab Results:", labResults);

  // Filtering logic for appointments & labs
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      !search ||
      a.doctor?.toLowerCase().includes(search.toLowerCase()) ||
      a.type?.toLowerCase().includes(search.toLowerCase()) ||
      a.notes?.toLowerCase().includes(search.toLowerCase());

    const date = a.date ? new Date(a.date) : null;
    const fromOk = !dateFrom || (date && date >= new Date(dateFrom));
    const toOk = !dateTo || (date && date <= new Date(dateTo));

    return matchesSearch && fromOk && toOk;
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

  // Pagination calculations
  const appointmentPages = Math.ceil(
    filteredAppointments.length / itemsPerPage
  );
  const labResultPages = Math.ceil(filteredLabResults.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (appointmentPage - 1) * itemsPerPage,
    appointmentPage * itemsPerPage
  );
  const paginatedLabResults = filteredLabResults.slice(
    (labResultPage - 1) * itemsPerPage,
    labResultPage * itemsPerPage
  );

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

  // File preview helpers (reuse logic similar to LabDashboard)
  const getFileType = (url) => {
    if (!url) return "unknown";
    const clean = url.split("?")[0];
    const ext = (clean.split(".").pop() || "").toLowerCase();

    if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext))
      return "image";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext))
      return "office";

    if (url.includes("cloudinary.com") && url.includes("/raw/upload/")) {
      if (url.includes("lab_results") || url.includes("file_")) {
        return "pdf";
      }
    }

    return "unknown";
  };

  const getEffectivePreviewUrl = (url, type) => {
    if (!url) return url;
    let effectiveUrl = url;
    if (url.includes("res.cloudinary.com")) {
      if (type === "pdf" && url.includes("/image/upload/")) {
        effectiveUrl = url.replace("/image/upload/", "/raw/upload/");
      }
      if (type === "pdf" && effectiveUrl.includes("/raw/upload/")) {
        const hasExtension = /\.(pdf|png|jpg|jpeg|doc|docx)$/i.test(
          effectiveUrl.split("?")[0]
        );
        if (!hasExtension) {
          const [baseUrl, queryString] = effectiveUrl.split("?");
          effectiveUrl = queryString
            ? `${baseUrl}.pdf?${queryString}`
            : `${baseUrl}.pdf`;
        }
      }
    }
    if (type === "pdf") {
      const separator = effectiveUrl.includes("?") ? "&" : "#";
      return `${effectiveUrl}${separator}toolbar=1&zoom=page-width`;
    }
    return effectiveUrl;
  };

  const openPreview = async (url, resultId, filename) => {
    const type = getFileType(url);
    const extractedFilename =
      filename || url.split("/").pop().split("?")[0] || "document";

    setPreview({
      open: true,
      url: null,
      type,
      filename: extractedFilename,
      loading: true,
    });

    let finalUrl = url;
    if (resultId) {
      try {
        const signedData = await getLabResultSignedUrl(resultId);
        finalUrl = signedData.signedUrl || signedData.url || url;
        if (signedData.filename) {
          setPreview((prev) => ({ ...prev, filename: signedData.filename }));
        }
      } catch (error) {
        console.warn("Signed URL not available, using direct URL:", error);
      }
    }
    setPreview((prev) => ({ ...prev, url: finalUrl, loading: false }));
  };

  const closePreview = () =>
    setPreview({
      open: false,
      url: null,
      type: null,
      filename: null,
      loading: true,
    });

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
              <>
                <div className="space-y-4">
                  {paginatedLabResults.map((lab, idx) => (
                    <details key={idx} className="bg-white/3 p-4 rounded-xl">
                      <summary
                        className="flex justify-between cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          const url = lab.resultFileUrl || lab.fileUrl;
                          if (url) {
                            openPreview(
                              url,
                              lab.id,
                              lab.filename || lab.testName
                            );
                          }
                        }}
                      >
                        <div>
                          <div className="font-semibold">{lab.testName}</div>
                        </div>
                        <div className="text-sm text-gray-300">{lab.date}</div>
                      </summary>

                      <div className="mt-3 text-gray-200">
                        {/* values: object of metrics */}
                        {lab.values ? (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lab.values).map(([k, v]) => (
                              <div
                                key={k}
                                className="p-2 bg-white/5 rounded-lg"
                              >
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
                          <p className="mt-3 text-gray-300">
                            Notes: {lab.notes}
                          </p>
                        )}
                        <div className="mt-4 flex justify-end">
                          <button
                            className="text-[#67e8f9] hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              const url = lab.resultFileUrl || lab.fileUrl;
                              if (url) {
                                openPreview(
                                  url,
                                  lab.id,
                                  lab.filename || lab.testName
                                );
                              }
                            }}
                          >
                            View Result
                          </button>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
                {labResultPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setLabResultPage(Math.max(1, labResultPage - 1))
                      }
                      disabled={labResultPage === 1}
                      className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
                    >
                      ←
                    </button>
                    <span className="text-sm text-gray-300">
                      {labResultPage} / {labResultPages}
                    </span>
                    <button
                      onClick={() =>
                        setLabResultPage(
                          Math.min(labResultPages, labResultPage + 1)
                        )
                      }
                      disabled={labResultPage === labResultPages}
                      className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
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
              <>
                <div className="space-y-4">
                  {paginatedAppointments.map((a) => (
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
                {appointmentPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setAppointmentPage(Math.max(1, appointmentPage - 1))
                      }
                      disabled={appointmentPage === 1}
                      className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
                    >
                      ←
                    </button>
                    <span className="text-sm text-gray-300">
                      {appointmentPage} / {appointmentPages}
                    </span>
                    <button
                      onClick={() =>
                        setAppointmentPage(
                          Math.min(appointmentPages, appointmentPage + 1)
                        )
                      }
                      disabled={appointmentPage === appointmentPages}
                      className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {preview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white w-[95vw] max-w-5xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <div className="font-medium">File Preview</div>
                {preview.filename && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {preview.filename}
                  </div>
                )}
              </div>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-0 relative">
              {preview.loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600 text-sm">
                      Loading preview...
                    </p>
                  </div>
                </div>
              )}
              {preview.type === "image" && preview.url && (
                <div className="max-h-[80vh] overflow-auto">
                  <img
                    src={preview.url}
                    alt="Result preview"
                    className="w-full h-auto object-contain"
                    onLoad={() =>
                      setPreview((prev) => ({ ...prev, loading: false }))
                    }
                    onError={() =>
                      setPreview((prev) => ({ ...prev, loading: false }))
                    }
                  />
                </div>
              )}
              {preview.type === "pdf" && preview.url && (
                <iframe
                  title="PDF preview"
                  src={getEffectivePreviewUrl(preview.url, preview.type)}
                  className="w-full h-[80vh]"
                  onLoad={() =>
                    setPreview((prev) => ({ ...prev, loading: false }))
                  }
                />
              )}
              {preview.type === "office" && preview.url && (
                <iframe
                  title="Document preview"
                  src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                    preview.url
                  )}`}
                  className="w-full h-[80vh]"
                  onLoad={() =>
                    setPreview((prev) => ({ ...prev, loading: false }))
                  }
                />
              )}
              {preview.type === "unknown" && (
                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                      Open in new tab
                    </a>
                    <a
                      href={preview.url}
                      download
                      className="px-4 py-2 border border-gray-300 rounded"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
