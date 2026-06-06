import { createContext, useContext, useState, useEffect } from "react";

export const colorPresets = [
  { id: "default-blue", name: "Ocean Blue", primary: "221 83% 53%", accent: "262 83% 58%", preview: ["#3b82f6", "#7c3aed", "#1e3a5f", "#e8edf3"] },
  { id: "emerald", name: "Emerald", primary: "152 69% 41%", accent: "168 76% 42%", preview: ["#22c55e", "#14b8a6", "#064e3b", "#ecfdf5"] },
  { id: "rose", name: "Rose", primary: "346 77% 50%", accent: "330 81% 60%", preview: ["#e11d48", "#ec4899", "#881337", "#fff1f2"] },
  { id: "amber", name: "Amber", primary: "38 92% 50%", accent: "25 95% 53%", preview: ["#f59e0b", "#f97316", "#78350f", "#fffbeb"] },
  { id: "violet", name: "Violet", primary: "262 83% 58%", accent: "280 67% 50%", preview: ["#7c3aed", "#a855f7", "#4c1d95", "#f5f3ff"] },
  { id: "cyan", name: "Cyan", primary: "199 89% 48%", accent: "186 94% 42%", preview: ["#06b6d4", "#0ea5e9", "#155e75", "#ecfeff"] },
  { id: "slate", name: "Slate", primary: "215 20% 40%", accent: "220 14% 50%", preview: ["#64748b", "#475569", "#1e293b", "#f1f5f9"] },
  { id: "coral", name: "Coral", primary: "16 85% 60%", accent: "0 84% 60%", preview: ["#f97066", "#ef4444", "#7c2d12", "#fff7ed"] },
];

export const fontPresets = [
  { id: "jakarta-inter", name: "Jakarta + Inter", heading: "'Plus Jakarta Sans'", body: "'Inter'", importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" },
  { id: "space-dm", name: "Space Grotesk + DM Sans", heading: "'Space Grotesk'", body: "'DM Sans'", importUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" },
  { id: "sora-manrope", name: "Sora + Manrope", heading: "'Sora'", body: "'Manrope'", importUrl: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap" },
  { id: "outfit-figtree", name: "Outfit + Figtree", heading: "'Outfit'", body: "'Figtree'", importUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Figtree:wght@300;400;500;600;700&display=swap" },
  { id: "urbanist-epilogue", name: "Urbanist + Epilogue", heading: "'Urbanist'", body: "'Epilogue'", importUrl: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&family=Epilogue:wght@300;400;500;600;700&display=swap" },
  { id: "poppins-nunito", name: "Poppins + Nunito", heading: "'Poppins'", body: "'Nunito'", importUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Nunito:wght@300;400;500;600;700&display=swap" },
];

export const borderRadiusPresets = [
  { id: "none", name: "Sharp", value: "0rem" },
  { id: "sm", name: "Subtle", value: "0.375rem" },
  { id: "md", name: "Moderate", value: "0.75rem" },
  { id: "lg", name: "Rounded", value: "1rem" },
  { id: "xl", name: "Pill", value: "1.5rem" },
];

export const navColorPresets = [
  { id: "dark-navy", name: "Dark Navy", bg: "222 47% 11%", foreground: "213 31% 91%", accent: "217 33% 17%", accentForeground: "210 40% 98%", border: "217 33% 17%", muted: "220 9% 46%", preview: "#141b2d" },
  { id: "charcoal", name: "Charcoal", bg: "0 0% 10%", foreground: "0 0% 85%", accent: "0 0% 15%", accentForeground: "0 0% 95%", border: "0 0% 15%", muted: "0 0% 50%", preview: "#1a1a1a" },
  { id: "deep-purple", name: "Deep Purple", bg: "270 50% 10%", foreground: "270 20% 85%", accent: "270 40% 18%", accentForeground: "270 20% 95%", border: "270 40% 16%", muted: "270 15% 50%", preview: "#1a0f2e" },
  { id: "forest", name: "Forest", bg: "160 40% 8%", foreground: "150 20% 85%", accent: "160 30% 15%", accentForeground: "150 20% 95%", border: "160 30% 14%", muted: "150 15% 45%", preview: "#0c1f18" },
  { id: "midnight-blue", name: "Midnight Blue", bg: "220 60% 8%", foreground: "220 20% 85%", accent: "220 45% 15%", accentForeground: "220 20% 95%", border: "220 45% 14%", muted: "220 15% 48%", preview: "#081428" },
  { id: "warm-dark", name: "Warm Dark", bg: "20 30% 9%", foreground: "30 20% 85%", accent: "20 25% 15%", accentForeground: "30 20% 95%", border: "20 25% 14%", muted: "20 12% 46%", preview: "#1e150e" },
  { id: "slate-gray", name: "Slate Gray", bg: "215 15% 18%", foreground: "215 10% 85%", accent: "215 12% 25%", accentForeground: "215 10% 95%", border: "215 12% 22%", muted: "215 8% 50%", preview: "#272d35" },
  { id: "pure-black", name: "Pure Black", bg: "0 0% 4%", foreground: "0 0% 80%", accent: "0 0% 10%", accentForeground: "0 0% 95%", border: "0 0% 10%", muted: "0 0% 45%", preview: "#0a0a0a" },
];

const UICustomizationContext = createContext({
  colorPreset: "default-blue",
  fontPreset: "jakarta-inter",
  borderRadius: "md",
  navColorPreset: "dark-navy",
  setColorPreset: () => {},
  setFontPreset: () => {},
  setBorderRadius: () => {},
  setNavColorPreset: () => {},
});

export const useUICustomization = () => useContext(UICustomizationContext);

function applyColor(preset) {
  const root = document.documentElement;
  root.style.setProperty("--primary", preset.primary);
  root.style.setProperty("--accent", preset.accent);
  root.style.setProperty("--ring", preset.primary);
  root.style.setProperty("--sidebar-primary", preset.primary);
  root.style.setProperty("--sidebar-ring", preset.primary);
  root.style.setProperty("--chart-1", preset.primary);
  root.style.setProperty("--chart-2", preset.accent);
}

function applyFont(preset) {
  const root = document.documentElement;
  root.style.setProperty("--font-heading", `${preset.heading}, sans-serif`);
  root.style.setProperty("--font-body", `${preset.body}, sans-serif`);

  const existingLink = document.getElementById("custom-font-link");
  if (existingLink) existingLink.remove();

  const link = document.createElement("link");
  link.id = "custom-font-link";
  link.rel = "stylesheet";
  link.href = preset.importUrl;
  document.head.appendChild(link);
}

function applyRadius(preset) {
  document.documentElement.style.setProperty("--radius", preset.value);
}

function applyNavColor(preset) {
  const root = document.documentElement;
  root.style.setProperty("--sidebar-background", preset.bg);
  root.style.setProperty("--sidebar-foreground", preset.foreground);
  root.style.setProperty("--sidebar-accent", preset.accent);
  root.style.setProperty("--sidebar-accent-foreground", preset.accentForeground);
  root.style.setProperty("--sidebar-border", preset.border);
  root.style.setProperty("--sidebar-muted", preset.muted);
}

export function UICustomizationProvider({ children }) {
  const [colorPreset, setColorPresetState] = useState(
    () => localStorage.getItem("ui-color") || "default-blue"
  );
  const [fontPreset, setFontPresetState] = useState(
    () => localStorage.getItem("ui-font") || "jakarta-inter"
  );
  const [borderRadius, setBorderRadiusState] = useState(
    () => localStorage.getItem("ui-radius") || "md"
  );
  const [navColorPreset, setNavColorPresetState] = useState(
    () => localStorage.getItem("ui-nav-color") || "dark-navy"
  );

  const setColorPreset = (id) => {
    setColorPresetState(id);
    localStorage.setItem("ui-color", id);
    const p = colorPresets.find((c) => c.id === id);
    if (p) applyColor(p);
  };

  const setFontPreset = (id) => {
    setFontPresetState(id);
    localStorage.setItem("ui-font", id);
    const p = fontPresets.find((f) => f.id === id);
    if (p) applyFont(p);
  };

  const setBorderRadius = (id) => {
    setBorderRadiusState(id);
    localStorage.setItem("ui-radius", id);
    const p = borderRadiusPresets.find((r) => r.id === id);
    if (p) applyRadius(p);
  };

  const setNavColorPreset = (id) => {
    setNavColorPresetState(id);
    localStorage.setItem("ui-nav-color", id);
    const p = navColorPresets.find((n) => n.id === id);
    if (p) applyNavColor(p);
  };

  useEffect(() => {
    const c = colorPresets.find((p) => p.id === colorPreset);
    if (c) applyColor(c);

    const f = fontPresets.find((p) => p.id === fontPreset);
    if (f) applyFont(f);

    const r = borderRadiusPresets.find((p) => p.id === borderRadius);
    if (r) applyRadius(r);

    const n = navColorPresets.find((p) => p.id === navColorPreset);
    if (n) applyNavColor(n);
  }, []);

  return (
    <UICustomizationContext.Provider
      value={{
        colorPreset,
        fontPreset,
        borderRadius,
        navColorPreset,
        setColorPreset,
        setFontPreset,
        setBorderRadius,
        setNavColorPreset,
      }}
    >
      {children}
    </UICustomizationContext.Provider>
  );
}
