import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { n as snapshotSchema, t as authMiddleware } from "./wordbook-schema-RDVANq7b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wordbook-api-CwaQTIYe.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadWordbook_createServerFn_handler = createServerRpc({
	id: "0d14523e6618b73b54fe4d38bb8d3b2d8fbb8257bc478a9d9ed337dae27a2a32",
	name: "loadWordbook",
	filename: "src/lib/wordbook-api.ts"
}, (opts) => loadWordbook.__executeServer(opts));
var loadWordbook = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadWordbook_createServerFn_handler, async ({ context }) => {
	const { loadWordbookData } = await import("./wordbook-data.server-Btk97sW5.mjs");
	return loadWordbookData(context.userId);
});
var saveWordbook_createServerFn_handler = createServerRpc({
	id: "d25f0bc5354f36198a48cb5987f930174ed0edd85054852f223b96047c6ecd35",
	name: "saveWordbook",
	filename: "src/lib/wordbook-api.ts"
}, (opts) => saveWordbook.__executeServer(opts));
var saveWordbook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => snapshotSchema.parse(input)).handler(saveWordbook_createServerFn_handler, async ({ context, data }) => {
	const { saveWordbookData } = await import("./wordbook-data.server-Btk97sW5.mjs");
	return saveWordbookData(context.userId, data);
});
//#endregion
export { loadWordbook_createServerFn_handler, saveWordbook_createServerFn_handler };
