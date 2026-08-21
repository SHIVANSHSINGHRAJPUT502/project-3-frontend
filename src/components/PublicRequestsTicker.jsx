// src/components/PublicRequestsTicker.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PublicRequestsTicker() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await axios.get('https://studynexusbackend.vercel.app/api/requests/recent');
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to load recent requests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={10} /> Resolved
          </span>
        );
      case 'in-progress':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Loader2 size={10} className="animate-spin" /> Uploading
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle size={10} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0c1220]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">📑</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Community Requests
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Live Activity</span>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-500 font-mono">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 font-mono">No recent requests</div>
      ) : (
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {requests.slice(0, 6).map((req) => (
            <div
              key={req._id}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-medium text-slate-200 truncate max-w-[120px]">
                  {req.name || 'Anonymous'}
                </span>
                {getStatusBadge(req.status)}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                "{req.message}"
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.03] text-[9px] text-slate-500 font-mono">
                <span>Sem {req.semester}</span>
                <span className="flex items-center gap-1">
                  <Clock size={9} /> {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}