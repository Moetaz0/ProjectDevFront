import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const FilterDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="relative w-full sm:w-1/4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#4addbf] backdrop-blur-sm shadow-md transition-all"
      >
        {options.find((o) => o.value === value)?.label}
        <FiChevronDown className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute mt-2 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg overflow-hidden z-50"
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="p-3 text-white cursor-pointer hover:bg-[#4addbf]/50 transition-all"
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;
