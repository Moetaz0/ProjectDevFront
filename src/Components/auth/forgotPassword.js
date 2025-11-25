import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import login from "../../static/Forgot password.png";
import { FiMail, FiCheckCircle } from "react-icons/fi";
import Swal from "sweetalert2";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const codeRefs = useRef([]);

  const validateEmail = (e) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(emailRegex.test(value));
  };

  // Send reset code
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address!",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Code Sent!",
          text:
            data.message || "A verification code has been sent to your email.",
        });
        setShowCodeModal(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to send verification code.",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "An error occurred. Please try again.",
      });
    }
  };

  // Handle 6-digit code input
  const handleCodeChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      codeRefs.current[index + 1].focus();
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Code",
        text: "Please enter all 6 digits.",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/verifycode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Code Verified",
          text: "You can now reset your password.",
        });
        setShowCodeModal(false);
        setShowResetPassword(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid Code",
          text: data.error || "The verification code is incorrect.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error verifying code.",
      });
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!newPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing Password",
        text: "Please enter your new password.",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword, code: code.join("") }),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Password Reset Successful!",
          text: "Redirecting to Sign In...",
          confirmButtonColor: "#4addbf",
        }).then(() => {
          window.location.href = "/Signin";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text: data.error || "Could not reset password.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error resetting password.",
      });
    }
  };

  return (
    <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden">
      {/* Left Section */}
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

          {!showResetPassword && (
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
          )}

          {/* Reset password input */}
          {showResetPassword && (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#1e293b] border border-white/20 text-white placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf] shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleResetPassword}
                className="w-full bg-[#4addbf] text-[#0F172A] font-bold py-3 rounded-xl hover:bg-[#39c6a5] transition-all duration-300 shadow-[0_0_15px_#4addbf50]"
              >
                Reset Password
              </motion.button>
            </div>
          )}

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

      {/* Right Section */}
      <div className="w-1/2 relative overflow-hidden">
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

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#0F172A] p-8 rounded-2xl w-[400px] shadow-lg text-center space-y-4">
            <h2 className="text-2xl font-bold text-[#4addbf] mb-2">
              Enter 6-digit Code
            </h2>
            <div className="flex justify-between space-x-2">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (codeRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(e, idx)}
                  className="w-12 h-12 text-center rounded-lg bg-[#1e293b] border border-white/20 text-white text-xl focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleVerifyCode}
              className="mt-4 w-full bg-[#4addbf] text-[#0F172A] font-bold py-3 rounded-xl hover:bg-[#39c6a5] transition-all duration-300 shadow-[0_0_15px_#4addbf50]"
            >
              Verify Code
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgetPassword;
