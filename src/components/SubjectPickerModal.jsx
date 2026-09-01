// src/components/SubjectPickerModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, X, CheckCircle2, Plus, Loader2, FileText } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "https://studynexusbackend.vercel.app";

const DEFAULT_SEMESTER_SUBJECTS = {
  1: ["Engineering Mathematics-I", "Engineering Physics", "Basic Electrical Engineering", "Engineering Graphics", "Communication Skills"],
  2: ["Engineering Mathematics-II", "Engineering Chemistry", "Programming in C", "Basic Electronics", "Environmental Studies"],
  3: ["Data Structures & Algorithms", "Digital Electronics", "Object Oriented Programming", "Discrete Mathematics", "Economics for Engineers"],
  4: ["Operating Systems", "Database Management Systems", "Computer Organization & Architecture", "Theory of Computation", "Mathematics-III"],
  5: ["Computer Networks", "Design & Analysis of Algorithms", "Software Engineering", "Microprocessors & Microcontrollers", "Cyber Security"],
  6: ["Compiler Design", "Artificial Intelligence", "Web Technologies", "Cloud Computing", "Data Science Fundamentals"],
  7: ["Machine Learning", "Information Security", "Distributed Systems", "Internet of Things (IoT)", "Elective-I"],
  8: ["Deep Learning", "Block Chain Technology", "Major Project / Internship", "Elective-II"]
};

export default function SubjectPickerModal({ isOpen, onClose, semester, selectedSubject, onSelect }) {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const semNum = Number(semester) || 1;
    setLoading(true);

    axios.get(`${API}/api/admin/subjects/${semNum}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const names = res.data.map(s => s.name);
          const combined = Array.from(new Set([...names, ...(DEFAULT_SEMESTER_SUBJECTS[semNum] || [])]));
          setAvailableSubjects(combined);
        } else {
          setAvailableSubjects(DEFAULT_SEMESTER_SUBJECTS[semNum] || []);
        }
      })
      .catch(() => {
        setAvailableSubjects(DEFAULT_SEMESTER_SUBJECTS[semNum] || []);
      })
      .finally(() => setLoading(false));
  }, [isOpen, semester]);

  if (!isOpen) return null;

  const filtered = availableSubjects.filter(sub => 
    sub.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    const clean = customInput.trim();
    if (!availableSubjects.includes(clean)) {
      setAvailableSubjects(prev => [clean, ...prev]);
    }
    onSelect(clean);
    setCustomInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] text-white font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm font-bold">
            <BookOpen size={16} className="text-cyan-400" />
            <span>Select Semester {semester || 1} Subject</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="relative my-3">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            autoFocus
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-60 scrollbar-thin">
          {loading ? (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
              <Loader2 size={14} className="animate-spin" />
              <span>Fetching subjects...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              No matching subject. Add custom below!
            </div>
          ) : (
            filtered.map((sub, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onSelect(sub); onClose(); }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                  selectedSubject === sub 
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold' 
                    : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText size={13} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{sub}</span>
                </div>
                {selectedSubject === sub && <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />}
              </button>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-white/10 mt-3">
          <label className="block text-[10px] text-slate-400 mb-1">Add custom subject name:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Distributed Operating Systems"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}