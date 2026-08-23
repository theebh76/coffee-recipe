export const THEME_STORAGE_KEY = "coffee-recipe:theme";

export const THEME_COLORS = {
  light: "#fff1e5",
  dark: "#17130f",
} as const;

export type Theme = keyof typeof THEME_COLORS;

/**
 * Runs before first paint, inlined into <head>. Restores a saved choice onto
 * <html> so the correct palette is in place by the time anything renders —
 * without it, a dark-mode visitor gets a salmon flash on every navigation.
 * Visitors who never chose are left alone so the media query governs.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;
