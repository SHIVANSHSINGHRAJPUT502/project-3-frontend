// src/components/SemesterView.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, BookOpen, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { GlassCard } from './GlassCard';

export const SemesterView = () => {
  const location = useLocation();
  const semId = location.pathname.split('/').pop(); 
  
  // State layers to manage the network lifecycle
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSyllabusData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 🌐 LIVE ENDPOINT: Connected directly to your active Render Gateway
        const response = await axios.get(`https://studynexus-backend.onrender.com/api/subjects/${semId}`, {
          withCredentials: true 
        });
        
        setSubjects(response.data);
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError("Failed to connect to the cloud API microservice. Verify your database cluster is whitelisted.");
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabusData();
  }, [semId]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <Link to="/" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">← Return Hub</Link>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Semester {semId} Containers</h2>
          <span className="text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md mt-1 font-semibold">B.Tech Computer Science</span>
        </div>
        <p className="text-slate-400 text-sm">Deploying live notes and curriculum assets dynamically from the server cluster.</p>
      </div>

      {/* ⏳ Case A: Network Request Latency (Loading State) */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Resolving API Handshake...</p>
        </div>
      )}

      {/* ❌ Case B: Backend Is Offline or Connection Times Out (Error State) */}
      {error && !loading && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 max-w-xl mx-auto flex gap-4 items-start">
          <AlertTriangle className="text-rose-400 shrink-0" size={24} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-200">Gateway Timeout Connection Error</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* 🚀 Case C: Successful Data Delivery */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 💡 FIXED: Prevent blackout screen if MongoDB returns an empty array */}
          {subjects.length === 0 ? (
            <div className="col-span-full text-center py-16 border border-dashed border-white/5 rounded-2xl bg-slate-950/40 max-w-md mx-auto p-6">
              <AlertTriangle className="text-amber-400 mx-auto mb-3" size={28} />
              <p className="text-sm text-slate-200 font-semibold">No data payload found for Semester {semId}</p>
              <p className="text-xs text-slate-500 mt-1">Please visit your seeding URL to initialize your course records.</p>
            </div>
          ) : (
            subjects.map((subject) => (
              <GlassCard key={subject._id || subject.id} className="relative group border-white/5 hover:border-blue-500/20">
                <div 
                  style={{
                    background: subject.colorKey === "blue" ? 'linear-gradient(to bottom, #2563eb, #06b6d4)' :
                                subject.colorKey === "purple" ? 'linear-gradient(to bottom, #9333ea, #ec4899)' :
                                subject.colorKey === "amber" ? 'linear-gradient(to bottom, #d97706, #f97316)' :
                                subject.colorKey === "emerald" ? 'linear-gradient(to bottom, #059669, #14b8a6)' :
                                subject.colorKey === "indigo" ? 'linear-gradient(to bottom, #4f46e5, #06b6d4)' :
                                subject.colorKey === "rose" ? 'linear-gradient(to bottom, #e11d48, #f43f5e)' :
                                'linear-gradient(to bottom, #0891b2, #3b82f6)'
                  }}
                  className="absolute top-0 left-0 w-1.5 h-full" 
                />
                
                <div className="pl-2 space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-800/80 border border-white/5 rounded text-slate-400 shadow-inner">
                      {subject.code}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock size={12} className="text-slate-500" />
                      {subject.credits} Credits
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-200 line-clamp-1">
                      {subject.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Verified MERN Payload</p>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-center rounded-xl text-xs font-bold text-slate-200 transition-all border border-white/5 flex items-center justify-center gap-1.5 active:scale-95">
                      <BookOpen size={13} className="text-slate-400" /> Notes
                    </button>
                    <button className="flex-1 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-center rounded-xl text-xs font-bold text-blue-400 border border-blue-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                      📝 PYQs
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
};