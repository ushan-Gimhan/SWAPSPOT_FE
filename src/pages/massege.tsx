import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MoreVertical, Phone, Video, 
  Smile, Paperclip, ChevronLeft, Loader2, CheckCheck
} from 'lucide-react';
import io from 'socket.io-client';
import Header from '../components/Header';
import { useAuth } from '../context/authContext';
import { fetchMyChats, fetchMessages, sendMessage } from '../services/chat';

// Socket Config
const ENDPOINT = "http://localhost:5000"; 
let socket: any; // Changed var to let

// --- TYPES ---
interface Participant {
  _id: string;
  fullName: string;
  avatar: string;
  email: string;
}

interface Item {
  _id: string;
  title: string;
  price: number;
  images: string[];
}

interface ChatType {
  _id: string;
  participants: Participant[];
  itemId?: Item;
  lastMessage?: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  chat: ChatType | string; 
  sender: Participant | string; 
  text: string;
  createdAt: string;
}

const Messages = () => {
  const { user } = useAuth();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  //STATE
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  //SETUP SOCKET & FETCH INITIAL CHATS
  useEffect(() => {
    if (!user?._id) return; // Guard against undefined user

    socket = io(ENDPOINT, { transports: ["websocket"] });
    socket.emit("setup", user);

    fetchMyChats()
      .then((data) => {
        setChats(Array.isArray(data) ? data : []);
        setLoadingChats(false);
      })
      .catch((err) => {
        console.error("Failed to load chats", err);
        setChats([]);
        setLoadingChats(false);
      });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // SOCKET LISTENER
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived: Message) => {
        if (!newMessageReceived || !newMessageReceived.chat) return;

        const incomingChatId = (typeof newMessageReceived.chat === 'object' && newMessageReceived.chat !== null)
            ? newMessageReceived.chat._id 
            : newMessageReceived.chat as string;

        setMessagesCache(prevCache => {
            const currentMessages = Array.isArray(prevCache[incomingChatId]) ? prevCache[incomingChatId] : [];
            if (currentMessages.some(m => m._id === newMessageReceived._id)) return prevCache;
            
            return {
                ...prevCache,
                [incomingChatId]: [...currentMessages, newMessageReceived]
            };
        });

        // Always update sidebar preview
        setChats(prev => prev.map(c => 
            c._id === incomingChatId 
            ? { ...c, lastMessage: newMessageReceived.text, updatedAt: new Date().toISOString() } 
            : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

        if (selectedChat?._id === incomingChatId) {
            scrollToBottom();
        }
    };

    socket.on("message received", handleMessageReceived);
    return () => { socket.off("message received", handleMessageReceived); };
  }, [selectedChat?._id]);

  //HELPERS
  const scrollToBottom = () => setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const getSenderObj = (chat: ChatType | null) => {
      if (!chat || !chat.participants || !user?._id) {
        return { fullName: "Unknown User", avatar: "" };
      }
      // Find the participant that is NOT the logged-in user
      const other = chat.participants.find((p) => p._id.toString() !== user._id.toString());
      return other || { fullName: "Unknown User", avatar: "" };
  };

  const isMyMessage = (msg: Message) => {
      if (!msg || !msg.sender || !user?._id) return false;
      
      const msgSenderId = typeof msg.sender === 'object' 
        ? (msg.sender as Participant)._id 
        : msg.sender;
        
      return msgSenderId.toString() === user._id.toString();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    try {
        return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) { return ""; }
  };

  //HANDLERS
  const handleChatSelect = async (chat: ChatType) => {
    if (!chat?._id) return; 

    setSelectedChat(chat);
    setShowChatOnMobile(true);
    socket.emit("join chat", chat._id);

    if (!messagesCache[chat._id]) {
        try {
            const msgs = await fetchMessages(chat._id);
            setMessagesCache(prev => ({
                ...prev,
                [chat._id]: Array.isArray(msgs) ? msgs : []
            }));
        } catch (error) {
            console.error("Error loading messages", error);
            setMessagesCache(prev => ({ ...prev, [chat._id]: [] }));
        }
    } 
    scrollToBottom();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    const content = newMessage;
    setNewMessage(""); 
    setSending(true);

    try {
        const data = await sendMessage(selectedChat._id, content);
        if (data) {
            socket.emit("new message", data);
            
            setMessagesCache(prev => ({
                ...prev,
                [selectedChat._id]: [...(prev[selectedChat._id] || []), data]
            }));

            // Force sidebar update for sender
            setChats(prev => prev.map(c => 
                c._id === selectedChat._id 
                ? { ...c, lastMessage: content, updatedAt: new Date().toISOString() } 
                : c
            ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

            scrollToBottom();
        }
    } catch (error) {
        console.error("Failed to send", error);
    } finally {
        setSending(false);
    }
  };

  // derived data
  const currentMessages = selectedChat ? (messagesCache[selectedChat._id] || []) : [];

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 h-[calc(100vh-80px)]">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex h-full relative">
          
          {/*LEFT SIDEBAR */}
          <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-slate-100 flex flex-col bg-white z-10 absolute md:relative h-full transition-transform duration-300 ${showChatOnMobile ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
            <div className="p-6 border-b border-slate-50">
              <h1 className="text-2xl font-black text-slate-900 mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input type="text" placeholder="Search chats..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {loadingChats ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600"/></div>
              ) : (!chats || chats.length === 0) ? (
                <div className="text-center py-10 text-slate-400 text-sm font-bold">No conversations yet.</div>
              ) : (
                chats.map((chat) => {
                  if (!chat) return null; 
                  const sender = getSenderObj(chat);
                  const isActive = selectedChat?._id === chat._id;
                  
                  return (
                    <div 
                      key={chat._id} 
                      onClick={() => handleChatSelect(chat)}
                      className={`group p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${
                        isActive ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden ${isActive ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700'}`}>
                          {sender.avatar ? <img src={sender.avatar} className="w-full h-full object-cover" alt="" /> : (sender.fullName ? sender.fullName.charAt(0) : '?')}
                        </div>
                        {isActive && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={`font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>{sender.fullName}</h3>
                          <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatTime(chat.updatedAt)}
                          </span>
                        </div>
                        <p className={`text-xs truncate font-medium ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {chat.itemId && <span className="font-bold mr-1">[{chat.itemId.title}]</span>}
                          {chat.lastMessage || "Started a conversation"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT MAIN AREA */}
          <div className={`flex-1 flex flex-col bg-slate-50/50 w-full h-full absolute md:relative transition-transform duration-300 ${showChatOnMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
            
            {selectedChat ? (
              <>
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setShowChatOnMobile(false)} className="md:hidden p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ChevronLeft size={20}/></button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                        {getSenderObj(selectedChat).avatar ? <img src={getSenderObj(selectedChat).avatar} className="w-full h-full object-cover" alt="avatar"/> : (getSenderObj(selectedChat).fullName ? getSenderObj(selectedChat).fullName.charAt(0) : '?')}
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900">{getSenderObj(selectedChat).fullName}</h2>
                        {selectedChat.itemId && (
                           <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit mt-0.5">
                              <span className="truncate max-w-[150px]">Ref: {selectedChat.itemId.title}</span>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button className="p-2 hover:bg-slate-100 rounded-full transition"><Phone size={20}/></button>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition"><Video size={20}/></button>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition"><MoreVertical size={20}/></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                  {(!currentMessages || currentMessages.length === 0) && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center"><Send size={32} /></div>
                          <p className="font-bold">No messages yet. Say hello!</p>
                      </div>
                  )}
                  
                  {Array.isArray(currentMessages) && currentMessages.map((msg, i) => {
                    if (!msg) return null;
                    const isMe = isMyMessage(msg);
                    const senderProfile = isMe ? null : getSenderObj(selectedChat);

                    return (
                      <div 
                        key={msg._id || i} 
                        className={`w-full flex ${isMe ? 'justify-end' : 'justify-start items-end gap-2'}`}
                      >
                        {!isMe && senderProfile && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 overflow-hidden flex items-center justify-center mb-1">
                                {senderProfile.avatar ? (
                                    <img src={senderProfile.avatar} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <span className="text-xs font-bold text-indigo-700">
                                      {senderProfile.fullName ? senderProfile.fullName.charAt(0) : '?'}
                                    </span>
                                )}
                            </div>
                        )}

                        <div 
                          className={`
                            max-w-[75%] md:max-w-[60%] px-5 py-3 text-sm font-medium shadow-sm relative break-words
                            ${isMe 
                              ? 'bg-[#1e1b4b] text-white rounded-[1.5rem] rounded-tr-none' 
                              : 'bg-white text-slate-700 border border-slate-100 rounded-[1.5rem] rounded-tl-none'
                            }
                          `}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          <div className={`text-[9px] font-bold mt-1 flex items-center gap-1 opacity-70 ${isMe ? 'justify-end text-indigo-200' : 'justify-start text-slate-400'}`}>
                            {formatTime(msg.createdAt)}
                            {isMe && <CheckCheck size={12} />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatScrollRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="max-w-4xl mx-auto flex items-center gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all shadow-sm">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition"><Paperclip size={20}/></button>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      placeholder="Type your message..." 
                      className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 font-medium px-2"
                    />
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition"><Smile size={20}/></button>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100 flex items-center justify-center"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Send size={40} className="text-indigo-600 ml-2" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Your Messages</h2>
                <p className="text-slate-400 font-bold mt-2 max-w-xs">Select a conversation from the sidebar to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;