import React, { useState } from "react";
import CONFIG from "../../config/config.js"; // 👈 Assure-toi que ce chemin est correct (minuscule)

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("⚠ Veuillez entrer une adresse e-mail valide.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(CONFIG.API_NEWSLETTER_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Merci pour votre abonnement à la newsletter !");
        setEmail("");
      } else if (response.status === 400 && data.email) {
        setMessage("⚠ Cet e-mail est déjà inscrit à la newsletter.");
      } else if (response.status === 404) {
        setMessage("⚠ Service newsletter introuvable. Vérifiez l’API.");
      } else {
        setMessage(data.error || "⚠ Une erreur est survenue. Réessayez.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("⚠ Erreur de connexion au serveur.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(""), 6000);
    }
  };

  return (
    <div className="newsletter-form text-center p-6 rounded-xl bg-white/5 backdrop-blur-md shadow-lg border border-white/10 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-3 text-white">
        📬 Abonnez-vous à notre newsletter
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row justify-center items-center gap-2"
      >
        <input
          type="email"
          placeholder="Votre adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-4 py-2 w-full sm:w-72 rounded-lg text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Envoi...
            </span>
          ) : (
            "S'abonner"
          )}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-sm font-semibold transition-all duration-300 ${
            message.includes("✅")
              ? "text-green-400"
              : message.includes("⚠")
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterForm;
