import { useEffect, useState } from "react";

const KEY = "clinic-flow-high-contrast";

export function applyStoredContrast() {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("high-contrast", localStorage.getItem(KEY) === "on");
}

export function useHighContrast() {
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(KEY) === "on"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", enabled);
    localStorage.setItem(KEY, enabled ? "on" : "off");
  }, [enabled]);

  return { enabled, setEnabled };
}
