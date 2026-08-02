import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BootForgeApp } from "@/components/bootforge-app";
import "@/app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("BootForge root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <BootForgeApp />
  </StrictMode>,
);
