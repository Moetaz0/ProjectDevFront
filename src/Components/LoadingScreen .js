import React from "react";
import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0F172A] text-white">
      <motion.img
        src="/logo.png"
        alt="CareX Logo"
        className="h-28 drop-shadow-[0_0_30px_#4addbf]"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="flex space-x-4 mt-6">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-3 w-3 bg-[#4addbf] rounded-full shadow-[0_0_15px_#4addbf]"
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
     
    </div>
  );
};

export default LoadingScreen;
