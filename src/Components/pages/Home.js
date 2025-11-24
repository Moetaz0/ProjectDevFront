import React, { useState } from "react";
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

const Home = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalToggle = () => setIsModalOpen(!isModalOpen);

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
              Caring for a Smarter Future
            </motion.p>

            <motion.h1
              className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#4addbf] to-[#06b6d4] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              Simplifying Healthcare <br /> Through Innovation
            </motion.h1>

            <motion.p
              className="text-gray-300 mb-8 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Book appointments, manage prescriptions, and connect with AI-powered support — all in one futuristic healthcare platform.
            </motion.p>

            <motion.button
              onClick={handleModalToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#4addbf] text-gray-900 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-[#4addbf]/50 transition-all"
            >
              Take Appointment
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
            What Medlink Offers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { img: geosearch, title: "Geo Search", desc: "Find nearby doctors, labs, and pharmacies instantly." },
              { img: appointment, title: "Online Appointments", desc: "Book and manage consultations in real-time." },
              { img: prescription, title: "Prescriptions", desc: "Access your health records and e-prescriptions anytime." },
              { img: chatbot, title: "AI Chatbot", desc: "Get instant AI-guided support for health inquiries." },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg hover:shadow-[#4addbf]/30 transition-all border border-white/10"
              >
                <img src={item.img} alt={item.title} className="w-32 h-32 mx-auto mb-4 object-contain" />
                <h3 className="text-xl font-semibold text-[#67e8f9] mb-2">{item.title}</h3>
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
            <h2 className="text-4xl font-bold text-[#4addbf] mb-4">About Medlink</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Medlink merges advanced AI and modern healthcare to make patient-doctor interactions effortless. From smart search to real-time AI assistance, our mission is to revolutionize how you access medical care.
            </p>
            <Link
              to="/aboutus"
              className="bg-[#4addbf] text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-[#39c6a5] transition"
            >
              Learn More
            </Link>
          </motion.div>
        </section>

        {/* 💬 Share Your Experience Section */}
<section className="py-24 px-8 md:px-24 bg-[#0F172A] text-white overflow-hidden relative">
  {/* Floating Neon Shapes */}
  <div className="absolute top-[-10%] left-[-5%] w-32 h-32 rounded-full bg-[#4addbf] opacity-20 blur-3xl animate-pulse-slow"></div>
  <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 rounded-full bg-[#39c6a5] opacity-15 blur-3xl animate-pulse-slow"></div>

  <h2 className="text-4xl font-bold text-center text-[#4addbf] mb-12 drop-shadow-[0_0_15px_#4addbf]">
    Share Your Experience
  </h2>

  <div className="flex flex-col md:flex-row gap-12">
    {/* Testimonial Card */}
    <motion.div
      className="bg-[#1e293b]/70 backdrop-blur-md rounded-2xl p-8 w-full md:w-1/2 shadow-[0_0_25px_#4addbf30]"
      whileHover={{ scale: 1.02, boxShadow: "0 0 25px #4addbf" }}
    >
      <p className="text-gray-300 italic mb-6">
        "Medlink transformed my healthcare routine. Booking an appointment now takes seconds!"
      </p>
      <p className="text-[#67e8f9] font-semibold drop-shadow-[0_0_8px_#67e8f9]">
        — Sarah Lee, Patient
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
        placeholder="Your Name"
        value={formData.name}
        onChange={handleInputChange}
        className="w-full p-3 rounded-xl bg-[#0F172A] border border-white/20 text-white placeholder-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                   shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
      />
      <input
        name="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full p-3 rounded-xl bg-[#0F172A] border border-white/20 text-white placeholder-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                   shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
      />
      <textarea
        name="message"
        placeholder="Your Feedback"
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
        Submit Feedback
      </motion.button>
    </motion.form>
  </div>
</section>


        {/* 🧭 Appointment Modal */}
      {/* 🧭 Appointment Modal */}
{isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-[#0F172A]/90 border border-[#4addbf]/40 backdrop-blur-xl rounded-2xl p-8 w-[400px] shadow-[0_0_30px_#4addbf50]"
    >
      <h3 className="text-2xl font-bold text-[#4addbf] mb-6 drop-shadow-[0_0_10px_#4addbf]">
        Book Appointment
      </h3>

      <form className="space-y-4">
        {/* Patient Name */}
        <input
          type="text"
          placeholder="Patient Name"
          className="w-full p-3 bg-[#0F172A] border border-white/20 text-white rounded-xl placeholder-white/60
                     focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                     shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-3 bg-[#0F172A] border border-white/20 text-white rounded-xl placeholder-white/60
                     focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                     shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
        />

        {/* Specialty */}
        <select
          className="w-full p-3 bg-[#0F172A] border border-white/20 text-white rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                     shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
        >
          <option>General Practitioner</option>
          <option>Dentist</option>
          <option>Cardiologist</option>
        </select>

        {/* Date & Time */}
        <div className="flex gap-4">
          <input
            type="date"
            className="flex-1 p-3 bg-[#0F172A] border border-white/20 text-white rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                       shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
          />
          <input
            type="time"
            className="flex-1 p-3 bg-[#0F172A] border border-white/20 text-white rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                       shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
          />
        </div>

        {/* Notes */}
        <textarea
          rows="3"
          placeholder="Notes (Optional)"
          className="w-full p-3 bg-[#0F172A] border border-white/20 text-white rounded-xl placeholder-white/60
                     focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf]
                     shadow-[inset_0_0_10px_#4addbf20] transition-all duration-300"
        ></textarea>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <motion.button
            type="button"
            onClick={handleModalToggle}
            whileHover={{ scale: 1.05 }}
            className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px #4addbf" }}
            className="px-5 py-2 bg-[#4addbf] text-[#0F172A] font-bold rounded-xl hover:bg-[#39c6a5]
                       shadow-[0_0_20px_#4addbf50] transition-all duration-300"
          >
            Confirm
          </motion.button>
        </div>
      </form>
    </motion.div>
  </div>
)}


        <Footer />
      </div>
    </>
  );
};

export default Home;
