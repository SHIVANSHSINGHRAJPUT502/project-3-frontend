// src/components/AdminRequestsTab.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, CheckCircle2, RefreshCw, Clock } from 'lucide-react';

export default function AdminRequestsTab({ token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://studynexusbackend.vercel.app/api/admin/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Mark this request as resolved/completed?')) return;
    try {
      await axios.delete(`https://studynexusbackend.vercel.app/api/admin/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="bg-[#0c1220]/90 border border-white/10 rounded-2xl p-5 shadow-2xl mt-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
        <div>
          <h3 className="text-sm font-mono tracking-wider uppercase text-amber-400 font-bold flex items-center gap-2">
            <span>📑</span> Student PDF Requests ({requests.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Missing notes and pyq requests submitted by students</p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 font-mono">
          No pending PDF requests from students.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-slate-900/80 border border-white/5 hover:border-amber-500/30 p-4 rounded-xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-white tracking-wide">{req.name || 'Anonymous'}</span>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Semester {req.semester}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
                  "{req.message}"
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock size={11} /> {new Date(req.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteRequest(req._id)}
                  className="flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <CheckCircle2 size={12} />
                  <span>Resolve</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}