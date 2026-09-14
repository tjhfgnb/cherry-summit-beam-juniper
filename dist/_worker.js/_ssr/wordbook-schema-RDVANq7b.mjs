import { n as createMiddleware } from "./ssr.mjs";
import { Jt as number, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wordbook-schema-RDVANq7b.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-12WPioY0.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-CIZuwBqU.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
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
//#endregion
export { snapshotSchema as n, authMiddleware as t };
