// DoctorMessages.jsx — Now with MediBot pinned at the top
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Paperclip,
  Send,
  User,
  Users,
  Circle,
} from "lucide-react";

const DoctorMessages = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("patient");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // MediBot — Always pinned at the top
  const mediBot = {
    id: 999,
    name: "MediBot Assistant",
    last: "Hello! How can I assist you today?",
    time: "Now",
    online: true,
    isBot: true,
  };

  const patientChats = [
    { id: 1, name: "John Doe", last: "Thank you doctor!", time: "2:45 PM", online: true },
    { id: 2, name: "Sarah Ali", last: "When is my appointment?", time: "1:10 PM", online: true },
    { id: 3, name: "Mark Chen", last: "I uploaded the reports", time: "Yesterday", online: false },
  ];

  const doctorChats = [
    { id: 4, name: "Dr. Smith", last: "Meeting at 5?", time: "3:20 PM", online: true },
    { id: 5, name: "Dr. Emily", last: "Sharing the case file", time: "Yesterday", online: true },
  ];

  const [messages, setMessages] = useState({
    999: [
      { from: "him", type: "text", content: "Hello Doctor! I'm MediBot, your AI assistant. Ask me anything about patients, schedules, or medical info." },
    ],
    1: [{ from: "them", type: "text", content: "Hello doctor!" }, { from: "me", type: "text", content: "Hello John!" }],
    2: [{ from: "them", type: "text", content: "I need help about my appointment" }],
    3: [{ from: "me", type: "text", content: "Please upload your test results" }],
    4: [{ from: "them", type: "text", content: "Are you free today?" }],
    5: [{ from: "me", type: "text", content: "Sure, send me the file" }],
  });

  const chatList = activeTab === "patient" ? patientChats : doctorChats;
  const fullList = activeTab === "patient" 
    ? [mediBot, ...patientChats] 
    : [mediBot, ...doctorChats]; // MediBot always on top

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  const handleSendMessage = (content, type = "text") => {
    if (!selectedChat || (type === "text" && !content.trim())) return;

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [
        ...(prev[selectedChat.id] || []),
        { from: "me", type, content },
      ],
    }));

    // Auto-reply from MediBot
    if (selectedChat.isBot && type === "text" && content.trim()) {
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [selectedChat.id]: [
            ...(prev[selectedChat.id] || []),
            { from: "him", type: "text", content: "I'm here to help you 24/7, Doctor! This is a demo response from MediBot." },
          ],
        }));
      }, 1200);
    }

    if (type === "text") setMessageInput("");
  };

  


  // Reuse the same recording & file logic from previous version
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = e => e.data.size > 0 && audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        handleSendMessage(URL.createObjectURL(blob), "audio");
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleSendMessage(url, file.type.startsWith("image/") ? "image" : "file");
    }
  };

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-hidden">

      {/* LEFT SIDEBAR */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="w-96 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <button onClick={() => navigate("/doctor-dashboard")} className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
            Messages
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex p-4 gap-3">
          <button
            onClick={() => setActiveTab("patient")}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl font-medium transition-all ${
              activeTab === "patient"
                ? "bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black shadow-xl"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <User size={20} /> Patients
          </button>
          <button
            onClick={() => setActiveTab("doctor")}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl font-medium transition-all ${
              activeTab === "doctor"
                ? "bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black shadow-xl"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <Users size={20} /> Doctors
          </button>
        </div>

        {/* Chat List — MediBot always first */}
        <div className="flex-1 overflow-y-auto">
          {fullList.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center gap-4 p-5 cursor-pointer transition-all hover:bg-white/10 border-l-4 border-transparent ${
                selectedChat?.id === chat.id ? "bg-[#4addbf]/10 border-l-[#4addbf]" : ""
              } ${chat.isBot ? "border-t border-white/10" : ""}`}
            >
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-xl ${
                  chat.isBot
                    ? "bg-gradient-to-br from-purple-500 to-pink-500"
                    : "bg-gradient-to-br from-[#4addbf] to-[#67e8f9]"
                }`}>
                  {chat.isBot ? "M" : chat.name.charAt(0)}
                </div>
                {chat.online && (
                  <Circle className="w-4 h-4 fill-green-400 text-green-400 absolute bottom-0 right-0 border-2 border-[#0f172a] rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg flex items-center gap-2 truncate">
                  {chat.name}
                  {chat.isBot && <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">AI</span>}
                </h3>
                <p className="text-sm text-gray-300 truncate">{chat.last}</p>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* RIGHT CHAT AREA — Same as before */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat ? (
          <>
            <div className="bg-black/50 backdrop-blur-2xl border-b border-white/10 px-8 py-5 flex items-center gap-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-xl ${
                selectedChat.isBot
                  ? "bg-gradient-to-br from-purple-500 to-pink-500"
                  : "bg-gradient-to-br from-[#4addbf] to-[#67e8f9]"
              }`}>
                {selectedChat.isBot ? "M" : selectedChat.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedChat.name}</h2>
                <p className="text-sm text-[#4addbf]">
                  {selectedChat.online ? "Online" : "Offline"}
                  {selectedChat.isBot && " • Always available"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {(messages[selectedChat.id] || []).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  {msg.type === "audio" ? (
                    <audio controls src={msg.content} className="w-72 h-12 rounded-xl my-1" />
                  ) : msg.type === "image" ? (
                    <img src={msg.content} alt="sent" className="max-w-xs rounded-2xl shadow-xl my-1" />
                  ) : msg.from === "me" ? (
                    <div className="max-w-xs md:max-w-lg px-6 py-4 rounded-3xl rounded-br-none bg-gradient-to-r from-[#4addbf] to-[#39c6a5] text-black shadow-xl">
                      <p className="text-base leading-relaxed">{msg.content}</p>
                    </div>
                  ) : selectedChat.isBot ? (
                    <div className="max-w-xs md:max-w-lg px-6 py-4 rounded-3xl rounded-bl-none bg-gradient-to-r from-purple-600/60 to-pink-600/60 border border-purple-400/40 shadow-xl">
                      <p className="text-base leading-relaxed">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="max-w-xs md:max-w-lg px-6 py-4 rounded-3xl rounded-bl-none bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
                      <p className="text-base leading-relaxed">{msg.content}</p>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar — unchanged */}
            <div className="bg-black/50 backdrop-blur-2xl border-t border-white/10 p-6">
              <div className="flex items-center gap-4 max-w-4xl mx-auto">
                <button onClick={() => fileInputRef.current.click()} className="p-3 rounded-full hover:bg-white/20 transition">
                  <Paperclip size={26} className="text-[#67e8f9]" />
                </button>

                <input
                  type="text"
                  placeholder={`Message ${selectedChat.name.split(" ")[0]}...`}
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage(messageInput)}
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                />

                {recording ? (
                  <motion.button
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    onClick={stopRecording}
                    className="p-4 rounded-full bg-red-500/90"
                  >
                    <MicOff size={28} />
                  </motion.button>
                ) : (
                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className="p-4 rounded-full hover:bg-white/20 transition"
                  >
                    <Mic size={28} className="text-[#4addbf]" />
                  </button>
                )}

                <button
                  onClick={() => handleSendMessage(messageInput)}
                  disabled={!messageInput.trim()}
                  className="p-4 rounded-full bg-gradient-to-r from-[#4addbf] to-[#67e8f9] disabled:opacity-40 hover:scale-110 transition shadow-2xl"
                >
                  <Send size={26} className="text-black" />
                </button>

                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileAttach} accept="image/*,.pdf,.doc,.docx" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorMessages;