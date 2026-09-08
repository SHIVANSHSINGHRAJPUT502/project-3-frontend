// src/hooks/useVoiceChat.js
import { useState, useRef, useEffect } from 'react';
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
  const speakSarah = (text) => {
    playAnyaVoice(
      text,
      () => {
        if (recognitionRef.current) recognitionRef.current.stop();
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
            } catch {
              // Safety catch for browser audio sync
            }
          }, 300);
        } else {
          setVoiceStatus('Voice System Idle');
        }
      }
    );
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
        } catch {
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
          recognition.stop();
          setVoiceStatus('Processing thought...');
          handleDispatchMessage(activeText);
        }, 1800);
      }
    };

    recognitionRef.current = recognition;
    setVoiceStatus('Continuous Engine Ready');

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isTyping]);

  // ── Mic Button Toggle ──
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening || shouldBeListeningRef.current) {
      shouldBeListeningRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      window.speechSynthesis.cancel();
      recognitionRef.current.stop();
      setVoiceStatus('Voice Mode Disabled');
    } else {
      shouldBeListeningRef.current = true;
      window.speechSynthesis.cancel();
      setInputValue('');
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
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

        // Auto-launch full-screen modal whenever a paper/subject is requested
        const lowerPrompt = userPayload.text.toLowerCase();
        const wantsExamScreen = /pyq|paper|question|exam|derive|solve|notes|compiler|operating|dbms|networks|algorithm/i.test(lowerPrompt);

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
            let detectedSubject = "University Examination";
            if (/compiler/i.test(lowerPrompt)) detectedSubject = "Compiler Design";
            else if (/operating|os/i.test(lowerPrompt)) detectedSubject = "Operating Systems";
            else if (/dbms|database/i.test(lowerPrompt)) detectedSubject = "Database Management Systems";
            else if (/network/i.test(lowerPrompt)) detectedSubject = "Computer Networks";

            targetDoc = {
              id: "virtual-pyq-" + Date.now(),
              title: `${detectedSubject} Previous Year Exam Workspace`,
              subject: detectedSubject,
              semester: data.semester || 6,
              url: null,
              type: "PYQ"
            };
          }

          setTimeout(() => {
            setActiveExamDoc(targetDoc);
            setIsExamModalOpen(true);
          }, 600);
        }
      } else if (response.status === 429) {
        setMessages((prev) => [...prev, { sender: 'ai', text: "⚠️ Server limit reached. Let's take a 30-second breather!" }]);
        window.speechSynthesis.cancel();
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: "❌ Connection handshake dropped." }]);
        if (shouldBeListeningRef.current && recognitionRef.current) recognitionRef.current.start();
      }
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: "⚡ Network link down." }]);
      if (shouldBeListeningRef.current && recognitionRef.current) recognitionRef.current.start();
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        isRequestPendingRef.current = false;
      }, 1500);
    }
  };

  const cancelSpeech = () => {
    shouldBeListeningRef.current = false;
    window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  return {
    inputValue,
    setInputValue,
    messages,
    isTyping,
    loadingText,
    voiceStatus,
    shouldBeListening: shouldBeListeningRef.current,
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