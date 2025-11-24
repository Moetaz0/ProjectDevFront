import React, { useState } from "react";
import { motion } from "framer-motion";
import login from "../../static/Forgot password.png";
import { FiMail, FiCheckCircle } from "react-icons/fi";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  const validateEmail = (e) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(emailRegex.test(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reset Email Submitted:", email);
  };

  return (
    <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden">
      {/* Left Section - Form */}
      <div className="w-1/2 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-[70%] space-y-6"
        >
          <h1 className="text-5xl font-bold mb-3 text-[#4addbf] drop-shadow-[0_0_15px_#4addbf]">
            Forgot Password?
          </h1>
          <p className="text-gray-300 mb-5">
            Enter your email and we will help you reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <FiMail className="absolute left-3 top-4 text-gray-400 group-focus-within:text-[#4addbf] transition-colors" />
              <input
                type="email"
                value={email}
                onChange={validateEmail}
                placeholder="Email"
                className="w-full p-3 pl-10 rounded-xl bg-[#1e293b] border border-white/20 text-white placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf] shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
              />
              {isEmailValid && (
                <FiCheckCircle className="absolute right-3 top-3 text-[#4addbf]" />
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              type="submit"
              className="w-full bg-[#4addbf] text-[#0F172A] font-bold py-3 rounded-xl hover:bg-[#39c6a5] transition-all duration-300 shadow-[0_0_15px_#4addbf50]"
            >
              Send Reset Link
            </motion.button>
          </form>

          <p className="text-gray-400 pt-4">
            <a
              href="/Signin"
              className="hover:text-[#67e8f9] hover:underline transition-colors"
            >
              Return to Sign In
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right Section - Image + Neon Shapes */}
      <div className="w-1/2 relative overflow-hidden">
        {/* Neon Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#4addbf] rounded-full opacity-30 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#39c6a5] rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>

        <motion.img
          src={login}
          alt="Forget Password Illustration"
          className="w-full h-full object-cover rounded-l-3xl shadow-[0_0_40px_#4addbf50]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
};

export default ForgetPassword;
