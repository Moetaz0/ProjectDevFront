// src/Components/auth/Step3.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import login from "../../static/Signup.png";
import { FiChevronLeft, FiChevronRight, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const Step3 = () => {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState("");
  const [surgeries, setSurgeries] = useState("");
  const [canContinue, setCanContinue] = useState(true); // Allow skip

  const commonConditions = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid Disorder", "None of the above"];

  const toggleCondition = (c) => {
    if (c === "None of the above") {
      setConditions(["None of the above"]);
    } else {
      setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev.filter(x => x !== "None of the above"), c]);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#0F172A] to-[#16223A] relative overflow-hidden">
      <div className="w-1/2 flex items-center justify-center z-10">
        <div className="w-[90%] max-h-[95vh] overflow-y-auto bg-white/10 backdrop-blur-md border border-[#4addbf50] rounded-3xl p-10 shadow-[0_0_30px_#4addbf70] text-white">

          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate("/SignUp/Step2")} className="text-4xl hover:text-[#4addbf] transition">
              <FiChevronLeft />
            </button>
            <p className="text-white/70 text-sm">Step 3 of 4</p>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-10">
            <div className="bg-[#4addbf] h-2 rounded-full w-3/4 transition-all duration-700"></div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">Medical <span className="text-[#4addbf]">History</span></h1>
              <p className="text-white/70 text-lg">This helps us give you better care</p>
            </div>

            <div>
              <p className="text-white/80 mb-4 text-lg">Any chronic conditions?</p>
              <div className="grid grid-cols-2 gap-4">
                {commonConditions.map(c => (
                  <button key={c} onClick={() => toggleCondition(c)}
                    className={`py-4 rounded-2xl border transition-all ${conditions.includes(c) ? "bg-[#4addbf] text-black border-[#4addbf]" : "bg-white/10 border-white/20 hover:bg-white/20"}`}>
                    {c} {conditions.includes(c) && <FiCheckCircle className="inline ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <textarea rows="3" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Allergies (e.g. penicillin, nuts...)"
                className="w-full px-6 py-5 rounded-2xl bg-white/10 border border-white/20 focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 text-white placeholder-white/50 resize-none focus:outline-none transition-all" />

              <textarea rows="3" value={surgeries} onChange={(e) => setSurgeries(e.target.value)} placeholder="Previous surgeries or hospitalizations"
                className="w-full px-6 py-5 rounded-2xl bg-white/10 border border-white/20 focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 text-white placeholder-white/50 resize-none focus:outline-none transition-all" />
            </div>

            <div className="flex justify-between pt-8">
              <button onClick={() => navigate("/SignUp/Step2")} className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-3 transition">
                <FiChevronLeft size={24} /> Back
              </button>
              <button onClick={() => navigate("/SignUp/Step4")}
                className="px-10 py-4 rounded-2xl font-bold flex items-center gap-3 bg-[#4addbf] hover:bg-[#39c6a5] text-black transition-all shadow-[0_0_40px_#4addbf70]">
                Continue to Final Step <FiChevronRight size={24} />
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

export default Step3;