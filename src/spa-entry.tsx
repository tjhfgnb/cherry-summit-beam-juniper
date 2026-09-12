import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const el = document.getElementById("root");
if (!el) {
  throw new Error("missing #root");
}

try {
  const router = getRouter();
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
} catch (err) {
  el.textContent = `載入失敗：${err instanceof Error ? err.message : String(err)}`;
}
