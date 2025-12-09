import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import aa from "../../static/home.png";
import geosearch from "../../static/geosearch.png";
import chatbot from "../../static/chatbot.png";
import prescription from "../../static/Prescription.png";
import appointment from "../../static/OnlineAppo.png";
import about from "../../static/logo.png";
import Footer from "../Footer";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import { LanguageContext } from "../../context/LanguageContext";
import AppointmentForm from "../AppointmentForm ";

const Home = () => {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔥 Redirect if user not logged in
  const handleModalToggle = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/signin";
      return;
    }
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-hidden">
        {/* 🩺 Hero Section */}
        <section className="relative h-screen flex items-center justify-between px-12 md:px-32">
          <div className="max-w-2xl z-10">
            <motion.p
              className="text-[#67e8f9] mb-4 font-semibold tracking-wider uppercase"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              {t("home.hero.kicker")}
            </motion.p>

            <motion.h1
              className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#4addbf] to-[#06b6d4] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              {t("home.hero.title")}
            </motion.h1>

            <motion.p
              className="text-gray-300 mb-8 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {t("home.hero.subtitle")}
            </motion.p>

            <motion.button
              onClick={handleModalToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#4addbf] text-gray-900 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-[#4addbf]/50 transition-all"
            >
              {t("home.hero.cta")}
            </motion.button>
          </div>

          <motion.div
            className="hidden md:block relative"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <img
              src={aa}
              alt="Doctor illustration"
              className="w-[600px] h-[600px] object-contain drop-shadow-[0_0_60px_#4addbf80]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4addbf]/10 to-transparent rounded-full blur-3xl"></div>
          </motion.div>
        </section>

        {/* 🌐 Services Section */}
        <section className="py-24 px-8 md:px-24">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#4addbf]">
            {t("home.services.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                img: geosearch,
                title: t("home.services.geo.title"),
                desc: t("home.services.geo.desc"),
              },
              {
                img: appointment,
                title: t("home.services.appointments.title"),
                desc: t("home.services.appointments.desc"),
              },
              {
                img: prescription,
                title: t("home.services.prescriptions.title"),
                desc: t("home.services.prescriptions.desc"),
              },
              {
                img: chatbot,
                title: t("home.services.chatbot.title"),
                desc: t("home.services.chatbot.desc"),
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg hover:shadow-[#4addbf]/30 transition-all border border-white/10"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-32 h-32 mx-auto mb-4 object-contain"
                />
                <h3 className="text-xl font-semibold text-[#67e8f9] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🧬 About Section */}
        <section className="py-24 px-8 md:px-24 flex flex-col md:flex-row items-center gap-12">
          <motion.img
            src={about}
            alt="About"
            className="w-full md:w-1/2 rounded-2xl shadow-lg"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl font-bold text-[#4addbf] mb-4">
              {t("home.about.title")}
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t("home.about.desc")}
            </p>
            <Link
              to="/aboutus"
              className="bg-[#4addbf] text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-[#39c6a5] transition"
            >
              {t("home.about.cta")}
            </Link>
          </motion.div>
        </section>

        {/* 💬 Share Your Experience Section */}
        <section className="py-24 px-8 md:px-24 bg-[#0F172A] text-white overflow-hidden relative">
          {/* Floating Neon Shapes */}
          <div className="absolute top-[-10%] left-[-5%] w-32 h-32 rounded-full bg-[#4addbf] opacity-20 blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 rounded-full bg-[#39c6a5] opacity-15 blur-3xl animate-pulse-slow"></div>

          <h2 className="text-4xl font-bold text-center text-[#4addbf] mb-12 drop-shadow-[0_0_15px_#4addbf]">
            {t("home.share.title")}
          </h2>

          <div className="flex flex-col md:flex-row gap-12">
            {/* Testimonial Card */}
            <motion.div
              className="bg-[#1e293b]/70 backdrop-blur-md rounded-2xl p-8 w-full md:w-1/2 shadow-[0_0_25px_#4addbf30]"
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px #4addbf" }}
            >
              <p className="text-gray-300 italic mb-6">
                {t("home.share.testimonial")}
              </p>
              <p className="text-[#67e8f9] font-semibold drop-shadow-[0_0_8px_#67e8f9]">
                {t("home.share.author")}
              </p>
            </motion.div>

            {/* Feedback Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="bg-[#1e293b]/70 backdrop-blur-md rounded-2xl p-8 w-full md:w-1/2 shadow-[0_0_25px_#4addbf30] space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <input
                name="name"
                placeholder={t("home.share.form.name")}
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl bg-[#0F172A] border border-white/20 text-white placeholder-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                   shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
              />
              <input
                name="email"
                placeholder={t("home.share.form.email")}
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl bg-[#0F172A] border border-white/20 text-white placeholder-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                   shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
              />
              <textarea
                name="message"
                placeholder={t("home.share.form.message")}
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 rounded-xl bg-[#0F172A] border border-white/20 text-white placeholder-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                   shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px #4addbf" }}
                className="w-full bg-[#4addbf] text-[#0F172A] font-bold py-3 rounded-xl hover:bg-[#39c6a5] transition-all duration-300 shadow-[0_0_15px_#4addbf50]"
              >
                {t("home.share.form.submit")}
              </motion.button>
            </motion.form>
          </div>
        </section>

        {/* 🧭 Appointment Modal */}

        {isModalOpen && <AppointmentForm onClose={handleModalToggle} />}

        <Footer />
      </div>
    </>
  );
};

export default Home;
