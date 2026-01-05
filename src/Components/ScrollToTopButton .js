import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 30 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.15, rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 md:bottom-10 md:right-5 bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-3  rounded-full shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all z-40 border-2 border-white/20"
        >
          <FaArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
