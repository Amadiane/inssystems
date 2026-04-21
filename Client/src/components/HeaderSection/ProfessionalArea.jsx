import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, AlertCircle, X, ChevronRight, Loader2, Target } from "lucide-react";
import CONFIG from "../../config/config.js";

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-32">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
    <span className="text-gray-600 text-lg mt-6 font-medium">Chargement...</span>
  </div>
);

const ProfessionalArea = () => {
  const { t, i18n } = useTranslation();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Mapping des groupes cibles
  const TARGET_GROUPS = {
    companies: {
      fr: "Entreprises / Projet R&D",
      en: "Companies / R&D Projects"
    },
    points_of_sale: {
      fr: "Points de vente",
      en: "Points of Sale"
    },
    distributors: {
      fr: "Distributeurs",
      en: "Distributors"
    }
  };

  // Normalisation URL
  const normalizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `${CONFIG.BASE_URL}${url}`;
    return `${CONFIG.BASE_URL}/${url}`;
  };

  // Fetch des zones professionnelles
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setError(null);
        const res = await fetch(CONFIG.API_PRO_AREA_LIST);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        const areaData = Array.isArray(data) ? data : data.results || [];
        
        // TEMPORAIRE: Afficher TOUTES les zones pour diagnostic
        // TODO: Activer vos zones dans l'admin puis décommenter le filtre ci-dessous
        
        // Filter only active areas (COMMENTÉ TEMPORAIREMENT)
        // const activeAreas = areaData.filter(
        //   area => area.is_active === true || area.isActive === true
        // );
        
        // TEMPORAIRE: Utiliser toutes les zones
        const activeAreas = areaData;
        
        console.log(`🏢 Total areas: ${areaData.length}, Active areas: ${activeAreas.length}`);
        console.log('🔍 Zones chargées:', activeAreas);
        
        setAreas(
          activeAreas.map((a) => ({
            ...a,
            image_url: normalizeUrl(a.image_url || a.image),
          }))
        );
      } catch (err) {
        console.error("Erreur API Professional Areas:", err);
        setError(err.message || "Une erreur est survenue lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  const currentLang = i18n.language;

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedArea(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-8 md:pt-40 md:pb-12">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-4 tracking-tight">
            {t("professionalArea.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-light">
            {t("professionalArea.subtitle")}
          </p>
        </div>
      </section>

      {/* Areas Section */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && <LoadingSpinner />}

          {/* Error State */}
          {error && !loading && (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-red-50 rounded-2xl p-12 border border-red-100">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t("professionalArea.errorTitle")}
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {t("professionalArea.retry")}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && areas.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-12 border border-gray-100">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t("professionalArea.empty")}
                </h3>
                <p className="text-gray-600">
                  {t("professionalArea.emptyDesc")}
                </p>
              </div>
            </div>
          )}

          {/* Areas Grid */}
          {!loading && !error && areas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {areas.map((area) => {
                const name = area[`name_${currentLang}`] || area.name_fr;
                const description = area[`description_${currentLang}`] || area.description_fr;
                const areaImage = area.image_url || area.image;
                const targetGroupLabel = TARGET_GROUPS[area.target_group]?.[currentLang] || area.target_group;

                return (
                  <div
                    key={area.id}
                    onClick={() => handleAreaClick(area)}
                    className="group cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Voir les détails de ${name}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAreaClick(area);
                      }
                    }}
                  >
                    {/* Card Container */}
                    <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-xl">
                      {/* Image Container */}
                      <div className="relative aspect-[4/5] p-8 bg-gradient-to-br from-gray-50 to-white">
                        {areaImage ? (
                          <img
                            src={areaImage}
                            alt={name || "Zone professionnelle"}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              console.error("❌ Erreur chargement image:", areaImage);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Building2 className={`w-24 h-24 text-gray-300 mx-auto ${areaImage ? 'hidden' : ''}`} />
                        
                        {/* Target Group Badge */}
                        {area.target_group && (
                          <div className="absolute top-4 left-4 right-4">
                            <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              <Target className="w-3 h-3" />
                              {targetGroupLabel}
                            </span>
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-orange-500 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-4 shadow-lg">
                            <ChevronRight className="w-7 h-7 text-orange-500" />
                          </div>
                        </div>
                      </div>

                      {/* Area Name */}
                      <div className="px-5 py-4 bg-white border-t border-gray-100 group-hover:bg-orange-50 transition-colors duration-300">
                        <h3 className="text-center text-base font-bold text-gray-900 line-clamp-2 group-hover:text-orange-500 transition-colors min-h-[3rem]">
                          {name || t("professionalArea.untitled")}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!loading && !error && areas.length > 0 && (
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mb-8 shadow-xl shadow-orange-500/20">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            
            {/* Title */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              {t("professionalArea.ctaTitle")}
            </h2>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("professionalArea.ctaDesc")}
            </p>

            {/* CTA Button */}
            <a
              href="/contacternous"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold text-lg rounded-xl shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-500 hover:scale-105"
              style={{ backgroundSize: '200% 100%' }}
            >
              <span>{t("professionalArea.ctaButton")}</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </a>
          </div>
        </section>
      )}

      {/* MODAL DÉTAILS ZONE */}
      {selectedArea && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
          onClick={handleCloseModal}
          style={{ top: 0 }}
        >
          <div
            className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 p-8 md:p-10">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-700/20 rounded-full blur-2xl"></div>
              
              <button
                className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 z-10"
                onClick={handleCloseModal}
                aria-label="Fermer"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div className="relative">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white pr-16 mb-2 drop-shadow-lg">
                  {selectedArea[`name_${currentLang}`] || selectedArea.name_fr}
                </h2>
                {selectedArea.name_en && selectedArea.name_fr && currentLang === "en" && (
                  <p className="text-white/90 text-base md:text-lg font-semibold mt-3 italic">
                    {selectedArea.name_fr}
                  </p>
                )}
                {selectedArea.name_en && selectedArea.name_fr && currentLang === "fr" && (
                  <p className="text-white/90 text-base md:text-lg font-semibold mt-3 italic">
                    {selectedArea.name_en}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 md:p-10 overflow-y-auto flex-1 bg-gradient-to-br from-white via-orange-50/20 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                {/* Colonne Gauche - Image */}
                <div className="space-y-6">
                  {(selectedArea.image_url || selectedArea.image) && (
                    <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 p-6">
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full"></div>
                      
                      <img
                        src={selectedArea.image_url || selectedArea.image}
                        className="relative w-full h-full object-contain drop-shadow-2xl"
                        alt={selectedArea[`name_${currentLang}`] || selectedArea.name_fr}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Target Group Badge */}
                  {selectedArea.target_group && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-2xl"></div>
                      <div className="relative flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg">
                        <Target className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-700 font-bold text-lg">
                          {TARGET_GROUPS[selectedArea.target_group]?.[currentLang] || selectedArea.target_group}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colonne Droite - Description */}
                <div className="space-y-6">
                  {/* French Description */}
                  {selectedArea.description_fr && (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-20 blur-lg transition-opacity rounded-3xl"></div>
                      <div className="relative bg-gradient-to-br from-orange-50 via-yellow-50/50 to-orange-50 p-6 md:p-8 rounded-3xl border-l-4 border-orange-500 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">FR</span>
                          </div>
                          <h3 className="font-black text-gray-900 text-xl">
                            {t("professionalArea.description")}
                          </h3>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                          {selectedArea.description_fr}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* English Description */}
                  {selectedArea.description_en && (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity rounded-3xl"></div>
                      <div className="relative bg-gradient-to-br from-orange-50/70 via-red-50/50 to-orange-50/70 p-6 md:p-8 rounded-3xl border-l-4 border-orange-600 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">EN</span>
                          </div>
                          <h3 className="font-black text-gray-900 text-xl">
                            Description
                          </h3>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                          {selectedArea.description_en}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          {t("professionalArea.infoTitle")}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {t("professionalArea.infoText")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="relative bg-gradient-to-r from-gray-50 to-orange-50/30 p-6 md:p-8 border-t-2 border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {t("professionalArea.footerNote")}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="/contacternous"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    style={{ backgroundSize: '200% 100%' }}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>{t("professionalArea.contact")}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <button
                    className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
                    onClick={handleCloseModal}
                  >
                    <X className="w-5 h-5" />
                    <span>{t("professionalArea.close")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalArea;