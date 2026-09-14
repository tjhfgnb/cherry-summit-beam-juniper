import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as signIn, t as authClient } from "./client-12WPioY0.mjs";
import { n as localSignIn, o as probeCloudAuth, r as localSignUp } from "./local-account-DRh4dDBX.mjs";
import { h as useCurrentUserState, n as cn } from "./router-Dzw7iLf_.mjs";
import { t as Button } from "./button-BzplLdit.mjs";
import { t as GROK_PROVIDERS } from "./providers-B-AR6wJz.mjs";
import { t as Input } from "./input-DqxuBDAk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-hEBBf-yj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [cloud, setCloud] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		probeCloudAuth().then(setCloud);
	}, []);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-xl bg-surface" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function onSubmit(e) {
		e.preventDefault();
		setError("");
		setBusy(true);
		const trimmedEmail = email.trim();
		try {
			if (cloud || await probeCloudAuth()) {
				if (mode === "signup") {
					const { error: err } = await authClient.signUp.email({
						email: trimmedEmail,
						password,
						name: name.trim() || trimmedEmail
					});
					if (err) throw new Error(err.message ?? "無法建立帳號");
				} else {
					const { error: err } = await authClient.signIn.email({
						email: trimmedEmail,
						password
					});
					if (err) throw new Error(err.message ?? "登入失敗");
				}
				window.location.assign("/");
				return;
			}
			if (mode === "signup") await localSignUp({
				email: trimmedEmail,
				password,
				name: name.trim() || trimmedEmail
			});
			else await localSignIn({
				email: trimmedEmail,
				password
			});
			window.location.assign("/");
		} catch (err) {
			setError(err instanceof Error ? err.message : "請再試一次");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-widest text-faint",
						children: "Account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl font-semibold tracking-tight",
						children: mode === "signup" ? "建立帳號" : "登入"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: cloud ? "帳號會存在雲端，換手機、清資料都還在。" : "目前還沒接雲端資料庫，帳號會存在這台裝置。接上 Neon 之後就可以換裝置繼續用。"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-2 rounded-xl bg-surface p-1 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("h-9 rounded-lg text-sm font-medium", mode === "signin" ? "bg-accent text-accent-fg" : "text-ink-soft"),
					onClick: () => setMode("signin"),
					children: "登入"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("h-9 rounded-lg text-sm font-medium", mode === "signup" ? "bg-accent text-accent-fg" : "text-ink-soft"),
					onClick: () => setMode("signup"),
					children: "建立帳號"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3 rounded-xl bg-surface p-4 shadow-card",
				onSubmit,
				children: [
					mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "name",
						className: "text-sm font-medium text-ink-soft",
						children: "稱呼"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "name",
						value: name,
						onChange: (e) => setName(e.target.value),
						className: "mt-1",
						autoComplete: "name"
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "email",
						className: "text-sm font-medium text-ink-soft",
						children: "電子郵件"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "email",
						type: "email",
						required: true,
						value: email,
						onChange: (e) => setEmail(e.target.value),
						className: "mt-1",
						autoComplete: "email"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "password",
							className: "text-sm font-medium text-ink-soft",
							children: "密碼"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "password",
							type: "password",
							required: true,
							minLength: 8,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "mt-1",
							autoComplete: mode === "signup" ? "new-password" : "current-password"
						}),
						mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-faint",
							children: "至少 8 個字"
						}) : null
					] }),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy,
						children: busy ? "請稍候…" : mode === "signup" ? "建立並登入" : "登入"
					})
				]
			}),
			GROK_PROVIDERS.length > 0 && (typeof window === "undefined" || !window.location.hostname.endsWith(".pages.dev")) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs uppercase tracking-widest text-faint",
					children: "或用社群帳號"
				}), GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "secondary",
					className: "w-full",
					onClick: () => void signIn(p.providerId, { callbackURL: "/" }),
					children: [
						"使用 ",
						p.label,
						" 繼續"
					]
				}, p.providerId))]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-center text-sm text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-accent underline-offset-2 hover:underline",
					children: "先不登入，繼續練習"
				})
			})
		]
	});
}
//#endregion
export { Login as component };
