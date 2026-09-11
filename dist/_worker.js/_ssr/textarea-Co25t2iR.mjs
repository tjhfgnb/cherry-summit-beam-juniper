import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { m as cn } from "./router-C0Aafbcp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/textarea-Co25t2iR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-xl bg-surface px-3.5 py-3 text-base text-ink shadow-card", "placeholder:text-faint outline-none transition-[box-shadow] duration-150", "focus-visible:ring-2 focus-visible:ring-accent/35", "disabled:cursor-not-allowed disabled:opacity-50 resize-y", "md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
//#endregion
export { Textarea as t };
