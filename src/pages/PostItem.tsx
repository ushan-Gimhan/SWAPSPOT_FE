import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Tag, Heart, Sparkles, 
  X, Plus, ChevronRight, DollarSign,
  ArrowRight, ShieldCheck, Repeat, Image as ImageIcon
} from 'lucide-react';
// Assuming you have these, otherwise replace with simple divs
import Header from '../components/Header'; 
import Footer from '../components/Footer';
import { createItem } from '../services/item';

const PostItem: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [mode, setMode] = useState<'sell' | 'exchange' | 'charity'>('sell');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: 'Tech & Electronics',
    condition: 'Like New',
    seeking: '',
    description: ''
  });

  // --- Handlers ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImageFiles([...imageFiles, ...files]);
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setPreviews(previews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  // Drag and Drop Logic
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const getAISuggestion = () => {
    if (!form.title) {
        setError("Please enter a title for AI pricing.");
        return;
    }
    setError("");
    setIsAILoading(true);
    setTimeout(() => {
      setForm({ ...form, price: (Math.floor(Math.random() * 200) + 20).toString() });
      setIsAILoading(false);
    }, 1500);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation Logic
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and Description are required.");
      setLoading(false);
      return;
    }
    if (mode === 'sell' && (!form.price || Number(form.price) <= 0)) {
      setError("Please enter a valid price for selling.");
      setLoading(false);
      return;
    }
    if (mode === 'exchange' && !form.seeking.trim()) {
      setError("Please specify what you are seeking.");
      setLoading(false);
      return;
    }
    if (imageFiles.length === 0) {
      setError("Please upload at least one image.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
         // Logic to exclude specific fields based on mode if necessary
         if(key === 'price' && mode !== 'sell') return;
         if(key === 'seeking' && mode !== 'exchange') return;
         formData.append(key, value);
      });
      formData.append('mode', mode.toUpperCase());
      if(mode !== 'sell') formData.append('price', '0');
      
      imageFiles.forEach((file) => formData.append('images', file));

      const res = await createItem(formData);
      if (res.status === 201) navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to publish item.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for dynamic colors
  const getModeColor = () => {
    switch(mode) {
      case 'sell': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'exchange': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'charity': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccentColor = () => {
    switch(mode) {
        case 'sell': return 'indigo';
        case 'exchange': return 'amber';
        case 'charity': return 'rose';
        default: return 'gray';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans text-slate-800">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 lg:py-12">
        {/* Breadcrumb / Stepper */}
        <div className="flex items-center gap-3 mb-8 text-sm font-medium text-slate-400">
          <span className="text-slate-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">1</span>
            Create Listing
          </span>
          <ChevronRight size={14} />
          <span>Review</span>
          <ChevronRight size={14} />
          <span>Publish</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* --- LEFT COLUMN: MEDIA UPLOAD --- */}
          <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
            
            {/* Upload Area */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Camera size={20} className={`text-${getAccentColor()}-600`} /> 
                  Photos
                </h3>
                <span className="text-xs font-medium text-slate-400">{previews.length}/5</span>
              </div>

              {/* Grid or Main Upload */}
              <div className="space-y-4">
                {previews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {previews.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow-lg hover:bg-white transition-transform hover:scale-110"
                            >
                            <X size={14} strokeWidth={3} />
                            </button>
                        </div>
                        ))}
                        {previews.length < 5 && (
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-${getAccentColor()}-400 hover:text-${getAccentColor()}-600 hover:bg-${getAccentColor()}-50/50 transition duration-300`}
                            >
                                <Plus size={24} />
                                <span className="text-xs font-bold mt-1 uppercase tracking-wide">Add</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div 
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`aspect-[4/3] rounded-2xl border-2 border-dashed ${dragActive ? `border-${getAccentColor()}-500 bg-${getAccentColor()}-50` : 'border-slate-300 hover:border-slate-400'} flex flex-col items-center justify-center text-slate-500 cursor-pointer transition-all duration-300 gap-3`}
                    >
                        <div className={`p-4 rounded-full bg-slate-50 ${dragActive ? 'scale-110' : ''} transition-transform`}>
                            <ImageIcon size={32} className="text-slate-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-700">Click or Drag photos here</p>
                            <p className="text-xs text-slate-400 mt-1">Up to 5 images (JPG, PNG)</p>
                        </div>
                    </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} />
            </div>

            {/* AI Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
              <h4 className="font-bold text-base mb-2 flex items-center gap-2 relative z-10">
                <Sparkles size={16} className="text-yellow-400 fill-yellow-400" /> 
                Smart Assistant
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                Our AI analyzes your photos to suggest the best {mode === 'exchange' ? 'trade matches' : 'prices'} and tags.
              </p>
            </div>
          </div>

          {/* --- RIGHT COLUMN: DETAILS FORM --- */}
          <form onSubmit={handlePublish} className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 lg:p-10">
            
            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
                    <X size={18} /> {error}
                </div>
            )}

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl mb-10 relative">
              {(['sell', 'exchange', 'charity'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMode(t)}
                  className={`relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    mode === t 
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5 scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t === 'sell' && <Tag size={14} />}
                  {t === 'exchange' && <Repeat size={14} />}
                  {t === 'charity' && <Heart size={14} />}
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              {/* Title Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Title</label>
                <input 
                  type="text" 
                  placeholder="What are you listing today?"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                />
              </div>

              {/* Category & Condition Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Category</label>
                  <div className="relative">
                    <select 
                      className="w-full pl-5 pr-10 py-4 bg-slate-50 border-none rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-4 focus:ring-slate-100 appearance-none transition-all outline-none cursor-pointer"
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                    >
                      <option>Tech & Electronics</option>
                      <option>Home & Garden</option>
                      <option>Fashion & Accessories</option>
                      <option>Sports & Outdoors</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Condition</label>
                  <div className="relative">
                    <select 
                      className="w-full pl-5 pr-10 py-4 bg-slate-50 border-none rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-4 focus:ring-slate-100 appearance-none transition-all outline-none cursor-pointer"
                      value={form.condition}
                      onChange={(e) => setForm({...form, condition: e.target.value})}
                    >
                      <option>Brand New</option>
                      <option>Like New</option>
                      <option>Used - Good</option>
                      <option>Used - Fair</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* Dynamic Section Based on Mode */}
              <div className={`p-6 rounded-2xl border transition-all duration-500 ${getModeColor()}`}>
                
                {mode === 'sell' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider opacity-70">Price ($)</label>
                      <button 
                        type="button" 
                        onClick={getAISuggestion} 
                        className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 bg-white/50 hover:bg-white rounded-lg transition-colors"
                      >
                         {isAILoading ? (
                           <span className="animate-pulse">Analyzing...</span>
                         ) : (
                           <><Sparkles size={12} className="text-indigo-500"/> <span className="text-indigo-700">Suggest Price</span></>
                         )}
                      </button>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={24} />
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3 bg-white/80 border-transparent rounded-xl text-2xl font-black text-indigo-900 placeholder:text-indigo-200 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                        value={form.price}
                        onChange={(e) => setForm({...form, price: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {mode === 'exchange' && (
                   <div className="animate-in fade-in slide-in-from-bottom-4">
                    <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">I want to trade for...</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-white/80 border-transparent rounded-xl font-bold text-amber-900 placeholder:text-amber-300 focus:ring-4 focus:ring-amber-500/20 focus:bg-white outline-none transition-all"
                      placeholder="e.g. Macbook Air M1 or Gaming Monitor"
                      value={form.seeking}
                      onChange={(e) => setForm({...form, seeking: e.target.value})}
                    />
                  </div>
                )}

                {mode === 'charity' && (
                   <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
                     <div className="p-3 bg-white rounded-full shadow-sm text-rose-500">
                        <Heart size={24} fill="currentColor" />
                     </div>
                     <div>
                       <h5 className="font-bold text-rose-900">Donation Listing</h5>
                       <p className="text-sm text-rose-700/80 mt-1">
                         This item will be marked as free. Verified non-profits get priority access.
                       </p>
                     </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Description</label>
                <textarea 
                  rows={5}
                  placeholder="Describe the condition, history, and any flaws..."
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl font-medium text-slate-700 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100 resize-none transition-all outline-none"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>
            </div>

            {/* Footer / Submit */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wide bg-emerald-50 px-4 py-2 rounded-full">
                <ShieldCheck size={14} /> 
                Secure Listing
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20`}
              >
                {loading ? (
                    <span>Publishing...</span>
                ) : (
                    <>Publish Listing <ArrowRight size={18} /></>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostItem;