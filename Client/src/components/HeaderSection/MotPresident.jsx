// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { User, Zap, Calendar, Quote, MessageSquare } from "lucide-react";

// // Configuration - Adaptez selon votre backend
// const CONFIG = {
//   API_MOTPRESIDENT_LIST: 'http://localhost:8000/api/mot-president/',
//   MEDIA_URL: 'http://localhost:8000/media/'
// };

// const MotPresident = () => {
//   const { t, i18n } = useTranslation();
//   const [motPresident, setMotPresident] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // ✅ Scroll vers le haut au chargement de la page
// useEffect(() => {
//   window.scrollTo({ top: 0, behavior: 'smooth' });
// }, []);

//   useEffect(() => {
//     const fetchMotPresident = async () => {
//       try {
//         const response = await fetch(CONFIG.API_MOTPRESIDENT_LIST);
//         if (!response.ok) throw new Error(`Erreur ${response.status}`);
//         const data = await response.json();
//         // Prendre le premier message ou le plus récent
//         setMotPresident(Array.isArray(data) && data.length > 0 ? data[0] : null);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMotPresident();
//   }, []);

//   const getImageSrc = (motPresident) => {
//     if (motPresident.image_url) return motPresident.image_url;
//     if (motPresident.image?.startsWith("http")) return motPresident.image;
//     if (motPresident.image) return `${CONFIG.MEDIA_URL}${motPresident.image}`;
//     return "https://placehold.co/1920x1080/1a1a2e/ffffff?text=President";
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-6">
//           <div className="relative w-20 h-20">
//             <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full animate-ping"></div>
//             <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
//           </div>
//           <p className="text-white text-lg font-semibold">{t("president.loading")}</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center px-4">
//         <div className="bg-red-500/10 border-2 border-red-500/50 text-white p-6 rounded-2xl shadow-2xl backdrop-blur-xl max-w-md">
//           <div className="flex items-center gap-3 mb-2">
//             <Zap className="w-6 h-6 text-red-500" />
//             <p className="font-bold text-xl">{t("president.error")}</p>
//           </div>
//           <p className="text-gray-300">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (!motPresident) {
//     return (
//       <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center px-4">
//         <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-500/30 px-8 max-w-2xl">
//           <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
//             <MessageSquare className="w-12 h-12 text-orange-400" />
//           </div>
//           <p className="text-white text-2xl font-bold mb-2">{t("president.empty")}</p>
//           <p className="text-gray-400 text-lg">{t("president.empty_desc")}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0e27] w-full">
//       {/* Effets de fond lumineux */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
//       </div>

//       {/* Header Compact */}
//       <div className="relative pt-20 md:pt-32 pb-8 md:pb-12 text-center w-full px-4">
//         <div className="relative inline-block">
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-orange-500/30 to-blue-500/30 blur-3xl scale-150 animate-pulse"></div>
          
//           <div className="relative">
//             <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-full mb-3 md:mb-4 shadow-2xl shadow-orange-500/50">
//               <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
//             </div>
            
//             <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-400 to-white mb-3 tracking-tight px-4">
//               {t("president.title")}
//             </h1>
            
//             <div className="relative w-20 md:w-24 h-1 mx-auto mt-3 md:mt-4 overflow-hidden rounded-full">
//               <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500 animate-pulse"></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Message Président - Design Professionnel */}
//       <div className="relative w-full flex items-center justify-center pb-12 md:pb-16 px-4">
//         <div className="w-full max-w-6xl">
//           <div className="relative group">
//             {/* Glow effect */}
//             <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl md:rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
            
//             {/* Card principale */}
//             <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden border-2 border-orange-500/30 shadow-2xl">
              
//               {/* Image Hero */}
//               <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
//                 <img
//                   src={getImageSrc(motPresident)}
//                   alt={motPresident[`title_${i18n.language}`] || motPresident.title_fr}
//                   className="w-full h-full object-cover"
//                   onError={(e) =>
//                     (e.target.src = "https://placehold.co/1920x1080/1a1a2e/ffffff?text=President")
//                   }
//                 />
                
//                 {/* Overlay gradient */}
//                 <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-[#0f1729]/60 to-transparent"></div>
                
//                 {/* Badge date */}
//                 {motPresident.created_at && (
//                   <div className="absolute top-4 right-4 md:top-6 md:right-6">
//                     <div className="relative">
//                       <div className="absolute inset-0 bg-blue-500/50 blur-xl rounded-xl md:rounded-2xl"></div>
//                       <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl border-2 border-blue-400/50">
//                         <div className="flex items-center gap-2 md:gap-3 text-white">
//                           <Calendar className="w-4 h-4 md:w-5 md:h-5" />
//                           <div>
//                             <p className="text-xs opacity-80 uppercase tracking-wide hidden md:block">{t("president.published")}</p>
//                             <p className="text-xs md:text-sm font-black">
//                               {new Date(motPresident.created_at).toLocaleDateString(i18n.language, { 
//                                 day: 'numeric', 
//                                 month: 'short', 
//                                 year: 'numeric' 
//                               })}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Badge Message */}
//                 <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
//                   <div className="inline-flex items-center gap-2 md:gap-3 bg-orange-500/20 backdrop-blur-sm border border-orange-500/40 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
//                     <Quote className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
//                     <span className="text-orange-300 text-xs md:text-sm font-bold uppercase tracking-wide">
//                       {t("president.message_from")}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Contenu du message */}
//               <div className="p-6 md:p-10 lg:p-12">
//                 <div className="max-w-4xl mx-auto">
                  
//                   {/* Titre */}
//                   <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-6 md:mb-8 leading-tight">
//                     {motPresident[`title_${i18n.language}`] || motPresident.title_fr}
//                   </h2>
                  
//                   <div className="w-24 md:w-32 h-1 md:h-1.5 bg-gradient-to-r from-orange-500 via-blue-500 to-transparent rounded-full mb-8 md:mb-12"></div>

//                   {/* Message principal */}
//                   <div className="relative mb-8 md:mb-12">
//                     <div className="absolute -left-2 md:-left-4 top-0 w-1 h-full bg-gradient-to-b from-orange-500 to-blue-500 rounded-full"></div>
                    
//                     <blockquote className="text-base md:text-xl lg:text-2xl text-gray-300 font-medium leading-relaxed pl-6 md:pl-8">
//                       {motPresident[`description_${i18n.language}`] || motPresident.description_fr}
//                     </blockquote>
//                   </div>

//                   {/* Signature */}
//                   <div className="relative">
//                     <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-xl md:rounded-2xl blur opacity-20"></div>
//                     <div className="relative bg-gradient-to-br from-orange-500/10 to-blue-500/10 backdrop-blur-sm border-2 border-orange-500/30 rounded-xl md:rounded-2xl p-6 md:p-8 text-right">
//                       <p className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-1 md:mb-2">
//                         {motPresident.president_name || t("president.president_name")}
//                       </p>
//                       <p className="text-orange-400 font-bold text-sm md:text-base lg:text-lg">
//                         {t("president.president_role")}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MotPresident;

import React, { useEffect, useState } from "react";
import { User, Sparkles, Quote, Calendar, Zap, MessageSquare } from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTranslation } from "react-i18next";

const MotPresident = () => {
  const { t, i18n } = useTranslation();
  const [motPresident, setMotPresident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Scroll vers le haut au chargement
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchMotPresident = async () => {
      try {
        const response = await fetch(CONFIG.API_MOTPRESIDENT_LIST);
        if (!response.ok) throw new Error("Erreur API Mot du Président");
        const data = await response.json();
        setMotPresident(Array.isArray(data) && data.length > 0 ? data[0] : null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMotPresident();
  }, []);

  const getImageSrc = (motPresident) => {
    if (!motPresident) return "";
    if (motPresident.image_url) return motPresident.image_url;
    if (motPresident.image?.startsWith("http")) return motPresident.image;
    if (motPresident.image) return `${CONFIG.MEDIA_URL}${motPresident.image}`;
    return "https://placehold.co/1920x1080/1a1a2e/ffffff?text=President";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg font-semibold">{t("president.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center px-4">
        <div className="bg-red-500/10 border-2 border-red-500/50 text-white p-6 rounded-2xl shadow-2xl backdrop-blur-xl max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-red-500" />
            <p className="font-bold text-xl">{t("president.error")}</p>
          </div>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!motPresident) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center px-4">
        <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-500/30 px-8 max-w-2xl">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <MessageSquare className="w-12 h-12 text-orange-400" />
          </div>
          <p className="text-white text-2xl font-bold mb-2">{t("president.empty")}</p>
          <p className="text-gray-400 text-lg">{t("president.empty_desc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] w-full">
      {/* Effets de fond lumineux */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header Compact */}
      <div className="relative pt-20 md:pt-32 pb-8 md:pb-12 text-center w-full px-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-orange-500/30 to-blue-500/30 blur-3xl scale-150 animate-pulse"></div>
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-full mb-3 md:mb-4 shadow-2xl shadow-orange-500/50">
              <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-400 to-white mb-3 tracking-tight px-4">
              {t("president.title")}
            </h1>
            
            <div className="relative w-20 md:w-24 h-1 mx-auto mt-3 md:mt-4 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Président - Design Professionnel */}
      <div className="relative w-full flex items-center justify-center pb-12 md:pb-16 px-4">
        <div className="w-full max-w-6xl">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl md:rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
            
            {/* Card principale */}
            <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden border-2 border-orange-500/30 shadow-2xl">
              
              {/* Image Hero */}
              <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
                <img
                  src={getImageSrc(motPresident)}
                  alt={motPresident[`title_${i18n.language}`] || motPresident.title_fr}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-[#0f1729]/60 to-transparent"></div>
                
                {/* Badge date */}
                {motPresident.created_at && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/50 blur-xl rounded-xl md:rounded-2xl"></div>
                      <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl border-2 border-blue-400/50">
                        <div className="flex items-center gap-2 md:gap-3 text-white">
                          <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                          <div>
                            <p className="text-xs opacity-80 uppercase tracking-wide hidden md:block">{t("president.published")}</p>
                            <p className="text-xs md:text-sm font-black">
                              {new Date(motPresident.created_at).toLocaleDateString(i18n.language, { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Badge Message */}
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                  <div className="inline-flex items-center gap-2 md:gap-3 bg-orange-500/20 backdrop-blur-sm border border-orange-500/40 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                    <Quote className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                    <span className="text-orange-300 text-xs md:text-sm font-bold uppercase tracking-wide">
                      {t("president.message_from")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenu du message */}
              <div className="p-6 md:p-10 lg:p-12">
                <div className="max-w-4xl mx-auto">
                  
                  {/* Titre */}
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-6 md:mb-8 leading-tight">
                    {motPresident[`title_${i18n.language}`] || motPresident.title_fr}
                  </h2>
                  
                  <div className="w-24 md:w-32 h-1 md:h-1.5 bg-gradient-to-r from-orange-500 via-blue-500 to-transparent rounded-full mb-8 md:mb-12"></div>

                  {/* Message principal */}
                  <div className="relative mb-8 md:mb-12">
                    <div className="absolute -left-2 md:-left-4 top-0 w-1 h-full bg-gradient-to-b from-orange-500 to-blue-500 rounded-full"></div>
                    
                    <blockquote className="text-base md:text-xl lg:text-2xl text-gray-300 font-medium leading-relaxed pl-6 md:pl-8 whitespace-pre-line">
                      {motPresident[`description_${i18n.language}`] || motPresident.description_fr}
                    </blockquote>
                  </div>

                  {/* Signature */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-xl md:rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-gradient-to-br from-orange-500/10 to-blue-500/10 backdrop-blur-sm border-2 border-orange-500/30 rounded-xl md:rounded-2xl p-6 md:p-8 text-right">
                      <p className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-1 md:mb-2">
                        {motPresident.president_name || t("president.president_name")}
                      </p>
                      <p className="text-orange-400 font-bold text-sm md:text-base lg:text-lg">
                        {t("president.president_role")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ CTA */}
      <div className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-orange-500/10 backdrop-blur-xl border-2 border-orange-500/30 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-400 to-white mb-4">
              {t("president.cta_title")}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
              {t("president.cta_text")}
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-base md:text-lg shadow-2xl border-2 border-orange-400/50 text-white hover:scale-105 transition-transform duration-300"
            >
              <Zap className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
              {t("president.cta_button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotPresident;