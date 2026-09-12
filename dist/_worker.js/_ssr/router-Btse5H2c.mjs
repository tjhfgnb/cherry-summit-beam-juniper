import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, M as literal, P as number, R as string, k as array, z as union } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-CVqXY6bk.mjs";
import { a as hasGateSessionMarker, n as auth } from "./server-fBy9HSH6.mjs";
import { t as authMiddleware } from "./middleware-2UtE0-LH.mjs";
import { c as Repeat, f as ListPlus, g as BookOpen, p as Languages, r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Btse5H2c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var subscribeToNothing = () => () => {};
var noGateOnServer = () => false;
function AccountChip({ className }) {
	const { user, isPending } = useCurrentUserState();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateOnServer);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-8 w-24 animate-pulse rounded-full bg-line", className),
		"aria-hidden": true
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: cn("inline-flex h-8 items-center rounded-full bg-accent px-3 text-xs font-medium text-accent-fg", className),
		children: "登入"
	});
	const label = user.displayName ?? user.primaryEmail ?? "帳號";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-w-0 items-center gap-2", className),
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "size-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-8 place-items-center rounded-full bg-accent-soft text-sm font-medium text-accent",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden max-w-28 truncate text-xs font-medium text-ink-soft sm:inline",
				children: label
			}),
			!gateSession ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				className: "text-xs text-muted underline-offset-2 hover:text-ink hover:underline disabled:cursor-wait",
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				children: signingOut ? "登出中…" : "登出"
			}) : null
		]
	});
}
function BrandMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("size-8", className),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "8",
				fill: "currentColor",
				className: "text-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M8 8.5h11.5c.8 0 1.5.7 1.5 1.5v14.2c0 .5-.4.8-.8.8H9.2c-.6 0-1.2-.5-1.2-1.1V8.5z",
				fill: "currentColor",
				className: "text-accent-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M11 8.5v16.5",
				stroke: "#21564E",
				strokeWidth: "1.2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M20.8 8.5H24c.6 0 1 .5 1 1.1V12l-1.6 1.1L25 14.2v9.2c0 .6-.4 1.1-1 1.1h-3.2",
				fill: "#DCE8E5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "14.2",
				y: "7",
				width: "3.2",
				height: "7.5",
				rx: "0.6",
				fill: "#1C1915"
			})
		]
	});
}
var POS_OPTIONS = [
	{
		key: "n",
		abbr: "n.",
		zh: "名詞"
	},
	{
		key: "v",
		abbr: "v.",
		zh: "動詞"
	},
	{
		key: "adj",
		abbr: "adj.",
		zh: "形容詞"
	},
	{
		key: "adv",
		abbr: "adv.",
		zh: "副詞"
	},
	{
		key: "prep",
		abbr: "prep.",
		zh: "介系詞"
	},
	{
		key: "conj",
		abbr: "conj.",
		zh: "連接詞"
	},
	{
		key: "pron",
		abbr: "pron.",
		zh: "代名詞"
	},
	{
		key: "det",
		abbr: "det.",
		zh: "限定詞"
	},
	{
		key: "int",
		abbr: "int.",
		zh: "感嘆詞"
	},
	{
		key: "phr",
		abbr: "phr.",
		zh: "片語"
	}
];
var POS_BY_KEY = Object.fromEntries(POS_OPTIONS.map((item) => [item.key, item]));
var ALIAS = {
	n: "n",
	"n.": "n",
	noun: "n",
	名詞: "n",
	v: "v",
	"v.": "v",
	vb: "v",
	verb: "v",
	動詞: "v",
	adj: "adj",
	"adj.": "adj",
	adjective: "adj",
	形容詞: "adj",
	adv: "adv",
	"adv.": "adv",
	adverb: "adv",
	副詞: "adv",
	連接副詞: "adv",
	prep: "prep",
	"prep.": "prep",
	preposition: "prep",
	介系詞: "prep",
	介詞: "prep",
	conj: "conj",
	"conj.": "conj",
	conjunction: "conj",
	連接詞: "conj",
	pron: "pron",
	"pron.": "pron",
	pronoun: "pron",
	代名詞: "pron",
	det: "det",
	"det.": "det",
	determiner: "det",
	article: "det",
	限定詞: "det",
	冠詞: "det",
	int: "int",
	"int.": "int",
	interjection: "int",
	感嘆詞: "int",
	感歎詞: "int",
	phr: "phr",
	"phr.": "phr",
	phrase: "phr",
	phrasal: "phr",
	片語: "phr",
	片語動詞: "phr"
};
function matchToken(token) {
	const trimmed = token.trim();
	if (!trimmed) return null;
	const direct = ALIAS[trimmed] ?? ALIAS[trimmed.toLowerCase()];
	if (direct) return direct;
	const compact = trimmed.toLowerCase().replace(/\s+/g, "");
	if (ALIAS[compact]) return ALIAS[compact];
	const abbr = compact.match(/^([a-z]+)\.?/);
	if (abbr?.[1] && ALIAS[abbr[1]]) return ALIAS[abbr[1]];
	const zh = trimmed.match(/[\u3400-\u9fff]+/g);
	if (zh) {
		for (const part of zh) if (ALIAS[part]) return ALIAS[part];
	}
	return null;
}
function parsePos(raw) {
	if (!raw.trim()) return [];
	const keys = [];
	for (const part of raw.split(/[／/、,;+|]+/)) {
		const key = matchToken(part);
		if (key && !keys.includes(key)) keys.push(key);
	}
	return keys;
}
function formatPos(keys) {
	return keys.map((key) => {
		const item = POS_BY_KEY[key];
		return item ? `${item.abbr} ${item.zh}` : key;
	}).join("／");
}
function canonicalizePos(raw) {
	const keys = parsePos(raw);
	return keys.length ? formatPos(keys) : raw.trim();
}
function togglePosKey(raw, key) {
	const keys = parsePos(raw);
	return formatPos(keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]);
}
function uniquePos(keys) {
	const out = [];
	for (const key of keys) if (!out.includes(key)) out.push(key);
	return out;
}
function mergeGloss(a, b) {
	const parts = [...a.split(/[／/、;；,，]+/), ...b.split(/[／/、;；,，]+/)].map((s) => s.trim()).filter(Boolean);
	const out = [];
	for (const part of parts) if (!out.includes(part)) out.push(part);
	return out.join("／");
}
function normalizeEn$1(value) {
	return value.trim().replace(/\s+/g, " ");
}
function pullPos(line) {
	const keys = [];
	return {
		rest: line.replace(/[（(]([^）)]*)[）)]/g, (_, inner) => {
			const found = parsePos(String(inner));
			if (found.length) {
				keys.push(...found);
				return " ";
			}
			return `(${inner})`;
		}).replace(/\s+/g, " ").trim(),
		keys: uniquePos(keys)
	};
}
function splitEnZh(rest) {
	const idx = rest.search(/[\u3400-\u9fff]/);
	if (idx === 0) {
		const split = rest.search(/[A-Za-z]/);
		if (split === -1) return {
			en: "",
			zh: rest.trim()
		};
		return {
			zh: rest.slice(0, split).trim(),
			en: rest.slice(split).trim()
		};
	}
	if (idx > 0) return {
		en: rest.slice(0, idx).trim(),
		zh: rest.slice(idx).trim()
	};
	const parts = rest.split(/\t+| {2,}|[|｜]+/);
	if (parts.length >= 2) return {
		en: parts[0].trim(),
		zh: parts.slice(1).join(" ").trim()
	};
	return {
		en: rest.trim(),
		zh: ""
	};
}
function parseBulkText(raw) {
	const groups = /* @__PURE__ */ new Map();
	const skipped = [];
	for (const original of raw.split(/\r?\n/)) {
		const line = original.trim();
		if (!line || line.startsWith("#") || line.startsWith("//")) continue;
		const { rest, keys } = pullPos(line);
		if (!rest) {
			skipped.push({
				line,
				reason: "這行只有詞性，沒有單字"
			});
			continue;
		}
		const split = splitEnZh(rest);
		const en = normalizeEn$1(split.en.replace(/^[-•·\d.)、]+\s*/, ""));
		const zh = split.zh.replace(/[。．.]+$/, "").trim();
		if (!en) {
			skipped.push({
				line,
				reason: "找不到英文"
			});
			continue;
		}
		if (!/[A-Za-z]/.test(en)) {
			skipped.push({
				line,
				reason: "找不到英文"
			});
			continue;
		}
		if (!zh) {
			skipped.push({
				line,
				reason: "找不到中文"
			});
			continue;
		}
		const key = en.toLowerCase();
		const prev = groups.get(key);
		if (prev) {
			prev.zh = mergeGloss(prev.zh, zh);
			prev.posKeys = uniquePos([...prev.posKeys, ...keys]);
			prev.pos = formatPos(prev.posKeys);
			prev.count += 1;
		} else groups.set(key, {
			en,
			zh,
			posKeys: keys,
			pos: formatPos(keys),
			count: 1
		});
	}
	return {
		groups: [...groups.values()],
		skipped
	};
}
var SEED = [
	{
		en: "opportunity",
		zh: "機會",
		phonetic: "/ˌɒpəˈtjuːnəti/",
		pos: "n. 名詞",
		exampleEn: "This internship is a rare opportunity.",
		exampleZh: "這次實習是難得的機會。",
		tags: ["核心"]
	},
	{
		en: "however",
		zh: "然而、不過",
		phonetic: "/haʊˈevə/",
		pos: "adv. 副詞",
		exampleEn: "The plan is solid; however, we need more time.",
		exampleZh: "計畫很穩妥；然而，我們需要更多時間。",
		tags: ["核心"]
	},
	{
		en: "recommend",
		zh: "推薦",
		phonetic: "/ˌrekəˈmend/",
		pos: "v. 動詞",
		exampleEn: "I recommend starting with ten words a day.",
		exampleZh: "我建議從每天十個單字開始。",
		tags: ["日常"]
	},
	{
		en: "comfortable",
		zh: "舒適的",
		phonetic: "/ˈkʌmftəbl/",
		pos: "adj. 形容詞",
		exampleEn: "This chair is more comfortable than it looks.",
		exampleZh: "這張椅子比看起來更舒適。",
		tags: ["日常"]
	},
	{
		en: "environment",
		zh: "環境",
		phonetic: "/ɪnˈvaɪrənmənt/",
		pos: "n. 名詞",
		exampleEn: "A quiet environment helps me focus.",
		exampleZh: "安靜的環境幫助我專心。",
		tags: ["核心"]
	},
	{
		en: "confident",
		zh: "有自信的",
		phonetic: "/ˈkɒnfɪdənt/",
		pos: "adj. 形容詞",
		exampleEn: "She felt more confident after the rehearsal.",
		exampleZh: "彩排之後，她變得更有自信。",
		tags: ["核心"]
	},
	{
		en: "although",
		zh: "雖然",
		phonetic: "/ɔːlˈðəʊ/",
		pos: "conj. 連接詞",
		exampleEn: "Although it was raining, we kept walking.",
		exampleZh: "雖然在下雨，我們還是繼續走。",
		tags: ["核心"]
	},
	{
		en: "necessary",
		zh: "必要的",
		phonetic: "/ˈnesəsəri/",
		pos: "adj. 形容詞",
		exampleEn: "A passport is necessary for this trip.",
		exampleZh: "這趟旅行必須帶護照。",
		tags: ["核心"]
	},
	{
		en: "experience",
		zh: "經驗；經歷",
		phonetic: "/ɪkˈspɪəriəns/",
		pos: "n. 名詞／v. 動詞",
		exampleEn: "She has years of teaching experience.",
		exampleZh: "她有多年的教學經驗。",
		tags: ["核心"]
	},
	{
		en: "schedule",
		zh: "行程、時間表",
		phonetic: "/ˈʃedjuːl/",
		pos: "n. 名詞／v. 動詞",
		exampleEn: "Let me check my schedule for Friday.",
		exampleZh: "我看一下星期五的行程。",
		tags: ["日常"]
	},
	{
		en: "appreciate",
		zh: "感謝；欣賞",
		phonetic: "/əˈpriːʃieɪt/",
		pos: "v. 動詞",
		exampleEn: "I appreciate your help with the notes.",
		exampleZh: "謝謝你幫忙整理筆記。",
		tags: ["日常"]
	},
	{
		en: "available",
		zh: "有空的；可使用的",
		phonetic: "/əˈveɪləbl/",
		pos: "adj. 形容詞",
		exampleEn: "Are you available after three?",
		exampleZh: "你三點以後有空嗎？",
		tags: ["日常"]
	},
	{
		en: "look forward to",
		zh: "期待",
		phonetic: "/lʊk ˈfɔːwəd tuː/",
		pos: "phr. 片語",
		exampleEn: "I look forward to seeing you next week.",
		exampleZh: "我很期待下週見到你。",
		tags: ["片語"]
	},
	{
		en: "make sense",
		zh: "合理、說得通",
		phonetic: "/meɪk sens/",
		pos: "phr. 片語",
		exampleEn: "Your explanation finally makes sense.",
		exampleZh: "你的解釋終於說得通了。",
		tags: ["片語"]
	},
	{
		en: "in charge of",
		zh: "負責",
		phonetic: "/ɪn tʃɑːdʒ ɒv/",
		pos: "phr. 片語",
		exampleEn: "Who is in charge of the guest list?",
		exampleZh: "誰負責賓客名單？",
		tags: ["片語"]
	},
	{
		en: "deadline",
		zh: "截止日期",
		phonetic: "/ˈdedlaɪn/",
		pos: "n. 名詞",
		exampleEn: "The deadline is Friday at noon.",
		exampleZh: "截止日期是星期五中午。",
		tags: ["日常"]
	},
	{
		en: "improve",
		zh: "改善、進步",
		phonetic: "/ɪmˈpruːv/",
		pos: "v. 動詞",
		exampleEn: "Daily review will improve your memory.",
		exampleZh: "每天複習會改善你的記憶。",
		tags: ["核心"]
	},
	{
		en: "responsible",
		zh: "負責的",
		phonetic: "/rɪˈspɒnsəbl/",
		pos: "adj. 形容詞",
		exampleEn: "He is responsible for locking up.",
		exampleZh: "他負責關門。",
		tags: ["核心"]
	}
];
var ZH_DISTRACTORS = [
	"天氣",
	"會議",
	"勇氣",
	"桌子",
	"決定",
	"風景",
	"習慣",
	"意見",
	"車站",
	"鄰居",
	"成績",
	"早餐",
	"週末",
	"行李",
	"合約",
	"耐心"
];
var EN_DISTRACTORS = [
	"weather",
	"meeting",
	"courage",
	"table",
	"decision",
	"scenery",
	"habit",
	"opinion",
	"station",
	"neighbor",
	"grade",
	"breakfast",
	"weekend",
	"luggage",
	"contract",
	"patience"
];
function buildSeedWords(now = Date.now()) {
	return SEED.map((item) => ({
		id: `seed-${item.en.replace(/\s+/g, "-")}`,
		...item,
		note: "",
		starred: false,
		ease: 0,
		intervalDays: 0,
		nextReviewAt: 0,
		reviewCount: 0,
		correctCount: 0,
		wrongCount: 0,
		createdAt: now,
		updatedAt: now,
		source: "seed"
	}));
}
var EASE_INTERVALS = [
	0,
	1,
	2,
	4,
	7,
	14
];
function nextReview(word, quality, now = Date.now()) {
	let ease = word.ease;
	let intervalDays = word.intervalDays;
	if (quality === 0) {
		ease = Math.max(0, ease - 1);
		return {
			ease,
			intervalDays: 0,
			nextReviewAt: now + 6e5,
			correct: false
		};
	}
	if (quality === 1) {
		intervalDays = Math.max(1, intervalDays || 1);
		return {
			ease,
			intervalDays,
			nextReviewAt: now + intervalDays * 864e5,
			correct: true
		};
	}
	ease = Math.min(5, ease + 1);
	intervalDays = EASE_INTERVALS[ease] ?? 30;
	return {
		ease,
		intervalDays,
		nextReviewAt: now + intervalDays * 864e5,
		correct: true
	};
}
function isDue(word, now = Date.now()) {
	return word.nextReviewAt <= now;
}
function reviewLabel(ts, now = Date.now()) {
	const delta = ts - now;
	if (delta <= 0) return "該複習了";
	if (delta < 36e5) return "稍後";
	const days = Math.round(delta / 864e5);
	if (days <= 0) return "今天稍後";
	if (days === 1) return "明天";
	return `${days} 天後`;
}
function todayKey(now = /* @__PURE__ */ new Date()) {
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function bumpStreak(lastPracticeDate, streak, today = todayKey()) {
	if (lastPracticeDate === today) return {
		streak,
		lastPracticeDate: today
	};
	const y = /* @__PURE__ */ new Date(`${today}T12:00:00`);
	y.setDate(y.getDate() - 1);
	if (lastPracticeDate === todayKey(y)) return {
		streak: streak + 1,
		lastPracticeDate: today
	};
	return {
		streak: 1,
		lastPracticeDate: today
	};
}
function normalizeEn(value) {
	return value.trim().replace(/\s+/g, " ");
}
function makeId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
	return `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
var emptyStats = {
	streak: 0,
	lastPracticeDate: null,
	totalReviews: 0
};
var memoryStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
	clear: () => {},
	key: () => null,
	length: 0
};
var useWordStore = create()(persist((set, get) => ({
	words: buildSeedWords(),
	stats: emptyStats,
	selectedIds: [],
	addWord: (input) => {
		const en = normalizeEn(input.en);
		const zh = input.zh.trim();
		if (!en || !zh) throw new Error("需要英文與中文");
		const existing = get().words.find((w) => w.en.toLowerCase() === en.toLowerCase());
		if (existing) {
			const patch = { updatedAt: Date.now() };
			if (zh) patch.zh = mergeGloss(existing.zh, zh);
			if (input.phonetic && !existing.phonetic) patch.phonetic = input.phonetic;
			if (input.exampleEn && !existing.exampleEn) patch.exampleEn = input.exampleEn;
			if (input.exampleZh && !existing.exampleZh) patch.exampleZh = input.exampleZh;
			if (input.pos) patch.pos = formatPos([...parsePos(existing.pos), ...parsePos(input.pos)]);
			get().updateWord(existing.id, patch);
			return {
				word: get().words.find((w) => w.id === existing.id) ?? existing,
				duplicated: true
			};
		}
		const now = Date.now();
		const word = {
			id: makeId(),
			en,
			zh,
			phonetic: input.phonetic?.trim() ?? "",
			pos: canonicalizePos(input.pos ?? ""),
			exampleEn: input.exampleEn?.trim() ?? "",
			exampleZh: input.exampleZh?.trim() ?? "",
			note: input.note?.trim() ?? "",
			tags: input.tags ?? [],
			starred: false,
			ease: 0,
			intervalDays: 0,
			nextReviewAt: 0,
			reviewCount: 0,
			correctCount: 0,
			wrongCount: 0,
			createdAt: now,
			updatedAt: now,
			source: input.source ?? "manual"
		};
		set((s) => ({ words: [word, ...s.words] }));
		return {
			word,
			duplicated: false
		};
	},
	importMany: (items) => {
		const ids = [];
		let added = 0;
		let merged = 0;
		let words = get().words;
		for (const input of items) {
			const en = normalizeEn(input.en);
			const zh = input.zh.trim();
			if (!en || !zh) continue;
			const existing = words.find((w) => w.en.toLowerCase() === en.toLowerCase());
			if (existing) {
				words = words.map((w) => w.id === existing.id ? {
					...w,
					zh: mergeGloss(w.zh, zh),
					pos: formatPos([...parsePos(w.pos), ...parsePos(input.pos ?? "")]),
					phonetic: w.phonetic || input.phonetic?.trim() || "",
					exampleEn: w.exampleEn || input.exampleEn?.trim() || "",
					exampleZh: w.exampleZh || input.exampleZh?.trim() || "",
					updatedAt: Date.now()
				} : w);
				ids.push(existing.id);
				merged += 1;
			} else {
				const now = Date.now();
				const word = {
					id: makeId(),
					en,
					zh,
					phonetic: input.phonetic?.trim() ?? "",
					pos: canonicalizePos(input.pos ?? ""),
					exampleEn: input.exampleEn?.trim() ?? "",
					exampleZh: input.exampleZh?.trim() ?? "",
					note: input.note?.trim() ?? "",
					tags: input.tags ?? [],
					starred: false,
					ease: 0,
					intervalDays: 0,
					nextReviewAt: 0,
					reviewCount: 0,
					correctCount: 0,
					wrongCount: 0,
					createdAt: now,
					updatedAt: now,
					source: input.source ?? "manual"
				};
				words = [word, ...words];
				ids.push(word.id);
				added += 1;
			}
		}
		set((s) => ({
			words,
			selectedIds: [.../* @__PURE__ */ new Set([...ids, ...s.selectedIds])]
		}));
		return {
			added,
			merged,
			ids
		};
	},
	updateWord: (id, patch) => {
		const next = patch.pos !== void 0 ? {
			...patch,
			pos: canonicalizePos(patch.pos)
		} : patch;
		set((s) => ({ words: s.words.map((w) => w.id === id ? {
			...w,
			...next,
			id: w.id,
			updatedAt: Date.now()
		} : w) }));
	},
	removeWord: (id) => {
		set((s) => ({
			words: s.words.filter((w) => w.id !== id),
			selectedIds: s.selectedIds.filter((x) => x !== id)
		}));
	},
	toggleStar: (id) => {
		set((s) => ({ words: s.words.map((w) => w.id === id ? {
			...w,
			starred: !w.starred,
			updatedAt: Date.now()
		} : w) }));
	},
	toggleSelected: (id) => {
		set((s) => ({ selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((x) => x !== id) : [...s.selectedIds, id] }));
	},
	setSelected: (ids) => {
		set({ selectedIds: [...new Set(ids)] });
	},
	clearSelected: () => {
		set({ selectedIds: [] });
	},
	recordReview: (id, quality) => {
		const word = get().words.find((w) => w.id === id);
		if (!word) return;
		const result = nextReview(word, quality);
		set((s) => ({
			words: s.words.map((w) => w.id === id ? {
				...w,
				ease: result.ease,
				intervalDays: result.intervalDays,
				nextReviewAt: result.nextReviewAt,
				reviewCount: w.reviewCount + 1,
				correctCount: w.correctCount + (result.correct ? 1 : 0),
				wrongCount: w.wrongCount + (result.correct ? 0 : 1),
				updatedAt: Date.now()
			} : w),
			stats: {
				...s.stats,
				totalReviews: s.stats.totalReviews + 1
			}
		}));
	},
	restoreSeed: () => {
		const existing = new Set(get().words.map((w) => w.en.toLowerCase()));
		const missing = buildSeedWords().filter((w) => !existing.has(w.en.toLowerCase()));
		if (missing.length) set((s) => ({ words: [...missing, ...s.words] }));
		return missing.length;
	},
	markPracticedToday: () => {
		set((s) => {
			const next = bumpStreak(s.stats.lastPracticeDate, s.stats.streak);
			return { stats: {
				...s.stats,
				...next
			} };
		});
	},
	hydrateCloud: (words, stats) => {
		set({
			words,
			stats
		});
	}
}), {
	name: "yingxiben-v1",
	storage: createJSONStorage(() => typeof window === "undefined" ? memoryStorage : localStorage),
	partialize: (s) => ({
		words: s.words,
		stats: s.stats
	}),
	merge: (persisted, current) => {
		const p = persisted ?? {};
		return {
			...current,
			...p,
			selectedIds: current.selectedIds
		};
	}
}));
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var wordSchema = object({
	id: string().min(1).max(80),
	en: string().min(1).max(200),
	zh: string().min(1).max(400),
	phonetic: string().max(120).optional().default(""),
	pos: string().max(80).optional().default(""),
	exampleEn: string().max(500).optional().default(""),
	exampleZh: string().max(500).optional().default(""),
	note: string().max(500).optional().default(""),
	tags: array(string().max(40)).max(12).optional().default([]),
	starred: boolean().optional().default(false),
	ease: number().int().min(0).max(5).optional().default(0),
	intervalDays: number().int().min(0).max(3650).optional().default(0),
	nextReviewAt: number().int().optional().default(0),
	reviewCount: number().int().min(0).optional().default(0),
	correctCount: number().int().min(0).optional().default(0),
	wrongCount: number().int().min(0).optional().default(0),
	createdAt: number().int(),
	updatedAt: number().int(),
	source: _enum([
		"seed",
		"manual",
		"translate"
	]).optional().default("manual")
});
var statsSchema = object({
	streak: number().int().min(0).max(1e4),
	lastPracticeDate: string().nullable(),
	totalReviews: number().int().min(0)
});
var snapshotSchema = object({
	words: array(wordSchema).max(500),
	stats: statsSchema
});
var loadWordbook = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0d14523e6618b73b54fe4d38bb8d3b2d8fbb8257bc478a9d9ed337dae27a2a32"));
var saveWordbook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => snapshotSchema.parse(input)).handler(createSsrRpc("d25f0bc5354f36198a48cb5987f930174ed0edd85054852f223b96047c6ecd35"));
function WordbookSync() {
	const { user, isPending } = useCurrentUserState();
	const words = useWordStore((s) => s.words);
	const stats = useWordStore((s) => s.stats);
	const hydrateCloud = useWordStore((s) => s.hydrateCloud);
	const readyForUser = (0, import_react.useRef)(null);
	const skipSave = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (isPending) return;
		if (!user) {
			readyForUser.current = null;
			return;
		}
		if (readyForUser.current === user.id) return;
		let cancelled = false;
		(async () => {
			try {
				const cloud = await loadWordbook();
				if (cancelled) return;
				const local = useWordStore.getState();
				if (cloud.words.length === 0 && local.words.length > 0) await saveWordbook({ data: {
					words: local.words,
					stats: local.stats
				} });
				else if (cloud.words.length > 0) {
					skipSave.current = true;
					hydrateCloud(cloud.words, cloud.stats);
				}
				readyForUser.current = user.id;
			} catch {
				readyForUser.current = user.id;
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		hydrateCloud,
		isPending,
		user
	]);
	(0, import_react.useEffect)(() => {
		if (!user || readyForUser.current !== user.id) return;
		if (skipSave.current) {
			skipSave.current = false;
			return;
		}
		const timer = window.setTimeout(() => {
			saveWordbook({ data: {
				words,
				stats
			} }).catch(() => {});
		}, 1400);
		return () => window.clearTimeout(timer);
	}, [
		stats,
		user,
		words
	]);
	return null;
}
var NAV = [
	{
		to: "/",
		label: "單字本",
		icon: BookOpen
	},
	{
		to: "/add",
		label: "速加",
		icon: ListPlus
	},
	{
		to: "/translate",
		label: "翻譯",
		icon: Languages
	},
	{
		to: "/practice",
		label: "練習",
		icon: Repeat
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const dueCount = useWordStore((s) => s.words.filter((w) => isDue(w)).length);
	const streak = useWordStore((s) => s.stats.streak);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordbookSync, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-surface/80 px-4 py-6 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mb-8 flex items-center gap-2.5 px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-display text-lg font-semibold tracking-tight",
								children: "英習本"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs uppercase tracking-widest text-muted",
								children: "Wordbook"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1",
						children: NAV.map((item) => {
							const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150", active ? "bg-accent text-accent-fg" : "text-ink-soft hover:bg-accent-soft/70"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
									item.label,
									item.to === "/practice" && dueCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("ml-auto tabular-nums text-xs", active ? "text-accent-fg/80" : "text-muted"),
										children: dueCount
									})
								]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-bg-warm px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-faint",
							children: "連續練習"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight",
							children: [streak, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-sm font-sans font-medium text-muted",
								children: "天"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountChip, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex h-14 items-center gap-2.5 border-b border-line bg-bg/90 px-4 backdrop-blur-sm md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "size-7" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-base font-semibold tracking-tight",
							children: "英習本"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted",
							children: "Wordbook"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountChip, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "px-4 pb-28 pt-5 md:ml-56 md:px-8 md:pb-12 md:pt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-full max-w-3xl",
					children
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid max-w-lg grid-cols-4",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium", active ? "text-accent" : "text-muted"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }),
								item.label,
								item.to === "/practice" && dueCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute right-1/4 top-1.5 min-w-4 rounded-full bg-accent px-1 text-center text-xs leading-4 text-accent-fg tabular-nums",
									children: dueCount
								})
							]
						}, item.to);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				toastOptions: { className: "!bg-surface !text-ink !shadow-card !border-0 !font-sans !rounded-xl" }
			})
		]
	});
}
var styles_default = "/assets/styles-uP4oZmO4.css";
var APP_NAME = "英習本 Wordbook";
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "自己的英文單字本：新增、翻譯、閃卡與拼寫練習。"
			},
			{
				name: "theme-color",
				content: "#F3EEE4"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "zh-Hant",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "antialiased",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$4 = () => import("./routes-CV1aHdzH.mjs");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./add-CO8GlZd6.mjs");
var Route$4 = createFileRoute("/add")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./login-Xtl1cBpa.mjs");
var Route$3 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./practice-DzZrTheQ.mjs");
var Route$2 = createFileRoute("/practice")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./translate-BmmBNHaJ.mjs");
var Route$1 = createFileRoute("/translate")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	AddRoute: Route$4.update({
		id: "/add",
		path: "/add",
		getParentRoute: () => Route$6
	}),
	LoginRoute: Route$3.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$6
	}),
	PracticeRoute: Route$2.update({
		id: "/practice",
		path: "/practice",
		getParentRoute: () => Route$6
	}),
	TranslateRoute: Route$1.update({
		id: "/translate",
		path: "/translate",
		getParentRoute: () => Route$6
	}),
	ApiAuthSplatRoute: Route.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { EN_DISTRACTORS as a, POS_BY_KEY as c, formatPos as d, parsePos as f, useCurrentUserState as h, reviewLabel as i, POS_OPTIONS as l, cn as m, useWordStore as n, ZH_DISTRACTORS as o, togglePosKey as p, isDue as r, parseBulkText as s, router_exports as t, canonicalizePos as u };
