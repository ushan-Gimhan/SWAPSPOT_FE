import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, MessageSquare, ArrowRightLeft, Star, 
  Filter, ShoppingBag, Sparkles, TrendingUp, 
  Zap, ChevronRight, Gift, Tag, Repeat, X, ArrowLeft, Heart, ShieldCheck, Send, MapPin, Clock,
  Loader2, ImageIcon
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAllItems } from '../services/item';

// --- TYPES ---
interface Item {
  id: string;
  name: string;
  price: number;
  images: string[]; // UPDATED: Array of strings
  isImageFile: boolean;
  seller: string;
  location: string;
  rating: number;
  condition: string;
  mode: 'sell' | 'exchange' | 'charity';
  seeking?: string; 
  category: string;
  description: string;
  postedAt: string;
}

const TradingPlatform = () => {
  // --- STATE ---
  const [items, setItems] = useState<Item[]>([]); 
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'sell' | 'exchange' | 'charity'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  // NEW: Track active image in Detail View
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [newMessage, setNewMessage] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'seller', text: 'Hi there! Thanks for viewing my listing.', time: '10:05 AM' }
  ]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await getAllItems(); 
        
        const mappedItems = response.data.map((backendItem: any) => {
          // Check for images array
          const hasImages = backendItem.images && backendItem.images.length > 0;
          
          return {
            id: backendItem._id || backendItem.id,
            name: backendItem.title,
            price: backendItem.price,
            
            // Store ALL images. If none, store array with 1 emoji string.
            images: hasImages ? backendItem.images : [getCategoryEmoji(backendItem.category)],
            isImageFile: hasImages,
            
            seller: backendItem.userId?.fullName || 'Unknown User',
            location: 'Colombo, LK', 
            rating: 5.0, 
            condition: backendItem.condition,
            mode: backendItem.mode ? backendItem.mode.toLowerCase() : 'sell',
            seeking: backendItem.seeking,
            category: backendItem.category,
            description: backendItem.description,
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

    fetchItems();
  }, []);

  // --- HELPERS ---
  const getCategoryEmoji = (category: string) => {
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('tech') || cat.includes('electron')) return '💻';
    if (cat.includes('camera')) return '📷';
    if (cat.includes('music')) return '🎸';
    if (cat.includes('cloth') || cat.includes('fashion')) return '👕';
    if (cat.includes('home') || cat.includes('garden')) return '🪑';
    if (cat.includes('sport')) return '⚽';
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

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages, selectedItem]);

  const filteredListings = useMemo(() => {
    return items.filter(item => {
      const matchesMode = filterMode === 'all' || item.mode === filterMode;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMode && matchesSearch;
    });
  }, [items, filterMode, searchQuery]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'buyer', text: newMessage, time: 'Just now' }]);
    setNewMessage('');
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'sell': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'exchange': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'charity': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getModeBadge = (mode: string) => {
    switch(mode) {
        case 'sell': return 'bg-indigo-600';
        case 'exchange': return 'bg-amber-500';
        case 'charity': return 'bg-rose-500';
        default: return 'bg-slate-500';
    }
  }

  // Handle opening item and resetting image index
  const handleOpenItem = (item: Item) => {
      setSelectedItem(item);
      setActiveImageIndex(0); // Reset to first image
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative bg-[#1e1b4b] text-white pt-16 pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold text-indigo-200 border border-white/10 animate-in fade-in slide-in-from-top-4">
             <Sparkles size={14} className="text-yellow-400" /> Community Marketplace
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            Discover. Trade. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Impact the World.
            </span>
          </h1>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
                <Search className="ml-4 text-slate-400" size={24} />
                <input 
                    type="text"
                    placeholder="Search for cameras, laptops, donations..."
                    className="w-full px-4 py-3 text-slate-800 bg-transparent outline-none text-lg placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="hidden sm:block bg-[#1e1b4b] text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-900 transition-colors">
                    Find
                </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="flex-grow max-w-7xl mx-auto w-full -mt-20 px-4 pb-20 relative z-20">
        
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl min-h-[400px]">
                <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading items...</p>
             </div>
        ) : selectedItem ? (
          // --- DETAIL VIEW ---
          <div className="animate-in fade-in zoom-in-95 duration-300 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
            
            {/* LEFT: Item Info */}
            <div className="lg:w-7/12 p-8 lg:p-12 border-r border-slate-100 relative overflow-y-auto max-h-[90vh] scrollbar-hide">
               <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-8 left-8 p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition shadow-sm z-10"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>

              <div className="flex flex-col h-full">
                
                {/* --- MAIN IMAGE (Interactive) --- */}
                <div className="relative aspect-video bg-slate-50 rounded-3xl flex items-center justify-center text-[8rem] mb-4 border border-slate-100 overflow-hidden">
                    {selectedItem.isImageFile ? (
                        <img 
                            src={selectedItem.images[activeImageIndex]} // Use Active Index
                            alt={selectedItem.name} 
                            className="w-full h-full object-contain" 
                        />
                    ) : (
                        <span>{selectedItem.images[0]}</span>
                    )}
                    
                    <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg ${getModeBadge(selectedItem.mode)}`}>
                        {selectedItem.mode}
                    </span>
                    <button className="absolute bottom-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:text-red-500 transition shadow-md">
                        <Heart size={20} />
                    </button>
                </div>

                {/* --- THUMBNAIL GALLERY --- */}
                {selectedItem.isImageFile && selectedItem.images.length > 1 && (
                    <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {selectedItem.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                                    activeImageIndex === idx 
                                    ? 'border-indigo-600 ring-2 ring-indigo-100' 
                                    : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Details */}
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedItem.name}</h2>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1"><MapPin size={14}/> {selectedItem.location}</span>
                                <span className="flex items-center gap-1"><Clock size={14}/> Posted {selectedItem.postedAt}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             {selectedItem.mode === 'sell' && <p className="text-3xl font-black text-indigo-600">LKR {selectedItem.price.toLocaleString()}</p>}
                             {selectedItem.mode === 'charity' && <p className="text-3xl font-black text-rose-500">FREE</p>}
                             {selectedItem.mode === 'exchange' && <p className="text-xl font-black text-amber-600 uppercase">Trade</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                             {selectedItem.seller.charAt(0)}
                         </div>
                         <div>
                             <p className="font-bold text-slate-900">{selectedItem.seller}</p>
                             <div className="flex items-center gap-1 text-xs text-slate-500">
                                 <Star size={12} className="fill-yellow-400 text-yellow-400"/> 
                                 <span className="font-bold text-slate-700">{selectedItem.rating}</span> 
                                 <span>(124 reviews)</span>
                             </div>
                         </div>
                         <button className="ml-auto text-sm font-bold text-indigo-600 hover:underline">View Profile</button>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                        <p className="text-slate-600 leading-relaxed">{selectedItem.description}</p>
                    </div>

                    {selectedItem.mode === 'exchange' && (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                             <h4 className="font-bold text-amber-800 text-sm mb-1">Seeking to Trade For:</h4>
                             <p className="text-amber-700 font-medium">{selectedItem.seeking}</p>
                        </div>
                    )}
                </div>
              </div>
            </div>

            {/* RIGHT: Chat */}
            <div className="lg:w-5/12 flex flex-col bg-slate-50/50 relative">
                <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                    <div>
                        <h3 className="font-bold text-slate-800">Message Seller</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Online now
                        </p>
                    </div>
                    <ShieldCheck className="text-emerald-500" />
                </div>

                {/* Messages Area */}
                <div ref={chatScrollRef} className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div className="flex justify-center">
                        <span className="text-[10px] bg-slate-200 text-slate-500 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            Safety Tip: Do not send money outside the app
                        </span>
                    </div>

                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                msg.sender === 'buyer' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                            }`}>
                                {msg.text}
                                <p className={`text-[10px] mt-2 font-medium ${msg.sender === 'buyer' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                         {['Is this still available?', 'Can I see more photos?', 'When can you meet?'].map((quickMsg) => (
                             <button 
                                key={quickMsg} 
                                onClick={() => setNewMessage(quickMsg)}
                                className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-full text-xs font-bold transition"
                             >
                                 {quickMsg}
                             </button>
                         ))}
                    </div>
                    <div className="relative flex items-center gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..." 
                            className="flex-1 pl-4 pr-12 py-3.5 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 border-2 rounded-xl outline-none transition font-medium text-slate-800"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="absolute right-2 p-2 bg-indigo-600 disabled:bg-slate-300 text-white rounded-lg hover:bg-indigo-700 transition"
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
            {/* Tabs */}
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-wrap gap-2 mb-10 max-w-4xl mx-auto">
              {[
                { id: 'all', label: 'All Listings', icon: <ShoppingBag size={18} /> },
                { id: 'sell', label: 'Buy', icon: <Tag size={18} /> },
                { id: 'exchange', label: 'Exchange', icon: <Repeat size={18} /> },
                { id: 'charity', label: 'Donations', icon: <Gift size={18} /> },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setFilterMode(mode.id as any)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    filterMode === mode.id 
                    ? 'bg-[#1e1b4b] text-white shadow-lg' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.length > 0 ? (
                  filteredListings.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleOpenItem(item)}
                      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                        
                        {/* Display First Image only in Grid */}
                        {item.isImageFile ? (
                             <img 
                                src={item.images[0]} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerText = getCategoryEmoji(item.category);
                                }}
                             />
                        ) : (
                             <span>{item.images[0]}</span>
                        )}

                        {/* Multiple Images Badge */}
                        {item.isImageFile && item.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <ImageIcon size={10} /> +{item.images.length - 1}
                            </div>
                        )}

                        <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-wide ${getModeBadge(item.mode)}`}>
                          {item.mode}
                        </div>
                      </div>
                      
                      {/* Content Area */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-slate-900 line-clamp-1 text-lg">{item.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{item.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                          <div>
                              {item.mode === 'sell' && <span className="text-xl font-black text-indigo-900">LKR {item.price.toLocaleString()}</span>}
                              {item.mode === 'charity' && <span className="text-sm font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md">FREE</span>}
                              {item.mode === 'exchange' && <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">SWAP</span>}
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${getModeColor(item.mode)} group-hover:bg-opacity-100`}>
                              <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                      <ShoppingBag size={64} className="mb-4 text-slate-300" />
                      <p className="text-xl font-bold text-slate-400">No listings found matching your criteria.</p>
                      <button onClick={() => {setFilterMode('all'); setSearchQuery('')}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear filters</button>
                  </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TradingPlatform;