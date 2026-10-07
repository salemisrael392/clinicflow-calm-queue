import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";

import { applyStoredContrast } from "./hooks/useHighContrast";

applyStoredContrast();
const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
