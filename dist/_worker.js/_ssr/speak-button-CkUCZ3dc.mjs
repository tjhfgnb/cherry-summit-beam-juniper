import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Volume2 } from "../_libs/lucide-react.mjs";
import { m as cn } from "./router-C0Aafbcp.mjs";
import { n as Button } from "./pos-CHniOR3Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/speak-button-CkUCZ3dc.js
var import_jsx_runtime = require_jsx_runtime();
function ensureVoices() {
	if (typeof window === "undefined" || !window.speechSynthesis) return [];
	const voices = window.speechSynthesis.getVoices();
	if (voices.length);
	return voices;
}
if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => {};
function speakEnglish(text) {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	const trimmed = text.trim();
	if (!trimmed) return;
	window.speechSynthesis.cancel();
	const utter = new SpeechSynthesisUtterance(trimmed);
	utter.lang = "en-US";
	utter.rate = .92;
	const voices = ensureVoices();
	const preferred = voices.find((v) => /en-US/i.test(v.lang) && /natural|premium|enhanced/i.test(v.name)) ?? voices.find((v) => /en-US/i.test(v.lang)) ?? voices.find((v) => /^en/i.test(v.lang));
	if (preferred) utter.voice = preferred;
	window.speechSynthesis.speak(utter);
}
function SpeakButton({ text, className, size = "icon-sm" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size,
		className: cn("text-muted hover:text-accent", className),
		"aria-label": `朗讀 ${text}`,
		onClick: (e) => {
			e.stopPropagation();
			speakEnglish(text);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
	});
}
//#endregion
export { SpeakButton as t };
