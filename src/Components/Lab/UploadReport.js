// UploadReport.jsx — FINAL: No double arrows EVER
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
} from "lucide-react";

const UploadReport = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-y-auto">
      {/* HEADER */}
      <header className="bg-black/50 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/lab-dashboard")}
              className="p-3 rounded-full hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={28} />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
              Upload Report
            </h1>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto space-y-12 mt-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-5xl font-bold mb-3">Send Lab Report to Doctor</h2>
          <p className="text-gray-300 text-lg">Fill in patient details and upload the test report securely</p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Patient & Doctor */}
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2"><User size={18} /> Patient Name</label>
              <input type="text" placeholder="Enter full name" className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all" />
            </div>
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2"><Stethoscope size={18} /> Doctor Name</label>
              <input type="text" placeholder="e.g. Dr. Henry" className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all" />
            </div>

            {/* TEST TYPE — BULLETPROOF DROPDOWN */}
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2"><FileText size={18} /> Test Type</label>
              <div className="relative">
                <select className="w-full h-[56px] px-6 pr-12 rounded-2xl bg-[#1e293b] border border-white/20 text-white text-base font-medium focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all cursor-pointer select-none">
                  <option>CBC + ESR</option>
                  <option>Lipid Profile</option>
                  <option>Thyroid Function Test</option>
                  <option>X-Ray Chest</option>
                  <option>Urine Analysis</option>
                  <option>Liver Function Test</option>
                  <option>Glucose Test</option>
                </select>
                {/* Custom arrow */}
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* URGENCY — BULLETPROOF DROPDOWN */}
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2"><AlertCircle size={18} /> Urgency Level</label>
              <div className="relative">
                <select className="w-full h-[56px] px-6 pr-12 rounded-2xl bg-[#1e293b] border border-white/20 text-white text-base font-medium focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all cursor-pointer select-none">
                  <option>Normal</option>
                  <option>Urgent</option>
                  <option>Critical</option>
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* FILE UPLOAD */}
          <div className="mt-12">
            <label className="text-gray-300 font-medium flex items-center gap-2 mb-6"><Upload size={22} /> Upload Report (PDF or Image)</label>
            <motion.div whileHover={{ scale: 1.02 }} className="border-2 border-dashed border-white/20 rounded-3xl p-16 text-center hover:border-[#4addbf] hover:bg-white/5 transition-all cursor-pointer">
              <Upload size={80} className="mx-auto text-[#67e8f9] mb-6 opacity-70" />
              <p className="text-xl font-medium">Drag & drop files here</p>
              <p className="text-gray-400 mt-2">or click to browse</p>
              <p className="text-sm text-gray-500 mt-4">Supports PDF, JPG, PNG • Max 10MB</p>
            </motion.div>
          </div>

          {/* BUTTONS */}
          <div className="mt-12 flex justify-end gap-6">
            <button onClick={() => navigate("/lab-dashboard")} className="px-10 py-5 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all font-medium">
              Cancel
            </button>
            <button className="px-12 py-5 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
              <Upload size={26} /> Send Report
            </button>
          </div>
        </motion.section>
      </div>

      {/* CRITICAL CSS — Add this to your index.css or App.css */}
      <style jsx>{`
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        select::-ms-expand {
          display: none;
        }
        /* Force hide native arrow on all browsers */
        select {
          background-image: none !important;
        }
      `}</style>
    </div>
  );
};

export default UploadReport;