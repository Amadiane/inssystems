import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Loader2,
  X,
  ArrowRight,
  Clock,
} from "lucide-react";
import CONFIG from "../../config/config.js";

const Actualites = () => {
  const { t, i18n } = useTranslation();

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // 1 hero + 6 regular

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setError(null);
        const response = await fetch(CONFIG.API_NEWS_LIST);
        if (!response.ok) throw new Error("Erreur HTTP : " + response.status);

        const data = await response.json();
        
        // ✅ Filtrer uniquement les actualités actives pour le client
        const activeNews = data.filter(item => item.is_active === true || item.isActive === true);
        
        const sorted = activeNews.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setNewsList(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getLocalizedField = (item, base) => {
    const lang = i18n.language;
    return item[`${base}_${lang}`] || item[`${base}_fr`] || item[base] || "";
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(i18n.language === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getReadTime = (content) => {
    const words = content.split(" ").length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentNews = newsList.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(newsList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#F47920] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{t("news.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("news.errorTitle")}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white font-bold rounded-2xl hover:scale-105 transition-transform duration-300"
          >
            {t("news.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header - Ultra Minimal */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-8 md:pt-40 md:pb-12">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-4 tracking-tight">
            {t("news.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-light">
            {t("news.subtitle")}
          </p>
        </div>
      </div>

      {/* Main Content - Bento Grid */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 md:py-12">
        {newsList.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">{t("news.noNews")}</h3>
            <p className="text-gray-500 text-lg">{t("news.noNewsDesc")}</p>
          </div>
        ) : (
          <>
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 auto-rows-fr">
              {currentNews.map((item, index) => {
                const title = getLocalizedField(item, "title");
                const content = getLocalizedField(item, "content");
                const excerpt = content.slice(0, index === 0 ? 200 : 120) + "...";
                const isHero = index === 0;

                return (
                  <article
                    key={item.id}
                    className={`group cursor-pointer ${
                      isHero ? "md:col-span-2 lg:row-span-2" : ""
                    }`}
                    onClick={() => setSelectedNews(item)}
                  >
                    <div className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-[#F47920] h-full flex flex-col">
                      {/* Image */}
                      {item.image_url && (
                        <div className={`relative overflow-hidden bg-gray-100 flex-shrink-0 ${
                          isHero ? "h-[400px] md:h-[500px]" : "h-48"
                        }`}>
                          <img
                            src={item.image_url}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      )}

                      {/* Content - Flexible pour remplir l'espace */}
                      <div className={`flex-1 flex flex-col ${isHero ? "p-6 md:p-10" : "p-6"}`}>
                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <time>{formatDate(item.created_at)}</time>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{getReadTime(content)}</span>
                          </div>
                        </div>

                        {/* Title - Hauteur fixe avec clamp */}
                        <h3 className={`font-black text-gray-900 mb-3 group-hover:text-[#F47920] transition-colors duration-300 flex-shrink-0 ${
                          isHero ? "text-3xl md:text-4xl lg:text-5xl leading-tight line-clamp-4" : "text-xl md:text-2xl line-clamp-2"
                        }`}>
                          {title}
                        </h3>

                        {/* Excerpt - Prend l'espace restant avec clamp */}
                        <p className={`text-gray-600 leading-relaxed mb-4 ${
                          isHero ? "text-lg md:text-xl line-clamp-5" : "text-base line-clamp-3"
                        }`}>
                          {excerpt}
                        </p>

                        {/* Spacer flexible pour pousser le bouton en bas */}
                        <div className="flex-1"></div>

                        {/* Read More - Toujours en bas */}
                        <div className="flex items-center text-[#F47920] font-bold group/btn flex-shrink-0">
                          <span>{t("news.readMore")}</span>
                          <ArrowRight className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination - Minimal */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 text-gray-700 hover:border-[#F47920] hover:text-[#F47920] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                  aria-label={t("news.previousPage")}
                >
                  ←
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-12 h-12 rounded-full font-bold transition-all duration-300 ${
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white scale-110"
                            : "border-2 border-gray-200 text-gray-700 hover:border-[#F47920]"
                        }`}
                        aria-label={`${t("news.page")} ${pageNumber}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 text-gray-700 hover:border-[#F47920] hover:text-[#F47920] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                  aria-label={t("news.nextPage")}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal - Modern Full Screen */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in fade-in duration-300"
          onClick={() => setSelectedNews(null)}
        >
          {/* Close Button */}
          <button
            className="fixed top-8 right-8 w-14 h-14 bg-gray-900 hover:bg-[#F47920] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
            onClick={() => setSelectedNews(null)}
            aria-label={t("news.close")}
          >
            <X size={24} className="text-white" />
          </button>

          <div
            className="max-w-4xl mx-auto px-6 lg:px-12 py-24 md:py-32"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time>{formatDate(selectedNews.created_at)}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{getReadTime(getLocalizedField(selectedNews, "content"))}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
              {getLocalizedField(selectedNews, "title")}
            </h1>

            {/* Image */}
            {selectedNews.image_url && (
              <div className="relative w-full h-[400px] md:h-[600px] mb-12 rounded-3xl overflow-hidden">
                <img
                  src={selectedNews.image_url}
                  alt={getLocalizedField(selectedNews, "title")}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-xl max-w-none">
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                {getLocalizedField(selectedNews, "content")}
              </p>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setSelectedNews(null)}
              className="mt-16 px-8 py-4 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white font-bold rounded-2xl hover:scale-105 transition-transform duration-300 inline-flex items-center gap-2"
            >
              ← {t("news.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actualites;