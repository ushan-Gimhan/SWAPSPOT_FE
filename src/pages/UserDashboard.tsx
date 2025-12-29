import React, { useState, useMemo } from 'react';
import { 
  Search, MessageSquare, ArrowRightLeft, Star, 
  Filter, ShoppingBag, Sparkles, TrendingUp, 
  Zap, ChevronRight, Gift, Tag, Repeat, X, ArrowLeft, Heart, ShieldCheck
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// --- TYPES ---
interface Item {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  rating: number;
  condition: string;
  mode: 'sell' | 'exchange' | 'charity';
  seeking?: string; 
  category: string;
  description: string;
}

const TradingPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [filterMode, setFilterMode] = useState<'all' | 'sell' | 'exchange' | 'charity'>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'seller', text: 'Hi! Are you interested in this? All proceeds/items go to helping the community.', time: '10:05 AM' }
  ]);

  // Updated Mock Data for Charity
  const allItems: Item[] = [
    { id: 1, name: 'Vintage Camera', price: 250, image: '📷', seller: 'PhotoPro', rating: 4.8, condition: 'Mint', mode: 'sell', category: 'Electronics', description: 'A perfectly working 1970s film camera. Great for enthusiasts.' },
    { id: 2, name: 'Gaming Laptop', price: 0, image: '💻', seller: 'TechDeals', rating: 4.9, condition: 'Used', mode: 'exchange', seeking: 'MacBook M2', category: 'Tech', description: 'High performance gaming laptop. Looking to swap for a MacBook for work.' },
    { id: 3, name: 'School Backpack', price: 0, image: '🎒', seller: 'KindSoul', rating: 5.0, condition: 'New', mode: 'charity', category: 'Education', description: 'Donating 5 new backpacks for students in need. Please message if you know a family.' },
    { id: 4, name: 'Study Desk', price: 0, image: '🪑', seller: 'HomeStyle', rating: 4.5, condition: 'Fair', mode: 'charity', category: 'Furniture', description: 'Giving away my old desk. Sturdy and useful for a college student.' },
    { id: 5, name: 'Smart Watch', price: 180, image: '⌚', seller: 'GadgetHub', rating: 4.6, condition: 'Mint', mode: 'sell', category: 'Wearables', description: 'Latest series smart watch. Box and charger included.' },
  ];

  const filteredListings = useMemo(() => {
    if (filterMode === 'all') return allItems;
    return allItems.filter(item => item.mode === filterMode);
  }, [filterMode, allItems]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([...chatMessages, { sender: 'buyer', text: newMessage, time: 'Just now' }]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="bg-[#1e1b4b] text-white pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-pink-500/20 px-3 py-1 rounded-full text-xs font-bold text-pink-300 border border-white/10">
                <Heart size={14} /> Community Driven
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Swap, Sell, or <br />
                <span className="text-pink-400">Donate for Good.</span>
              </h1>
              <p className="text-gray-400 max-w-md text-lg">
                Join thousands of users exchanging value and giving back to the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow max-w-7xl mx-auto w-full -mt-16 px-4 pb-20 relative z-20">
        
        {/* If an item is selected, show the Detail + Chat "Topup" View */}
        {selectedItem ? (
          <div className="animate-in fade-in zoom-in duration-300 bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[700px] flex flex-col lg:flex-row">
            
            {/* LEFT: Item Details */}
            <div className="lg:w-1/2 p-10 border-r border-gray-100">
              <button 
                onClick={() => setSelectedItem(null)}
                className="mb-8 flex items-center gap-2 text-gray-400 hover:text-[#1e1b4b] font-bold transition"
              >
                <ArrowLeft size={20} /> Back to Marketplace
              </button>

              <div className="relative h-80 bg-gray-50 rounded-[2rem] flex items-center justify-center text-[10rem] mb-8">
                {selectedItem.image}
                <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg ${
                  selectedItem.mode === 'charity' ? 'bg-pink-500' : selectedItem.mode === 'exchange' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {selectedItem.mode}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-4xl font-black text-gray-900">{selectedItem.name}</h2>
                  <div className="text-right">
                    {selectedItem.mode === 'sell' && <p className="text-3xl font-black text-blue-600">${selectedItem.price}</p>}
                    {selectedItem.mode === 'charity' && <p className="text-2xl font-black text-pink-500 italic">DONATION</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-gray-50">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold">{selectedItem.seller.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedItem.seller}</p>
                    <p className="text-xs text-gray-400">Trusted Seller • ⭐ {selectedItem.rating}</p>
                  </div>
                </div>

                <p className="text-gray-500 leading-relaxed py-4">{selectedItem.description}</p>

                {selectedItem.mode === 'charity' && (
                  <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 flex items-start gap-4">
                    <Heart className="text-pink-500 shrink-0" />
                    <div>
                      <p className="text-pink-900 font-bold text-sm uppercase">Charity Listing</p>
                      <p className="text-pink-700 text-xs">This item is being donated. Priority is given to verified community members and students.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Chat Area */}
            <div className="lg:w-1/2 flex flex-col bg-gray-50/50">
              <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="font-black text-gray-800">Chat with {selectedItem.seller}</h3>
                </div>
                <ShieldCheck className="text-indigo-400" />
              </div>

              <div className="flex-grow p-8 overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm text-sm font-medium ${
                      msg.sender === 'buyer' ? 'bg-[#1e1b4b] text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                      <p className="text-[10px] mt-2 opacity-50">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-white border-t border-gray-100">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  <button onClick={() => setNewMessage("I'm interested in this for a donation.")} className="whitespace-nowrap px-4 py-2 bg-pink-50 text-pink-600 rounded-full text-xs font-bold border border-pink-100">Charity Request</button>
                  <button onClick={() => setNewMessage("Is this still available?")} className="whitespace-nowrap px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">Availability</button>
                  <button onClick={() => setNewMessage("Can we meet up tomorrow?")} className="whitespace-nowrap px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Meeting</button>
                </div>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..." 
                    className="flex-1 px-6 py-4 bg-gray-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 transition font-medium" 
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="w-14 h-14 bg-[#1e1b4b] text-white rounded-2xl flex items-center justify-center hover:bg-black transition shadow-lg"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* GRID VIEW (When no item is selected) */
          <>
            {/* Mode Switcher */}
            <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-wrap gap-2 mb-10">
              {[
                { id: 'all', label: 'All Feed', icon: <ShoppingBag size={18} /> },
                { id: 'sell', label: 'For Sale', icon: <Tag size={18} /> },
                { id: 'exchange', label: 'Exchange', icon: <Repeat size={18} /> },
                { id: 'charity', label: 'Donations', icon: <Heart size={18} /> },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setFilterMode(mode.id as any)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-4 rounded-[2rem] font-black text-xs tracking-widest transition-all ${
                    filterMode === mode.id ? 'bg-[#1e1b4b] text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {mode.icon} {mode.label.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredListings.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
                >
                  <div className="h-56 bg-gray-50 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform">
                    {item.image}
                    <div className={`absolute top-5 left-5 px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${
                      item.mode === 'charity' ? 'bg-pink-500' : item.mode === 'exchange' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {item.mode}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-400 mb-6">by {item.seller}</p>
                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-xl font-black text-gray-900">
                        {item.mode === 'sell' ? `$${item.price}` : item.mode === 'charity' ? 'FREE' : 'SWAP'}
                      </span>
                      <ChevronRight className="text-gray-300 group-hover:text-pink-500 transition" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TradingPlatform;