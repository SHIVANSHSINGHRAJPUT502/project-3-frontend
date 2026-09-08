// src/hooks/useVoiceChat.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { LOADING_PHRASES, playAnyaVoice } from '../utils/voiceAssistant.js';

export const useVoiceChat = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hey! Continuous voice mode is primed. Talk to me completely hands-free! Just speak, pause, and I'll answer—the mic will stay live until you turn it off! 🚀"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Voice System Idle');
  const [activeExamDoc, setActiveExamDoc] = useState(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const shouldBeListeningRef = useRef(false);
  const isRequestPendingRef = useRef(false);

  // ── Speech Synthesis Callback ──
  const speakSarah = useCallback((text) => {
    playAnyaVoice(
      text,
      () => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (_) {}
        }
        setVoiceStatus('Sarah is speaking...');
      },
      () => {
        if (shouldBeListeningRef.current && recognitionRef.current && !isRequestPendingRef.current) {
          setInputValue('');
          setVoiceStatus('Sarah finished. Listening for you...');
          setTimeout(() => {
            try {
              if (shouldBeListeningRef.current && !window.speechSynthesis.speaking) {
                recognitionRef.current.start();
              }
            } catch (_) {
              // Safety catch for browser audio sync
            }
          }, 300);
        } else {
          setVoiceStatus('Voice System Idle');
        }
      }
    );
  }, []);

  // ── Helper: Subject Matching ──
  const extractSubjectContext = (prompt) => {
    const lower = prompt.toLowerCase();
    if (/compiler|cd\b/i.test(lower)) return "Compiler Design";
    if (/operating|os\b/i.test(lower)) return "Operating Systems";
    if (/dbms|database/i.test(lower)) return "Database Management Systems";
    if (/network|cn\b/i.test(lower)) return "Computer Networks";
    if (/algorithm|daa\b/i.test(lower)) return "Design & Analysis of Algorithms";
    if (/math|mathematics/i.test(lower)) return "Engineering Mathematics";
    return "University Examination";
  };

  // ── Network Dispatch & Auto Exam Trigger ──
  const handleDispatchMessage = async (textToSend = inputValue) => {
    const cleanText = textToSend.trim();
    if (!cleanText) return;

    if (isRequestPendingRef.current) return;
    isRequestPendingRef.current = true;

    const userPayload = { sender: 'user', text: cleanText };
    setMessages((prev) => [...prev, userPayload]);
    setInputValue('');

    const randomPhrase = LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)];
    setLoadingText(randomPhrase);
    setIsTyping(true);

    try {
      const response = await fetch('https://studynexusbackend.vercel.app/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userPayload.text })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply,
            resources: data.resources || [],
            semester: data.semester || null
          }
        ]);
        speakSarah(data.reply);

        // ── RELIABLE SYNCHRONOUS MODAL TRIGGER ──
        const lowerPrompt = userPayload.text.toLowerCase();
        const wantsExamScreen = /pyq|previous year|paper|question|exam|derive|solve|notes|syllabus/i.test(lowerPrompt) ||
                                /compiler|operating|dbms|networks|algorithm/i.test(lowerPrompt);

        if (wantsExamScreen) {
          let targetDoc = null;

          if (data.resources && data.resources.length > 0) {
            const topDoc = data.resources[0];
            targetDoc = {
              id: topDoc.id || topDoc._id,
              title: topDoc.title,
              subject: topDoc.subject,
              semester: topDoc.semester,
              url: topDoc.url || topDoc.s3Url,
              type: topDoc.type || 'PYQ'
            };
          } else {
            const detectedSubject = extractSubjectContext(lowerPrompt);
            targetDoc = {
              id: "virtual-pyq-" + Date.now(),
              title: `${detectedSubject} Examination Workspace`,
              subject: detectedSubject,
              semester: data.semester || 6,
              url: null, // Modal defaults directly to solver pane
              type: "PYQ"
            };
          }

          // Direct state dispatch (prevents timer drops)
          setActiveExamDoc(targetDoc);
          setIsExamModalOpen(true);
        }
      } else if (response.status === 429) {
        setMessages((prev) => [...prev, { sender: 'ai', text: "⚠️ Server limit reached. Let's take a 30-second breather!" }]);
        window.speechSynthesis.cancel();
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: "❌ Connection handshake dropped." }]);
        if (shouldBeListeningRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (_) {}
        }
      }
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: "⚡ Network link down." }]);
      if (shouldBeListeningRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (_) {}
      }
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        isRequestPendingRef.current = false;
      }, 1200);
    }
  };

  // ── Speech Recognition Lifecycle ──
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Speech API Not Supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('Sarah is listening... Speak freely!');
    };

    recognition.onerror = (event) => {
      console.error('Mic Error:', event.error);
      if (event.error === 'no-speech') return;
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (shouldBeListeningRef.current && !window.speechSynthesis.speaking && !isTyping && !isRequestPendingRef.current) {
        try {
          recognition.start();
        } catch (_) {
          // Handled restart
        }
      }
    };

    recognition.onresult = (event) => {
      if (window.speechSynthesis.speaking || isTyping || isRequestPendingRef.current) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        return;
      }

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      if (activeText.trim()) {
        setInputValue(activeText);

        silenceTimerRef.current = setTimeout(() => {
          try { recognition.stop(); } catch (_) {}
          setVoiceStatus('Processing thought...');
          handleDispatchMessage(activeText);
        }, 1800);
      }
    };

    recognitionRef.current = recognition;
    setVoiceStatus('Continuous Engine Ready');

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isTyping]);

  // ── Mic Button Toggle ──
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening || shouldBeListeningRef.current) {
      shouldBeListeningRef.current = false;
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      window.speechSynthesis.cancel();
      try { recognitionRef.current.stop(); } catch (_) {}
      setVoiceStatus('Voice Mode Disabled');
    } else {
      shouldBeListeningRef.current = true;
      setIsListening(true);
      window.speechSynthesis.cancel();
      setInputValue('');
      try {
        recognitionRef.current.start();
      } catch (_) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    }
  };

  const cancelSpeech = () => {
    shouldBeListeningRef.current = false;
    setIsListening(false);
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
  };

  return {
    inputValue,
    setInputValue,
    messages,
    isTyping,
    loadingText,
    isListening,
    voiceStatus,
    shouldBeListening: isListening,
    activeExamDoc,
    setActiveExamDoc,
    isExamModalOpen,
    setIsExamModalOpen,
    speakSarah,
    toggleListening,
    handleDispatchMessage,
    cancelSpeech
  };
};