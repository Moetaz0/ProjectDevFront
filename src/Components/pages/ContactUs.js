import React, { useContext } from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";
import contact from "../../static/contactus.png";
import { MapContainer, TileLayer } from "react-leaflet";
import { CiPhone, CiMail } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { LanguageContext } from "../../context/LanguageContext";

const ContactUs = () => {
  const { t } = useContext(LanguageContext);
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-96 md:h-[500px] flex flex-col items-center justify-center text-center bg-[#0F172A] overflow-hidden">
        {/* Animated Neon Circles */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[-15%] left-[-10%] w-72 h-72 bg-[#4addbf] rounded-full opacity-30 blur-2xl"
        />
        <motion.div
          animate={{ scale: [1, 0.95, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#39c6a5] rounded-full opacity-25 blur-2xl"
        />
        {/* Hero Text */}
        <h1 className="relative text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_0_10px_#4addbf]">
          {t("contact.hero.title")}
        </h1>
        <p className="relative mt-4 text-lg md:text-xl text-white/70 drop-shadow-[0_0_6px_#4addbf] max-w-2xl">
          {t("contact.hero.subtitle")}
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-[#0F172A] container mx-auto py-12 px-8 lg:px-32 text-white space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Form */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-[#4addbf] mb-6 drop-shadow-[0_0_10px_#4addbf]">
              {t("contact.form.title")}
            </h2>
            <form className="space-y-6">
              <div className="relative">
                <label htmlFor="name" className="block text-white/70 mb-2">
                  {t("contact.form.name")}
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder={t("contact.form.name")}
                  className="w-full bg-white/10 focus:bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-[#4addbf] transition-all duration-300"
                />
              </div>
              <div className="relative">
                <label htmlFor="email" className="block text-white/70 mb-2">
                  {t("contact.form.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={t("contact.form.email")}
                  className="w-full bg-white/10 focus:bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-[#4addbf] transition-all duration-300"
                />
              </div>
              <div className="relative">
                <label htmlFor="message" className="block text-white/70 mb-2">
                  {t("contact.form.message")}
                </label>
                <textarea
                  id="message"
                  rows="4"
                  placeholder={t("contact.form.message")}
                  className="w-full bg-white/10 focus:bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-[#4addbf] transition-all duration-300"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-[#4addbf] hover:bg-[#39c6a5] px-6 py-2 rounded-xl text-white font-semibold shadow-[0_0_20px_#4addbf50] transition-all duration-300"
              >
                {t("contact.form.submit")}
              </button>
            </form>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center relative"
          >
            <img
              src={contact}
              alt="Contact Us"
              className="w-full max-w-md object-cover rounded-xl shadow-[0_0_20px_#4addbf30]"
            />
          </motion.div>
        </div>

        {/* Get in Touch & Map Section */}
        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 space-y-6"
          >
            <h2 className="text-3xl font-bold text-[#4addbf] drop-shadow-[0_0_10px_#4addbf]">
              {t("contact.info.title")}
            </h2>
            <p className="text-white/70">{t("contact.info.desc")}</p>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-center space-x-3">
                <CiPhone size={24} className="text-[#4addbf]" />
                <span>{t("contact.info.phone")}</span>
              </li>
              <li className="flex items-center space-x-3">
                <CiMail size={24} className="text-[#4addbf]" />
                <span>{t("contact.info.email")}</span>
              </li>
              <li className="flex items-center space-x-3">
                <IoLocationOutline size={24} className="text-[#4addbf]" />
                <span>{t("contact.info.location")}</span>
              </li>
            </ul>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 mt-12 lg:mt-0 relative z-0"
          >
            <h3 className="text-2xl font-bold text-[#4addbf] mb-4 drop-shadow-[0_0_10px_#4addbf]">
              {t("contact.map.title")}
            </h3>
            <MapContainer
              center={[51.505, -0.09]}
              zoom={15}
              className="w-full h-64 rounded-xl shadow-[0_0_20px_#4addbf30]"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </MapContainer>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactUs;
