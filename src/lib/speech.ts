let voicesReady = false;

function ensureVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) voicesReady = true;
  return voices;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    voicesReady = true;
  };
}

export function speakEnglish(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const trimmed = text.trim();
  if (!trimmed) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = "en-US";
  utter.rate = 0.92;
  const voices = ensureVoices();
  const preferred =
    voices.find((v) => /en-US/i.test(v.lang) && /natural|premium|enhanced/i.test(v.name)) ??
    voices.find((v) => /en-US/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang));
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

void voicesReady;
