import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MoreVertical, Phone, Video, 
  Smile, Paperclip, ChevronLeft, Loader2, CheckCheck
} from 'lucide-react';
import io from 'socket.io-client';
import Header from '../components/Header';
import { useAuth } from '../context/authContext';
import { fetchMyChats, fetchMessages, sendMessage } from '../services/chat';

const ENDPOINT = "http://localhost:5000"; 

// --- TYPES ---
interface Participant { _id: string; fullName: string; avatar: string; email: string; }
interface Item { _id: string; title: string; price: number; images: string[]; }
interface ChatType { _id: string; participants: Participant[]; itemId?: Item; lastMessage?: string; updatedAt: string; }
interface Message { _id: string; chat: ChatType | string; sender: Participant | string; text: string; createdAt: string; }

const Messages = () => {
  const { user } = useAuth();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const socket = useRef<any>(null);

  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // 1. INITIAL SETUP
  useEffect(() => {
    if (!user?._id) return;

    socket.current = io(ENDPOINT, { transports: ["websocket"] });
    socket.current.emit("setup", user);

    const loadInitialData = async () => {
      try {
        setLoadingChats(true);
        const data = await fetchMyChats();
        setChats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load chats", err);
      } finally {
        setLoadingChats(false);
      }
    };

    loadInitialData();
    return () => { socket.current?.disconnect(); };
  }, [user?._id]);

  // 2. SOCKET LISTENER
  useEffect(() => {
    if (!socket.current) return;

    const handleMessageReceived = (newMessageReceived: Message) => {
      const incomingChatId = (typeof newMessageReceived.chat === 'object')
        ? newMessageReceived.chat._id 
        : newMessageReceived.chat as string;

      setMessagesCache(prev => {
        const current = prev[incomingChatId] || [];
        if (current.some(m => m._id === newMessageReceived._id)) return prev;
        return { ...prev, [incomingChatId]: [...current, newMessageReceived] };
      });

      // Update sidebar sorting
      setChats(prev => {
        const updated = prev.map(c => 
          c._id === incomingChatId 
          ? { ...c, lastMessage: newMessageReceived.text, updatedAt: new Date().toISOString() } 
          : c
        );
        return [...updated].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      if (selectedChat?._id === incomingChatId) scrollToBottom();
    };

    socket.current.on("message received", handleMessageReceived);
    return () => { socket.current.off("message received"); };
  }, [selectedChat?._id]);

  // --- HELPERS ---
  const scrollToBottom = () => setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const getSenderObj = (chat: ChatType | null) => {
    const currentUserId = user?._id;
    if (!chat || !chat.participants || !currentUserId) return { fullName: "User", avatar: "" };
    const other = chat.participants.find((p) => p._id.toString() !== currentUserId.toString());
    return other || { fullName: "User", avatar: "" };
  };

  const isMyMessage = (msg: Message) => {
    const currentUserId = user?._id;
    if (!msg.sender || !currentUserId) return false;
    const msgSenderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    return msgSenderId.toString() === currentUserId.toString();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- HANDLERS ---
  const handleChatSelect = async (chat: ChatType) => {
    setSelectedChat(chat);
    setShowChatOnMobile(true);
    socket.current.emit("join chat", chat._id);

    if (!messagesCache[chat._id]) {
      try {
        setLoadingMessages(true);
        const msgs = await fetchMessages(chat._id);
        setMessagesCache(prev => ({ ...prev, [chat._id]: Array.isArray(msgs) ? msgs : [] }));
      } catch (err) { 
        console.error(err); 
      } finally {
        setLoadingMessages(false);
      }
    } 
    scrollToBottom();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;
    const content = newMessage;
    const chatId = selectedChat._id;
    setNewMessage(""); 
    setSending(true);

    try {
      const data = await sendMessage(chatId, content);
      if (data) {
        socket.current.emit("new message", data);
        setMessagesCache(prev => ({
          ...prev, [chatId]: [...(prev[chatId] || []), data]
        }));
        scrollToBottom();
      }
    } catch (err) { console.error(err); } finally { setSending(false); }
  };

  const currentMessages = selectedChat ? (messagesCache[selectedChat._id] || []) : [];

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto p-2 md:p-6 h-[calc(100vh-80px)]">
        <div className="bg-white rounded-[2rem] shadow-xl border flex h-full relative overflow-hidden">
          
          {/* SIDEBAR */}
          <div className={`w-full md:w-[350px] border-r flex flex-col bg-white z-20 absolute md:relative h-full transition-transform duration-300 ${showChatOnMobile ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
            <div className="p-6 border-b">
              <h1 className="text-2xl font-black mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Search chats..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingChats ? <Loader2 className="animate-spin mx-auto mt-10 text-indigo-600"/> : 
                chats.map((chat) => {
                  const sender = getSenderObj(chat);
                  const isActive = selectedChat?._id === chat._id;
                  return (
                    <div key={chat._id} onClick={() => handleChatSelect(chat)} className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50'}`}>
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-indigo-700 overflow-hidden shrink-0">
                        {sender.avatar ? <img src={sender.avatar} className="w-full h-full object-cover" /> : sender.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold truncate">{sender.fullName}</h3>
                          <span className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{formatTime(chat.updatedAt)}</span>
                        </div>
                        <p className={`text-xs truncate ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>{chat.lastMessage || "New chat"}</p>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className={`flex-1 flex flex-col bg-slate-50/50 w-full h-full absolute md:relative transition-transform duration-300 ${showChatOnMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
            {selectedChat ? (
              <>
                <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setShowChatOnMobile(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full"><ChevronLeft /></button>
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

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {loadingMessages ? <Loader2 className="animate-spin mx-auto text-indigo-600" /> : 
                    currentMessages.map((msg, i) => {
                      const isMe = isMyMessage(msg);
                      return (
                        <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border text-slate-700 rounded-tl-none'}`}>
                            {msg.text}
                            <div className={`text-[9px] mt-1 flex items-center gap-1 ${isMe ? 'justify-end text-indigo-200' : 'text-slate-400'}`}>
                              {formatTime(msg.createdAt)}
                              {isMe && <CheckCheck size={12} />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                  <div ref={chatScrollRef} />
                </div>

                <div className="p-4 bg-white border-t">
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition"><Paperclip size={20}/></button>
                    <input 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-transparent px-2 outline-none text-sm font-medium" 
                      placeholder="Type a message..." 
                    />
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition"><Smile size={20}/></button>
                    <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-100">
                      {sending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4"><Send size={32} className="text-indigo-200" /></div>
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