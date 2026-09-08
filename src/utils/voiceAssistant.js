// src/utils/voiceAssistant.js

// Witty, playful loading lines in the same tone
export const LOADING_PHRASES = [
  "Searching for that girl who cheated on you...",
  "Recalculating your life choices after semester exams...",
  "Consulting the backbencher who passed without studying...",
  "Bribing the attendance server for 75%...",
  "Finding who asked in the first place...",
  "Decryption key found under the hostel pillow...",
  "Checking if your GPA can still be saved..."
];

// Clean text for smooth, expressive speech output
export const sanitizeVoiceText = (text) => {
  if (!text) return '';
  
  let cleaned = text.replace(/(https?:\/\/[^\s]+)/g, 'Check out the link on your screen!');
  cleaned = cleaned
    .replace(/[*#`_~>]/g, '')
    .replace(/[-+]\s+/g, '')
    .replace(/\\/g, '')
    .trim();

  return cleaned.replace(/\.(?!\d)/g, '! ');
};

// Play audio using an energetic, youthful anime acoustic profile
export const playAnyaVoice = (text, onStart, onEnd) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const processed = sanitizeVoiceText(text);
  const utterance = new SpeechSynthesisUtterance(processed);
  const voices = window.speechSynthesis.getVoices();

  // Pick clear, natural female voices available across modern browsers
  const targetVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.includes('Google US English') || 
     v.name.includes('Victoria') || 
     v.name.includes('Samantha') || 
     v.name.includes('Natural') || 
     v.name.includes('Jenny') || 
     v.name.includes('Ana'))
  ) || voices.find(v => v.lang.startsWith('en') && (v.name.includes('female') || v.name.includes('Female')));

  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  // Anya voice settings: high pitch and upbeat pace
  utterance.pitch = 1.48;
  utterance.rate = 1.08;
  utterance.volume = 1;

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
};