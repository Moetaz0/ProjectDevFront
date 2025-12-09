import React, { useState, useRef, useEffect, useContext } from "react";
import { MdOutlineAccountCircle } from "react-icons/md";
import { GiWorld } from "react-icons/gi";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { CiPhone, CiMail } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import profileImage from "../static/profile.png";
import { LanguageContext } from "../context/LanguageContext";

const Navbar = () => {
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const accountRef = useRef(null);
  const languageRef = useRef(null);

  const { user, logout } = useContext(AuthContext);
  const { language, updateLanguage, t } = useContext(LanguageContext);

  const toggleAccountDropdown = () => {
    setAccountDropdown(!accountDropdown);
    setLanguageDropdown(false);
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdown(!languageDropdown);
    setAccountDropdown(false);
  };
  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);
  const getAvatar = () => profileImage; // always default

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target) &&
        languageRef.current &&
        !languageRef.current.contains(event.target)
      ) {
        setAccountDropdown(false);
        setLanguageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-[#0a0f1c]/90 backdrop-blur-xl shadow-lg border-b border-cyan-400/10">
      {/* TOP BAR */}
      <div className="text-sm py-4 pl-40 pr-24">
        <div className="flex justify-between">
          <div className="flex items-center space-x-4 text-gray-300">
            <div className="flex items-center space-x-2 hover:text-cyan-400">
              <CiMail size={22} />
              <span>{t("nav.contactEmail")}</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-cyan-400">
              <CiPhone size={22} />
              <span>{t("nav.phone")}</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-cyan-400">
              <IoLocationOutline size={22} />
              <span>{t("nav.location")}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-300">
            {[FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn].map(
              (Icon, i) => (
                <a key={i} className="hover:text-cyan-400" href="#!">
                  <Icon size={16} />
                </a>
              )
            )}
          </div>
        </div>
      </div>

      <hr className="border-cyan-700/30" />

      {/* LOWER NAV */}
      <div className="flex justify-between items-center pl-36 pr-32 py-3">
        <a href="/" className="flex items-center space-x-2">
          <img
            src="/logo.png"
            className="h-16 drop-shadow-[0_0_12px_#4addbf70]"
            alt="logo"
          />
          <div>
            <h1 className="text-cyan-400 text-3xl font-semibold">Medlink</h1>
            <p className="text-gray-400 text-xs">{t("nav.brand.tagline")}</p>
          </div>
        </a>

        {/* LINKS */}
        <div className="flex items-center space-x-10">
          {[
            { label: t("nav.link.home"), href: "/" },
            { label: t("nav.link.search"), href: "/map" },
            { label: t("nav.link.contact"), href: "/contact" },
            { label: t("nav.link.about"), href: "/aboutus" },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="text-gray-300 hover:text-cyan-400 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-cyan-400 transition-all group-hover:w-full group-hover:left-0"></span>
            </a>
          ))}

          {/* ACCOUNT */}
          <div className="relative" ref={accountRef}>
            <button onClick={toggleAccountDropdown}>
              {user ? (
                <img
                  src={getAvatar()}
                  className="h-9 w-9 rounded-full border border-cyan-400/40 shadow"
                  alt="avatar"
                />
              ) : (
                <MdOutlineAccountCircle size={26} className="text-gray-300" />
              )}
            </button>

            <AnimatePresence>
              {accountDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-[#121826] border border-cyan-400/20 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  {user ? (
                    <>
                      {[
                        {
                          label: t("nav.menu.history"),
                          link: "/medical-history",
                        },
                        {
                          label: t("nav.menu.prescriptions"),
                          link: "/prescriptions",
                        },
                        { label: t("nav.menu.messages"), link: "/messages" },
                        { label: t("nav.menu.settings"), link: "/settings" },
                      ].map((item, i) => (
                        <a
                          key={i}
                          href={item.link}
                          className="block px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition"
                        >
                          {item.label}
                        </a>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          window.location.href = "/";
                        }}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20 transition"
                      >
                        {t("nav.menu.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href="/signin"
                        className="block px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition"
                      >
                        {t("nav.menu.login")}
                      </a>
                      <a
                        href="/signup"
                        className="block px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition"
                      >
                        {t("nav.menu.signup")}
                      </a>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LANGUAGE */}
          {user ? (
            // 🔔 NOTIFICATION ICON
            <div className="relative">
              <button className="text-gray-300 hover:text-cyan-400">
                <span className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0"
                    />
                  </svg>

                  {/* Red notification badge */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1.5 rounded-full">
                    3
                  </span>
                </span>
              </button>
            </div>
          ) : (
            // 🌍 LANGUAGE MENU
            <div className="relative" ref={languageRef}>
              <button
                onClick={toggleLanguageDropdown}
                className="text-gray-300 hover:text-cyan-400"
              >
                <GiWorld size={24} />
              </button>

              <AnimatePresence>
                {languageDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-40 bg-[#121826] border border-cyan-400/20 rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    {[
                      { code: "en", label: "English" },
                      { code: "fr", label: "Français" },
                      { code: "ar", label: "عربى" },
                      { code: "es", label: "Español" },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          updateLanguage(lang.code);
                          setLanguageDropdown(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition ${
                          language === lang.code ? "bg-cyan-500/10" : ""
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
