import React, { useState } from "react";
import ChatBotNew from "../ChatBot/ChatbotNew";

const NousRejoindreHeader = () => {
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl + "/api/rejoindre/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organisation: organization,
          email: email,
          message: message,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setOrganization("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Spacer div to push content down */}
      <div className="h-32"></div>
      
      <div className="pt-16 pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Header Section with Decorative Element */}
          <div className="text-center mb-16 relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-10 w-20 h-1 bg-blue-600 rounded-full"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C47] mb-6">
              Devenez partenaire de Tamkine
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Rejoignez-nous dans notre mission de transformer et d'améliorer
              l'éducation à travers l'intégration des Technologies de l'Information
              et de la Communication (TIC).
            </p>
            <p className="text-lg md:text-xl text-gray-700 mt-2 font-medium">
              Ensemble, nous pouvons avoir un impact mondial.
            </p>
          </div>

          {/* Partnership Benefits Section with Enhanced Cards */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1C1C47] mb-10 text-center">
              Pourquoi devenir partenaire ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white shadow-xl rounded-xl p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-t-4 border-[#1C1C47]">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1C1C47]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#1C1C47] mb-4">
                  Impact Social
                </h3>
                <p className="text-gray-600">
                  En devenant partenaire, vous contribuez directement à améliorer l'éducation
                  et à soutenir les initiatives de développement durable pour les
                  générations futures.
                </p>
              </div>
              <div className="bg-white shadow-xl rounded-xl p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-t-4 border-[#1C1C47]">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1C1C47]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#1C1C47] mb-4">
                  Visibilité
                </h3>
                <p className="text-gray-600">
                  Votre organisation sera reconnue pour son engagement envers
                  l'éducation et le développement grâce à des opportunités de
                  visibilité sur nos plateformes et événements.
                </p>
              </div>
              <div className="bg-white shadow-xl rounded-xl p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-t-4 border-[#1C1C47]">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1C1C47]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#1C1C47] mb-4">
                  Collaboration
                </h3>
                <p className="text-gray-600">
                  Travaillez avec des leaders du secteur et des experts dans le domaine 
                  des TIC et de l'éducation pour développer des solutions innovantes.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action Section with Enhanced Form */}
          <div className="bg-gradient-to-br from-[#1C1C47] to-[#2A2A6A] text-white p-10 md:p-12 rounded-2xl shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Prêt à nous rejoindre ?</h2>
              <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
                Remplissez le formulaire ci-dessous pour devenir partenaire et
                contribuer à l'évolution de l'éducation à travers le monde.
              </p>

              {/* Messages de retour avec animation */}
              {status === "success" && (
                <div className="mb-6 text-green-500 font-semibold">
                  Formulaire envoyé avec succès !
                </div>
              )}
              {status === "error" && (
                <div className="mb-6 text-red-500 font-semibold">
                  Une erreur s'est produite, veuillez réessayer.
                </div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium mb-2">
                      Organisation
                    </label>
                    <input
                      id="organization"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                    required
                  />
                </div>
                <div className="mt-6 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-500 transition-colors duration-300"
                  >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

export default NousRejoindreHeader;
