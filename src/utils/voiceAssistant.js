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

// Ensure voices are actually loaded from the browser before selection
const getAvailableVoices = () => {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
    // Safety timeout fallback
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices() || []);
    }, 300);
  });
};

// Play audio using an energetic, youthful anime acoustic profile
export const playAnyaVoice = async (text, onStart, onEnd) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const voices = await getAvailableVoices();
  const processed = sanitizeVoiceText(text);
  const utterance = new SpeechSynthesisUtterance(processed);

  // Filter for English voices first
  const englishVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));

  // Priority list: modern high-clarity female voices
  const targetVoice = 
    englishVoices.find(v => v.name.includes('Google US English') || v.name.includes('Google UK English Female')) ||
    englishVoices.find(v => v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Aria')) ||
    englishVoices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen')) ||
    englishVoices.find(v => /female/i.test(v.name)) ||
    // Strict safeguard: reject known desktop male voice identifiers
    englishVoices.find(v => !/(david|mark|george|male|guy)/i.test(v.name)) ||
    voices[0];

  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  // Anya Acoustic Profile:
  // 1.55 delivers the high, expressive anime pitch
  utterance.pitch = 1.55;
  // 1.10 keeps cadence nimble and energetic
  utterance.rate = 1.10;
  utterance.volume = 1;

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
};