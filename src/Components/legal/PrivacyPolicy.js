import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b] text-white px-6 md:px-20 py-16">
        <motion.h1
          className="text-4xl font-bold text-[#4addbf] mb-10 drop-shadow-[0_0_12px_#4addbf]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          MedLink Privacy Policy
        </motion.h1>

        <div className="bg-[#0F172A]/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_20px_#4addbf30] leading-relaxed space-y-6">

          <section>
            <h2 className="text-xl font-semibold text-[#67e8f9] mb-2">1. Introduction</h2>
            <p className="text-gray-300">
              At MedLink, your privacy is one of our top priorities. This Privacy Policy outlines how we collect, use, store, and protect your personal information when you use our platform, including appointment booking, prescriptions, AI assistance, and location-based healthcare services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#67e8f9] mb-2">2. Information We Collect</h2>
            <ul className="list-disc ml-6 text-gray-300 space-y-1">
              <li>Personal details (name, email, phone number)</li>
              <li>Medical appointment information</li>
              <li>Location data for Geo Search features</li>
              <li>Messages sent to the AI chatbot</li>
              <li>Technical data such as device type and IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#67e8f9] mb-2">3. How We Use Your Information</h2>
            <p className="text-gray-300">MedLink uses your data to:</p>
            <ul className="list-disc ml-6 text-gray-300 space-y-1">
              <li>Book and manage medical appointments</li>
              <li>Provide personalized AI-driven healthcare support</li>
              <li>Improve platform functionality and user experience</li>
              <li>Ensure security and fraud prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#67e8f9] mb-2">4. Data Protection</h2>
            <p className="text-gray-300">
              We implement modern security measures such as encryption, secure authentication, and restricted access to ensure your data is always protected. MedLink never sells your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#67e8f9] mb-2">5. Your Rights</h2>
            <p className="text-gray-300">You have the right to:</p>
            <ul className="list-disc ml-6 text-gray-300 space-y-1">
              <li>Access your personal data</li>
              <li>Request corrections or deletion</li>
              <li>Withdraw consent for processing</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#67e8f9] mb-2">6. Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, feel free to contact MedLink support at:
              <br />
              <span className="text-[#4addbf] font-semibold">support@medlink.com</span>
            </p>
          </section>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
