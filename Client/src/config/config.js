// // ✅ Détection automatique selon le domaine
// const BASE_URL =
//   window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
//     ? "http://127.0.0.1:8000"
//     : "https://inssystems.onrender.com"; // ton URL backend Render

// const CONFIG = {
//   BASE_URL,
//   API_LOGIN: `${BASE_URL}/api/login/`,




// // 📸 Dossier media (pour les images directes)
// MEDIA_URL: `${BASE_URL}/media/`,

// CLOUDINARY_NAME: "dkg28bb4f",
// CLOUDINARY_UPLOAD_PRESET: "default", // 👈 le nom exact de ton preset UNSIGNED
  

// };

// export default CONFIG;


// config/config.js

// ✅ Détection automatique selon le domaine
const BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://inssystems.onrender.com";

const CONFIG = {
  BASE_URL,

  // ── Auth ────────────────────────────────────────────────
  API_LOGIN: `${BASE_URL}/api/login/`,

  // ── Courriers Arrivés ───────────────────────────────────
  API_COURRIERS_ARRIVES:        `${BASE_URL}/api/courriers-arrives/`,
  API_COURRIER_ARRIVE_DETAIL:   (id) => `${BASE_URL}/api/courriers-arrives/${id}/`,
  API_COURRIER_ARRIVE_SCAN:     (id) => `${BASE_URL}/api/courriers-arrives/${id}/scan/`,
  API_COURRIER_ARRIVE_CIRC:     (id, lid) => `${BASE_URL}/api/courriers-arrives/${id}/circulation/${lid}/`,
  API_COURRIER_ARRIVE_PRINT:    (id) => `${BASE_URL}/api/courriers-arrives/${id}/impression/`,

  // ── (Placeholder) Courriers Sortants ────────────────────
  API_COURRIERS_SORTANTS:       `${BASE_URL}/api/courriers-sortants/`,

  // ── (Placeholder) Archives ──────────────────────────────
  API_ARCHIVES:                 `${BASE_URL}/api/archives/`,

  // ── Media ────────────────────────────────────────────────
  MEDIA_URL: `${BASE_URL}/media/`,

  // ── Cloudinary ───────────────────────────────────────────
  CLOUDINARY_NAME:          "dkg28bb4f",
  CLOUDINARY_UPLOAD_PRESET: "ml_default",
  CLOUDINARY_UPLOAD_URL:    "https://api.cloudinary.com/v1_1/dkg28bb4f/auto/upload",
};

export default CONFIG;




