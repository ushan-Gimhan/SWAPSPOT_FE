import React, { useState } from "react";
import { Trash2, UserCheck, Check, FileText, Loader2 } from "lucide-react";
import { createUserReports } from "../../services/auth";
import Swal from "sweetalert2";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  roles?: any[]; 
  approved?: "APPROVED" | "PENDING" | "REJECTED";
}

export interface UserManagementProps {
  users: User[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: "APPROVED" | "PENDING" | "REJECTED") => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onDelete, onUpdateStatus }) => {
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    users.reduce((acc, u) => {
      acc[u._id] = u.approved || "PENDING";
      return acc;
    }, {} as Record<string, string>)
  );
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper to check for Admin role safely across different data formats
  const checkIsAdmin = (user: User) => {
    return user.roles?.some(role => 
      typeof role === 'string' 
        ? role.toUpperCase() === 'ADMIN' 
        : role.name?.toUpperCase() === 'ADMIN'
    );
  };

  const handleDownloadPDF = async () => {
    if (users.length === 0) return;
    setIsGenerating(true);
    try {
      // Pass the current UI state (localStatuses) to the PDF generator
      const pdfBlobData = await createUserReports(
        users.map(u => ({ ...u, approved: localStatuses[u._id] || u.approved }))
      );

      const url = window.URL.createObjectURL(new Blob([pdfBlobData], { type: 'application/pdf' }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `User_Report_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({ icon: 'success', title: 'Export Complete', timer: 1500, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Export Failed', text: 'Backend server error.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (id: string, value: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (id: string) => {
    const user = users.find(u => u._id === id);
    
    if (user && checkIsAdmin(user)) {
      return Swal.fire({ 
        icon: 'error', 
        title: 'Permission Denied', 
        text: 'Administrator status cannot be modified via this panel.' 
      });
    }

    const newStatus = localStatuses[id] as "APPROVED" | "PENDING" | "REJECTED";
    onUpdateStatus(id, newStatus);
    
    Swal.fire({
      icon: 'success',
      title: 'Updated',
      toast: true,
      position: 'top-end',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true
    });
  };

  const confirmDelete = (id: string) => {
    const user = users.find(u => u._id === id);

    if (user && checkIsAdmin(user)) {
      return Swal.fire({
        icon: 'error',
        title: 'Action Blocked',
        text: 'System Protection: Admin accounts cannot be deleted.'
      });
    }

    Swal.fire({
      title: 'Remove User?',
      text: `Are you sure you want to delete ${user?.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(id);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <main className="max-w-6xl mx-auto w-full px-4 py-24 lg:py-28">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Directory</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage permissions and export reports.</p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating || users.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {isGenerating ? "Generating..." : "Export PDF Report"}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">All Registered Users</h3>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Total: {users.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Identity</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Approval</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isAdmin = checkIsAdmin(user);
                  return (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border uppercase ${isAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            {user.fullName?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.fullName}</p>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${isAdmin ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                          {isAdmin ? "ADMIN" : "USER"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          disabled={isAdmin}
                          value={localStatuses[user._id]}
                          onChange={(e) => handleChange(user._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase disabled:opacity-40 cursor-pointer transition-all ${localStatuses[user._id] === "APPROVED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : localStatuses[user._id] === "REJECTED" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}
                        >
                          <option value="APPROVED">Approved</option>
                          <option value="PENDING">Pending</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!isAdmin && (
                            <button 
                              onClick={() => handleSave(user._id)} 
                              title="Save Changes"
                              className="p-2 bg-white border border-slate-200 rounded-xl text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => confirmDelete(user._id)} 
                            title="Delete User"
                            className="p-2 bg-white border border-slate-200 rounded-xl text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;