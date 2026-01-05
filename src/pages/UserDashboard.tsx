import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingBag, Sparkles, ChevronRight, ChevronLeft, 
  Gift, Tag, Repeat, ArrowLeft, Heart, ShieldCheck, Send, MapPin, Clock,
  Loader2, ImageIcon
} from 'lucide-react';
import io from 'socket.io-client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/authContext';
import { getAllItems } from '../services/item';
import { accessChat, fetchMessages, sendMessage } from '../services/chat';

const ENDPOINT = "http://localhost:5000"; 
var socket: any;

//TYPES
interface Item {
  id: string;
  name: string;
  price: number;
  images: string[];
  isImageFile: boolean;
  seller: string;
  sellerId: string;
  location: string;
  rating: number;
  condition: string;
  mode: 'sell' | 'exchange' | 'charity';
  seeking?: string; 
  category: string;
  description: string;
  postedAt: string;
}

interface Message {
  _id: string;
  // Sender can be an object (populated) or string (ID)
  sender: { _id: string; fullName: string; avatar?: string } | string;
  text: string;
  createdAt: string;
}

const TradingPlatform = () => {
  const { user } = useAuth();
  
  //STATE
  const [items, setItems] = useState<Item[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12;
  const [filterMode, setFilterMode] = useState<'all' | 'sell' | 'exchange' | 'charity'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  //CHAT STATE
  const [currentChat, setCurrentChat] = useState<any>(null); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  //SOCKET SETUP
  useEffect(() => {
    if (!user) return;

    socket = io(ENDPOINT);
    socket.emit("setup", user); 
    socket.on("connected", () => setSocketConnected(true));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  //LISTEN FOR INCOMING MESSAGES
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessageReceived: any) => {
      // Check if message belongs to current chat
      if (currentChat && currentChat._id === newMessageReceived.chatId._id) {
        setMessages((prev) => [...prev, newMessageReceived]);
        scrollToBottom();
      }
    };

    socket.on("new message", handleNewMessage);

    return () => {
      socket.off("new message", handleNewMessage);
    };
  }, [currentChat]);

  //FETCH ITEMS (Standard Logic)
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterMode]); 

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        mode: filterMode === 'all' ? undefined : filterMode,
        search: searchQuery || undefined
      };

      const response = await getAllItems(params); 
      
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }

      const mappedItems = response.data.map((backendItem: any) => {
        const hasImages = backendItem.images && backendItem.images.length > 0;
        const sellerId = backendItem.userId?._id || backendItem.userId || "";
        const sellerName = backendItem.userId?.fullName || 'Community Member';

        return {
          id: backendItem._id || backendItem.id,
          name: backendItem.title,
          price: backendItem.price,
          images: hasImages ? backendItem.images : [getCategoryEmoji(backendItem.category)],
          isImageFile: hasImages,
          seller: sellerName,
          sellerId: sellerId,
          location: 'Colombo, LK', 
          rating: 5.0, 
          condition: backendItem.condition,
          mode: backendItem.mode ? backendItem.mode.toLowerCase() : 'sell',
          seeking: backendItem.seeking,
          category: backendItem.category,
          description: backendItem.description || "No description provided.",
          postedAt: formatTimeAgo(new Date(backendItem.createdAt))
        };
      });

      setItems(mappedItems);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  //START CHAT LOGIC
  const handleItemClick = async (item: Item) => {
    setSelectedItem(item);
    setActiveImageIndex(0);
    setMessages([]);
    setCurrentChat(null);

    if (!user) return; 

    if (!item.sellerId) {
        console.error("❌ Cannot start chat: Item has no Seller ID", item);
        return;
    }

    try {
        const chatData = await accessChat(item.sellerId, item.id);
        setCurrentChat(chatData);
        socket.emit("join chat", chatData._id);

        const messageHistory = await fetchMessages(chatData._id);
        setMessages(messageHistory);
        scrollToBottom();

    } catch (error: any) {
        console.error("🔥 Error accessing chat:", error);
    }
  };

  //SEND MESSAGE LOGIC (Fixed Duplicate Issue)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;

    try {
        const content = newMessage;
        setNewMessage(""); // Clear input immediately
        
        // Call Backend API
        const data = await sendMessage(currentChat._id, content);
        
        // DO NOT manually add to messages here.
        // The socket listener above will receive the "new message" event 
        // from the backend (for both sender and receiver) and add it.
        
        // Only if socket fails, you might want a fallback, but usually let socket handle it.
        socket.emit("new message", data); // Ensure backend broadcasts if it doesn't automatically
        
    } catch (error) {
        console.error("Failed to send message", error);
        alert("Failed to send message.");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  //CHECK SENDER HELPER (Fixed Alignment Issue)
  const isMyMessage = (msg: Message) => {
      if (!user) return false;
      // Handle populated object or string ID
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      return senderId === user._id;
  };

  //HELPERS
  const handleSearch = () => { setCurrentPage(1); fetchItems(); };
  const handleFilterChange = (mode: any) => { setFilterMode(mode); setCurrentPage(1); };
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const getCategoryEmoji = (category: string) => { 
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('tech') || cat.includes('electron')) return '💻';
    if (cat.includes('camera')) return '📷';
    if (cat.includes('music')) return '🎸';
    return '📦';
  };
  const formatTimeAgo = (date: Date) => {
    if(isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime()) / 36e5;
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };
  const getModeColor = (mode: string) => { /* ... existing ... */ return 'text-slate-600 bg-slate-50 border-slate-200'; };
  const getModeBadge = (mode: string) => {
    switch(mode) {
        case 'sell': return 'bg-indigo-600';
        case 'exchange': return 'bg-amber-500';
        case 'charity': return 'bg-rose-500';
        default: return 'bg-slate-500';
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      <Header />

      {/* HERO SECTION */}
      <section className="relative bg-[#1e1b4b] text-white pt-16 pb-32 px-4 overflow-hidden">
        {/*Keep Hero Section Same*/}
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
             <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.1]">
              Buy, Sell, Trade and Donate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              Anything, Anywhere.
            </span>
            </h1>
             <div className="max-w-2xl mx-auto relative flex items-center bg-white rounded-2xl p-2">
                <Search className="ml-4 text-slate-400" size={24} />
                <input type="text" placeholder="Search items..." className="w-full px-4 py-3 text-slate-800 bg-transparent outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                <button onClick={handleSearch} className="bg-[#1e1b4b] text-white px-8 py-3 rounded-xl font-bold">Find</button>
             </div>
         </div>
      </section>

      {/* CONTENT SECTION */}
      <main className="flex-grow max-w-7xl mx-auto w-full -mt-20 px-4 pb-20 relative z-20">
        
        {loading && !selectedItem ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl min-h-[400px]">
                <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading items...</p>
             </div>
        ) : selectedItem ? (
          
          // DETAIL VIEW WITH CHAT
          <div className="animate-in fade-in zoom-in-95 duration-300 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
            
            {/* LEFT SIDE: ITEM DETAILS */}
            <div className="lg:w-7/12 p-8 lg:p-12 border-r border-slate-100 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
               <button onClick={() => setSelectedItem(null)} className="absolute top-8 left-8 p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition shadow-sm z-10 group">
                 <ArrowLeft size={20} className="text-slate-600" />
               </button>
               {/*  (Image & Description - Keep Same)  */}
               <div className="flex flex-col h-full mt-12 lg:mt-0">
                  <div className="relative aspect-video bg-slate-50 rounded-[2rem] flex items-center justify-center text-[8rem] mb-6 border border-slate-100 overflow-hidden">
                     {selectedItem.isImageFile ? <img src={selectedItem.images[activeImageIndex]} className="w-full h-full object-contain" alt="" /> : <span>{selectedItem.images[0]}</span>}
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black text-slate-900">{selectedItem.name}</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">{selectedItem.description}</p>
                  </div>
               </div>
            </div>

            {/* RIGHT SIDE: CHAT INTERFACE */}
            <div className="lg:w-5/12 flex flex-col bg-slate-50 relative border-l border-slate-100">
                <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {selectedItem.seller.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{selectedItem.seller}</h3>
                          <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                             <ShieldCheck size={12} /> {socketConnected ? 'Secure Chat' : 'Connecting...'}
                          </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                   {!user ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-bold">Please login to chat</div>
                   ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-bold">Start the conversation!</div>
                   ) : (
                       messages.map((msg, i) => {
                          // Use robust helper to determine sender
                          const isMe = isMyMessage(msg); 
                          
                          return (
                              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm relative ${
                                     isMe 
                                     ? 'bg-[#1e1b4b] text-white rounded-tr-none' 
                                     : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                  }`}>
                                     {msg.text}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 mt-1 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                              </div>
                          );
                       })
                   )}
                   <div ref={chatScrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                   <div className="flex gap-2 items-center bg-slate-100 p-2 rounded-[1.5rem] border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={user ? "Type a message..." : "Login to chat"}
                        disabled={!user}
                        className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 font-medium px-2"
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !user}
                        className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-90"
                      >
                         <Send size={18} />
                      </button>
                   </div>
                </div>
            </div>
          </div>

        ) : (
          // --- GRID VIEW ---
          <>
            {/* ... (Keep Grid View Same) ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {items.length > 0 ? (
                  items.map((item) => (
                    <div key={item.id} onClick={() => handleItemClick(item)} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col h-full">
                      <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                        {item.isImageFile ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" /> : <span>{item.images[0]}</span>}
                        <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-wide ${getModeBadge(item.mode)}`}>{item.mode}</div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-slate-900 line-clamp-1 text-lg mb-2">{item.name}</h3>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{item.description}</p>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                          <div>{item.mode === 'sell' ? <span className="text-xl font-black text-indigo-900">LKR {item.price.toLocaleString()}</span> : <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded">{item.mode}</span>}</div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition"><ChevronRight size={18} /></div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                      <ShoppingBag size={64} className="mb-4 text-slate-300" />
                      <p className="text-xl font-bold text-slate-400">No listings found.</p>
                  </div>
              )}
            </div>
            {/* Pagination ... */}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TradingPlatform;