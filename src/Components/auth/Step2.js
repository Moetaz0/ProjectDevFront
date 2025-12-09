// src/Components/auth/Step2.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import login from "../../static/Signup.png";
import { FiChevronLeft, FiChevronRight, FiMeh, FiFrown, FiSmile, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const Step2 = () => {
  const navigate = useNavigate();
  const [mainConcern, setMainConcern] = useState("");
  const [whenStarted, setWhenStarted] = useState("");
  const [severity, setSeverity] = useState(5);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(mainConcern.trim().length > 10);
  }, [mainConcern]);

  const getSliderStyle = () => {
    const percent = (severity - 1) * 11.11;
    return { background: `linear-gradient(to right, #ef4444 0%, #f59e0b ${percent}%, #4addbf ${percent}%, #4addbf 100%)` };
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#0F172A] to-[#16223A] relative overflow-hidden">
      <div className="w-1/2 flex items-center justify-center z-10">
        <div className="w-[90%] max-h-[95vh] overflow-y-auto bg-white/10 backdrop-blur-md border border-[#4addbf50] rounded-3xl p-10 shadow-[0_0_30px_#4addbf70] text-white">

          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate("/SignUp")} className="text-4xl hover:text-[#4addbf] transition">
              <FiChevronLeft />
            </button>
            <p className="text-white/70 text-sm">Step 2 of 4</p>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-10">
            <div className="bg-[#4addbf] h-2 rounded-full w-1/2 transition-all duration-700"></div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-10">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">What's Bothering You <span className="text-[#4addbf]">Today?</span></h1>
              <p className="text-white/70 text-lg">Tell us how you're feeling — be as specific as you can</p>
            </div>

            <div className="relative group">
              <textarea rows="5" value={mainConcern} onChange={(e) => setMainConcern(e.target.value)}
                placeholder="e.g. I have a sharp headache on the right side..." 
                className="w-full px-6 py-5 rounded-2xl bg-white/10 border border-white/20 focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 text-white placeholder-white/50 resize-none focus:outline-none transition-all" />
              {mainConcern && <FiCheckCircle size={28} className="absolute right-4 top-4 text-[#4addbf]" />}
            </div>

            <div>
              <p className="text-white/80 mb-3 text-lg">When did it start?</p>
              <div className="grid grid-cols-2 gap-4">
                {["Today", "Yesterday", "2–3 days ago", "This week", "Last week", "More than a week"].map((opt) => (
                  <button key={opt} type="button" onClick={() => setWhenStarted(opt)}
                    className={`py-4 rounded-2xl border transition-all ${whenStarted === opt ? "bg-[#4addbf] text-black border-[#4addbf] shadow-lg" : "bg-white/10 border-white/20 hover:bg-white/20"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-white/80 text-lg">How severe is it right now?</p>
              <div className="flex justify-between px-2">
                <FiFrown size={32} className="text-red-400" />
                <FiMeh size={36} className="text-yellow-400" />
                <FiSmile size={40} className="text-green-400" />
              </div>
              <input type="range" min="1" max="10" value={severity} onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#4addbf]" style={getSliderStyle()} />
              <div className="flex justify-between text-sm text-white/70">
                <span>1 - Barely noticeable</span>
                <span className="text-2xl font-bold text-[#4addbf]">{severity}/10</span>
                <span>10 - Worst imaginable</span>
              </div>
            </div>

            <div className="flex justify-between pt-8">
              <button onClick={() => navigate("/SignUp")} className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-3 transition">
                <FiChevronLeft size={24} /> Back
              </button>
              <button onClick={() => navigate("/SignUp/Step3")} disabled={!canContinue}
                className={`px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-[0_0_40px_#4addbf70] ${canContinue ? "bg-[#4addbf] hover:bg-[#39c6a5] text-black" : "bg-white/10 text-white/40 cursor-not-allowed"}`}>
                Continue to Step 3 <FiChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative w-1/2 h-screen overflow-hidden">
        <motion.img src={login} alt="Medical" className="absolute inset-0 w-full h-full object-cover opacity-40"
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent" />
      </div>
    </div>
  );
};

export default Step2;