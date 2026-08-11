// Központi API konfiguráció
// - Fejlesztésben (npm run dev): localhost backend
// - Éles build-ben (Vercel): Render backend
// - Ha a VITE_API_BASE_URL be van állítva, az felülírja mindkettőt
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://gymproject-mmpk.onrender.com');