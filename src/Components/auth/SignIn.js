import React, { useState, useContext, useEffect } from "react";
import loginImg from "../../static/login.png";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiLogIn,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";

const SignIn = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Already logged in → redirect to home
    if (user?.role === "CLIENT") navigate("/");
  }, [user, navigate]);

  const validateEmail = (e) => {
    const value = e.target.value;
    setEmail(value);
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setIsEmailValid(regex.test(value));
  };

  const validatePassword = (e) => {
    const value = e.target.value;
    setPassword(value);
    setIsPasswordValid(value.length >= 6);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEmailValid || !isPasswordValid) return;

    try {
      setLoading(true);
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#0F172A] to-[#16223A] relative overflow-hidden">
      <div className="w-1/2 flex items-center justify-center z-10">
        <div className="w-[70%] bg-white/10 backdrop-blur-md border border-[#4addbf50] rounded-3xl p-10 shadow-[0_0_20px_#4addbf70] text-white">
          <div className="flex justify-between mb-6">
            <a
              href="/"
              className="text-xl text-white hover:text-[#4addbf] transition"
            >
              ←
            </a>
            <p className="text-white text-lg">
              New here?{" "}
              <a
                href="/SignUp"
                className="text-[#4addbf] hover:text-white hover:underline transition"
              >
                Sign Up
              </a>
            </p>
          </div>

          <h1 className="text-5xl font-bold mb-3 mt-10 text-white">
            Sign in to <span className="text-[#4addbf]">Medlink</span>
          </h1>
          <p className="text-white/80 mb-8">
            Welcome back! Access your futuristic health dashboard.
          </p>

          {error && (
            <p className="bg-red-500/20 border border-red-400 text-red-300 px-4 py-2 rounded-xl mb-4">
              {error}
            </p>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
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
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-white/70 focus:outline-none"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <button
                type="submit"
                disabled={!isEmailValid || !isPasswordValid || loading}
                className={`w-56 py-3 rounded-xl text-white font-semibold flex justify-center items-center space-x-2 shadow-[0_0_30px_#4addbf70] transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4addbf] hover:bg-[#39c6a5]"
                }`}
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiLogIn className="w-6 h-6" />
                  </>
                )}
              </button>

              <Link
                to="/forgetpassword"
                className="text-sm text-white/70 hover:text-[#4addbf] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="relative w-1/2 h-screen overflow-hidden">
        <motion.img
          src={loginImg}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      </div>
    </div>
  );
};

export default SignIn;
