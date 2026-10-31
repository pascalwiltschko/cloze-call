import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main>
      <h1>Final Cut</h1>
      <p>The projection room is ready.</p>
    </main>
  </StrictMode>,
);
