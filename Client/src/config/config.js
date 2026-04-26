

// // ✅ Détection automatique selon le domaine
// const BASE_URL =
//   window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
//     ? "http://127.0.0.1:8000"
//     : "https://inssystems.onrender.com";

// const CONFIG = {
//   BASE_URL,

//   // ── Auth ────────────────────────────────────────────────
//   API_LOGIN: `${BASE_URL}/api/login/`,

//   // ── Courriers Arrivés ───────────────────────────────────
//   API_COURRIERS_ARRIVES:        `${BASE_URL}/api/courriers-arrives/`,
//   API_COURRIER_ARRIVE_DETAIL:   (id) => `${BASE_URL}/api/courriers-arrives/${id}/`,
//   API_COURRIER_ARRIVE_SCAN:     (id) => `${BASE_URL}/api/courriers-arrives/${id}/scan/`,
//   API_COURRIER_ARRIVE_CIRC:     (id, lid) => `${BASE_URL}/api/courriers-arrives/${id}/circulation/${lid}/`,
//   API_COURRIER_ARRIVE_PRINT:    (id) => `${BASE_URL}/api/courriers-arrives/${id}/impression/`,


//   // ── Courriers Sortants ────────────────────────────────
//   API_COURRIERS_SORTANTS:      `${BASE_URL}/api/courriers-sortants/`,
//   API_COURRIER_SORTANT_DETAIL: (id) => `${BASE_URL}/api/courriers-sortants/${id}/`,
//   API_COURRIER_SORTANT_SCAN:   (id) => `${BASE_URL}/api/courriers-sortants/${id}/scan/`,
//   API_COURRIER_SORTANT_PRINT:  (id) => `${BASE_URL}/api/courriers-sortants/${id}/impression/`,

// // ── Archives ──────────────────────────────────────────
//   API_ARCHIVES:                `${BASE_URL}/api/archives/`,
//   API_ARCHIVE_STATS:           `${BASE_URL}/api/archives/stats/`,
//   API_ARCHIVE_DETAIL:          (id) => `${BASE_URL}/api/archives/${id}/`,
//   API_ARCHIVE_SCAN:            (id) => `${BASE_URL}/api/archives/${id}/scan/`,
//   API_ARCHIVE_PRINT:           (id) => `${BASE_URL}/api/archives/${id}/impression/`,
//   API_ARCHIVE_FROM_ARRIVE:     (id) => `${BASE_URL}/api/archives/from-arrive/${id}/`,
//   API_ARCHIVE_FROM_SORTANT:    (id) => `${BASE_URL}/api/archives/from-sortant/${id}/`,

//   // ── (Placeholder) Archives ──────────────────────────────
//   API_ARCHIVES:                 `${BASE_URL}/api/archives/`,

//   // ── Media ────────────────────────────────────────────────
//   MEDIA_URL: `${BASE_URL}/media/`,

//   // ── Cloudinary ───────────────────────────────────────────
//   CLOUDINARY_NAME:          "dkg28bb4f",
//   CLOUDINARY_UPLOAD_PRESET: "ml_default",
//   CLOUDINARY_UPLOAD_URL:    "https://api.cloudinary.com/v1_1/dkg28bb4f/auto/upload",
// };

// export default CONFIG;



// config/config.js

const BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://inssystems.onrender.com";

const CONFIG = {
  BASE_URL,

  // ── Auth ──────────────────────────────────────────────
  API_LOGIN: `${BASE_URL}/api/login/`,

  // ── Courriers Arrivés ─────────────────────────────────
  API_COURRIERS_ARRIVES:       `${BASE_URL}/api/courriers-arrives/`,
  API_COURRIER_ARRIVE_DETAIL:  (id) => `${BASE_URL}/api/courriers-arrives/${id}/`,
  API_COURRIER_ARRIVE_SCAN:    (id) => `${BASE_URL}/api/courriers-arrives/${id}/scan/`,
  API_COURRIER_ARRIVE_CIRC:    (id, lid) => `${BASE_URL}/api/courriers-arrives/${id}/circulation/${lid}/`,
  API_COURRIER_ARRIVE_PRINT:   (id) => `${BASE_URL}/api/courriers-arrives/${id}/impression/`,
  API_COURRIER_ARRIVE_PDF:     (id) => `${BASE_URL}/api/courriers-arrives/${id}/pdf/`,

  // ── Courriers Sortants ────────────────────────────────
  API_COURRIERS_SORTANTS:      `${BASE_URL}/api/courriers-sortants/`,
  API_COURRIER_SORTANT_DETAIL: (id) => `${BASE_URL}/api/courriers-sortants/${id}/`,
  API_COURRIER_SORTANT_SCAN:   (id) => `${BASE_URL}/api/courriers-sortants/${id}/scan/`,
  API_COURRIER_SORTANT_PRINT:  (id) => `${BASE_URL}/api/courriers-sortants/${id}/impression/`,
  API_COURRIER_SORTANT_PDF:    (id) => `${BASE_URL}/api/courriers-sortants/${id}/pdf/`,

  // ── Archives ──────────────────────────────────────────
  API_ARCHIVES:                `${BASE_URL}/api/archives/`,
  API_ARCHIVE_STATS:           `${BASE_URL}/api/archives/stats/`,
  API_ARCHIVE_DETAIL:          (id) => `${BASE_URL}/api/archives/${id}/`,
  API_ARCHIVE_SCAN:            (id) => `${BASE_URL}/api/archives/${id}/scan/`,
  API_ARCHIVE_PRINT:           (id) => `${BASE_URL}/api/archives/${id}/impression/`,
  API_ARCHIVE_PDF:             (id) => `${BASE_URL}/api/archives/${id}/pdf/`,
  API_ARCHIVE_FROM_ARRIVE:     (id) => `${BASE_URL}/api/archives/from-arrive/${id}/`,
  API_ARCHIVE_FROM_SORTANT:    (id) => `${BASE_URL}/api/archives/from-sortant/${id}/`,

  // ── Media / Cloudinary ────────────────────────────────
  MEDIA_URL:                `${BASE_URL}/media/`,
  CLOUDINARY_NAME:          "dkg28bb4f",
  CLOUDINARY_UPLOAD_PRESET: "default",
  CLOUDINARY_UPLOAD_URL:    "https://api.cloudinary.com/v1_1/dkg28bb4f/auto/upload",
};

export default CONFIG;
