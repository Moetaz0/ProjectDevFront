import React, { useState, useRef, useEffect } from "react";
import { MdOutlineAccountCircle } from "react-icons/md";
import { GiWorld } from "react-icons/gi";
import { Link } from "react-router-dom";
import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { CiPhone, CiMail } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [searchDropdown, setSearchDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const accountRef = useRef(null);
  const languageRef = useRef(null);
  const searchRef = useRef(null);

  const toggleDropdown = (dropdown) => {
    if (dropdown === "account") {
      setAccountDropdown(!accountDropdown);
      setLanguageDropdown(false);
      setSearchDropdown(false);
    } else if (dropdown === "language") {
      setLanguageDropdown(!languageDropdown);
      setAccountDropdown(false);
      setSearchDropdown(false);
    } else if (dropdown === "search") {
      setSearchDropdown(!searchDropdown);
      setAccountDropdown(false);
      setLanguageDropdown(false);
    }
  };

  const handleModalToggle = () => setIsModalOpen(!isModalOpen);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target) &&
        languageRef.current &&
        !languageRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setAccountDropdown(false);
        setLanguageDropdown(false);
        setSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-[#0a0f1c]/90 backdrop-blur-xl shadow-lg shadow-cyan-500/10 border-b border-cyan-400/10">
      {/* Upper Navbar */}
      <div className="text-sm py-4 pl-40 pr-24 space-x-4 bg-transparent">
        <div className="flex justify-between">
          <div className="flex items-center space-x-4 text-gray-300">
            <div className="flex items-center space-x-2 hover:text-cyan-400 transition-all duration-300">
              <CiMail size={22} />
              <span>contact@Medlink.com</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-cyan-400 transition-all duration-300">
              <CiPhone size={22} />
              <span>+123 456 789</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-cyan-400 transition-all duration-300">
              <IoLocationOutline size={22} />
              <span>Tunis, Tunisia</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-300 pr-8">
            {[FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn].map(
              (Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="hover:text-cyan-400 transform hover:scale-110 transition duration-300"
                >
                  <Icon size={16} />
                </a>
              )
            )}
          </div>
        </div>
      </div>
      <hr className="border-t border-cyan-700/30" />

      {/* Lower Navbar */}
      <div className="fixed top-15 left-0 right-0 bg-[#0a0f1c]/95 z-50 shadow-md">
        <div className="flex justify-between items-center pl-36 pr-32 py-2">
          {/* Logo Section */}
          <a href="/" className="flex items-center space-x-2 group">
            <img
              src="/logo.png"
              alt="Medlink Logo"
              className="h-16 cursor-pointer transform transition-transform group-hover:scale-105 drop-shadow-[0_0_12px_#4addbf70]"
            />
            <div>
              <h1 className="text-cyan-400 text-3xl font-semibold tracking-wide group-hover:text-cyan-300 transition-all">
                Medlink
              </h1>
              <p className="text-gray-400 text-xs">For Better Health</p>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="flex items-center space-x-10">
            {[
              { name: "Home", link: "/" },
              { name: "Search", link: "/map" },
              { name: "Contact us", link: "/contact" },
              { name: "About Medlink", link: "/aboutus" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="text-gray-300 relative group hover:text-cyan-400 transition-all duration-300"
              >
                <span>{item.name}</span>
                <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              </a>
            ))}

            {/* Account Dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => toggleDropdown("account")}
                className="text-gray-300 hover:text-cyan-400 transition-transform transform hover:scale-110"
              >
                <MdOutlineAccountCircle size={26} />
              </button>
              <AnimatePresence>
                {accountDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute right-0 w-40 mt-2 bg-[#121826] border border-cyan-400/20 rounded-lg shadow-xl shadow-cyan-400/10 overflow-hidden"
                  >
                    <a
                      href="/SignIn"
                      className="block px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition-all duration-200"
                    >
                      Login
                    </a>
                    <a
                      href="/SignUp"
                      className="block px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition-all duration-200"
                    >
                      Sign Up
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Dropdown */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => toggleDropdown("language")}
                className="text-gray-300 hover:text-cyan-400 transition-transform transform hover:scale-110"
              >
                <GiWorld size={24} />
              </button>
              <AnimatePresence>
                {languageDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute right-0 w-40 mt-2 bg-[#121826] border border-cyan-400/20 rounded-lg shadow-xl shadow-cyan-400/10 overflow-hidden"
                  >
                    {["English", "Français", "عربى"].map((lang, i) => (
                      // eslint-disable-next-line jsx-a11y/anchor-is-valid
                      <a
                        key={i}
                        href="#"
                        className="block px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition-all duration-200"
                      >
                        {lang}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Modal unchanged, but you can restyle it similarly later */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] text-gray-200 rounded-xl w-96 p-6 shadow-2xl border border-cyan-500/30">
            {/* form */}
            <p className="text-center text-cyan-400 font-semibold mb-2">
              Appointment Form
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
