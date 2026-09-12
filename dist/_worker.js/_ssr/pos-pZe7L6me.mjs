import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as POS_BY_KEY, f as parsePos, l as POS_OPTIONS, m as cn, p as togglePosKey } from "./router-Btse5H2c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pos-pZe7L6me.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent", className),
		children
	});
}
function PosBadge({ pos, className }) {
	const keys = parsePos(pos);
	if (!keys.length) {
		if (!pos.trim()) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			className,
			children: pos
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex flex-wrap gap-1", className),
		children: keys.map((key) => {
			const item = POS_BY_KEY[key];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display",
				children: item.abbr
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1",
				children: item.zh
			})] }, key);
		})
	});
}
function PosPicker({ value, onChange }) {
	const selected = new Set(parsePos(value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1.5",
		children: POS_OPTIONS.map((item) => {
			const on = selected.has(item.key);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-pressed": on,
				onClick: () => onChange(togglePosKey(value, item.key)),
				className: cn("h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150", on ? "bg-accent text-accent-fg" : "bg-bg-warm text-ink-soft shadow-card hover:bg-surface-2"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display",
					children: item.abbr
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-1",
					children: item.zh
				})]
			}, item.key);
		})
	});
}
//#endregion
export { PosBadge as n, PosPicker as r, Badge as t };
