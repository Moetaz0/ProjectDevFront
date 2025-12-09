import React, { useState } from "react";
import login from "../../static/Signup.png";
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiUser, FiUserPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
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
  const [isChecked, setIsChecked] = useState(false);

  const validateFullName = (e) => {
    const value = e.target.value;
    setFullName(value);
    setIsFullNameValid(value.trim().length > 2);
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

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#0F172A] to-[#16223A] relative overflow-hidden">

      {/* Left Section */}
      <div className="w-1/2 flex items-center justify-center z-10">
        <div className="w-[70%] bg-white/10 backdrop-blur-md border border-[#4addbf50] rounded-3xl p-8 shadow-[0_0_20px_#4addbf70] text-white">

          {/* Header */}
          <div className="flex justify-between mb-6">
            <a href="/" className="text-xl text-white hover:text-[#4addbf] transition">
              ←
            </a>
            <p className="text-white text-lg">
              Already a member?{" "}
              <a href="/SignIn" className="text-[#4addbf] hover:text-white hover:underline transition">
                Sign In
              </a>
            </p>
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
              <FiUser className="absolute left-3 top-3 text-white/70 group-focus-within:text-[#4addbf]" />
              <input
                type="text"
                value={fullName}
                onChange={validateFullName}
                placeholder="Full Name"
                className="w-full bg-white/10 focus:bg-white/20 border-b-2 border-white/30 focus:border-[#4addbf] pl-10 py-2 rounded-xl text-white placeholder-white/60 focus:outline-none transition-all duration-300"
              />
              {isFullNameValid && <FiCheckCircle className="absolute right-3 top-3 text-[#4addbf]" />}
            </div>

            {/* Email */}
            <div className="relative group">
              <FiMail className="absolute left-3 top-3 text-white/70 group-focus-within:text-[#4addbf]" />
              <input
                type="email"
                value={email}
                onChange={validateEmail}
                placeholder="Email"
                className="w-full bg-white/10 focus:bg-white/20 border-b-2 border-white/30 focus:border-[#4addbf] pl-10 py-2 rounded-xl text-white placeholder-white/60 focus:outline-none transition-all duration-300"
              />
              {isEmailValid && <FiCheckCircle className="absolute right-3 top-3 text-[#4addbf]" />}
            </div>

            {/* Password */}
            <div className="relative group">
              <FiLock className="absolute left-3 top-3 text-white/70 group-focus-within:text-[#4addbf]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={validatePassword}
                placeholder="Password"
                className="w-full bg-white/10 focus:bg-white/20 border-b-2 border-white/30 focus:border-[#4addbf] pl-10 py-2 rounded-xl text-white placeholder-white/60 focus:outline-none transition-all duration-300"
              />
              {isPasswordValid && <FiCheckCircle className="absolute right-10 top-3 text-[#4addbf]" />}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/70 focus:outline-none"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="relative group">
              <FiLock className="absolute left-3 top-3 text-white/70 group-focus-within:text-[#4addbf]" />
              <input
                type={showRePassword ? "text" : "password"}
                value={rePassword}
                onChange={validateRePassword}
                placeholder="Re-enter Password"
                className="w-full bg-white/10 focus:bg-white/20 border-b-2 border-white/30 focus:border-[#4addbf] pl-10 py-2 rounded-xl text-white placeholder-white/60 focus:outline-none transition-all duration-300"
              />
              {isRePasswordValid && <FiCheckCircle className="absolute right-10 top-3 text-[#4addbf]" />}
              <button
                type="button"
                onClick={() => setShowRePassword(!showRePassword)}
                className="absolute right-3 top-3 text-white/70 focus:outline-none"
              >
                {showRePassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Terms Checkbox */}
           <div className="flex items-center space-x-3">
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={() => setIsChecked(!isChecked)}
      className="sr-only peer"
    />
    <div className="w-6 h-6 bg-white/10 border-2 border-white/30 rounded-lg peer-checked:border-[#4addbf] peer-checked:bg-[#4addbf]/30 transition-all duration-300 flex items-center justify-center shadow-[0_0_10px_#4addbf50]">
      {/* Checkmark */}
      <svg
        className={`w-4 h-4 text-[#4addbf] opacity-0 peer-checked:opacity-100 transition-opacity duration-300`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </label>
                <label htmlFor="agreeCheckbox" className="text-white/80 text-sm"> I agree to the{" "} <a href="/terms" className="text-[#4addbf] underline">Terms of Service</a>,{" "} <a href="/privacy" className="text-[#4addbf] underline">Privacy Policy</a>, and{" "} <a href="/cookies" className="text-[#4addbf] underline">Cookie Policy</a>. </label>

</div>


            {/* Submit */}
            <div className="flex flex-col items-center space-y-4">
              <button
                type="submit"
                className="w-56 bg-[#4addbf] hover:bg-[#39c6a5] py-3 rounded-xl text-white font-semibold flex justify-center items-center space-x-2 shadow-[0_0_30px_#4addbf70] transition-all duration-300"
              >
                <span>Sign Up</span>
                <FiUserPlus className="w-6 h-6" />
              </button>

              <span className="text-white/80">OR</span>

              {/* Social */}
              <div className="flex items-center space-x-4">
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                    alt="Google"
                    className="w-6 h-6"
                  />
                </button>
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300">
                  <img
                    src="https://z-m-static.xx.fbcdn.net/rsrc.php/v4/yD/r/5D8s-GsHJlJ.png"
                    alt="Facebook"
                    className="w-6 h-6"
                  />
                </button>
              </div>
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