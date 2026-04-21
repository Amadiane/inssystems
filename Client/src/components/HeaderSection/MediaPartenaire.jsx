import React, { useEffect, useState } from "react";
import { ExternalLink, Loader, ChevronRight, Search, Calendar, MapPin, Building } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ChatBotNew from "../ChatBot/ChatbotNew";

const MediaPartenaire = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BACKEND;
  
  // Filtres
  const [activeFilter, setActiveFilter] = useState('tous');
  const [yearFilter, setYearFilter] = useState('tous');
  const [monthFilter, setMonthFilter] = useState('tous');
  const [activityFilter, setActivityFilter] = useState('tous');
  
  // Options de filtres
  const [categories, setCategories] = useState(['tous']);
  const [years, setYears] = useState(['tous']);
  const [months, setMonths] = useState(['tous']);
  const [activities, setActivities] = useState(['tous']);

  const monthNames = {
    fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  };

  useEffect(() => {
    const fetchPartenaires = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl + "/api/partenaires/"); //apiUrl + "/
        if (!response.ok) throw new Error(t("media_partners.errors.loading_error"));
        const data = await response.json();
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(data.map(p => p.categorie).filter(Boolean))];
        setCategories(['tous', ...uniqueCategories]);
        
        // Extraire les années uniques à partir de date_creation
        const uniqueYears = [...new Set(data.map(p => {
          if (p.date_creation) {
            return new Date(p.date_creation).getFullYear();
          }
          return null;
        }).filter(Boolean))].sort((a, b) => b - a);
        setYears(['tous', ...uniqueYears]);
        
        // Extraire les mois uniques
        const uniqueMonths = [...new Set(data.map(p => {
          if (p.date_creation) {
            return new Date(p.date_creation).getMonth();
          }
          return null;
        }).filter(month => month !== null))].sort((a, b) => a - b);
        setMonths(['tous', ...uniqueMonths]);
        
        // Extraire les activités uniques (assumant qu'il y a un champ activite)
        const uniqueActivities = [...new Set(data.map(p => p.activite).filter(Boolean))];
        setActivities(['tous', ...uniqueActivities]);
        
        setPartenaires(data);
        setError(null);
      } catch (error) {
        console.error(t("media_partners.errors.fetch_error"), error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartenaires();
  }, [t]);

  // Filtrage multilingue et par critères
  const filteredPartenaires = partenaires.filter(partenaire => {
    // Recherche textuelle multilingue
    const searchMatch = 
      (partenaire[`titre_${i18n.language}`] || partenaire.titre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (partenaire[`description_${i18n.language}`] || partenaire.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (partenaire.ville || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par catégorie
    const categoryMatch = activeFilter === 'tous' || partenaire.categorie === activeFilter;
    
    // Filtre par année
    const yearMatch = yearFilter === 'tous' || 
      (partenaire.date_creation && new Date(partenaire.date_creation).getFullYear() === yearFilter);
    
    // Filtre par mois
    const monthMatch = monthFilter === 'tous' || 
      (partenaire.date_creation && new Date(partenaire.date_creation).getMonth() === monthFilter);
    
    // Filtre par activité
    const activityMatch = activityFilter === 'tous' || partenaire.activite === activityFilter;

    return searchMatch && categoryMatch && yearMatch && monthMatch && activityMatch;
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    return `${apiUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleContactClick = () => {
    navigate('/contacter-tamkine');
  };

  const clearAllFilters = () => {
    setActiveFilter('tous');
    setYearFilter('tous');
    setMonthFilter('tous');
    setActivityFilter('tous');
    setSearchTerm('');
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* En-tête avec gradient */}
      <header className="bg-gradient-to-r from-[#1C1C47] to-[#12138B] text-white text-center py-4 px-4 md:py-8 lg:py-12 shadow-md">
        <div className="pt-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('media_partners.title')}
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg opacity-90">
            {t('media_partners.subtitle')}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {/* Barre de recherche */}
        <div className="max-w-md mx-auto mb-8">
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t("media_partners.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1C1C47] focus:border-transparent shadow-sm"
              aria-label={t("media_partners.search_aria_label")}
            />
          </div>
        </div>

        {/* Filtres */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1C1C47]">
                {t('media_partners.filters.title')}
              </h2>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {t('media_partners.filters.clear_all')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre par catégorie */}
              {categories.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building size={16} className="inline mr-1" />
                    {t('media_partners.filters.category')}
                  </label>
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C1C47] focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'tous' ? t('media_partners.filters.all_categories') : cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtre par année */}
              {years.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    {t('media_partners.filters.year')}
                  </label>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value === 'tous' ? 'tous' : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C1C47] focus:border-transparent"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year === 'tous' ? t('media_partners.filters.all_years') : year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtre par mois */}
              {months.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    {t('media_partners.filters.month')}
                  </label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value === 'tous' ? 'tous' : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C1C47] focus:border-transparent"
                  >
                    <option value="tous">{t('media_partners.filters.all_months')}</option>
                    {months.filter(month => month !== 'tous').map(month => (
                      <option key={month} value={month}>
                        {monthNames[i18n.language] ? monthNames[i18n.language][month] : monthNames.fr[month]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtre par activité */}
              {activities.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building size={16} className="inline mr-1" />
                    {t('media_partners.filters.activity')}
                  </label>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C1C47] focus:border-transparent"
                  >
                    {activities.map(activity => (
                      <option key={activity} value={activity}>
                        {activity === 'tous' ? t('media_partners.filters.all_activities') : activity}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenu principal */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1C1C47]"></div>
            <span className="ml-3 text-gray-600 text-sm sm:text-base">{t("common.loading")}</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md my-4 text-sm sm:text-base" role="alert">
            <p className="font-bold">{t("common.error")}</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 bg-[#1C1C47] hover:bg-[#15154b] text-white px-4 py-2 rounded-md transition text-sm"
            >
              {t('media_partners.retry')}
            </button>
          </div>
        ) : filteredPartenaires.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md px-4">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-3 text-base sm:text-lg text-gray-600">
              {t("media_partners.no_partners")}
            </p>
            {(searchTerm || activeFilter !== 'tous' || yearFilter !== 'tous' || monthFilter !== 'tous' || activityFilter !== 'tous') && (
              <button 
                onClick={clearAllFilters}
                className="mt-2 text-[#1C1C47] hover:text-[#3b3b82] transition-colors"
              >
                {t("media_partners.clear_filters")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredPartenaires.map((partenaire, index) => (
              <PartenaireCard key={partenaire.id || index} partenaire={partenaire} getImageUrl={getImageUrl} />
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-white py-16 text-black">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl text-center">
          <button
            onClick={handleContactClick}
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

const PartenaireCard = ({ partenaire, getImageUrl }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { i18n, t } = useTranslation();

  // Formatage de la date selon la langue
  let formattedDate = t("media_partners.date_unavailable");
  try {
    if (partenaire.date_creation) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      formattedDate = new Date(partenaire.date_creation).toLocaleDateString(
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
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2"
      style={{
        boxShadow: isHovered ? '0 12px 24px rgba(0, 0, 0, 0.15)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image du partenaire */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {partenaire.couverture ? (
          <img
            src={getImageUrl(partenaire.couverture)}
            alt={`Logo de ${partenaire[`titre_${i18n.language}`] || partenaire.titre}`}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            loading="lazy"
            onError={(e) => {
              console.log('Image non chargée:', e.target.src);
              e.target.onerror = null;
              e.target.parentNode.innerHTML = `
                <div class="h-full w-full bg-gray-200 flex items-center justify-center">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-gray-500 ml-2">${t('media_partners.image_unavailable')}</p>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-500 ml-2">{t('media_partners.image_unavailable')}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        
        {partenaire.categorie && (
          <div className="absolute top-4 right-4 bg-[#1C1C47]/80 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {partenaire.categorie}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 sm:p-5 md:p-6 flex-grow flex flex-col">
        <h2 className="text-lg sm:text-xl font-semibold text-[#1C1C47] mb-2 sm:mb-3">
          {partenaire[`titre_${i18n.language}`] || partenaire.titre || t("media_partners.untitled")}
        </h2>
        
        <p className="text-gray-700 mb-4 sm:mb-6 flex-grow text-sm sm:text-base">
          {partenaire[`description_${i18n.language}`] || partenaire.description || t("media_partners.no_description")}
        </p>

        {/* Informations supplémentaires */}
        <div className="space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
          {partenaire.ville && (
            <div className="flex items-center">
              <MapPin size={14} className="mr-2 text-gray-400" />
              <span className="font-medium">{t('media_partners.location')}: </span>
              <span className="ml-1">{partenaire.ville}</span>
            </div>
          )}
          {partenaire.activite && (
            <div className="flex items-center">
              <Building size={14} className="mr-2 text-gray-400" />
              <span className="font-medium">{t('media_partners.activity')}: </span>
              <span className="ml-1">{partenaire.activite}</span>
            </div>
          )}
          {partenaire.date_creation && (
            <div className="flex items-center">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span className="font-medium">{t('media_partners.established')}: </span>
              <span className="ml-1">{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Bouton */}
        <div className="mt-auto">
          {partenaire.site_url ? (
            <a
              href={partenaire.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#1C1C47] hover:bg-[#15154b] text-white py-3 px-4 sm:px-6 rounded-lg transition-colors duration-300 w-full text-center group text-sm sm:text-base"
            >
              {t('media_partners.visit_site')}
              <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <button className="bg-gray-200 text-gray-500 py-3 px-4 sm:px-6 rounded-lg w-full cursor-not-allowed text-sm sm:text-base">
              {t('media_partners.site_unavailable')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPartenaire;