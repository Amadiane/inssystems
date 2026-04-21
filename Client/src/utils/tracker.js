


// // src/hooks/useTracker.js
// import CONFIG from "../config/config";

// const track = async (type_action, extras = {}) => {
//   try {
//     await fetch(`${CONFIG.BASE_URL}/api/track/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ type_action, ...extras }),
//     });
//   } catch {} // silencieux — ne jamais bloquer l'UX
// };

// export default track;

// utils/tracker.js
import CONFIG from "../config/config";

const track = async (type_action, extras = {}) => {
  try {
    await fetch(CONFIG.API_TRACK, {          // ✅ CONFIG.API_TRACK au lieu de BASE_URL/api/track/
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type_action, ...extras }),
    });
  } catch {} // silencieux — ne jamais bloquer l'UX
};

export default track;