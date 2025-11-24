import React, { useState } from "react";
import login from "../../static/login.png";
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { FiLogIn } from "react-icons/fi";
const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#0F172A] to-[#16223A] relative overflow-hidden">
      
      {/* Futuristic Shapes & Neon Glows */}
    
      

      {/* Left Section - Form */}
      <div className="w-1/2 flex items-center justify-center z-10">
        <div className="w-[70%] bg-white/10 backdrop-blur-md border border-[#4addbf50] rounded-3xl p-10 shadow-[0_0_20px_#4addbf70] text-white">
          
          {/* Header */}
          <div className="flex justify-between mb-6">
            <a href="/" className="text-xl text-white hover:text-[#4addbf] transition">
              ←
            </a>
            <p className="text-white text-lg">
              New here?{" "}
              <a href="/SignUp" className="text-[#4addbf] hover:text-white hover:underline transition">
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

          {/* Form */}
          <form className="space-y-8">
            
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
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-white/70 focus:outline-none"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center space-y-4">
              <button
  type="submit"
  className="w-56 bg-[#4addbf] hover:bg-[#39c6a5] py-3 rounded-xl text-white font-semibold flex justify-center items-center space-x-2 shadow-[0_0_30px_#4addbf70] transition-all duration-300"
>
  <span>Sign In</span>
  <FiLogIn className="w-6 h-6" />
</button>
              <span className="text-white/80">OR</span>

              {/* Social Buttons */}
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

              {/* Forgot Password */}
              <p className="text-white/80 text-lg pt-4">
                <a href="/forgetpassword" className="hover:text-[#4addbf] hover:underline transition">
                  Forgot Password?
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      
      <div className="relative w-1/2 h-screen overflow-hidden">
        <motion.img
          src={login}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 "
         
        />
      </div>
    </div>
  );
};

export default SignIn;
