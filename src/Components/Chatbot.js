// Chatbot.jsx — with localStorage & WebSocket support
import React, { useState, useRef, useEffect } from "react";
import { SiChatbot } from "react-icons/si";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { IoSend, IoCopyOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);

  const GEMINI_KEY = "AIzaSyCoKscpfQ90xYVdxrKnpOUcbnYk7iYjSHA";
  const WS_URL = "ws://localhost:8080"; // Change to your WebSocket server URL

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to load messages:", e);
        setMessages([
          { role: "assistant", content: "**Hi! I'm your MediLink AI Assistant**\n\nI can help with:\n• Lab results explanation\n• Doctor report drafting\n• Medical questions\n• Patient communication\n\nHow can I assist you today?" }
        ]);
      }
    } else {
      setMessages([
        { role: "assistant", content: "**Hi! I'm your MediLink AI Assistant**\n\nI can help with:\n• Lab results explanation\n• Doctor report drafting\n• Medical questions\n• Patient communication\n\nHow can I assist you today?" }
      ]);
    }

    // Connect to WebSocket (optional)
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket connection handler
  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "chat_message") {
            setMessages(prev => [...prev, data.message]);
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      wsRef.current.onerror = (error) => {
        console.warn("WebSocket error:", error);
        setWsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        setWsConnected(false);
      };
    } catch (e) {
      console.warn("Failed to connect to WebSocket:", e);
    }
  };

  // Send message via WebSocket
  const sendViaWebSocket = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat_message",
        message: message,
        timestamp: new Date().toISOString()
      }));
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setShowConfirm(true);
  };

  const confirmClear = () => {
    setMessages([
      { role: "assistant", content: "**Hi! I'm your MediLink AI Assistant**\n\nI can help with:\n• Lab results explanation\n• Doctor report drafting\n• Medical questions\n• Patient communication\n\nHow can I assist you today?" }
    ]);
    localStorage.removeItem("chatMessages");
    setShowConfirm(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput("");
    setIsTyping(true);

    // Add user message locally
    const newUserMessage = { role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    // Send via WebSocket if connected
    if (wsConnected) {
      sendViaWebSocket(newUserMessage);
    }

    try {
      // First, get available models
      let modelName = null;
      try {
        const modelsResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_KEY}`
        );
        const modelsData = await modelsResponse.json();
        console.log("Available Models:", modelsData);
        
        if (modelsData.models && modelsData.models.length > 0) {
          const supportedModel = modelsData.models.find(m => 
            m.supportedGenerationMethods?.includes('generateContent')
          );
          if (supportedModel) {
            modelName = supportedModel.name.split('/').pop();
            console.log("Using model:", modelName);
          }
        }
      } catch (e) {
        console.warn("Could not fetch models list, falling back to gemini-pro");
        modelName = "gemini-pro";
      }

      if (!modelName) {
        const errorMsg = { role: "assistant", content: "No supported models available. Please check your API key permissions." };
        setMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: "You are MediLink AI, a professional medical assistant for doctors and labs. Be helpful, accurate, and concise." }]
              },
              ...messages.map(m => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }]
              })),
              { role: "user", parts: [{ text: userMessage }] }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024
            }
          })
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      let assistantMessage = null;

      if (!response.ok) {
        console.error("API Error:", data.error || data);
        assistantMessage = { role: "assistant", content: `API Error: ${data.error?.message || "Unknown error"}` };
      } else if (data.candidates && data.candidates.length > 0) {
        const reply = data.candidates[0].content.parts[0].text;
        assistantMessage = { role: "assistant", content: reply };
      } else {
        assistantMessage = { role: "assistant", content: "No response generated. Check your API key or try again." };
      }

      setMessages(prev => [...prev, assistantMessage]);

      // Send assistant response via WebSocket
      if (wsConnected) {
        sendViaWebSocket(assistantMessage);
      }

    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg = { role: "assistant", content: "Network error. Please check your connection." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-[#4addbf] to-[#39c6a5] text-white p-4 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl hover:shadow-[#4addbf]/50 transition-all z-50 border-4 border-white/20"
      >
        {isOpen ? <AiOutlineCloseCircle size={28} /> : <SiChatbot size={28} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-96 h-[550px] bg-gradient-to-br from-[#0f172a]/95 to-[#1e293b]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#4addbf]/30 overflow-hidden z-40 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4addbf]/20 to-[#39c6a5]/20 border-b border-[#4addbf]/40 px-5 py-4 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <SiChatbot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#4addbf] drop-shadow-lg">MediLink AI</h3>
                  <p className="text-xs text-gray-300">
                    Powered by Google Gemini • {wsConnected ? "✓ Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={clearChatHistory}
                  className="text-gray-400 hover:text-white text-xs px-2 py-1 hover:bg-white/10 rounded transition"
                  title="Clear chat history"
                >
                  🗑️
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <AiOutlineCloseCircle size={24} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-[#4addbf]/50 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs px-4 py-3 rounded-2xl ${msg.role === "user"
                    ? "bg-gradient-to-r from-[#4addbf] to-[#39c6a5] text-black shadow-lg"
                    : "bg-white/10 border border-white/20 backdrop-blur-sm"
                    }`}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="text-[#4addbf] font-bold">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc list-inside ml-2 text-sm">{children}</ul>,
                          code: ({ children }) => <code className="bg-black/30 px-2 py-1 rounded text-xs">{children}</code>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm font-medium">{msg.content}</p>
                    )}
                    {msg.role === "assistant" && msg.content && (
                      <button onClick={() => copyMessage(msg.content)} className="mt-2 text-xs opacity-70 hover:opacity-100 flex items-center gap-1">
                        <IoCopyOutline size={14} /> Copy
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <SiChatbot size={18} />
                  </div>
                  <div className="bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-black/30 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-2 focus:ring-[#4addbf]/50 transition-all text-sm"
                  disabled={isTyping}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="bg-gradient-to-r from-[#4addbf] to-[#39c6a5] p-3 rounded-full shadow-lg disabled:opacity-50"
                >
                  <IoSend size={20} className="text-black" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1e293b] border border-[#4addbf]/30 rounded-lg p-6 shadow-2xl max-w-sm"
            >
              <h2 className="text-white font-bold mb-2">Clear Chat History?</h2>
              <p className="text-gray-300 text-sm mb-4">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClear}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;