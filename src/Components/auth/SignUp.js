// src/Components/auth/SignUp.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import login from "../../static/Signup.png";
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle,
  FiUser, FiUserPlus, FiCalendar, FiPhone, FiTrendingUp, FiChevronLeft
} from "react-icons/fi";
import { motion } from "framer-motion";

const SignUp = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [isFullNameValid, setIsFullNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isRePasswordValid, setIsRePasswordValid] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);

  const validateFullName = (e) => {
    const v = e.target.value;
    setFullName(v);
    setIsFullNameValid(v.trim().length > 2);
  };

  const validateEmail = (e) => {
    const v = e.target.value;
    setEmail(v);
    setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
  };

  const validatePassword = (e) => {
    const v = e.target.value;
    setPassword(v);
    setIsPasswordValid(v.length >= 6);
  };

  const validateRePassword = (e) => {
    const v = e.target.value;
    setRePassword(v);
    setIsRePasswordValid(v === password && v.length >= 6);
  };

  useEffect(() => {
    const complete = isFullNameValid && isEmailValid && isPasswordValid && isRePasswordValid &&
                     dateOfBirth && gender && height && weight && phone && isChecked;
    setIsFormComplete(complete);
  }, [isFullNameValid, isEmailValid, isPasswordValid, isRePasswordValid, dateOfBirth, gender, height, weight, phone, isChecked]);

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#0F172A] to-[#16223A] relative overflow-hidden">

      {/* Left Form */}
      <div className="w-1/2 flex items-center justify-center z-10">
        <div className="w-[90%] max-h-[95vh] overflow-y-auto bg-white/10 backdrop-blur-md border border-[#4addbf50] rounded-3xl p-10 shadow-[0_0_30px_#4addbf70] text-white">

          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate("/")} className="text-4xl hover:text-[#4addbf] transition">
              <FiChevronLeft />
            </button>
            <div className="text-right">
              <p className="text-white/70 text-sm">Already a member?</p>
              <a href="/SignIn" className="text-[#4addbf] hover:underline text-lg">Sign In</a>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-3">Welcome to <span className="text-[#4addbf]">Medlink</span></h1>
            <p className="text-white/80 text-lg">Step 1 of 4 – Complete Your Profile</p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-4">
              <div className="bg-[#4addbf] h-2 rounded-full w-1/4 transition-all duration-700"></div>
            </div>
          </div>

          <form className="space-y-6">
            {/* Full Name */}
            <div className="relative group">
              <FiUser className="absolute left-4 top-4 text-white/70 group-focus-within:text-[#4addbf]" />
              <input type="text" value={fullName} onChange={validateFullName} placeholder="Full Name"
                className="w-full bg-white/10 border border-white/20 focus:border-[#4addbf] pl-12 pr-12 py-4 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30 transition-all" />
              {isFullNameValid && <FiCheckCircle className="absolute right-4 top-4 text-[#4addbf]" />}
            </div>

            {/* Email */}
            <div className="relative group">
              <FiMail className="absolute left-4 top-4 text-white/70 group-focus-within:text-[#4addbf]" />
              <input type="email" value={email} onChange={validateEmail} placeholder="Email Address"
                className="w-full bg-white/10 border border-white/20 focus:border-[#4addbf] pl-12 pr-12 py-4 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30 transition-all" />
              {isEmailValid && <FiCheckCircle className="absolute right-4 top-4 text-[#4addbf]" />}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <FiLock className="absolute left-4 top-4 text-white/70 group-focus-within:text-[#4addbf]" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={validatePassword} placeholder="Password"
                  className="w-full bg-white/10 border border-white/20 focus:border-[#4addbf] pl-12 pr-12 py-4 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
                  {showPassword ? <FiEyeOff className="text-white/70" /> : <FiEye className="text-white/70" />}
                </button>
                {isPasswordValid && <FiCheckCircle className="absolute right-12 top-4 text-[#4addbf]" />}
              </div>
              <div className="relative group">
                <FiLock className="absolute left-4 top-4 text-white/70 group-focus-within:text-[#4addbf]" />
                <input type={showRePassword ? "text" : "password"} value={rePassword} onChange={validateRePassword} placeholder="Confirm Password"
                  className="w-full bg-white/10 border border-white/20 focus:border-[#4addbf] pl-12 pr-12 py-4 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30" />
                <button type="button" onClick={() => setShowRePassword(!showRePassword)} className="absolute right-4 top-4">
                  {showRePassword ? <FiEyeOff className="text-white/70" /> : <FiEye className="text-white/70" />}
                </button>
                {isRePasswordValid && <FiCheckCircle className="absolute right-12 top-4 text-[#4addbf]" />}
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <FiCalendar className="absolute left-4 top-4 text-white/70" />
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 focus:border-[#4addbf] pl-12 py-4 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30" />
              </div>
              <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full appearance-none bg-white/10 border border-white/20 focus:border-[#4addbf] px-6 py-4 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30 transition-all cursor-pointer"
  >
    <option value="" disabled className="bg-[#0F172A] text-white">
      Gender
    </option>
    <option value="male" className="bg-[#0F172A] text-white">
      Male
    </option>
    <option value="female" className="bg-[#0F172A] text-white">
      Female
    </option>
    <option value="other" className="bg-[#0F172A] text-white">
      Other
    </option>
    <option value="prefer-not" className="bg-[#0F172A] text-white">
      Prefer not to say
    </option>
  </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <FiTrendingUp className="absolute left-4 top-4 text-white/70" />
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height (cm)"
                  className="w-full bg-white/10 border border-white/20 focus:border-[#4addbf] pl-12 py-4 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30" />
              </div>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (kg)"
                className="bg-white/10 border border-white/20 focus:border-[#4addbf] px-6 py-4 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30" />
            </div>

            <div className="relative group">
              <FiPhone className="absolute left-4 top-4 text-white/70" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number"
                className="w-full bg-white/10 border border-white/20 focus:border-[#4addbf] pl-12 py-4 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/30" />
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} className="sr-only peer" />
                <div className="w-6 h-6 bg-white/10 border-2 border-white/30 rounded-lg peer-checked:border-[#4addbf] peer-checked:bg-[#4addbf]/30 transition-all flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#4addbf] opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </label>
              <p className="text-white/80 text-sm leading-tight">
                I agree to the <a href="#" className="text-[#4addbf] underline">Terms</a>, <a href="#" className="text-[#4addbf] underline">Privacy Policy</a>
              </p>
            </div>

            <div className="flex justify-center pt-6">
              <button type="button" onClick={() => isFormComplete && navigate("/SignUp/Step2")} disabled={!isFormComplete}
                className={`w-64 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_#4addbf70] transition-all ${isFormComplete ? "bg-[#4addbf] hover:bg-[#39c6a5] text-black" : "bg-white/10 text-white/50 cursor-not-allowed"}`}>
                Continue to Step 2 <FiUserPlus className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Image */}
      <div className="relative w-1/2 h-screen overflow-hidden">
        <motion.img src={login} alt="Medical" className="absolute inset-0 w-full h-full object-cover opacity-40"
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent" />
      </div>
    </div>
  );
};

export default SignUp;