import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";
import { Mic, MicOff, Paperclip, Send, Circle } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getUserFromToken } from "../../utils/jwt";

const Messages = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const userId = getUserFromToken()?.userId;
  console.log("Current User ID:", userId);

  /** Fetch contacts */
  useEffect(() => {
    fetch(`http://localhost:8000/api/chats/${userId}/contacts`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched contacts:", data);
        const contacts = [
          {
            id: 0,
            name: "MediBot Assistant",
            specialty: "AI Health Assistant",
            isBot: true,
            online: true,
          },
          ...(Array.isArray(data) ? data : []),
        ];
        setUsers(contacts);
        setSelectedUser(contacts[0]);
      })
      .catch((err) => console.error("Failed to fetch contacts:", err));
  }, [userId]);

  /** Fetch conversation when selectedUser changes */
  useEffect(() => {
    if (!selectedUser || selectedUser.isBot) return;

    fetch(`http://localhost:8000/api/chats/${userId}/with/${selectedUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => ({
          ...prev,
          [selectedUser.id]: data.map((m) => ({
            from: m.senderId.toString() === userId ? "me" : "him",
            ...m,
          })),
        }));
      })
      .catch((err) => console.error("Failed to fetch conversation:", err));
  }, [selectedUser, userId]);

  /** WebSocket connection */
  useEffect(() => {
    const socket = new SockJS("http://localhost:8000/chat");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log("STOMP:", msg),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("STOMP connected!");
      stompClientRef.current = client;

      client.subscribe(`/user/${userId}/queue/messages`, (msg) => {
        try {
          const message = JSON.parse(msg.body);
          setMessages((prev) => ({
            ...prev,
            [message.senderId]: [
              ...(prev[message.senderId] || []),
              { from: "him", ...message },
            ],
          }));
        } catch (err) {
          console.error("Failed to parse message:", err);
        }
      });
    };

    client.onStompError = (err) => {
      console.error("STOMP error:", err);
    };

    client.activate();

    return () => client.deactivate();
  }, [userId]);

  /** Send message */
  const handleSendMessage = (text, type = "text") => {
    if (!text && type === "text") return;
    if (!selectedUser) return;
    if (!stompClientRef.current?.connected && !selectedUser.isBot) {
      console.warn("Cannot send: STOMP client not connected yet");
      return;
    }

    const msg = {
      senderId: parseInt(userId),
      receiverId: selectedUser.id,
      content: text,
      type,
    };

    // Update local state
    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [
        ...(prev[selectedUser.id] || []),
        { from: "me", ...msg },
      ],
    }));

    if (!selectedUser.isBot) {
      stompClientRef.current.publish({
        destination: "/app/chat",
        body: JSON.stringify(msg),
      });
    } else {
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [selectedUser.id]: [
            ...(prev[selectedUser.id] || []),
            {
              from: "him",
              content:
                "I'm analyzing your message... This is a demo response from MediBot.",
              type: "text",
            },
          ],
        }));
      }, 1000);
    }

    if (type === "text") setNewMessage("");
  };

  /** Scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  /** Audio recording */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) =>
        e.data.size > 0 && audioChunksRef.current.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        handleSendMessage(URL.createObjectURL(blob), "audio");
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch {
      alert("Please allow microphone access");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  /** File attachment */
  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) handleSendMessage(URL.createObjectURL(file), "file");
  };

  return (
    <>
      <Navbar />
      <div className="fixed inset-0 top-32 flex bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-hidden">
        <div className="flex w-full h-full">
          {/* Sidebar */}
          <motion.div
            className="w-80 md:w-96 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col overflow-hidden"
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
                Your Doctors
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-4 p-5 cursor-pointer transition-all hover:bg-white/10 border-l-4 border-transparent ${
                    selectedUser?.id === user.id
                      ? "bg-[#4addbf]/10 border-l-[#4addbf] shadow-lg"
                      : ""
                  } ${user.isBot ? "border-t border-white/10" : ""}`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-xl ${
                        user.isBot
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : "bg-gradient-to-br from-[#4addbf] to-[#67e8f9]"
                      }`}
                    >
                      {user.isBot ? "M" : user.name.charAt(0)}
                    </div>
                    {user.online && (
                      <Circle className="w-4 h-4 fill-green-400 text-green-400 absolute bottom-0 right-0 border-2 border-[#0f172a] rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg flex items-center gap-2 truncate">
                      {user.name}
                      {user.isBot && (
                        <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full flex-shrink-0">
                          AI
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-300 truncate">
                      {user.specialty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="bg-black/50 backdrop-blur-2xl border-b border-white/10 px-8 py-5 flex items-center gap-5 flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-xl ${
                  selectedUser?.isBot
                    ? "bg-gradient-to-br from-purple-500 to-pink-500"
                    : "bg-gradient-to-br from-[#4addbf] to-[#67e8f9]"
                }`}
              >
                {selectedUser?.isBot ? "M" : selectedUser?.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">
                  {selectedUser?.name}
                </h2>
                <p className="text-sm text-[#4addbf] flex items-center gap-2">
                  {selectedUser?.online ? "Online" : "Offline"}
                  {selectedUser?.isBot && " • Always available"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {(messages[selectedUser?.id] || []).map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.from === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.from === "me" && msg.type === "audio" ? (
                    <audio
                      controls
                      src={msg.content}
                      className="w-72 h-12 rounded-xl outline-none my-1 mr-3"
                    />
                  ) : msg.from === "me" ? (
                    <div className="max-w-xs md:max-w-lg px-6 py-4 rounded-3xl rounded-br-none bg-gradient-to-r from-[#4addbf] to-[#39c6a5] text-black shadow-xl my-1 mr-3">
                      <p className="text-base">{msg.content}</p>
                    </div>
                  ) : msg.type === "audio" ? (
                    <audio
                      controls
                      src={msg.content}
                      className="w-72 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 my-1 ml-3"
                    />
                  ) : selectedUser?.isBot ? (
                    <div className="max-w-xs md:max-w-lg px-6 py-4 rounded-3xl rounded-bl-none bg-gradient-to-r from-purple-600/60 to-pink-600/60 border border-purple-400/40 text-white shadow-xl my-1 ml-3">
                      <p className="text-base">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="max-w-xs md:max-w-lg px-6 py-4 rounded-3xl rounded-bl-none bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-xl my-1 ml-3">
                      <p className="text-base">{msg.content}</p>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-black/50 backdrop-blur-2xl border-t border-white/10 p-6 flex-shrink-0">
              <div className="flex items-center gap-4 max-w-4xl mx-auto">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="p-3 rounded-full hover:bg-white/20 transition-all"
                >
                  <Paperclip size={26} className="text-[#67e8f9]" />
                </button>

                <input
                  type="text"
                  placeholder={`Message ${
                    selectedUser?.name?.split(" ")[0]
                  }...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSendMessage(newMessage)
                  }
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all text-white"
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
                    className="p-4 rounded-full hover:bg-white/20 transition-all"
                  >
                    <Mic size={28} className="text-[#4addbf]" />
                  </button>
                )}

                <button
                  onClick={() => handleSendMessage(newMessage)}
                  disabled={!newMessage.trim()}
                  className="p-4 rounded-full bg-gradient-to-r from-[#4addbf] to-[#67e8f9] disabled:opacity-40 hover:scale-110 transition-all shadow-2xl"
                >
                  <Send size={26} className="text-black" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileAttach}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
