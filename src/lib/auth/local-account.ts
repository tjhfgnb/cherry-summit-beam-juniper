const ACCOUNTS_KEY = "yingxiben-accounts-v1";
const SESSION_KEY = "yingxiben-session-v1";
const GUEST_BOOK = "yingxiben-v1";

export type LocalUser = {
  id: string;
  displayName: string;
  primaryEmail: string;
};

type StoredAccount = {
  id: string;
  email: string;
  name: string;
  salt: string;
  passwordHash: string;
  createdAt: number;
};

const listeners = new Set<() => void>();

function emit() {
  for (const cb of listeners) cb();
}

export function subscribeLocalAuth(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** True when this page is the Cloudflare static shell. Cloud API may still exist. */
export function isStaticSpaShell(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(document.getElementById("root"));
}

export async function probeCloudAuth(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/auth/ok", { credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

/** @deprecated prefer probeCloudAuth — kept so older calls still compile */
export function isLocalAuthOnly(): boolean {
  return isStaticSpaShell();
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function newId() {
  return crypto.randomUUID?.() ?? `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toUser(account: StoredAccount): LocalUser {
  return {
    id: account.id,
    displayName: account.name || account.email,
    primaryEmail: account.email,
  };
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { userId?: string };
    if (!session.userId) return null;
    const account = readAccounts().find((a) => a.id === session.userId);
    return account ? toUser(account) : null;
  } catch {
    return null;
  }
}

function setSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
  else localStorage.removeItem(SESSION_KEY);
  emit();
}

function copyGuestBookIfNeeded(userId: string) {
  const userKey = `${GUEST_BOOK}:${userId}`;
  if (localStorage.getItem(userKey)) return;
  const guest = localStorage.getItem(GUEST_BOOK);
  if (guest) localStorage.setItem(userKey, guest);
}

export async function localSignUp(input: {
  email: string;
  password: string;
  name: string;
}): Promise<LocalUser> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const name = input.name.trim() || email.split("@")[0] || "同學";
  if (!email.includes("@")) throw new Error("請輸入有效的電子郵件");
  if (password.length < 8) throw new Error("密碼至少 8 個字");
  const accounts = readAccounts();
  if (accounts.some((a) => a.email === email)) {
    throw new Error("這個電子郵件已經註冊過，請改登入");
  }
  const salt = newId();
  const account: StoredAccount = {
    id: newId(),
    email,
    name,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: Date.now(),
  };
  writeAccounts([...accounts, account]);
  copyGuestBookIfNeeded(account.id);
  setSession(account.id);
  return toUser(account);
}

export async function localSignIn(input: { email: string; password: string }): Promise<LocalUser> {
  const email = input.email.trim().toLowerCase();
  const account = readAccounts().find((a) => a.email === email);
  if (!account) throw new Error("電子郵件或密碼不對");
  const hash = await hashPassword(input.password, account.salt);
  if (hash !== account.passwordHash) throw new Error("電子郵件或密碼不對");
  setSession(account.id);
  return toUser(account);
}

export function localSignOut() {
  setSession(null);
}

export function persistNameForUser(userId: string | null) {
  return userId ? `${GUEST_BOOK}:${userId}` : GUEST_BOOK;
}
