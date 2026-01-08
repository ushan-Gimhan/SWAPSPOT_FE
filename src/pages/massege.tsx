import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import type { RootState, AppDispatch } from "../store";
import {
  setChats,
  setSelectedChat,
  setMessagesCache,
  addMessageToCache,
  setLoadingChats,
  setLoadingMessages,
  setSending,
  updateChatLastMessage,
} from "../store/chatSlice";

import { fetchMyChats, fetchMessages, sendMessage } from "../services/chat";
import { useAuth } from "../context/authContext";
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  ChevronLeft,
  Loader2,
  CheckCheck,
} from "lucide-react";

const ENDPOINT = "http://localhost:5000";

const Messages = () => {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const socket = useRef<any>(null);

  const { chats, selectedChat, messagesCache, loadingChats, loadingMessages, sending } =
    useSelector((state: RootState) => state.chat);

  const [newMessage, setNewMessage] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ------------------- SOCKET SETUP -------------------
 useEffect(() => {
  if (!user?._id) return;

  socket.current = io(ENDPOINT);

  // Convert role array to a string
  let roleString = "USER"; // default
  if (Array.isArray(user.role)) {
    // pick first valid role
    roleString = user.role.find((r: any) => r) || "USER";
  } else if (typeof user.role === "string") {
    roleString = user.role;
  }

  socket.current.emit("setup", {
    _id: user._id,
    email: user.email,
    role: roleString, // ✅ always string
  });

  socket.current.on("connected", () => console.log("✅ Socket connected"));

  return () => {
    socket.current.disconnect();
  };
}, [user]);




  // ------------------- REAL-TIME MESSAGE LISTENER -------------------
  useEffect(() => {
    if (!socket.current) return;

    const handleMessageReceived = (msg: any) => {
      const chatId = msg.chat?._id || msg.chatId;
      dispatch(addMessageToCache({ chatId, message: msg }));
      dispatch(updateChatLastMessage({ chatId, text: msg.text }));

      if (selectedChat?._id === chatId) scrollToBottom();
    };

    socket.current.on("message received", handleMessageReceived);
    return () => socket.current.off("message received");
  }, [selectedChat, dispatch]);

  // ------------------- LOAD CHATS & AUTO-SELECT FIRST -------------------
  useEffect(() => {
    const loadChats = async () => {
      // if (!user?._id) return;

      dispatch(setLoadingChats(true));
      try {
        const chatsData = await fetchMyChats(); // fetch array of chats
        dispatch(setChats(chatsData || []));

        if (chatsData && chatsData.length > 0) {
          handleChatSelect(chatsData[0]); // auto-select first chat
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        dispatch(setLoadingChats(false));
      }
    };

    loadChats();
  }, [user, dispatch]);

  // ------------------- SCROLL TO BOTTOM -------------------
  const scrollToBottom = () => {
    setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // ------------------- CHAT SELECTION -------------------
  const handleChatSelect = async (chat: any) => {
    dispatch(setSelectedChat(chat));
    setShowChatOnMobile(true);

    socket.current.emit("join chat", chat._id);

    if (!messagesCache[chat._id]) {
      try {
        dispatch(setLoadingMessages(true));
        const res = await fetchMessages(chat._id);
        const msgs = res?.data || res || [];
        dispatch(setMessagesCache({ ...messagesCache, [chat._id]: msgs }));
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        dispatch(setLoadingMessages(false));
      }
    }

    scrollToBottom();
  };

  // ------------------- SEND MESSAGE -------------------
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    const chatId = selectedChat._id;
    const content = newMessage;
    setNewMessage("");
    dispatch(setSending(true));

    try {
      const data = await sendMessage(chatId, content);
      dispatch(addMessageToCache({ chatId, message: data }));
      dispatch(updateChatLastMessage({ chatId, text: data.text }));
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      dispatch(setSending(false));
    }
  };

  // ------------------- GET SENDER INFO -------------------
  const getSenderObj = (chat: any) => {
    const other = chat.participants.find((p: any) => p._id !== user?._id);
    const name = other?.fullName || other?.["full Name"] || "User";
    return {
      fullName: name,
      avatar: other?.avatar || "",
      initial: name[0].toUpperCase(),
    };
  };

  // ------------------- FORMAT TIME -------------------
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ------------------- FILTER CHATS -------------------
  const filteredChats = chats.filter((chat) =>
    getSenderObj(chat).fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedChat ? messagesCache[selectedChat._id] || [] : [];

  // ------------------- RENDER -------------------
  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex h-[700px] overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-[3rem] relative">
        {/* --- LEFT SIDEBAR --- */}
        <div
          className={`w-full md:w-[380px] border-r border-gray-50 flex flex-col bg-white z-20 absolute md:relative h-full transition-all duration-300 ${
            showChatOnMobile ? "-translate-x-full md:translate-x-0" : "translate-x-0"
          }`}
        >
          <div className="p-8">
            <h1 className="text-3xl font-black text-[#1e1b4b] tracking-tight mb-6">Inbox</h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all text-sm font-bold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
            {loadingChats ? (
              <div className="flex justify-center pt-10">
                <Loader2 className="animate-spin text-indigo-600" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs font-black uppercase tracking-widest">
                No chats found
              </div>
            ) : (
              filteredChats.map((chat) => {
                const sender = getSenderObj(chat);
                const isActive = selectedChat?._id === chat._id;
                return (
                  <div
                    key={chat._id}
                    onClick={() => handleChatSelect(chat)}
                    className={`group p-5 rounded-[2rem] flex items-center gap-4 cursor-pointer transition-all ${
                      isActive ? "bg-[#1e1b4b] text-white shadow-xl translate-x-1" : "hover:bg-indigo-50/50"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 shrink-0 ${
                        isActive
                          ? "bg-indigo-500 text-white border-indigo-400"
                          : "bg-indigo-50 text-indigo-600 border-white"
                      }`}
                    >
                      {sender.avatar ? (
                        <img src={sender.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                      ) : (
                        sender.initial
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`font-black truncate ${isActive ? "text-white" : "text-gray-900"}`}>
                          {sender.fullName}
                        </h3>
                        <span
                          className={`text-[9px] font-black uppercase ${
                            isActive ? "text-indigo-300" : "text-gray-400"
                          }`}
                        >
                          {formatTime(chat.updatedAt)}
                        </span>
                      </div>
                      <p className={`text-xs truncate font-medium ${isActive ? "text-indigo-100" : "text-gray-500"}`}>
                        {chat.lastMessage || "New connection..."}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* --- RIGHT SIDEBAR --- */}
        <div
          className={`flex-1 flex flex-col bg-[#FDFDFE] w-full h-full absolute md:relative transition-all duration-300 ${
            showChatOnMobile ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="px-8 py-5 bg-white border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowChatOnMobile(false)}
                    className="md:hidden p-2 bg-gray-50 rounded-xl"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-[#1e1b4b] flex items-center justify-center font-black text-white text-lg">
                    {getSenderObj(selectedChat).initial}
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 leading-tight">
                      {getSenderObj(selectedChat).fullName}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Active Chat
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
                    <Phone size={18} />
                  </button>
                  <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
                    <Video size={18} />
                  </button>
                  <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <Loader2 className="animate-spin text-indigo-600" />
                    <span className="text-[10px] font-black text-gray-300 uppercase">
                      Fetching history
                    </span>
                  </div>
                ) : (
                  currentMessages.map((msg: any, i: number) => {
                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                    return (
                      <div key={msg._id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[75%] px-6 py-4 rounded-[1.8rem] text-[15px] font-medium leading-relaxed shadow-sm transition-all ${
                            isMe
                              ? "bg-[#1e1b4b] text-white rounded-tr-none"
                              : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                          }`}
                        >
                          {msg.text || msg.content}
                        </div>
                        <div
                          className={`text-[9px] font-black uppercase mt-2 px-2 flex items-center gap-1 ${
                            isMe ? "text-indigo-300" : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                          {isMe && <CheckCheck size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatScrollRef} />
              </div>

              {/* Chat Input */}
              <div className="p-8 border-t border-gray-50 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <div className="flex-1 relative flex items-center bg-gray-50 rounded-[1.8rem] px-4 border-2 border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
                    <button type="button" className="p-3 text-gray-400 hover:text-indigo-600">
                      <Paperclip size={20} />
                    </button>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Write your message..."
                      className="flex-1 bg-transparent py-5 px-2 outline-none text-sm font-bold text-gray-700"
                    />
                    <button type="button" className="p-3 text-gray-400 hover:text-indigo-600">
                      <Smile size={20} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-[#1e1b4b] text-white p-5 rounded-2xl hover:bg-black active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-200 mb-6">
                <Send size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#1e1b4b]">Your Conversations</h2>
              <p className="text-gray-400 font-bold mt-2 max-w-xs">
                Select a chat from the left to view messages and start talking.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default Messages;
