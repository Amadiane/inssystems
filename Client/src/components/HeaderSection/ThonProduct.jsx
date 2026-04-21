import React, { useEffect, useState } from "react";
import { Package, Loader2, AlertCircle, X, ChevronRight } from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTranslation } from "react-i18next";

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-32">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
    <span className="text-gray-600 text-lg mt-6 font-medium">Chargement...</span>
  </div>
);

const ThonProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const response = await fetch(CONFIG.API_THON_PRODUCT_LIST);
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.results || [];
        
        // Filter only active products
        const activeProducts = list.filter(
          product => product.is_active === true || product.isActive === true
        );
        
        console.log(`📦 Total products: ${list.length}, Active products: ${activeProducts.length}`);
        setProducts(activeProducts);
      } catch (err) {
        console.error("Erreur API ThonProduct:", err);
        setError(err.message || "Une erreur est survenue lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const currentLang = i18n.language;

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Style moderne avec thème Thon */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-8 md:pt-40 md:pb-12">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-4 tracking-tight">
            {t("thon.title") || "Produits de Thon"}
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-light">
            {t("thon.subtitle") || (
              <>
                Découvrez notre gamme de{" "}
                <span className="text-orange-500">thon de qualité</span>{" "}
                supérieure
              </>
            )}
          </p>
        </div>
      </section>

      {/* Products Section */}
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
                  {t("thon.errorTitle") || "Erreur de chargement"}
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {t("thon.retry") || "Réessayer"}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-12 border border-gray-100">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t("thon.noProducts") || "Aucun produit disponible"}
                </h3>
                <p className="text-gray-600">
                  {t("thon.noProductsDesc") || "Nos produits arrivent bientôt. Revenez plus tard."}
                </p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => {
                const title = currentLang === "en" ? product.title_en : product.title_fr;
                const content = currentLang === "en" ? product.content_en : product.content_fr;
                const productImage = product.image_url || product.image;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="group cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Voir les détails de ${title}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleProductClick(product);
                      }
                    }}
                  >
                    {/* Card Container */}
                    <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-xl">
                      {/* Image Container */}
                      <div className="relative aspect-[4/5] p-8 bg-gradient-to-br from-gray-50 to-white">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={title || "Produit"}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              console.error("❌ Erreur chargement image:", productImage);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Package className={`w-24 h-24 text-gray-300 mx-auto ${productImage ? 'hidden' : ''}`} />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-orange-500 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-4 shadow-lg">
                            <ChevronRight className="w-7 h-7 text-orange-500" />
                          </div>
                        </div>
                      </div>

                      {/* Product Name */}
                      <div className="px-5 py-4 bg-white border-t border-gray-100 group-hover:bg-orange-50 transition-colors duration-300">
                        <h3 className="text-center text-base font-bold text-gray-900 line-clamp-2 group-hover:text-orange-500 transition-colors min-h-[3rem]">
                          {title || t("thon.untitled") || "Sans titre"}
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
      {!loading && !error && products.length > 0 && (
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mb-8 shadow-xl shadow-orange-500/20">
              <Package className="w-10 h-10 text-white" />
            </div>
            
            {/* Title */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              {t("thon.ctaTitle") || "INTÉRESSÉ PAR NOS PRODUITS ?"}
            </h2>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("thon.ctaDesc") || (
                <>
                  Contactez <span className="text-orange-500 font-bold">VIALI</span> pour plus d'informations sur notre gamme complète de produits à base de thon
                </>
              )}
            </p>

            {/* CTA Button */}
            <a
              href="/contacternous"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold text-lg rounded-xl shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-500 hover:scale-105"
              style={{ backgroundSize: '200% 100%' }}
            >
              <span>{t("thon.ctaButton") || "NOUS CONTACTER"}</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </a>
          </div>
        </section>
      )}

      {/* MODAL DÉTAILS PRODUIT - MODERNE & AGGRANDI */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
          onClick={handleCloseModal}
          style={{ top: 0 }}
        >
          <div
            className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Design Moderne */}
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
                  {currentLang === "en" ? selectedProduct.title_en : selectedProduct.title_fr}
                </h2>
                {selectedProduct.title_en && selectedProduct.title_fr && (
                  <p className="text-white/90 text-base md:text-lg font-semibold mt-3 italic">
                    {currentLang === "en" ? selectedProduct.title_fr : selectedProduct.title_en}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Content - Layout Moderne en 2 colonnes */}
            <div className="p-8 md:p-10 overflow-y-auto flex-1 bg-gradient-to-br from-white via-orange-50/20 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                {/* Colonne Gauche - Image */}
                <div className="space-y-6">
                  {(selectedProduct.image_url || selectedProduct.image) && (
                    <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 p-6">
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full"></div>
                      
                      <img
                        src={selectedProduct.image_url || selectedProduct.image}
                        className="relative w-full h-full object-contain drop-shadow-2xl"
                        alt={currentLang === "en" ? selectedProduct.title_en : selectedProduct.title_fr}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Availability Badge - Modernisé */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-2xl"></div>
                    <div className="relative flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span className="text-green-700 font-bold text-lg">
                        {t("thon.available") || "Produit disponible"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Colonne Droite - Descriptions */}
                <div className="space-y-6">
                  {/* French Description */}
                  {selectedProduct.content_fr && (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-20 blur-lg transition-opacity rounded-3xl"></div>
                      <div className="relative bg-gradient-to-br from-orange-50 via-yellow-50/50 to-orange-50 p-6 md:p-8 rounded-3xl border-l-4 border-orange-500 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">FR</span>
                          </div>
                          <h3 className="font-black text-gray-900 text-xl">
                            Description
                          </h3>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                          {selectedProduct.content_fr}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* English Description */}
                  {selectedProduct.content_en && (
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
                          {selectedProduct.content_en}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          {t("thon.infoTitle") || "Information"}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {t("thon.infoText") || "Pour toute commande ou information complémentaire, n'hésitez pas à nous contacter."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Design Moderne */}
            <div className="relative bg-gradient-to-r from-gray-50 to-orange-50/30 p-6 md:p-8 border-t-2 border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {t("thon.footerNote") || "Produit de qualité supérieure"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="/contacternous"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    style={{ backgroundSize: '200% 100%' }}
                  >
                    <Package className="w-5 h-5" />
                    <span>{t("thon.order") || "Commander"}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <button
                    className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
                    onClick={handleCloseModal}
                  >
                    <X className="w-5 h-5" />
                    <span>{t("thon.close") || "Fermer"}</span>
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

export default ThonProduct;