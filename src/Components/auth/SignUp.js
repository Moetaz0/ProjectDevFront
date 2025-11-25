import React, { useState, useContext } from "react";
import login from "../../static/Signup.png";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isFullNameValid, setIsFullNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isRePasswordValid, setIsRePasswordValid] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  const validateUsername = (e) => {
    const value = e.target.value;
    setUsername(value);
    setIsFullNameValid(value.trim().length > 2);
  };

  const validateEmail = (e) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(emailRegex.test(value));
  };

  const validatePassword = (e) => {
    const value = e.target.value;
    setPassword(value);
    setIsPasswordValid(value.length >= 6);
  };

  const validateRePassword = (e) => {
    const value = e.target.value;
    setRePassword(value);
    setIsRePasswordValid(value === password && value.length >= 6);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Trim inputs
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedRePassword = rePassword.trim();

    // Basic validation
    if (
      !trimmedUsername ||
      !trimmedEmail ||
      !trimmedPassword ||
      !trimmedRePassword
    ) {
      setError("All fields are required.");
      return;
    }

    if (
      !isFullNameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isRePasswordValid
    ) {
      setError("Please complete the form correctly.");
      return;
    }

    if (!isChecked) {
      setError("You must agree to the terms.");
      return;
    }
    console.log("Password entered:", trimmedPassword);

    try {
      // Call register function with trimmed values
      const user = await register(
        trimmedUsername,
        trimmedEmail,
        trimmedPassword
      );

      // Redirect based on role
      if (user.role === "CLIENT") {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.error || "Registration failed");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#0F172A] to-[#16223A] relative overflow-hidden">
      {/* Left Section */}
      <div className="w-1/2 flex items-center justify-center z-10">
        <div className="w-[70%] bg-white/10 backdrop-blur-md border border-[#4addbf50] rounded-3xl p-8 shadow-[0_0_20px_#4addbf70] text-white">
          {/* Header */}
          <div className="flex justify-between mb-6">
            <a
              href="/"
              className="text-xl text-white hover:text-[#4addbf] transition"
            >
              ←
            </a>
            <p className="text-white text-lg">
              Already a member?{" "}
              <a
                href="/SignIn"
                className="text-[#4addbf] hover:text-white hover:underline transition"
              >
                Sign In
              </a>
            </p>
          </div>

          <h1 className="text-5xl font-bold mb-3 mt-10 text-white">
            Sign up to <span className="text-[#4addbf]">Medlink</span>
          </h1>
          <p className="text-white/80 mb-8">
            Welcome! Create your Medlink health account.
          </p>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="relative group">
              <FiUser className="absolute left-3 top-3 text-white/70 group-focus-within:text-[#4addbf]" />
              <input
                type="text"
                value={username}
                onChange={validateUsername}
                placeholder="Username"
                className="w-full bg-white/10 focus:bg-white/20 border-b-2 border-white/30 focus:border-[#4addbf] pl-10 py-2 rounded-xl text-white placeholder-white/60 focus:outline-none transition-all duration-300"
              />
              {isFullNameValid && (
                <FiCheckCircle className="absolute right-3 top-3 text-[#4addbf]" />
              )}
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
              {isEmailValid && (
                <FiCheckCircle className="absolute right-3 top-3 text-[#4addbf]" />
              )}
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
              {isPasswordValid && (
                <FiCheckCircle className="absolute right-10 top-3 text-[#4addbf]" />
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/70 focus:outline-none"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Re-enter Password */}
            <div className="relative group">
              <FiLock className="absolute left-3 top-3 text-white/70 group-focus-within:text-[#4addbf]" />
              <input
                type={showRePassword ? "text" : "password"}
                value={rePassword}
                onChange={validateRePassword}
                placeholder="Re-enter Password"
                className="w-full bg-white/10 focus:bg-white/20 border-b-2 border-white/30 focus:border-[#4addbf] pl-10 py-2 rounded-xl text-white placeholder-white/60 focus:outline-none transition-all duration-300"
              />
              {isRePasswordValid && (
                <FiCheckCircle className="absolute right-10 top-3 text-[#4addbf]" />
              )}
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
                  <svg
                    className={`w-4 h-4 text-[#4addbf] opacity-0 peer-checked:opacity-100 transition-opacity duration-300`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </label>
              <label className="text-white/80 text-sm">
                I agree to the{" "}
                <a href="/terms" className="text-[#4addbf] underline">
                  Terms of Service
                </a>
                ,{" "}
                <a href="/privacy" className="text-[#4addbf] underline">
                  Privacy Policy
                </a>
                , and{" "}
                <a href="/cookies" className="text-[#4addbf] underline">
                  Cookie Policy
                </a>
                .
              </label>
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
            </div>
          </form>
        </div>
      </div>

      {/* Right Section */}
      <div className="relative w-1/2 h-screen overflow-hidden">
        <motion.img
          src={login}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      </div>
    </div>
  );
};

export default SignUp;
