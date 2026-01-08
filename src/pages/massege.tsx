import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import type { RootState, AppDispatch } from "../store";
import type { ChatType, Message } from "../store/chatSlice";
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
import Header from "../components/Header";
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

  const { chats, selectedChat, messagesCache, loadingChats, loadingMessages, sending } = useSelector(
    (state: RootState) => state.chat
  );

  const [newMessage, setNewMessage] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // ------------------- SOCKET SETUP -------------------
  useEffect(() => {
    if (!user?._id) return;

    socket.current = io(ENDPOINT, { transports: ["websocket"] });
    socket.current.emit("setup", user);

    socket.current.on("connected", () => {
      console.log("Socket connected for user:", user._id);
    });

    const loadInitialData = async () => {
      try {
        dispatch(setLoadingChats(true));
        const data = await fetchMyChats();
        if (Array.isArray(data)) {
          // Sort by updatedAt descending
          const sortedChats = data.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          dispatch(setChats(sortedChats));
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        dispatch(setLoadingChats(false));
      }
    };

    loadInitialData();

    return () => socket.current?.disconnect();
  }, [user?._id, dispatch]);

  // ------------------- SOCKET LISTENERS -------------------
  useEffect(() => {
    if (!socket.current) return;

    const handleMessageReceived = (msg: Message) => {
      const chatId = typeof msg.chat === "object" ? msg.chat._id : (msg.chat as string);
      dispatch(addMessageToCache({ chatId, message: msg }));
      dispatch(updateChatLastMessage({ chatId, text: msg.text }));
      if (selectedChat?._id === chatId) scrollToBottom();
    };

    socket.current.on("message received", handleMessageReceived);

    return () => {
      socket.current.off("message received");
    };
  }, [selectedChat?._id, dispatch]);

  const scrollToBottom = () =>
    setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  // ------------------- SELECT CHAT -------------------
  const handleChatSelect = async (chat: ChatType) => {
    dispatch(setSelectedChat(chat));
    setShowChatOnMobile(true);
    socket.current.emit("join chat", chat._id);

    if (!messagesCache[chat._id]) {
      try {
        dispatch(setLoadingMessages(true));
        const msgs = await fetchMessages(chat._id);
        dispatch(setMessagesCache({ ...messagesCache, [chat._id]: Array.isArray(msgs) ? msgs : [] }));
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        dispatch(setLoadingMessages(false));
      }
    }
    scrollToBottom();
  };

  // ------------------- SEND MESSAGE -------------------
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    const chatId = selectedChat._id;
    dispatch(setSending(true));
    const content = newMessage;
    setNewMessage("");

    try {
      const data = await sendMessage(chatId, content);
      if (data) {
        socket.current.emit("new message", data);
        dispatch(addMessageToCache({ chatId, message: data }));
        scrollToBottom();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      dispatch(setSending(false));
    }
  };

  const currentMessages = selectedChat ? messagesCache[selectedChat._id] || [] : [];

  // ------------------- HELPER FUNCTIONS -------------------
  const getSenderObj = (chat: ChatType | null) => {
    if (!chat || !chat.participants || !user?._id) return { fullName: "User", avatar: "" };
    const other = chat.participants.find((p) => p._id !== user._id);
    if (!other) return { fullName: "User", avatar: "" };
    const fullName = other.fullName || `${other.firstName || ""} ${other.lastName || ""}`.trim();
    return { fullName, avatar: other.avatar || "" };
  };

  const isMyMessage = (msg: Message) => {
    if (!msg.sender || !user?._id) return false;
    const msgSenderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
    return msgSenderId === user._id;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ------------------- RENDER -------------------
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto p-2 md:p-6 h-[calc(100vh-80px)]">
        <div className="bg-white rounded-[2rem] shadow-xl border flex h-full relative overflow-hidden">
          {/* ------------------- SIDEBAR ------------------- */}
          <div
            className={`w-full md:w-[350px] border-r flex flex-col bg-white z-20 absolute md:relative h-full transition-transform duration-300 ${
              showChatOnMobile ? "-translate-x-full md:translate-x-0" : "translate-x-0"
            }`}
          >
            <div className="p-6 border-b">
              <h1 className="text-2xl font-black mb-4">Messages</h1>
              <div className="relative">
                <label htmlFor="search-chats" className="sr-only">Search chats</label>
                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                <input
                  id="search-chats"
                  name="searchChats"
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingChats ? (
                <Loader2 className="animate-spin mx-auto mt-10 text-indigo-600" />
              ) : (
                chats.map((chat) => {
                  const sender = getSenderObj(chat);
                  const isActive = selectedChat?._id === chat._id;
                  return (
                    <div
                      key={chat._id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition ${
                        isActive ? "bg-indigo-600 text-white shadow-lg" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-indigo-700 overflow-hidden shrink-0">
                        {sender.avatar ? (
                          <img src={sender.avatar} className="w-full h-full object-cover" alt={`${sender.fullName} avatar`} />
                        ) : (
                          sender.fullName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold truncate">{sender.fullName}</h3>
                          <span className={`text-[10px] ${isActive ? "text-indigo-100" : "text-slate-400"}`}>
                            {formatTime(chat.updatedAt)}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${isActive ? "text-indigo-100" : "text-slate-500"}`}>
                          {chat.lastMessage || "New chat"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ------------------- CHAT WINDOW ------------------- */}
          <div
            className={`flex-1 flex flex-col bg-slate-50/50 w-full h-full absolute md:relative transition-transform duration-300 ${
              showChatOnMobile ? "translate-x-0" : "translate-x-full md:translate-x-0"
            }`}
          >
            {selectedChat ? (
              <>
                {/* CHAT HEADER */}
                <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowChatOnMobile(false)}
                      className="md:hidden p-2 hover:bg-slate-100 rounded-full"
                    >
                      <ChevronLeft />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                      {getSenderObj(selectedChat).fullName.charAt(0)}
                    </div>
                    <h2 className="font-bold text-slate-900">{getSenderObj(selectedChat).fullName}</h2>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <Phone size={20} className="cursor-pointer hover:text-indigo-600" />
                    <Video size={20} className="cursor-pointer hover:text-indigo-600" />
                    <MoreVertical size={20} className="cursor-pointer hover:text-indigo-600" />
                  </div>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {loadingMessages ? (
                    <Loader2 className="animate-spin mx-auto text-indigo-600" />
                  ) : (
                    currentMessages.map((msg, i) => {
                      const isMe = isMyMessage(msg);
                      return (
                        <div key={msg._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                              isMe
                                ? "bg-indigo-600 text-white rounded-tr-none"
                                : "bg-white border text-slate-700 rounded-tl-none"
                            }`}
                          >
                            {msg.text}
                            <div
                              className={`text-[9px] mt-1 flex items-center gap-1 ${
                                isMe ? "justify-end text-indigo-200" : "text-slate-400"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                              {isMe && <CheckCheck size={12} />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatScrollRef} />
                </div>

                {/* CHAT INPUT */}
                <div className="p-4 bg-white border-t">
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition">
                      <Paperclip size={20} />
                    </button>
                    <label htmlFor="chat-message" className="sr-only">Type your message</label>
                    <input
                      id="chat-message"
                      name="chatMessage"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-transparent px-2 outline-none text-sm font-medium"
                      placeholder="Type a message..."
                      autoComplete="off"
                    />
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition">
                      <Smile size={20} />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-100"
                    >
                      {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <Send size={32} className="text-indigo-200" />
                </div>
                <p className="font-bold">Select a chat to see messages</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
