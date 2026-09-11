import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as Check } from "../_libs/lucide-react.mjs";
import { m as cn } from "./router-BdPjIZDy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/select-circle-BsJiitbq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-xl bg-surface px-3.5 text-base text-ink shadow-card", "placeholder:text-faint outline-none transition-[box-shadow] duration-150", "focus-visible:ring-2 focus-visible:ring-accent/35", "disabled:cursor-not-allowed disabled:opacity-50", "md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
function SelectCircle({ selected, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("pointer-events-none flex size-7 items-center justify-center rounded-full border-2 transition-[background-color,border-color,transform] duration-100 ease-out-soft", selected ? "scale-100 border-accent bg-accent" : "border-faint bg-transparent", className),
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: cn("size-3.5 text-accent-fg transition-[opacity,transform] duration-150 ease-out-soft", selected ? "scale-100 opacity-100" : "scale-50 opacity-0"),
			strokeWidth: 3
		})
	});
}
//#endregion
export { SelectCircle as n, Input as t };
