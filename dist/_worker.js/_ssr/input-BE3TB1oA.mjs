import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { m as cn } from "./router-Btse5H2c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-BE3TB1oA.js
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
//#endregion
export { Input as t };
