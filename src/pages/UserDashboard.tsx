import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingBag, Sparkles, ChevronRight, ChevronLeft, 
  Gift, Tag, Repeat, ArrowLeft, Heart, ShieldCheck, Send, MapPin, Clock,
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
  images: string[];
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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12; // 12 looks good on 3-col and 4-col grids

  // Filters
  const [filterMode, setFilterMode] = useState<'all' | 'sell' | 'exchange' | 'charity'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail View State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Chat State
  const [newMessage, setNewMessage] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'seller', text: 'Hi there! Thanks for viewing my listing.', time: '10:05 AM' }
  ]);

  // --- FETCH DATA ---
  // Re-run whenever Page, Filter, or Search changes
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterMode]); // Search is handled via button/enter to prevent too many calls

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Prepare params for backend
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        mode: filterMode === 'all' ? undefined : filterMode, // Send undefined if 'all' to get everything
        search: searchQuery || undefined
      };

      const response = await getAllItems(params); 
      
      // 1. Update Pagination Data from Backend
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }

      // 2. Map Data
      const mappedItems = response.data.map((backendItem: any) => {
        const hasImages = backendItem.images && backendItem.images.length > 0;
        return {
          id: backendItem._id || backendItem.id,
          name: backendItem.title,
          price: backendItem.price,
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

  // --- HELPERS ---
  const handleSearch = () => {
    setCurrentPage(1); // Reset to page 1 on new search
    fetchItems();
  };

  const handleFilterChange = (mode: any) => {
    setFilterMode(mode);
    setCurrentPage(1); // Reset to page 1 on new filter
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    }
  };

  const getCategoryEmoji = (category: string) => {
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('tech') || cat.includes('electron')) return '💻';
    if (cat.includes('camera')) return '📷';
    if (cat.includes('music')) return '🎸';
    if (cat.includes('cloth') || cat.includes('fashion')) return '👕';
    if (cat.includes('home') || cat.includes('garden')) return '🪑';
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

  // --- UI HELPERS ---
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
            Buy, Sell, and Trade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Anything, Anywhere.
            </span>
          </h1>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
                <Search className="ml-4 text-slate-400" size={24} />
                <input 
                    type="text"
                    placeholder="Search items..."
                    className="w-full px-4 py-3 text-slate-800 bg-transparent outline-none text-lg placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  className="hidden sm:block bg-[#1e1b4b] text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-900 transition-colors"
                >
                    Find
                </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="flex-grow max-w-7xl mx-auto w-full -mt-20 px-4 pb-20 relative z-20">
        
        {loading && !selectedItem ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl min-h-[400px]">
                <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading items...</p>
             </div>
        ) : selectedItem ? (
          // --- DETAIL VIEW (No changes needed here, keeping your existing logic) ---
          <div className="animate-in fade-in zoom-in-95 duration-300 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
             {/* ... Copy your existing Detail View code here ... */}
             {/* For brevity, I'm assuming you keep the Detail View exactly as provided in the previous step */}
             {/* LEFT SIDE */}
             <div className="lg:w-7/12 p-8 lg:p-12 border-r border-slate-100 relative overflow-y-auto max-h-[90vh]">
                 <button onClick={() => setSelectedItem(null)} className="absolute top-8 left-8 p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition shadow-sm z-10"><ArrowLeft size={20} className="text-slate-600" /></button>
                 <div className="flex flex-col h-full">
                    <div className="relative aspect-video bg-slate-50 rounded-3xl flex items-center justify-center text-[8rem] mb-4 border border-slate-100 overflow-hidden">
                        {selectedItem.isImageFile ? <img src={selectedItem.images[activeImageIndex]} className="w-full h-full object-contain" /> : <span>{selectedItem.images[0]}</span>}
                        <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg ${getModeBadge(selectedItem.mode)}`}>{selectedItem.mode}</span>
                    </div>
                    {/* Thumbnails */}
                    {selectedItem.isImageFile && selectedItem.images.length > 1 && (
                        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                            {selectedItem.images.map((img, idx) => (
                                <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImageIndex === idx ? 'border-indigo-600' : 'border-transparent opacity-70'}`}><img src={img} className="w-full h-full object-cover" /></button>
                            ))}
                        </div>
                    )}
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedItem.name}</h2>
                    <p className="text-slate-600 leading-relaxed mb-6">{selectedItem.description}</p>
                 </div>
             </div>
             {/* RIGHT SIDE (Chat) */}
             <div className="lg:w-5/12 flex flex-col bg-slate-50/50 relative">
                 <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                     <h3 className="font-bold text-slate-800">Message Seller</h3>
                 </div>
                 {/* ... Chat UI ... */}
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
                  onClick={() => handleFilterChange(mode.id)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {items.length > 0 ? (
                  items.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => { setSelectedItem(item); setActiveImageIndex(0); }}
                      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                        {item.isImageFile ? (
                             <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                             <span>{item.images[0]}</span>
                        )}
                        {item.isImageFile && item.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <ImageIcon size={10} /> +{item.images.length - 1}
                            </div>
                        )}
                        <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-wide ${getModeBadge(item.mode)}`}>{item.mode}</div>
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${getModeColor(item.mode)} group-hover:bg-opacity-100`}><ChevronRight size={18} /></div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                      <ShoppingBag size={64} className="mb-4 text-slate-300" />
                      <p className="text-xl font-bold text-slate-400">No listings found.</p>
                      <button onClick={() => {handleFilterChange('all'); setSearchQuery('')}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear filters</button>
                  </div>
              )}
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            {totalItems > 0 && (
                <div className="flex items-center justify-center gap-4 py-8 border-t border-slate-200/60">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="text-sm font-bold text-slate-500">
                        Page <span className="text-indigo-900">{currentPage}</span> of {totalPages}
                    </span>

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
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