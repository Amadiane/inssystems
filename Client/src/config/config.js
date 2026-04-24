// ✅ Détection automatique selon le domaine
const BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://inssystems.onrender.com"; // ton URL backend Render

const CONFIG = {
  BASE_URL,
  API_LOGIN: `${BASE_URL}/api/login/`,
  // API_REGISTER: `${BASE_URL}/api/users/`,
  // API_CATEGORIE :  `${BASE_URL}/api/categories/`,
  // API_PRODUIT: `${BASE_URL}/api/produits/`,
  // API_STOCK: `${BASE_URL}/api/stocks/`,
  // API_VENTE: `${BASE_URL}/api/ventes/`,
  // API_ACTIVITY: `${BASE_URL}/api/activity/`,
  // API_TRACK: `${BASE_URL}/api/track/`,
  // API_TRACK_STATS: `${BASE_URL}/api/track/stats/`,




// 📸 Dossier media (pour les images directes)
MEDIA_URL: `${BASE_URL}/media/`,

CLOUDINARY_NAME: "dkg28bb4f",
CLOUDINARY_UPLOAD_PRESET: "default", // 👈 le nom exact de ton preset UNSIGNED
  

};

export default CONFIG;




