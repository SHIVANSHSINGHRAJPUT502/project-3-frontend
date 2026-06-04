// src/components/AIChatPopup.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, Mic, Volume2 } from 'lucide-react';

const LOADING_PHRASES = [
  "Bypassing NASA firewalls...",
  "Overclocking the local dynamic matrix...",
  "Feeding the server hamsters...",
  "Re-routing the mainframe through Panipat traffic...",
  "Downloading more RAM from the cloud...",
  "Escaping the infinite recursion loop..."
];

export const AIChatPopup = ({ isOpen, onClose }) => {
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
  
  const scrollTrackerRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);      
  const shouldBeListeningRef = useRef(false);  
  const isRequestPendingRef = useRef(false); 

  useEffect(() => {
    if (scrollTrackerRef.current) {
      scrollTrackerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

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
        } catch (e) {
          console.log("Mic restart cycle handled cleanly.");
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

        // Auto-submit after 1.8 seconds of human silence
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

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); 

    // Intercept raw web links and replace them in the audio channel
    let vocalText = text.replace(/(https?:\/\/[^\s]+)/g, 'Check out the live link on your screen!');

    let processedText = vocalText.replace(/[*#`_\-]/g, '').trim();
    if (!processedText.toLowerCase().startsWith('hey') && !processedText.toLowerCase().startsWith('oh')) {
      processedText = "Alright! " + processedText;
    }
    processedText = processedText.replace(/\.(?!\d)/g, '! ');

    const utterance = new SpeechSynthesisUtterance(processedText);
    const voices = window.speechSynthesis.getVoices();
    
    let femaleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Zira'))
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    
    utterance.rate = 1.14;
    utterance.pitch = 1.25;

    utterance.onstart = () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      setVoiceStatus('Sarah is speaking...');
    };

    utterance.onend = () => {
      if (shouldBeListeningRef.current && recognitionRef.current && !isRequestPendingRef.current) {
        setInputValue('');
        setVoiceStatus('Sarah finished. Listening for you...');
        setTimeout(() => {
          try {
            if (shouldBeListeningRef.current && !window.speechSynthesis.speaking) {
              recognitionRef.current.start();
            }
          } catch (e) {
            console.log("Safe reset bypass.");
          }
        }, 300); 
      } else {
        setVoiceStatus('Voice System Idle');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

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
      } catch (e) {
        recognitionRef.current.stop();
      }
    }
  };

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
      // 🌐 LIVE ENDPOINT CONNECTED TO YOUR PRODUCTION RENDER CLUSTER
      const response = await fetch('https://studynexus-backend.onrender.com/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userPayload.text })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
        speakText(data.reply);
      } else if (response.status === 429) {
        setMessages((prev) => [...prev, { sender: 'ai', text: "⚠️ Google's free-tier limit reached. Let's take a 30-second breather before talking!" }]);
        window.speechSynthesis.cancel();
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: "❌ Connection handshake dropped." }]);
        if (shouldBeListeningRef.current && recognitionRef.current) recognitionRef.current.start();
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: "⚡ Network link down." }]);
      if (shouldBeListeningRef.current && recognitionRef.current) recognitionRef.current.start();
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        isRequestPendingRef.current = false;
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleDispatchMessage();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          /* 💡 FIXED: Fluid multi-device container scaling bounds */
          className="fixed bottom-20 md:bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 h-[70vh] sm:h-[530px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden text-white"
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(to right, rgba(37, 99, 235, 0.15), rgba(147, 51, 234, 0.15))' }} className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <h3 className="font-semibold text-sm text-white">ASK SARAH</h3>
                <span className={`text-[10px] flex items-center gap-1 font-mono ${shouldBeListeningRef.current ? 'text-rose-400 font-bold' : 'text-cyan-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${shouldBeListeningRef.current ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`} /> 
                  {voiceStatus}
                </span>
              </div>
            </div>
            <button onClick={() => { shouldBeListeningRef.current = false; window.speechSynthesis.cancel(); onClose(); }} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages Screen */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm scrollbar-none">
            {messages.map((msg, index) => (
              <div key={index} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed group relative ${msg.sender === 'user' ? 'bg-blue-600 text-white font-medium rounded-tr-none' : 'bg-slate-800/60 border border-white/5 text-slate-300 rounded-tl-none whitespace-pre-wrap'}`}>
                  {msg.text}
                  {msg.sender === 'ai' && (
                    <button onClick={() => speakText(msg.text)} className="absolute -bottom-5 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-cyan-400 flex items-center gap-1 text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-white/10">
                      <Volume2 size={10} /> Replay Voice
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex w-full justify-start">
                <div className="bg-slate-800/40 border border-white/5 px-4 py-2.5 rounded-xl rounded-tl-none text-cyan-400 flex items-center gap-2 text-xs font-mono">
                  <Loader2 size={12} className="animate-spin" />
                  {loadingText}
                </div>
              </div>
            )}
            <div ref={scrollTrackerRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-950/50 border-t border-white/10 flex gap-3 items-center">
            <div className="relative flex items-center justify-center">
              <AnimatePresence>
                {shouldBeListeningRef.current && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className="absolute w-11 h-11 bg-rose-500/30 rounded-xl pointer-events-none"
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.3 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeOut" }}
                      className="absolute w-11 h-11 bg-rose-500/20 rounded-xl pointer-events-none"
                    />
                  </>
                )}
              </AnimatePresence>

              <button 
                onClick={toggleListening}
                className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
                  shouldBeListeningRef.current 
                    ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 shadow-inner'
                }`}
                title={shouldBeListeningRef.current ? "Click to stop continuous mode" : "Start continuous voice chat"}
              >
                {shouldBeListeningRef.current ? (
                  <div className="flex items-end justify-center gap-[2.5px] h-4 w-5">
                    <motion.span animate={{ height: ["4px", "16px", "4px"] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-[3px] bg-white rounded-full" />
                    <motion.span animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.45, ease: "easeInOut", delay: 0.15 }} className="w-[3px] bg-white rounded-full" />
                    <motion.span animate={{ height: ["4px", "18px", "4px"] }} transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.05 }} className="w-[3px] bg-white rounded-full" />
                    <motion.span animate={{ height: ["4px", "10px", "4px"] }} transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", delay: 0.2 }} className="w-[3px] bg-white rounded-full" />
                  </div>
                ) : (
                  <Mic size={16} />
                )}
              </button>
            </div>

            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={shouldBeListeningRef.current ? "Hands-free active... speak freely" : "Type or click mic to talk..."} 
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-white placeholder:text-slate-500 transition-colors focus:border-white/20"
            />
            
            <button onClick={() => handleDispatchMessage()} style={{ background: 'linear-gradient(to right, #2563eb, #06b6d4)' }} className="p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Send size={16} className="text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};