import React, { useMemo, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  getAllLabs,
  getLabResultsByLab,
  getLabResultSignedUrl,
} from "../../services/api";

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
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [labData, setLabData] = useState(null);
  const [labs, setLabs] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [preview, setPreview] = useState({
    open: false,
    url: null,
    type: null,
    filename: null,
    loading: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    testsToday: 0,
    pending: 0,
    completed: 0,
  });

  // Fetch lab data and tests on component mount
  useEffect(() => {
    const fetchLabData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all labs
        const labsData = await getAllLabs();
        setLabs(labsData);

        // Resolve Lab entity ID by matching token user to lab.user.id
        let currentLabId = null;
        let currentLabEntity = null;
        if (user?.userId && Array.isArray(labsData) && labsData.length) {
          const matched = labsData.find((l) => l?.user?.id === user.userId);
          if (matched) {
            currentLabEntity = matched;
            currentLabId = matched.id;
          }
        }
        if (!currentLabId && labsData.length > 0) {
          currentLabEntity = labsData[0];
          currentLabId = labsData[0].id;
        }
        setLabData(currentLabEntity);

        // Fetch lab results for the current lab
        try {
          if (currentLabId) {
            const results = await getLabResultsByLab(currentLabId);
            setLabResults(Array.isArray(results) ? results : []);

            // Basic stats from lab results
            const today = new Date().toISOString().split("T")[0];
            const todayResults = results.filter((r) =>
              r.date?.startsWith(today)
            );
            setStats((prev) => ({
              ...prev,
              testsToday: todayResults.length,
              completed: results.length,
              pending: 0,
            }));
          } else {
            setLabResults([]);
            setStats({ testsToday: 0, pending: 0, completed: 0 });
          }
        } catch (resultsError) {
          console.error("Error fetching lab results:", resultsError);
          setLabResults([]);
          setStats({ testsToday: 0, pending: 0, completed: 0 });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching lab data:", err);
        setError("Failed to load lab data. Please try again.");
        setLoading(false);
      }
    };

    fetchLabData();
  }, [user]);

  const filtered = useMemo(() => {
    const dataSource = labResults;
    return dataSource.filter((r) => {
      const q = query.toLowerCase();
      const patientName = (
        r.client?.username ||
        r.client?.name ||
        r.clientName ||
        ""
      ).toLowerCase();
      const testName = (r.testName || r.test || "").toLowerCase();
      const matchesQuery =
        !q ||
        r.id?.toString().toLowerCase().includes(q) ||
        testName.includes(q) ||
        patientName.includes(q);
      return matchesQuery;
    });
  }, [query, labResults]);

  const sparkData = [10, 18, 14, 22, 30, 27, 32, 28];

  const totals = useMemo(() => {
    const totalResults = labResults.length;
    const uniquePatients = new Set(
      labResults.map((r) => r.client?.id || r.clientId || r.client?.username)
    ).size;
    const uniqueDoctors = new Set(
      labResults.map((r) => r.doctor?.id || r.doctorId || r.doctor?.username)
    ).size;
    return { totalResults, uniquePatients, uniqueDoctors };
  }, [labResults]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getFileType = (url) => {
    if (!url) return "unknown";
    const clean = url.split("?")[0];
    const ext = (clean.split(".").pop() || "").toLowerCase();

    // Check extension first
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext))
      return "image";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext))
      return "office";

    // For Cloudinary URLs without extension, check folder/path patterns
    if (url.includes("cloudinary.com") && url.includes("/raw/upload/")) {
      // Assume PDFs are in lab_results folder or similar
      if (url.includes("lab_results") || url.includes("file_")) {
        return "pdf";
      }
    }

    return "unknown";
  };

  const getEffectivePreviewUrl = (url, type) => {
    if (!url) return url;

    let effectiveUrl = url;

    // Handle Cloudinary URLs
    if (url.includes("res.cloudinary.com")) {
      // Convert image/upload to raw/upload for PDFs
      if (type === "pdf" && url.includes("/image/upload/")) {
        effectiveUrl = url.replace("/image/upload/", "/raw/upload/");
      }

      // Append .pdf extension if missing for raw uploads
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

    // Add PDF viewer parameters
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

    // Try to fetch signed URL if resultId is provided
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
        // Fallback to direct URL
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lab data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 hidden md:block">
          <div className="text-2xl font-semibold mb-6">
            {labData?.name || "MedLink Lab"}
          </div>
          <nav className="space-y-2 text-sm">
            <a
              className="flex items-center gap-3 px-3 py-2 rounded bg-indigo-50 text-indigo-600"
              href="/Lab-Dashboard"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 3h14v4H3V3zm0 6h8v8H3V9z" />
              </svg>
              Dashboard
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
              href="/Upload-Report"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2L3 9h4v7h6V9h4l-7-7z" />
              </svg>
              Upload Report
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
              href="/Lab-Settings"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9V9h2v4zm0-6H9V5h2v2z" />
              </svg>
              Settings
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-red-50 hover:text-red-600 w-full text-left mt-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 3h8v2H5v10h6v2H3V3zm10 4l5 5-5 5v-3H7v-4h6V7z" />
              </svg>
              Logout
            </button>
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
                <span className="text-sm">
                  {user?.username || user?.email || "Lab User"}
                </span>
                <div className="w-8 h-8 bg-indigo-600 rounded-full text-white flex items-center justify-center text-sm">
                  {(user?.username || user?.email || "L")[0].toUpperCase()}
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
                    {stats.testsToday}
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
                  <div className="text-xs text-gray-500">All Tests</div>
                  <div className="text-2xl font-semibold">
                    {totals.totalResults}
                  </div>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4h12v2H4V4zm0 4h12v2H4V8zm0 4h12v2H4v-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Unique Patients</div>
                  <div className="text-2xl font-semibold">
                    {totals.uniquePatients}
                  </div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 10a4 4 0 110-8 4 4 0 010 8zm0 2c-3.33 0-6 1.34-6 3v1h12v-1c0-1.66-2.67-3-6-3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Unique Doctors</div>
                  <div className="text-2xl font-semibold">
                    {totals.uniqueDoctors}
                  </div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a4 4 0 110 8 4 4 0 010-8zm0 10c-3.33 0-6 1.34-6 3v1h12v-1c0-1.66-2.67-3-6-3z" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Recent tests */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Lab Results</h2>
                <div className="flex items-center gap-2"></div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="py-2">LT-id</th>
                      <th className="py-2">Patient name</th>
                      <th className="py-2">Test</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, index) => (
                      <tr
                        key={r.id || index}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          const url = r.resultFileUrl || r.fileUrl;
                          if (url) {
                            openPreview(url, r.id, r.filename || r.testName);
                          } else {
                            alert("No file available for this result");
                          }
                        }}
                      >
                        <td className="py-3 text-sm text-gray-700">{`LT-${r.id}`}</td>
                        <td className="py-3">
                          {r.client?.username || r.clientName || "N/A"}
                        </td>
                        <td className="py-3">{r.testName || "N/A"}</td>
                        <td className="py-3 text-gray-500">
                          {r.date || "N/A"}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              className="text-indigo-600 text-sm hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = r.resultFileUrl || r.fileUrl;
                                if (url) {
                                  openPreview(
                                    url,
                                    r.id,
                                    r.filename || r.testName
                                  );
                                } else {
                                  alert("No file available for this result");
                                }
                              }}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-6 text-center text-gray-400"
                        >
                          No lab results found
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
                <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <button
                    className="w-full text-left px-3 py-2 bg-indigo-600 text-white rounded"
                    onClick={() => navigate("/Upload-Report")}
                  >
                    Upload a lab result
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 border border-gray-200 rounded"
                    onClick={() => window.location.reload()}
                  >
                    Refresh lab results
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 border border-gray-200 rounded"
                    onClick={() => navigate("/Lab-Settings")}
                  >
                    Go to lab settings
                  </button>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-100 p-4 shadow-sm">
                <h3 className="text-sm font-medium mb-2">Recent results</h3>
                <div className="space-y-3 text-sm">
                  {(labResults.slice(0, 3) || []).map((r, idx) => (
                    <div
                      key={r.id || idx}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <div className="font-semibold text-gray-800">
                          {r.testName || "Test"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.client?.username ||
                            r.clientName ||
                            "Unknown patient"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.date || "—"}
                      </div>
                    </div>
                  ))}
                  {labResults.length === 0 && (
                    <div className="text-xs text-gray-500">
                      No lab results yet.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
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
