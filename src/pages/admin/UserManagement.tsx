import React, { useState } from "react";
import { Trash2, UserCheck, Check } from "lucide-react";

// User Type
export interface User {
  _id: string;
  fullName: string;
  email: string;
  roles?: string[];
  approved?: "APPROVED" | "PENDING" | "REJECTED";
}

// Props
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

  const handleChange = (id: string, value: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (id: string) => {
    const newStatus = localStatuses[id] as "APPROVED" | "PENDING" | "REJECTED";
    onUpdateStatus(id, newStatus);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <main className="max-w-6xl mx-auto w-full px-4 py-24 lg:py-28">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              User Directory
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Manage all registered users here.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-8 py-6 bg-slate-50 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                All Users
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Total Users: {users.length}
              </p>
            </div>

            <div className="overflow-x-auto relative">
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
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100 uppercase">
                            {user.fullName?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.fullName}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-400 lowercase">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide ${
                            user.roles?.includes("ADMIN")
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {user.roles?.[0] || "USER"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={localStatuses[user._id]}
                          onChange={(e) => handleChange(user._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                            localStatuses[user._id] === "APPROVED"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : localStatuses[user._id] === "REJECTED"
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          <option value="APPROVED">Approved</option>
                          <option value="PENDING">Pending</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(user._id)}
                            title="Save Status"
                            className="p-2 bg-white border border-slate-200 rounded-xl text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-1"
                          >
                            <Check size={16} /> Save
                          </button>
                          <button
                            onClick={() => onDelete(user._id)}
                            title="Remove User"
                            className="p-2 bg-white border border-slate-200 rounded-xl text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="p-20 text-center">
                  <UserCheck className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-semibold italic">No users found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
