import React, { useEffect, useState } from "react";
import { 
  Package, 
  Loader2, 
  AlertCircle, 
  X, 
  ArrowRight,
  Sparkles,
  Zap,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle,
  Star
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTranslation } from "react-i18next";

/**
 * 🎨 PAGE SERVICES ULTRA MODERNE - TEKACOM
 * Layout optimisé pour 7 services avec CTAs stratégiques
 */

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-32">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-4 border-[#a34ee5]/20 rounded-full"></div>
      <div className="absolute inset-2 border-4 border-[#fec603]/30 rounded-full animate-spin"></div>
      <div className="absolute inset-4 border-4 border-t-[#a34ee5] rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
      <div className="absolute inset-8 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-full blur-md opacity-60"></div>
    </div>
    <span className="text-gray-300 text-lg mt-8 font-bold animate-pulse">Chargement des services...</span>
  </div>
);

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setError(null);
        const response = await fetch(CONFIG.API_SERVICE_LIST);
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.results || [];
        
        const activeServices = list.filter(service => service.is_active === true);
        
        console.log(`📦 Services actifs: ${activeServices.length}`);
        setServices(activeServices);
      } catch (err) {
        console.error("Erreur API Services:", err);
        setError(err.message || "Une erreur est survenue lors du chargement des services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#a34ee5]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#fec603]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7828a8]/10 rounded-full blur-3xl"></div>
        <div className="hidden md:block absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, #a34ee5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 lg:px-12 border-b border-[#a34ee5]/20">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-[#a34ee5]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-[#fec603]/20 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>

        <div className="relative max-w-[1400px] mx-auto">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-gradient-to-r from-[#41124f]/60 to-[#0a0a0a]/60 backdrop-blur-xl border border-[#a34ee5]/40 rounded-full shadow-lg shadow-[#a34ee5]/20">
            <Sparkles className="w-4 h-4 text-[#fec603] animate-pulse" />
            <span className="text-sm font-bold text-[#a34ee5] uppercase tracking-wider">
              Excellence & Créativité
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none">
            <span className="block text-white mb-2">Nos</span>
            <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient">
              SERVICES
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-400 font-light max-w-3xl leading-relaxed mb-8">
            Des solutions{" "}
            <span className="text-[#fec603] font-bold">créatives sur mesure</span>{" "}
            pour propulser{" "}
            <span className="text-[#a34ee5] font-bold">votre marque</span>
          </p>

          {/* Quick CTA */}
          <a
            href="/contacternous"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-bold text-lg rounded-xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-105 group"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Discutons de votre projet</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">

          {/* Loading */}
          {loading && <LoadingSpinner />}

          {/* Error */}
          {error && !loading && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-red-500/30">
                <div className="absolute -inset-1 bg-red-500/20 blur-xl"></div>
                <div className="relative text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Erreur de chargement</h3>
                  <p className="text-gray-400 mb-8">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && services.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-[#a34ee5]/30">
                <div className="absolute -inset-1 bg-[#a34ee5]/10 blur-xl"></div>
                <div className="relative text-center">
                  <Package className="w-16 h-16 text-[#a34ee5] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Aucun service disponible</h3>
                  <p className="text-gray-400">Nos services arrivent bientôt !</p>
                </div>
              </div>
            </div>
          )}

          {/* Services Grid - Layout optimisé pour 7 services */}
          {!loading && !error && services.length > 0 && (
            <>
              {/* Section Header avec CTA */}
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Découvrez notre{" "}
                  <span className="bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text text-transparent">
                    expertise
                  </span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
                  Cliquez sur un service pour découvrir comment nous pouvons vous aider
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#a34ee5]/10 border border-[#a34ee5]/30 rounded-full">
                  <Zap className="w-4 h-4 text-[#fec603]" />
                  <span className="text-sm text-gray-300 font-semibold">{services.length} services professionnels</span>
                </div>
              </div>

              {/* Grid Layout : 3 + 4 ou 4 + 3 selon nombre */}
              <div className="space-y-8">
                
                {/* Première rangée - 3 services en featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {services.slice(0, 3).map((service, index) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onClick={handleServiceClick}
                      featured={true}
                      index={index}
                    />
                  ))}
                </div>

                {/* CTA Intermédiaire */}
                <div className="relative my-12">
                  <div className="relative bg-gradient-to-r from-[#41124f]/40 via-[#a34ee5]/20 to-[#41124f]/40 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-[#a34ee5]/30 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#fec603]/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                          Un projet en tête ?
                        </h3>
                        <p className="text-gray-400 text-lg mb-6">
                          Parlons-en ! Notre équipe est prête à transformer vos idées en réalité.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href="/contacternous"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#a34ee5]/50"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span>Contactez-nous</span>
                          </a>
                          <a
                            href="tel:+224626741478"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold rounded-xl hover:border-[#a34ee5]/80 transition-all"
                          >
                            <Phone className="w-5 h-5" />
                            <span>+224 626 74 14 78</span>
                          </a>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: Star, text: "Qualité garantie", color: "from-[#fec603] to-[#a34ee5]" },
                          { icon: Zap, text: "Livraison rapide", color: "from-[#a34ee5] to-[#7828a8]" },
                          { icon: CheckCircle, text: "Suivi personnalisé", color: "from-[#7828a8] to-[#a34ee5]" },
                          { icon: Sparkles, text: "Créativité unique", color: "from-[#fec603] to-[#a34ee5]" },
                        ].map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <div key={idx} className="flex items-center gap-2 p-3 bg-[#0a0a0a]/60 rounded-xl border border-[#a34ee5]/20">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-gray-300 font-semibold">{item.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deuxième rangée - 4 services restants */}
                {services.length > 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {services.slice(3, 7).map((service, index) => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        onClick={handleServiceClick}
                        featured={false}
                        index={index + 3}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Final Section */}
      {!loading && !error && services.length > 0 && (
        <section className="relative py-20 md:py-28 px-6 lg:px-12 border-t border-[#a34ee5]/20">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#a34ee5]/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse" style={{ animationDuration: '6s' }}></div>
          
          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-3xl shadow-2xl shadow-[#a34ee5]/50 animate-bounce" style={{ animationDuration: '3s' }}>
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="block text-white mb-2">Prêt à</span>
              <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent">
                DÉMARRER ?
              </span>
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-400 font-light mb-12 max-w-3xl mx-auto">
              Contactez{" "}
              <span className="text-[#fec603] font-bold">TEKACOM</span>{" "}
              dès aujourd'hui et donnons vie à{" "}
              <span className="text-[#a34ee5] font-bold">votre vision</span>
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contacternous"
                className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-lg rounded-2xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-110 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#fec603] to-[#a34ee5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative">DEMANDER UN DEVIS</span>
                <ArrowRight className="relative w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </a>

              <a
                href="mailto:contact@tekacom.gn"
                className="inline-flex items-center gap-3 px-8 py-5 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold text-lg rounded-2xl hover:border-[#a34ee5]/80 hover:bg-[#41124f]/80 transition-all duration-300"
              >
                <Mail className="w-6 h-6" />
                <span>Email Direct</span>
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-gray-500">
              {[
                { icon: Star, text: "+200 Projets réussis" },
                { icon: CheckCircle, text: "Satisfaction garantie" },
                { icon: Zap, text: "Réponse sous 24h" },
              ].map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-[#fec603]" />
                    <span className="font-semibold">{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* MODAL Service Details */}
      {selectedService && (
        <ServiceModal 
          service={selectedService} 
          onClose={handleCloseModal}
        />
      )}

      {/* Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ service, onClick, featured, index }) => {
  const serviceImage = service.image_url || service.image;
  
  return (
    <div
      onClick={() => onClick(service)}
      className="group relative cursor-pointer"
      style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
    >
      <div className={`relative bg-[#41124f]/20 backdrop-blur-sm rounded-3xl overflow-hidden border transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
        featured 
          ? 'border-[#a34ee5]/30 hover:border-[#a34ee5]/80 shadow-xl hover:shadow-2xl hover:shadow-[#a34ee5]/30' 
          : 'border-[#a34ee5]/20 hover:border-[#a34ee5]/60 shadow-lg hover:shadow-xl hover:shadow-[#a34ee5]/20'
      }`}>
        
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-3xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500"></div>
        
        {/* Image */}
        <div className={`relative ${featured ? 'aspect-[4/5]' : 'aspect-square'} overflow-hidden bg-gradient-to-br from-[#0a0a0a]/40 to-[#41124f]/20 p-6`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a34ee5]/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
          
          {serviceImage ? (
            <img
              src={serviceImage}
              alt={service.title}
              className="relative w-full h-full object-contain transition-all duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Package className={`w-20 h-20 text-[#a34ee5]/40 mx-auto ${serviceImage ? 'hidden' : ''}`} />
          
          {/* Hover Icon */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#a34ee5]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
            <div className="bg-white/20 backdrop-blur-md border-2 border-white/50 rounded-full p-3">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#0a0a0a]/40 border-t border-[#a34ee5]/20 group-hover:bg-gradient-to-r group-hover:from-[#a34ee5]/20 group-hover:to-[#fec603]/20 transition-all duration-500">
          <h3 className={`font-black mb-2 transition-all duration-300 ${
            featured ? 'text-xl' : 'text-lg'
          } ${
            'text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#a34ee5] group-hover:to-[#fec603] group-hover:bg-clip-text'
          }`}>
            {service.title}
          </h3>
          
          {service.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-4">
              {service.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#fec603] font-bold uppercase tracking-wide">
              En savoir plus
            </span>
            <ArrowRight className="w-5 h-5 text-[#a34ee5] group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
};

// Modal Component
const ServiceModal = ({ service, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 z-[9999] animate-in fade-in duration-300"
      onClick={onClose}
      style={{ paddingTop: '100px', paddingBottom: '10px' }}
    >
      <div
        className="relative bg-[#0a0a0a] border border-[#a34ee5]/30 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100vh-110px)] flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Plus compact */}
        <div className="relative bg-gradient-to-r from-[#a34ee5] to-[#7828a8] px-8 py-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#fec603]/20 rounded-full blur-3xl"></div>
          
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 z-10"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <h2 className="relative text-2xl md:text-3xl font-black text-white pr-16 mb-1.5">
            {service.title}
          </h2>
          
          <div className="relative inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
            <span className="text-xs text-white font-semibold">Service professionnel</span>
          </div>
        </div>

        {/* Content - Padding réduit */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gradient-to-br from-[#0a0a0a] via-[#41124f]/10 to-[#0a0a0a]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left - Image */}
            <div className="space-y-6">
              {service.image && (
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-[#41124f]/20 to-[#0a0a0a]/40 p-6 border border-[#a34ee5]/20">
                  <img
                    src={service.image_url || service.image}
                    alt={service.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-3">
                <a
                  href="/contacternous"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#a34ee5]/50"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>DEMANDER UN DEVIS</span>
                </a>
                
                <a
                  href="tel:+224626741478"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold rounded-xl hover:border-[#a34ee5]/80 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span>Appelez-nous</span>
                </a>
              </div>
            </div>

            {/* Right - Description */}
            <div className="space-y-6">
              {service.description && (
                <div className="bg-[#41124f]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#a34ee5]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-white text-xl">Description</h3>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {service.description}
                  </p>
                </div>
              )}

              {/* Benefits */}
              <div className="bg-gradient-to-br from-[#41124f]/20 to-[#0a0a0a]/40 p-6 rounded-2xl border border-[#a34ee5]/20">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#fec603]" />
                  Avantages
                </h4>
                <ul className="space-y-3">
                  {[
                    "Expertise professionnelle certifiée",
                    "Résultats mesurables et garantis",
                    "Support dédié 7j/7",
                    "Tarifs compétitifs et transparents"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#fec603] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Urgency */}
              <div className="bg-gradient-to-r from-[#fec603]/10 to-[#a34ee5]/10 p-6 rounded-2xl border border-[#fec603]/30">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-[#fec603] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Offre limitée</h4>
                    <p className="text-gray-300 text-sm">
                      Contactez-nous maintenant et bénéficiez d'une consultation gratuite de 30 minutes !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Plus compact */}
        <div className="bg-gradient-to-r from-[#41124f]/40 to-[#0a0a0a]/40 p-4 md:p-6 border-t-2 border-[#a34ee5]/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#fec603] rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm text-gray-400 font-medium">Réponse garantie sous 24h</span>
            </div>

            <div className="flex gap-3">
              <a
                href="/contacternous"
                className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-sm md:text-base rounded-xl hover:scale-105 transition-all shadow-xl hover:shadow-2xl inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                <span>Je veux ce service</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Animations
const styleSheet = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default Services;