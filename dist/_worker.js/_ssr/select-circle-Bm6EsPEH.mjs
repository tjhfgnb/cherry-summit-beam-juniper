import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as Check } from "../_libs/lucide-react.mjs";
import { m as cn } from "./router-Btse5H2c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/select-circle-Bm6EsPEH.js
var import_jsx_runtime = require_jsx_runtime();
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
export { SelectCircle as t };
