// Központi API konfiguráció
// Vercel deploy esetén a VITE_API_BASE_URL környezeti változót kell beállítani
// a Render backend URL-jére (pl. https://gymproject-mmpk.onrender.com)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';