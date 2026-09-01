// src/components/ContributeModal.jsx
import React, { useState, useEffect } from 'react';
import { X, UploadCloud, CheckCircle, Loader2, FileUp, Link2 } from 'lucide-react';
import axios from 'axios';

const API = "https://studynexusbackend.vercel.app";

export const ContributeModal = ({ isOpen, onClose, semId, subjects = [] }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'link'
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    type: 'Notes',
    fileUrl: '',
    uploaderName: ''
  });

  // Automatically select the first available subject on open
  useEffect(() => {
    if (subjects.length > 0) {
      const firstSub = typeof subjects[0] === 'string' ? subjects[0] : subjects[0].name;
      setFormData(prev => ({ ...prev, subject: prev.subject || firstSub }));
    }
  }, [subjects, isOpen]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    setSubmitSuccess(false);
    setSelectedFile(null);
    setUploadMode('file');
    setFormData({
      title: '',
      subject: subjects.length > 0 ? (typeof subjects[0] === 'string' ? subjects[0] : subjects[0].name) : '',
      type: 'Notes',
      fileUrl: '',
      uploaderName: ''
    });
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        alert('Please select a valid PDF file.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('File size exceeds 20MB limit.');
        return;
      }
      setSelectedFile(file);
      // Auto-fill title with filename if empty
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject) {
      alert("Please select a subject.");
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      alert("Please choose a PDF file from your device.");
      return;
    }

    if (uploadMode === 'link' && !formData.fileUrl.trim()) {
      alert("Please enter a valid PDF or Google Drive URL.");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('subject', formData.subject.trim());
      data.append('semester', Number(semId));
      data.append('type', formData.type);
      data.append('uploaderName', formData.uploaderName?.trim() || 'Student Contributor');

      if (uploadMode === 'file' && selectedFile) {
        data.append('pdf', selectedFile);
      } else {
        data.append('fileUrl', formData.fileUrl.trim());
      }

      await axios.post(`${API}/api/admin/notes/submit-file`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSubmitSuccess(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.response?.data?.error || "Submission failed. Please verify your file or link and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b1120] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left">
        <button
          onClick={handleModalClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-900 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        {submitSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">Submission In Review!</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your PDF has been sent to admin moderation. Once verified for syllabus accuracy, it will be published under <strong className="text-cyan-300">{formData.subject}</strong>.
            </p>
            <button
              onClick={handleModalClose}
              className="px-6 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/20 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <UploadCloud size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload Study Material</h3>
                <p className="text-[11px] font-mono text-slate-400">Semester {semId} • Direct Upload or Link</p>
              </div>
            </div>

            {/* Upload Method Selector Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/5 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  uploadMode === 'file'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileUp size={14} />
                <span>Upload PDF File</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  uploadMode === 'link'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Link2 size={14} />
                <span>Paste Link</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Subject Dropdown */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Select Subject</label>
                {subjects.length > 0 ? (
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                  >
                    {subjects.map((sub, i) => {
                      const name = typeof sub === 'string' ? sub : sub.name;
                      return (
                        <option key={i} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compiler Design"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                  />
                )}
              </div>

              {/* Title / Chapter Name */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Title / Chapter Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 2 - Complete Parsing Notes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Resource Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Notes', 'PYQ', 'Syllabus'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                        formData.type === t
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-inner'
                          : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic File Upload / URL Input */}
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Select PDF from Device</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-cyan-500/40 bg-slate-900/50 rounded-2xl p-4 cursor-pointer transition-all">
                    <FileUp size={24} className="text-slate-400 mb-1.5" />
                    <span className="text-xs font-semibold text-slate-300 truncate max-w-[240px]">
                      {selectedFile ? selectedFile.name : "Tap to choose PDF (Max 20MB)"}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 font-mono">Accepts .pdf files</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">PDF URL / Google Drive Link</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or direct link"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
              )}

              {/* Contributor Credit (Optional) */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Your Name </label>
                <input
                  type="text"
                  placeholder="e.g. Student Contributor"
                  value={formData.uploaderName}
                  onChange={(e) => setFormData({ ...formData, uploaderName: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold tracking-wider uppercase text-[11px] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                {submitting ? 'Submitting to Moderation...' : 'Submit Resource'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContributeModal;