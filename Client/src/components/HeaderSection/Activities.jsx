// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { ExternalLink, Loader, ChevronRight, Search } from "lucide-react";
// import { useNavigate } from 'react-router-dom';
// import ChatBotNew from "../ChatBot/ChatbotNew";
// import { API_URL } from "../config";

// const Activities = () => {
//   const navigate = useNavigate();
//   const { i18n, t } = useTranslation();
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isSearchFocused, setIsSearchFocused] = useState(false);
//   const apiUrl = import.meta.env.VITE_API_BACKEND;
//   const response = await fetch(`${API_URL}/api/activities/${id}/`);

//   useEffect(() => {
//     const fetchActivities = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(apiUrl + "/api/activities/");
//         if (!response.ok) throw new Error(t("errors.loading_activities"));
//         const data = await response.json();
//         setActivities(data);
//         setError("");
//       } catch (err) {
//         console.error(t("errors.fetch_error"), err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchActivities();
//   }, [t]);
  
//   // Filtrage multilingue des activités
//   const filteredActivities = activities.filter(activity =>
//     (activity[`title_${i18n.language}`] || activity.title_fr || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
//     ((activity[`comment_${i18n.language}`] || activity.comment_fr || "").toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return null;
    
//     if (imagePath.startsWith('http')) {
//       return imagePath;
//     }
    
//     return `${apiUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
//   };

//   const handleClick = () => {
//     navigate('/contacter-tamkine');
//   };

//   return (
//     <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
//       {/* En-tête */}
//       <header className="bg-gradient-to-r from-[#1C1C47] to-[#12138B] text-white text-center py-4 px-4 md:py-8 lg:py-12 shadow-md">
//         <div className="pt-16">
//           <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t('activities.title')}</h1>
//           <p className="max-w-2xl mx-auto text-base md:text-lg opacity-90">
//             {t('activities.subtitle')}
//           </p>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
//         {/* Barre de recherche */}
//         <div className="max-w-md mx-auto mb-8">
//           <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
//             <input
//               type="text"
//               placeholder={t("activities.search_placeholder")}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               onFocus={() => setIsSearchFocused(true)}
//               onBlur={() => setIsSearchFocused(false)}
//               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1C1C47] focus:border-transparent shadow-sm"
//               aria-label={t("activities.search_aria_label")}
//             />
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-10">
//             <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1C1C47]"></div>
//             <span className="ml-3 text-gray-600 text-sm sm:text-base">{t("common.loading")}</span>
//           </div>
//         ) : error ? (
//           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md my-4 text-sm sm:text-base" role="alert">
//             <p className="font-bold">{t("common.error")}</p>
//             <p>{error}</p>
//           </div>
//         ) : filteredActivities.length === 0 ? (
//           <div className="text-center py-10 bg-white rounded-lg shadow-md px-4">
//             <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <p className="mt-3 text-base sm:text-lg text-gray-600">{t("activities.no_activities")}</p>
//             {searchTerm && (
//               <button 
//                 onClick={() => setSearchTerm("")}
//                 className="mt-2 text-[#1C1C47] hover:text-[#3b3b82] transition-colors"
//               >
//                 {t("activities.clear_search")}
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
//             {filteredActivities.map((activity, index) => {
//               let formattedDate = t("activities.date_unavailable");
//               try {
//                 if (activity.created_at) {
//                   const options = { year: 'numeric', month: 'long', day: 'numeric' };
//                   formattedDate = new Date(activity.created_at).toLocaleDateString(
//                     i18n.language === 'fr' ? 'fr-FR' : 
//                     i18n.language === 'ar' ? 'ar-MA' : 'en-US', 
//                     options
//                   );
//                 }
//               } catch (e) {
//                 console.error('Erreur lors du formatage de la date:', e);
//               }

//               return (
//                 <ActivityCard 
//                   key={activity.id} 
//                   activity={activity} 
//                   formattedDate={formattedDate}
//                   getImageUrl={getImageUrl}
//                   i18n={i18n}
//                   t={t}
//                 />
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Footer CTA */}
//       <div className="bg-white py-16 text-black">
//         <div className="container mx-auto px-4 md:px-8 max-w-6xl text-center">
//           <button
//             onClick={handleClick}
//             className="bg-[#12138B] text-white hover:bg-[#1e1fab] transition px-8 py-4 rounded-full font-semibold text-lg shadow-md"
//           >
//             {t('contact_us')}
//           </button>
//         </div>
//       </div>

//       <div className="fixed bottom-6 right-6 z-50">
//         <ChatBotNew />
//       </div>
//     </div>
//   );
// };

// const ActivityCard = ({ activity, formattedDate, getImageUrl, i18n, t }) => {
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div 
//       className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Image de l'activité */}
//       {activity.cover_photo ? (
//         <div className="relative h-48 sm:h-56 overflow-hidden">
//           <img
//             src={getImageUrl(activity.cover_photo)}
//             alt={`${activity[`title_${i18n.language}`] || activity.title_fr} cover`}
//             className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
//             loading="lazy"
//             onError={(e) => {
//               console.log('Image non chargée:', e.target.src);
//               e.target.onerror = null;
//               e.target.parentNode.innerHTML = `
//                 <div class="h-full w-full bg-gray-200 flex items-center justify-center">
//                   <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                   </svg>
//                   <p class="text-gray-500 ml-2">${t('activities.image_unavailable')}</p>
//                 </div>
//               `;
//             }}
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
//         </div>
//       ) : (
//         <div className="h-48 sm:h-56 w-full bg-gray-200 flex items-center justify-center">
//           <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//           <p className="text-gray-500 ml-2">{t('activities.image_unavailable')}</p>
//         </div>
//       )}

//       {/* Contenu */}
//       <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
//         <h2 className="text-lg sm:text-xl font-semibold text-[#1C1C47] mb-2 sm:mb-3">
//           {activity[`title_${i18n.language}`] || activity.title_fr || t("activities.untitled")}
//         </h2>
        
//         <div className="flex-grow mb-4">
//           <p className="text-gray-600 text-sm sm:text-base">
//             {activity[`comment_${i18n.language}`] || activity.comment_fr || t('activities.no_description')}
//           </p>
//         </div>

//         <div className="flex justify-between items-center border-t pt-4 mt-auto">
//           <span className="text-xs text-gray-500">
//             {t('activities.created_on')} {formattedDate}
//           </span>
          
//           <button 
//             className="inline-flex items-center px-4 py-2 bg-[#1C1C47] text-white rounded-md hover:bg-[#3b3b82] transition-colors text-sm font-medium shadow-md hover:shadow-lg group"
//           >
//             {t('activities.view_details')}
//             <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Activities;

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ChatBotNew from "../ChatBot/ChatbotNew";
import CONFIG from "../../config/config.js";



const Activities = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/activities/`);
        if (!response.ok) throw new Error(t("errors.loading_activities"));
        const data = await response.json();
        setActivities(data);
        setError("");
      } catch (err) {
        console.error(t("errors.fetch_error"), err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [t]);

  const filteredActivities = activities.filter(activity =>
    (activity[`title_${i18n.language}`] || activity.title_fr || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (activity[`comment_${i18n.language}`] || activity.comment_fr || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleClick = () => {
    navigate('/contacter-tamkine');
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1C1C47] to-[#12138B] text-white text-center py-8 shadow-md">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t('activities.title')}</h1>
        <p className="max-w-2xl mx-auto text-base md:text-lg opacity-90">
          {t('activities.subtitle')}
        </p>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Barre de recherche */}
        <div className="max-w-md mx-auto mb-8">
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
            <input
              type="text"
              placeholder={t("activities.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1C1C47] focus:border-transparent shadow-sm"
              aria-label={t("activities.search_aria_label")}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1C1C47]"></div>
            <span className="ml-3 text-gray-600 text-sm sm:text-base">{t("common.loading")}</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md my-4 text-sm sm:text-base" role="alert">
            <p className="font-bold">{t("common.error")}</p>
            <p>{error}</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md px-4">
            <p className="mt-3 text-base sm:text-lg text-gray-600">{t("activities.no_activities")}</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-2 text-[#1C1C47] hover:text-[#3b3b82] transition-colors"
              >
                {t("activities.clear_search")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => {
              const formattedDate = activity.created_at
                ? new Date(activity.created_at).toLocaleDateString(
                    i18n.language === 'fr' ? 'fr-FR' :
                    i18n.language === 'ar' ? 'ar-MA' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )
                : t("activities.date_unavailable");

              return (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity} 
                  formattedDate={formattedDate}
                  getImageUrl={getImageUrl}
                  i18n={i18n}
                  t={t}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-white py-16 text-center">
        <button
          onClick={handleClick}
          className="bg-[#12138B] text-white hover:bg-[#1e1fab] transition px-8 py-4 rounded-full font-semibold text-lg shadow-md"
        >
          {t('contact_us')}
        </button>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

const ActivityCard = ({ activity, formattedDate, getImageUrl, i18n, t }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col h-full">
      {activity.cover_photo ? (
        <img
          src={getImageUrl(activity.cover_photo)}
          alt={`${activity[`title_${i18n.language}`] || activity.title_fr} cover`}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
          {t('activities.image_unavailable')}
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-[#1C1C47] mb-2">
          {activity[`title_${i18n.language}`] || activity.title_fr || t("activities.untitled")}
        </h2>
        <p className="text-gray-600 flex-grow text-sm">
          {activity[`comment_${i18n.language}`] || activity.comment_fr || t('activities.no_description')}
        </p>
        <div className="flex justify-between items-center border-t pt-4 mt-4 text-xs text-gray-500">
          <span>{t('activities.created_on')} {formattedDate}</span>
          <button className="inline-flex items-center text-[#1C1C47] hover:text-[#3b3b82] text-sm font-medium">
            {t('activities.view_details')}
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Activities;
