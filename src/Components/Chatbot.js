// Chatbot.jsx — with localStorage & WebSocket support
import React, { useState, useRef, useEffect } from "react";
import { SiChatbot } from "react-icons/si";
import { AiOutlineCloseCircle, AiOutlineArrowDown } from "react-icons/ai";
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
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);
  const chatBodyRef = useRef(null);

  const GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8080";
  const ENABLE_WS_STORAGE = process.env.REACT_APP_ENABLE_WS_STORAGE === "true";

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to load messages:", e);
        setMessages([
          {
            role: "assistant",
            content:
              "**Hi! I'm your MediLink AI Assistant**\n\nI can help with:\n• Lab results explanation\n• Doctor report drafting\n• Medical questions\n• Patient communication\n\nHow can I assist you today?",
          },
        ]);
      }
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "**Hi! I'm your MediLink AI Assistant**\n\nI can help with:\n• Lab results explanation\n• Doctor report drafting\n• Medical questions\n• Patient communication\n\nHow can I assist you today?",
        },
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
    const container = chatBodyRef.current;
    const distanceToBottom = container
      ? container.scrollHeight - (container.scrollTop + container.clientHeight)
      : 0;
    if (distanceToBottom < 200) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowScrollDown(true);
    }
  }, [messages]);

  // Track scroll position for scroll-down button
  useEffect(() => {
    const container = chatBodyRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceToBottom =
        container.scrollHeight - (container.scrollTop + container.clientHeight);
      setShowScrollDown(distanceToBottom > 160);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // WebSocket connection handler (optional - app works without it)
  const connectWebSocket = () => {
    // Only attempt WebSocket if explicitly enabled
    if (!ENABLE_WS_STORAGE || !WS_URL || WS_URL === "ws://localhost:8080") {
      return; // Silently skip - use localStorage only
    }

    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log(
          "WebSocket connected - conversations will be stored on server"
        );
        setWsConnected(true);

        // Send existing messages to server on connection
        if (messages.length > 0) {
          wsRef.current.send(
            JSON.stringify({
              type: "sync_messages",
              messages: messages,
              timestamp: new Date().toISOString(),
            })
          );
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "chat_message") {
            setMessages((prev) => [...prev, data.message]);
          } else if (data.type === "sync_ack") {
            console.log("Messages synced to server");
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
        console.log("WebSocket disconnected - using localStorage fallback");
        setWsConnected(false);
      };
    } catch (e) {
      console.warn("WebSocket connection failed:", e.message);
      setWsConnected(false);
    }
  };

  // Send message via WebSocket (server-side storage)
  const sendViaWebSocket = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat_message",
          message: message,
          timestamp: new Date().toISOString(),
        })
      );
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setShowConfirm(true);
  };

  const confirmClear = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "**Hi! I'm your MediLink AI Assistant**\n\nI can help with:\n• Lab results explanation\n• Doctor report drafting\n• Medical questions\n• Patient communication\n\nHow can I assist you today?",
      },
    ]);
    localStorage.removeItem("chatMessages");
    setShowConfirm(false);
  };

  // Close/toggle helper to also dismiss any active modal
  const toggleChat = () => {
    if (showConfirm) setShowConfirm(false);
    setIsOpen((prev) => !prev);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollDown(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Check if API key is available
    if (!GEMINI_KEY) {
      const errorMsg = {
        role: "assistant",
        content:
          "⚠️ API Key Missing!\n\nPlease add your Gemini API key to the `.env` file:\n```\nREACT_APP_GEMINI_API_KEY=your_api_key_here\n```\n\nThen restart the application.",
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMessage = input;
    setInput("");
    setIsTyping(true);

    // Add user message locally
    const newUserMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);

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

        if (!modelsResponse.ok) {
          throw new Error(
            modelsData.error?.message || "Failed to fetch models"
          );
        }

        if (modelsData.models && modelsData.models.length > 0) {
          const supportedModel = modelsData.models.find((m) =>
            m.supportedGenerationMethods?.includes("generateContent")
          );
          if (supportedModel) {
            modelName = supportedModel.name.split("/").pop();
            console.log("Using model:", modelName);
          }
        }
      } catch (e) {
        console.warn("Could not fetch models list:", e.message);
        console.warn("Falling back to gemini-pro");
        modelName = "gemini-pro";
      }

      if (!modelName) {
        const errorMsg = {
          role: "assistant",
          content:
            "❌ No supported models available.\n\nPlease ensure:\n• Your API key is valid\n• Your Gemini API has the necessary permissions\n• Check the browser console for more details",
        };
        setMessages((prev) => [...prev, errorMsg]);
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
                parts: [
                  {
                    text: "You are MediLink AI, a professional medical assistant for doctors and labs. Be helpful, accurate, and concise.",
                  },
                ],
              },
              ...messages.map((m) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
              })),
              { role: "user", parts: [{ text: userMessage }] },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      let assistantMessage = null;

      if (!response.ok) {
        console.error("API Error:", data.error || data);
        assistantMessage = {
          role: "assistant",
          content: `❌ API Error: ${data.error?.message || "Unknown error"}`,
        };
      } else if (data.candidates && data.candidates.length > 0) {
        const reply = data.candidates[0].content.parts[0].text;
        assistantMessage = { role: "assistant", content: reply };
      } else {
        assistantMessage = {
          role: "assistant",
          content: "No response generated. Please try again.",
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);

      // Send assistant response via WebSocket
      if (wsConnected) {
        sendViaWebSocket(assistantMessage);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg = {
        role: "assistant",
        content: `🔌 Network error: ${error.message}\n\nPlease check your connection and try again.`,
      };
      setMessages((prev) => [...prev, errorMsg]);
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
        onClick={toggleChat}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-6  md:bottom-10 md:right-20 bg-gradient-to-br from-cyan-500 via-cyan-400 to-blue-500 text-white p-3  flex items-center justify-center rounded-full shadow-2xl hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all z-[9999] border-2 border-white/30"
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
            className="fixed bottom-28 right-8 w-96 h-[550px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-2xl rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden z-[9998] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600/15 to-blue-600/15 border-b border-cyan-500/40 px-5 py-4 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center animate-pulse shadow-lg shadow-cyan-500/50">
                  <SiChatbot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-cyan-300 drop-shadow-lg text-lg">
                    MediLink AI
                  </h3>
                  <p className="text-xs text-gray-300 font-medium">
                    Medical Assistant •{" "}
                    {wsConnected ? "✓ Sync Online" : "📱 App Mode"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearChatHistory}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-cyan-300 text-lg hover:bg-white/10 rounded-full transition duration-200"
                  title="Clear chat history"
                  type="button"
                >
                  🗑️
                </button>
                <button
                  onClick={() => {
                    if (showConfirm) setShowConfirm(false);
                    setIsOpen(false);
                  }}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-cyan-300 hover:bg-white/10 rounded-full transition duration-200"
                  type="button"
                >
                  <AiOutlineCloseCircle size={24} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatBodyRef}
              className="relative flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-5 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 font-medium"
                        : "bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-cyan-500/30 backdrop-blur-sm text-gray-100"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="text-sm leading-relaxed">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="text-cyan-300 font-bold">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside ml-2 text-sm">
                              {children}
                            </ul>
                          ),
                          code: ({ children }) => (
                            <code className="bg-black/40 px-2 py-1 rounded text-xs font-mono text-cyan-300">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm font-medium">{msg.content}</p>
                    )}
                    {msg.role === "assistant" && msg.content && (
                      <button
                        onClick={() => copyMessage(msg.content)}
                        className="mt-2 text-xs opacity-70 hover:opacity-100 flex items-center gap-1 text-cyan-300 hover:text-cyan-200 transition"
                      >
                        <IoCopyOutline size={14} /> Copy
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                    <SiChatbot size={18} className="text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-cyan-500/30 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />

              {showScrollDown && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 bg-cyan-500 text-white p-2 rounded-full shadow-lg shadow-cyan-500/40 border border-white/20"
                  aria-label="Scroll to latest message"
                >
                  <AiOutlineArrowDown size={18} />
                </motion.button>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-gradient-to-t from-slate-900/80 to-transparent border-t border-cyan-500/20">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  placeholder="Ask me anything..."
                  className="flex-1 px-5 py-3 rounded-full bg-gray-700/40 border border-cyan-500/30 placeholder-gray-400 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm hover:border-cyan-500/50"
                  disabled={isTyping}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="bg-gradient-to-br from-cyan-500 to-blue-500 p-3 rounded-full shadow-lg shadow-cyan-500/40 disabled:opacity-50 disabled:shadow-none transition-all hover:shadow-cyan-500/60"
                >
                  <IoSend size={20} className="text-white" />
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
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9997] backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/40 rounded-xl p-6 shadow-2xl shadow-cyan-500/20 max-w-sm"
            >
              <h2 className="text-white font-bold mb-2 text-lg">
                Clear Chat History?
              </h2>
              <p className="text-gray-300 text-sm mb-6">
                This action cannot be undone. All messages will be permanently
                deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClear}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200 font-medium"
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
