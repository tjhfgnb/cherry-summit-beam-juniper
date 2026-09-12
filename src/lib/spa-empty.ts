export const auth = {
  handler: () => new Response("auth disabled", { status: 501 }),
};
export const authConfigured = false;
export const authMiddleware = undefined;
export default {};
