import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Tag, Heart, Sparkles, 
  X, Plus, ChevronRight, ArrowRight, ShieldCheck, Repeat, Image as ImageIcon,
  Loader2, CheckCircle
} from 'lucide-react';
import Header from '../components/Header'; 
import Footer from '../components/Footer';
import { createItem, getAiPriceSuggestion } from '../services/item'; 
import { uploadToImgBB } from '../services/imgbb'; 
import Swal from 'sweetalert2';
import '@sweetalert2/theme-dark/dark.css';

const PostItem = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State ---
  const [mode, setMode] = useState<'sell' | 'exchange' | 'charity'>('sell');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Publishing...");
  const [dragActive, setDragActive] = useState(false);

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: 'Tech & Electronics',
    condition: 'Like New',
    seeking: '',
    description: ''
  });

  // --- Image Handlers ---
  const processFiles = (files: File[]) => {
    if (imageFiles.length + files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImageFiles([...imageFiles, ...files]);
    setPreviews([...previews, ...newPreviews]);
    setError(""); 
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const removeImage = (index: number) => {
    setPreviews(previews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFiles(Array.from(e.dataTransfer.files));
  };

  // --- AI Price Suggestion ---
  const getAISuggestion = async () => {
    if (!form.title) { 
      setError("Please enter a Title first."); 
      return; 
    }

    setIsAILoading(true);
    setError("");

    try {
      let aiImageUrl = "";
      if (imageFiles.length > 0) aiImageUrl = await uploadToImgBB(imageFiles[0]);

      const suggestedPrice = await getAiPriceSuggestion(
        form.title,
        form.category,
        form.condition,
        form.description,
        aiImageUrl
      );

      if (suggestedPrice > 0) {
        setForm(prev => ({ ...prev, price: suggestedPrice.toString() }));
        // Show AI popup
        Swal.fire({
          title: '💰 AI Suggestion',
          text: `Suggested price: LKR ${suggestedPrice}`,
          icon: 'info',
          confirmButtonText: 'Got it!',
          confirmButtonColor: '#4F46E5'
        });
      } else {
        setError("AI could not determine a price.");
      }

    } catch (err: any) {
      console.error("AI Estimation Failed:", err);
      setError("AI service is busy. Enter price manually.");
    } finally {
      setIsAILoading(false);
    }
  };

  // --- Publish Handler ---
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and Description are required.");
      setLoading(false);
      return;
    }

    if (imageFiles.length === 0) {
      setError("Please upload at least one photo.");
      setLoading(false);
      return;
    }

    try {
      setLoadingText("Uploading photos...");
      const imageUrls = await Promise.all(imageFiles.map(file => uploadToImgBB(file)));

      setLoadingText("Creating listing...");
      const itemData = {
        title: form.title,
        description: form.description,
        category: form.category,
        condition: form.condition,
        mode: mode.toUpperCase(),
        price: mode === 'sell' ? form.price : 0,
        seeking: mode === 'exchange' ? form.seeking : '',
        images: imageUrls
      };

      const res = await createItem(itemData);
      console.log(res); 

      if (res) {
        // SweetAlert success popup
        await Swal.fire({
          title: '🎉 Success!',
          text: 'Your item has been published successfully.',
          icon: 'success',
          confirmButtonText: 'Go to Dashboard',
          confirmButtonColor: '#4F46E5',
          timer: 2500,
          timerProgressBar: true
        });
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error(err);
      Swal.fire({
        title: '❌ Failed!',
        text: err.response?.data?.message || "Failed to create listing.",
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTheme = () => {
    switch(mode) {
      case 'sell': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', ring: 'focus:ring-indigo-500', badge: 'bg-indigo-600' };
      case 'exchange': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'focus:ring-amber-500', badge: 'bg-amber-600' };
      case 'charity': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', ring: 'focus:ring-rose-500', badge: 'bg-rose-600' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', ring: 'focus:ring-slate-500', badge: 'bg-slate-500' };
    }
  };
  const theme = getTheme();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <Header />
      <main className="max-w-6xl mx-auto w-full px-4 py-24 lg:py-28">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Listing</h1>
                <p className="text-slate-500 mt-1 font-medium">Post an item to sell, trade, or donate.</p>
            </div>
             <div className="flex items-center gap-3 text-sm font-bold bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <span className="flex items-center gap-2 text-indigo-600">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px]">1</span>
                    Details
                </span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-400">Review</span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-400">Done</span>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* --- LEFT: MEDIA UPLOAD --- */}
          <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
               <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Camera size={18} className={theme.color} /> Photos
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${theme.bg} ${theme.color}`}>{previews.length} / 5</span>
              </div>
              <div className="space-y-4">
                {previews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {previews.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-700 hover:text-red-500 rounded-full shadow-lg">
                                <X size={14} strokeWidth={3} />
                            </button>
                        </div>
                        ))}
                        {previews.length < 5 && (
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-300">
                                <Plus size={20} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 group ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400'}`}>
                        <div className="p-4 rounded-full bg-slate-100 text-slate-400 group-hover:text-indigo-500"><ImageIcon size={32} /></div>
                        <div className="text-center"><p className="text-sm font-bold text-slate-700">Click or Drag photos</p></div>
                    </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} />
            </div>
            
            {/* AI Banner */}
            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-16 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-500/30 transition-colors"></div>
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2 relative z-10"><Sparkles size={16} className="text-yellow-400 fill-yellow-400" /> AI Assistant</h4>
              <p className="text-xs text-slate-300 leading-relaxed relative z-10 font-medium">Upload clear photos to let our AI suggest the best tags and price for your item automatically.</p>
            </div>
          </div>

          {/* --- RIGHT: FORM FIELDS --- */}
          <form onSubmit={handlePublish} className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 lg:p-10 relative">
            
            {error && <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold"><X size={18} /> {error}</div>}
            {success && <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3 text-sm font-bold"><CheckCircle size={20} /> Item Published Successfully!</div>}

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl mb-10">
              {(['sell', 'exchange', 'charity'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setMode(t)} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${mode === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t === 'sell' && <Tag size={14} />} {t === 'exchange' && <Repeat size={14} />} {t === 'charity' && <Heart size={14} />} {t}
                </button>
              ))}
            </div>

            <div className="space-y-8">
               <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Listing Title</label>
                <input type="text" placeholder="e.g. Vintage Canon AE-1 Camera" className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white border-2 rounded-xl text-lg font-bold text-slate-900 outline-none focus:border-indigo-500" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                  <div className="relative">
                    <select className="w-full pl-5 pr-10 py-4 bg-slate-50 border-transparent focus:bg-white border-2 rounded-xl font-bold text-slate-700 focus:border-indigo-500 appearance-none outline-none cursor-pointer" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                      <option>Tech & Electronics</option><option>Home & Garden</option><option>Fashion & Accessories</option><option>Sports & Outdoors</option><option>Musical Instruments</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Condition</label>
                  <div className="relative">
                    <select className="w-full pl-5 pr-10 py-4 bg-slate-50 border-transparent focus:bg-white border-2 rounded-xl font-bold text-slate-700 focus:border-indigo-500 appearance-none outline-none cursor-pointer" value={form.condition} onChange={(e) => setForm({...form, condition: e.target.value})}>
                      <option>Brand New</option><option>Like New</option><option>Used - Good</option><option>Used - Fair</option><option>For Parts</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-500 ${theme.bg} ${theme.border}`}>
                {mode === 'sell' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <label className={`text-xs font-bold uppercase tracking-wider ${theme.color}`}>Price (LKR)</label>
                      {/* AI BUTTON HERE */}
                      <button type="button" onClick={getAISuggestion} disabled={isAILoading} className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/60 hover:bg-white rounded-lg text-xs font-bold text-indigo-700 transition-all shadow-sm">
                          {isAILoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-indigo-500 group-hover:scale-110 transition-transform"/>}
                          {isAILoading ? "Calculating..." : "AI Suggest"}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm pointer-events-none">LKR</span>
                      <input type="number" placeholder="0" className="w-full pl-14 pr-4 py-3 bg-white border-transparent rounded-xl text-3xl font-black text-slate-800 placeholder:text-slate-200 focus:ring-0 outline-none" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
                    </div>
                  </div>
                )}
                 {mode === 'exchange' && (
                   <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">I want to trade for...</label>
                    <div className="relative">
                        <Repeat className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" size={20} />
                        <input type="text" className="w-full pl-12 pr-4 py-4 bg-white border-transparent rounded-xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-0 outline-none text-lg" placeholder="e.g. Macbook Air M1" value={form.seeking} onChange={(e) => setForm({...form, seeking: e.target.value})} />
                    </div>
                  </div>
                )}
                 {mode === 'charity' && (
                   <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="p-3 bg-white rounded-full shadow-sm text-rose-500 shrink-0"><Heart size={24} fill="currentColor" /></div>
                      <div><h5 className="font-bold text-rose-900 text-lg">Donation Listing</h5><p className="text-sm text-rose-700 font-medium mt-1">This item will be listed as <span className="font-black">FREE</span>. Verified students and non-profits will get priority.</p></div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                <textarea rows={6} placeholder="Describe the item..." className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white border-2 rounded-xl font-medium text-slate-700 focus:border-indigo-500 resize-none outline-none" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
                <ShieldCheck size={14} /> Secure Listing
              </div>
              
              <button 
                type="submit"
                disabled={loading || success}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20`}
              >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>{loadingText}</span> 
                    </>
                ) : success ? (
                    <>
                        <CheckCircle size={18} /> <span>Published!</span>
                    </>
                ) : (
                    <>
                        <span>Publish Listing</span> <ArrowRight size={18} />
                    </>
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