import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { d as togglePosKey, m as cn, o as POS_BY_KEY, s as POS_OPTIONS, u as parsePos } from "./router-C0Aafbcp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pos-CHniOR3Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out select-none active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg [&_svg]:pointer-events-none [&_svg]:shrink-0", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:bg-accent-hover shadow-card",
			secondary: "bg-surface text-ink shadow-card hover:bg-surface-2",
			ghost: "text-ink-soft hover:bg-accent-soft/70",
			outline: "bg-transparent text-ink shadow-card hover:bg-surface",
			danger: "bg-danger text-accent-fg hover:opacity-90",
			soft: "bg-accent-soft text-accent hover:bg-accent-soft/80"
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-lg",
			md: "h-11 px-4 text-sm rounded-xl",
			lg: "h-12 px-5 text-base rounded-xl",
			icon: "size-11 rounded-xl",
			"icon-sm": "size-9 rounded-lg"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
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
export { PosPicker as i, Button as n, PosBadge as r, Badge as t };
