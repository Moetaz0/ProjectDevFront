import React, { useContext } from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";
import geosearch from "../../static/story.png";
import chatbot from "../../static/goals.png";
import prescription from "../../static/services.png";
import { LanguageContext } from "../../context/LanguageContext";

const AboutUs = () => {
  const { t } = useContext(LanguageContext);
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-96 md:h-[500px] flex flex-col items-center justify-center text-center bg-[#0F172A] overflow-hidden">
        {/* Subtle Animated Neon Circles */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-[#4addbf] rounded-full opacity-20 blur-2xl"
        />
        <motion.div
          animate={{ scale: [1, 0.95, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#39c6a5] rounded-full opacity-15 blur-2xl"
        />

        <h1 className="relative text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_0_10px_#4addbf]">
          {t("about.hero.title")}
        </h1>
        <p className="relative mt-4 text-lg md:text-xl text-white/70 drop-shadow-[0_0_6px_#4addbf] max-w-2xl">
          {t("about.hero.subtitle")}
        </p>
      </div>

      {/* Main Content */}
      <div className=" bg-[#0F172A] container mx-auto py-12 px-6 lg:px-32 space-y-20 text-white">
        {/* Goals Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-3xl font-bold text-[#4addbf] mb-4 drop-shadow-[0_0_10px_#4addbf]">
              {t("about.goals.title")}
            </h2>
            <p className="text-white/70">{t("about.goals.desc")}</p>
          </div>
          <div className="flex justify-center relative">
            <img
              src={geosearch}
              alt="Our Goals"
              className="w-full max-w-md rounded-xl shadow-[0_0_20px_#4addbf30]"
            />
          </div>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div className="flex justify-center order-2 lg:order-none relative">
            <img
              src={chatbot}
              alt="Our Story"
              className="w-full max-w-md rounded-xl shadow-[0_0_20px_#4addbf20]"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#4addbf] mb-4 drop-shadow-[0_0_10px_#4addbf]">
              {t("about.story.title")}
            </h2>
            <p className="text-white/70">{t("about.story.desc")}</p>
          </div>
        </motion.div>

        {/* Services Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-3xl font-bold text-[#4addbf] mb-4 drop-shadow-[0_0_10px_#4addbf]">
              {t("about.services.title")}
            </h2>
            <p className="text-white/70">{t("about.services.desc")}</p>
          </div>
          <div className="flex justify-center relative">
            <img
              src={prescription}
              alt="Our Services"
              className="w-full max-w-md rounded-xl shadow-[0_0_20px_#4addbf30]"
            />
          </div>
        </motion.div>
      </div>

      <Footer />
    </>
  );
};

export default AboutUs;
