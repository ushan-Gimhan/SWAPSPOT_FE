import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingBag, Sparkles, ChevronRight, ChevronLeft, 
  Gift, Tag, Repeat, ArrowLeft, Heart, ShieldCheck, Send, MapPin, Clock,
  Loader2, ImageIcon, Filter, ShoppingCart
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
  sender: { _id: string; fullName: string; avatar?: string } | string;
  text: string;
  createdAt: string;
}

const TradingPlatform = () => {
  const { user } = useAuth();
  
  //STATE
  const [items, setItems] = useState<Item[]>([]); 
  const [filteredItems, setFilteredItems] = useState<Item[]>([]); // Logic for filters
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    return () => { socket.disconnect(); };
  }, [user]);

  //LISTEN FOR INCOMING MESSAGES
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessageReceived: any) => {
      if (currentChat && currentChat._id === newMessageReceived.chatId._id) {
        setMessages((prev) => [...prev, newMessageReceived]);
        scrollToBottom();
      }
    };
    socket.on("new message", handleNewMessage);
    return () => { socket.off("new message", handleNewMessage); };
  }, [currentChat]);

  //FETCH ITEMS
  useEffect(() => {
    fetchItems();
  }, []); // Fetch all initially

  // FRONTEND FILTER LOGIC
  // This effect runs whenever items, filterMode, or searchQuery changes
  useEffect(() => {
    let result = [...items];

    // 1. Filter by Mode (Sell, Exchange, Charity)
    if (filterMode !== 'all') {
      result = result.filter(item => item.mode === filterMode);
    }

    // 2. Filter by Search Query (Name or Category)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
    }

    setFilteredItems(result);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE) || 1);
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [items, filterMode, searchQuery]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await getAllItems({ limit: 100 }); // Fetch a larger set to filter locally
      
      const mappedItems = response.data.map((backendItem: any) => {
        const hasImages = backendItem.images && backendItem.images.length > 0;
        return {
          id: backendItem._id || backendItem.id,
          name: backendItem.title,
          price: backendItem.price,
          images: hasImages ? backendItem.images : [getCategoryEmoji(backendItem.category)],
          isImageFile: hasImages,
          seller: backendItem.userId?.fullName || 'Community Member',
          sellerId: backendItem.userId?._id || backendItem.userId || "",
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

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentDisplayedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  //START CHAT LOGIC
  const handleItemClick = async (item: Item) => {
    setSelectedItem(item);
    setActiveImageIndex(0);
    setMessages([]);
    setCurrentChat(null);
    if (!user || !item.sellerId) return;

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

  //SEND MESSAGE LOGIC
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;
    try {
        const content = newMessage;
        setNewMessage(""); 
        const data = await sendMessage(currentChat._id, content);
        socket.emit("new message", data); 
    } catch (error) {
        console.error("Failed to send message", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => { chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  const isMyMessage = (msg: Message) => {
      if (!user) return false;
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      return senderId === user._id;
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
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
             <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.1]">
              Buy, Sell, Trade and Donate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              Anything, Anywhere.
            </span>
            </h1>
              <div className="max-w-2xl mx-auto relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
                <Search className="ml-4 text-slate-400" size={24} />
                <input 
                  type="text" 
                  placeholder="Search by name or category..." 
                  className="w-full px-4 py-3 text-slate-800 bg-transparent outline-none font-medium" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <div className="bg-[#1e1b4b] text-white px-8 py-3 rounded-xl font-bold">Search</div>
              </div>
         </div>
      </section>

      {/* CATEGORY FILTER BAR */}
      <div className="max-w-7xl mx-auto w-full px-4 -mt-10 mb-8 relative z-30">
        <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-wrap gap-2 justify-center md:justify-start border border-slate-100">
          {[
            { id: 'all', label: 'All Items', icon: <Filter size={16}/> },
            { id: 'sell', label: 'For Sale', icon: <ShoppingCart size={16}/> },
            { id: 'exchange', label: 'Exchange', icon: <Repeat size={16}/> },
            { id: 'charity', label: 'Donations', icon: <Heart size={16}/> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                filterMode === tab.id 
                ? 'bg-[#1e1b4b] text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 pb-20 relative z-20">
        
        {loading && !selectedItem ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl min-h-[400px]">
                <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Syncing Marketplace...</p>
             </div>
        ) : selectedItem ? (
          
          // DETAIL VIEW WITH CHAT
          <div className="animate-in fade-in zoom-in-95 duration-300 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
            <div className="lg:w-7/12 p-8 lg:p-12 border-r border-slate-100 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
               <button onClick={() => setSelectedItem(null)} className="absolute top-8 left-8 p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition shadow-sm z-10 group">
                 <ArrowLeft size={20} className="text-slate-600" />
               </button>
               <div className="flex flex-col h-full mt-12 lg:mt-0">
                  <div className="relative aspect-video bg-slate-50 rounded-[2rem] flex items-center justify-center text-[8rem] mb-6 border border-slate-100 overflow-hidden">
                     {selectedItem.isImageFile ? <img src={selectedItem.images[activeImageIndex]} className="w-full h-full object-contain" alt="" /> : <span>{selectedItem.images[0]}</span>}
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black text-slate-900">{selectedItem.name}</h2>
                    <div className="flex items-center gap-4">
                        <span className={`px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest ${getModeBadge(selectedItem.mode)}`}>{selectedItem.mode}</span>
                        <span className="text-slate-400 font-bold flex items-center gap-1 text-xs"><Tag size={14}/> {selectedItem.category}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg">{selectedItem.description}</p>
                  </div>
               </div>
            </div>

            <div className="lg:w-5/12 flex flex-col bg-slate-50 relative border-l border-slate-100">
                {/* ... CHAT HEADER ... */}
                <div className="p-6 bg-white border-b flex items-center gap-4 shadow-sm z-10">
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

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                   {messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${isMyMessage(msg) ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${isMyMessage(msg) ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border rounded-tl-none'}`}>
                              {msg.text}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                      </div>
                   ))}
                   <div ref={chatScrollRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                   <div className="flex gap-2 items-center bg-slate-100 p-2 rounded-[1.5rem] border border-slate-200">
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-slate-800 px-2" />
                      <button onClick={handleSendMessage} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg"><Send size={18} /></button>
                   </div>
                </div>
            </div>
          </div>

        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {currentDisplayedItems.length > 0 ? (
                  currentDisplayedItems.map((item) => (
                    <div key={item.id} onClick={() => handleItemClick(item)} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col h-full border-b-4 border-b-transparent hover:border-b-indigo-500">
                      <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
                        {item.isImageFile ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" /> : <span>{item.images[0]}</span>}
                        <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-lg ${getModeBadge(item.mode)}`}>{item.mode}</div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-slate-900 line-clamp-1 text-lg mb-2 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{item.description}</p>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                          <div className="font-black text-indigo-900">
                            {item.mode === 'sell' ? `LKR ${item.price.toLocaleString()}` : item.mode.toUpperCase()}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><ChevronRight size={18} /></div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                      <ShoppingBag size={64} className="mb-4 text-slate-200" />
                      <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">No matching items</h3>
                      <button onClick={() => {setSearchQuery(''); setFilterMode('all');}} className="mt-6 text-indigo-600 font-bold hover:underline">Clear all filters</button>
                  </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
               <div className="flex justify-center items-center gap-4 mt-8">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 transition-all shadow-sm"><ChevronLeft size={20}/></button>
                  <span className="font-black text-slate-600 text-sm">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 transition-all shadow-sm"><ChevronRight size={20}/></button>
               </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TradingPlatform;