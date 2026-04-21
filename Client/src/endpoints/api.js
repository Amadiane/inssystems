import CONFIG from "../config/config.js";

export const login = async (username, password) => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_LOGIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Erreur HTTP : " + response.status);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return { success: false, error: error.message };
  }
};
