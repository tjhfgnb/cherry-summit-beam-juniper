import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/local-account-DRh4dDBX.js
var local_account_exports = /* @__PURE__ */ __exportAll({
	getLocalUser: () => getLocalUser,
	isLocalAuthOnly: () => isLocalAuthOnly,
	isStaticSpaShell: () => isStaticSpaShell,
	localSignIn: () => localSignIn,
	localSignOut: () => localSignOut,
	localSignUp: () => localSignUp,
	persistNameForUser: () => persistNameForUser,
	probeCloudAuth: () => probeCloudAuth,
	subscribeLocalAuth: () => subscribeLocalAuth
});
var ACCOUNTS_KEY = "yingxiben-accounts-v1";
var SESSION_KEY = "yingxiben-session-v1";
var GUEST_BOOK = "yingxiben-v1";
var listeners = /* @__PURE__ */ new Set();
function emit() {
	for (const cb of listeners) cb();
}
function subscribeLocalAuth(cb) {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
}
/** True when this page is the Cloudflare static shell. Cloud API may still exist. */
function isStaticSpaShell() {
	if (typeof window === "undefined") return false;
	return Boolean(document.getElementById("root"));
}
async function probeCloudAuth() {
	if (typeof window === "undefined") return false;
	try {
		return (await fetch("/api/auth/ok", { credentials: "include" })).ok;
	} catch {
		return false;
	}
}
/** @deprecated prefer probeCloudAuth — kept so older calls still compile */
function isLocalAuthOnly() {
	return isStaticSpaShell();
}
function readAccounts() {
	try {
		const raw = localStorage.getItem(ACCOUNTS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function writeAccounts(accounts) {
	localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
async function hashPassword(password, salt) {
	const data = new TextEncoder().encode(`${salt}:${password}`);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
function newId() {
	return crypto.randomUUID?.() ?? `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function toUser(account) {
	return {
		id: account.id,
		displayName: account.name || account.email,
		primaryEmail: account.email
	};
}
function getLocalUser() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		const session = JSON.parse(raw);
		if (!session.userId) return null;
		const account = readAccounts().find((a) => a.id === session.userId);
		return account ? toUser(account) : null;
	} catch {
		return null;
	}
}
function setSession(userId) {
	if (userId) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
	else localStorage.removeItem(SESSION_KEY);
	emit();
}
function copyGuestBookIfNeeded(userId) {
	const userKey = `${GUEST_BOOK}:${userId}`;
	if (localStorage.getItem(userKey)) return;
	const guest = localStorage.getItem(GUEST_BOOK);
	if (guest) localStorage.setItem(userKey, guest);
}
async function localSignUp(input) {
	const email = input.email.trim().toLowerCase();
	const password = input.password;
	const name = input.name.trim() || email.split("@")[0] || "同學";
	if (!email.includes("@")) throw new Error("請輸入有效的電子郵件");
	if (password.length < 8) throw new Error("密碼至少 8 個字");
	const accounts = readAccounts();
	if (accounts.some((a) => a.email === email)) throw new Error("這個電子郵件已經註冊過，請改登入");
	const salt = newId();
	const account = {
		id: newId(),
		email,
		name,
		salt,
		passwordHash: await hashPassword(password, salt),
		createdAt: Date.now()
	};
	writeAccounts([...accounts, account]);
	copyGuestBookIfNeeded(account.id);
	setSession(account.id);
	return toUser(account);
}
async function localSignIn(input) {
	const email = input.email.trim().toLowerCase();
	const account = readAccounts().find((a) => a.email === email);
	if (!account) throw new Error("電子郵件或密碼不對");
	if (await hashPassword(input.password, account.salt) !== account.passwordHash) throw new Error("電子郵件或密碼不對");
	setSession(account.id);
	return toUser(account);
}
function localSignOut() {
	setSession(null);
}
function persistNameForUser(userId) {
	return userId ? `${GUEST_BOOK}:${userId}` : GUEST_BOOK;
}
//#endregion
export { persistNameForUser as a, local_account_exports as i, localSignIn as n, probeCloudAuth as o, localSignUp as r, subscribeLocalAuth as s, getLocalUser as t };
