import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ChatBotNew from "../ChatBot/ChatbotNew";

const Platforms = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPlatform, setExpandedPlatform] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/api/platformlinks/");//const response = await fetch(apiUrl + "/api/programmes/");
        if (!response.ok) throw new Error(t("errors.loading_platforms"));
        const data = await response.json();
        setPlatforms(data);
      } catch (err) {
        console.error(t("errors.fetch_error"), err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, [t]);

  // Filtrage multilingue des plateformes
  const filteredPlatforms = platforms.filter(platform =>
    (platform[`title_${i18n.language}`] || platform.title_fr || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((platform[`description_${i18n.language}`] || platform.description_fr || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getImageUrl = (iconPath) => {
    if (!iconPath) return null;
    
    if (iconPath.startsWith('http')) {
      return iconPath;
    }
    
    return `http://127.0.0.1:8000${iconPath.startsWith('/') ? '' : '/'}${iconPath}`;
  };

  const toggleDescription = (index) => {
    setExpandedPlatform(expandedPlatform === index ? null : index);
  };

  const handleClick = () => {
    navigate('/contacter-tamkine');
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* En-tête */}
      <header className="bg-gradient-to-r from-[#1C1C47] to-[#12138B] text-white text-center py-4 px-4 md:py-8 lg:py-12 shadow-md">
        <div className="pt-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t('platforms.title')}</h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg opacity-90">
            {t('platforms.subtitle')}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <div className="max-w-md mx-auto mb-8">
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
            <input
              type="text"
              placeholder={t("platforms.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1C1C47] focus:border-transparent shadow-sm"
              aria-label={t("platforms.search_aria_label")}
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
        ) : filteredPlatforms.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md px-4">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-3 text-base sm:text-lg text-gray-600">{t("platforms.no_platforms")}</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-2 text-[#1C1C47] hover:text-[#3b3b82] transition-colors"
              >
                {t("platforms.clear_search")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredPlatforms.map((platform, index) => {
              let formattedDate = t("platforms.date_unavailable");
              try {
                if (platform.added_at) {
                  const options = { year: 'numeric', month: 'long', day: 'numeric' };
                  formattedDate = new Date(platform.added_at).toLocaleDateString(
                    i18n.language === 'fr' ? 'fr-FR' : 
                    i18n.language === 'ar' ? 'ar-MA' : 'en-US', 
                    options
                  );
                }
              } catch (e) {
                console.error('Erreur lors du formatage de la date:', e);
              }

              return (
                <div 
                  key={platform.id} 
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
                >
                  {platform.icon ? (
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <img 
                        src={getImageUrl(platform.icon)}
                        alt={`${platform[`title_${i18n.language}`] || platform.title_fr} icon`}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          console.log('Image non chargée:', e.target.src);
                          e.target.onerror = null;
                          e.target.parentNode.innerHTML = `
                            <div class="h-full w-full bg-gray-200 flex items-center justify-center">
                              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                              <p class="text-gray-500 ml-2">${t('platforms.image_unavailable')}</p>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-48 sm:h-56 w-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <p className="text-gray-500 ml-2">{t('platforms.image_unavailable')}</p>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                    <h2 className="text-lg sm:text-xl font-semibold text-[#1C1C47] mb-2 sm:mb-3">
                      {platform[`title_${i18n.language}`] || platform.title_fr || t("platforms.untitled")}
                    </h2>
                    
                    {(platform[`description_${i18n.language}`] || platform.description_fr) ? (
                      <div className={`overflow-hidden transition-all duration-500 flex-grow ${expandedPlatform === index ? 'max-h-screen' : 'max-h-20 sm:max-h-24'}`}>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {platform[`description_${i18n.language}`] || platform.description_fr}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic mb-6 flex-grow text-sm sm:text-base">
                        {t('platforms.no_description')}
                      </p>
                    )}
                    
                    {(platform[`description_${i18n.language}`] || platform.description_fr) && (
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mt-4"
                        onClick={() => toggleDescription(index)}
                        aria-expanded={expandedPlatform === index}
                      >
                        {expandedPlatform === index ? (
                          <>
                            {t("platforms.show_less")}
                            <ChevronUp size={14} className="ml-1" />
                          </>
                        ) : (
                          <>
                            {t("platforms.read_more")}
                            <ChevronDown size={14} className="ml-1" />
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex justify-between items-center border-t pt-4 mt-4">
                      <span className="text-xs text-gray-500">
                        {t('platforms.added_on')} {formattedDate}
                      </span>
                      
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-[#1C1C47] text-white rounded-md hover:bg-[#3b3b82] transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                      >
                        {t('platforms.visit')}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-white py-16 text-black">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl text-center">
          {/* <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('platforms.cta_title')}
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t('platforms.cta_description')}
          </p> */}
          <button
            onClick={handleClick}
            className="bg-[#12138B] text-white hover:bg-[#1e1fab] transition px-8 py-4 rounded-full font-semibold text-lg shadow-md"
          >
            {t('contact_us')}
          </button>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

export default Platforms;