import React, { useState } from 'react';
import { SiChatbot } from 'react-icons/si';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { IoSend } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);
  const handleSend = () => {
    if (message.trim()) setMessage('');
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-16 bg-[#4addbf] text-white p-3 w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-[#3c9f99] transition-all z-10"
      >
        <SiChatbot size={25} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-24 right-10 w-80 h-[420px] flex flex-col rounded-2xl shadow-[0_0_25px_#4addbf88] bg-[rgba(255,255,255,0.25)] backdrop-blur-md border border-[#4addbf55] text-white overflow-hidden z-20"
            style={{
              background:
                'linear-gradient(145deg, rgba(15,25,25,0.85), rgba(10,30,30,0.75))',
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-[rgba(74,221,191,0.2)] border-b border-[#4addbf55] backdrop-blur-lg">
              <h3 className="font-semibold text-lg tracking-wider text-[#4addbf] drop-shadow-[0_0_6px_#4addbf]">
                Medlink AI Assistant
              </h3>
              <button
                onClick={toggleChat}
                className="text-[#4addbf] hover:text-white hover:drop-shadow-[0_0_8px_#4addbf] transition-all"
              >
                <AiOutlineCloseCircle size={22} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#4addbf80] scrollbar-track-transparent">
              <div className="self-start bg-gradient-to-r from-[#4addbf44] to-[#39c6a544] p-3 rounded-xl border border-[#4addbf66] shadow-[0_0_8px_#4addbf44]">
                <p className="text-sm">
                  <strong className="text-[#4addbf]">Medlink:</strong> Hello 👋, I’m your AI health companion. How can I assist you today?
                </p>
              </div>
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-[#4addbf33] bg-[rgba(255,255,255,0.15)] backdrop-blur-sm flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-grow p-2 px-3 text-sm rounded-xl bg-[rgba(255,255,255,0.2)] text-white border border-[#4addbf66] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-[#4addbf] transition-all"
              />
              <motion.button
                onClick={handleSend}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-[#4addbf] w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#3fc1a3] shadow-[0_0_15px_#4addbf] transition-all"
              >
                <IoSend size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
