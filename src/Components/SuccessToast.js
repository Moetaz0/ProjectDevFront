import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SuccessToast = ({ message, show, onClose, duration = 3000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (show) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => prev - 1);
      }, duration / 100);

      const timer = setTimeout(onClose, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 bg-[#0f172a] text-white border border-white/10 shadow-2xl rounded-2xl p-4 w-80 z-50 backdrop-blur-xl"
        >
          <div className="flex justify-between items-start">
            <p className="text-lg font-semibold text-[#4addbf]">{message}</p>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
              className="h-full bg-[#4addbf]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessToast;
