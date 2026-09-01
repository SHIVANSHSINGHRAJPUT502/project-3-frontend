// src/components/AdminRequestsTab.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  FileText, 
  ExternalLink, 
  XCircle, 
  ShieldCheck, 
  MessageSquareCode,
  Loader2,
  AlertCircle
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://studynexusbackend.vercel.app';

export default function AdminRequestsTab({ token }) {
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' or 'requests'
  
  // Student Requests State
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // PDF Moderation State
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Helper to retrieve auth token
  const getAuthToken = () => token || localStorage.getItem('admin_token') || localStorage.getItem('token');

  // Fetch Student Missing-PDF Tickets
  const fetchRequests = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingRequests(true);
    try {
      const authToken = getAuthToken();
      const res = await axios.get(`${API}/api/admin/requests`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.requests || []);
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      if (!isSilent) setLoadingRequests(false);
    }
  }, [token]);

  // Fetch Pending User-Uploaded PDFs
  const fetchPendingNotes = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingNotes(true);
    try {
      const authToken = getAuthToken();
      const res = await axios.get(`${API}/api/admin/notes/pending`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      const data = res.data?.notes || (Array.isArray(res.data) ? res.data : []);
      setPendingNotes(data);
    } catch (err) {
      console.error('Failed to fetch pending notes', err);
    } finally {
      if (!isSilent) setLoadingNotes(false);
    }
  }, [token]);

  useEffect(() => {
    // 1. Initial fetch
    fetchRequests(false);
    fetchPendingNotes(false);

    // 2. Auto-poll every 10 seconds in the background
    const interval = setInterval(() => {
      fetchRequests(true);
      fetchPendingNotes(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchRequests, fetchPendingNotes]);

  // Handle Request Resolution
  const deleteRequest = async (id) => {
    if (!window.confirm('Mark this student request as resolved?')) return;
    try {
      const authToken = getAuthToken();
      await axios.delete(`${API}/api/admin/requests/${id}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  // Approve User-Uploaded PDF
  const handleApproveNote = async (id) => {
    try {
      setActionLoading(id);
      const authToken = getAuthToken();
      await axios.patch(
        `${API}/api/admin/notes/${id}/approve`,
        {},
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }
      );
      setPendingNotes((prev) => prev.filter((item) => item._id !== id));
      setFeedback({ type: 'success', message: 'Resource approved & live on StudyNexus!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to approve resource.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Reject User-Uploaded PDF
  const handleRejectNote = async (id) => {
    if (!window.confirm('Are you sure you want to reject and delete this PDF submission?')) return;
    try {
      setActionLoading(id);
      const authToken = getAuthToken();
      await axios.delete(`${API}/api/admin/notes/${id}/reject`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      setPendingNotes((prev) => prev.filter((item) => item._id !== id));
      setFeedback({ type: 'success', message: 'Submission rejected and cleared from queue.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to reject resource.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleRefreshCurrent = () => {
    if (activeTab === 'moderation') fetchPendingNotes(false);
    else fetchRequests(false);
  };

  return (
    <div className="bg-[#0c1220]/90 border border-white/10 rounded-2xl p-5 shadow-2xl mt-6">
      {/* Top Controls & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'moderation'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={14} />
            <span>PDF MODERATION ({pendingNotes.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquareCode size={14} />
            <span>STUDENT TICKETS ({requests.length})</span>
          </button>
        </div>

        <button
          onClick={handleRefreshCurrent}
          disabled={loadingRequests || loadingNotes}
          className="p-2 self-end sm:self-auto bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 transition"
          title="Refresh Active Queue"
        >
          <RefreshCw size={14} className={(loadingRequests || loadingNotes) ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Action Notification Banner */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <AlertCircle size={14} />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── TAB 1: PDF MODERATION QUEUE ── */}
      {activeTab === 'moderation' && (
        <div className="mt-4 space-y-3">
          {loadingNotes && pendingNotes.length === 0 ? (
            <div className="py-12 flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs">
              <Loader2 size={16} className="animate-spin" />
              <span>Scanning moderation records...</span>
            </div>
          ) : pendingNotes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-mono">
              Moderation queue is empty. No user-uploaded PDFs awaiting approval.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingNotes.map((note) => (
                <div
                  key={note._id}
                  className="bg-slate-900/80 border border-white/5 hover:border-cyan-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText size={15} className="text-cyan-400 shrink-0" />
                      <span className="font-bold text-sm text-white truncate">{note.title}</span>
                      <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        Sem {note.semester}
                      </span>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                        {note.subject}
                      </span>
                      <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                        {note.type || 'Notes'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span>Submitted by: <strong className="text-slate-200">{note.uploaderName || note.uploadedBy || 'Student Contributor'}</strong></span>
                      {note.createdAt && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock size={11} /> {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {note.s3Url && (
                      <a
                        href={note.s3Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Preview PDF</span>
                        <ExternalLink size={12} />
                      </a>
                    )}

                    <button
                      disabled={actionLoading === note._id}
                      onClick={() => handleApproveNote(note._id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve</span>
                    </button>

                    <button
                      disabled={actionLoading === note._id}
                      onClick={() => handleRejectNote(note._id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: STUDENT MISSING-NOTES REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="mt-4 space-y-3">
          {loadingRequests && requests.length === 0 ? (
            <div className="py-12 flex items-center justify-center gap-2 text-amber-400 font-mono text-xs">
              <Loader2 size={16} className="animate-spin" />
              <span>Fetching student requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-mono">
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
      )}
    </div>
  );
}