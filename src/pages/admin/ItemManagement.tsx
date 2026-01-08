import React, { useState } from "react";
import { Trash2, ExternalLink, Package, Tag, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { updateItemStatus, deleteItem ,createUserItemReport } from "../../services/item";
const MySwal = Swal;

export interface Item {
  _id: string;
  title: string;
  price?: number;
  category: string;
  status: "available" | "pending" | "sold";
  sellerName: string;
  sellerImage?: string;
  images?: string[];
}
export interface ItemManagementProps {
  items: Item[];
  onDeleteItem: (id: string) => void;
  onUpdateItemStatus: (id: string, status: Item["status"]) => void;
}

const ItemManagement: React.FC<ItemManagementProps> = ({
  items,
  onDeleteItem,
  onUpdateItemStatus,
}) => {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Handle Status Change ---
  const handleStatusChange = async (id: string, status: Item["status"]) => {
    setLoadingStatus(id);
    try {
      await updateItemStatus(id, status);
      onUpdateItemStatus(id, status);
      MySwal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Item status updated to ${status}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update item status",
      });
    } finally {
      setLoadingStatus(null);
    }
  };

  // --- Handle Delete Item ---
  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      icon: "warning",
      title: "Delete Item?",
      text: "This action cannot be undone!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteItem(id);
        onDeleteItem(id);
        MySwal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Item has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete item",
        });
      }
    }
  };

  // --- Handle PDF Report Generation ---
  const handleDownloadPDF = async () => {
  if (items.length === 0) return;
  setIsGenerating(true);

  try {
    const pdfBlob = await createUserItemReport(items);

    // create a download link
    const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Items_Report_${new Date().getTime()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    MySwal.fire({ icon: "success", title: "PDF Generated!", timer: 1500, showConfirmButton: false });
  } catch (err) {
    console.error(err);
    MySwal.fire({ icon: "error", title: "Failed to generate report" });
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Market Inventory</h1>
          <p className="text-slate-500 mt-1 font-medium">Monitor and moderate all trade listings.</p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating || items.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
          {isGenerating ? "Generating..." : "Export PDF Report"}
        </button>
      </div>

      <div className="w-full bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Active Listings</h3>
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-black">
            {items.length} Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-5">Product Details</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Value</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-all group">
                  {/* Product Details */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {item.sellerImage ? (
                          <img src={item.sellerImage} alt={item.sellerName} className="object-cover w-full h-full" />
                        ) : (
                          <Package size={20} className="text-slate-400 m-auto" />
                        )}
                      </div>

                      <div className="flex gap-2">
                        {item.images && item.images.length > 0 ? (
                          item.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner cursor-pointer overflow-hidden"
                              onClick={() => setModalImage(img)}
                            >
                              <img src={img} alt={`${item.title} ${idx + 1}`} className="object-cover w-full h-full" />
                            </div>
                          ))
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Package size={20} />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                          Seller: {item.sellerName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <Tag size={14} className="text-indigo-500" />
                      {item.category}
                    </div>
                  </td>

                  {/* Value */}
                  <td className="px-8 py-5">
                    <span className="font-black text-slate-900 text-sm">
                      ${item.price?.toLocaleString() ?? "0"}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-8 py-5">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value as Item["status"])}
                      disabled={loadingStatus === item._id}
                      className="text-sm font-bold border px-2 py-1 rounded"
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all">
                        <ExternalLink size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:shadow-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img src={modalImage} alt="Preview" className="max-h-[80%] max-w-[80%] rounded-2xl shadow-lg" />
        </div>
      )}
    </div>
  );
};

// --- Status Badge (optional) ---
const StatusBadge = ({ status }: { status: Item["status"] }) => {
  const configs: Record<string, { color: string; icon: any }> = {
    available: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
    pending: { color: "text-amber-600 bg-amber-50 border-amber-100", icon: AlertCircle },
    sold: { color: "text-slate-400 bg-slate-100 border-slate-200", icon: Package },
  };

  const { color, icon: Icon } = configs[status] || {
    color: "text-slate-400 bg-slate-100 border-slate-200",
    icon: Package,
  };

  return (
    <div
      className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${color}`}
    >
      <Icon size={12} />
      {status || "unknown"}
    </div>
  );
};

export default ItemManagement;
