import React, { useEffect, useState } from "react";
import { 
  Handshake, 
  ExternalLink, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Zap,
  TrendingUp,
  Globe,
  Award,
  Heart
} from "lucide-react";
import CONFIG from "../../config/config.js";

/**
 * 🎨 PAGE PARTENAIRES ULTRA MODERNE - TEKACOM
 * Agence de graphisme créative
 * Harmonisé avec Header/Footer (#a34ee5, #41124f, #fec603, #7828a8, #0a0a0a)
 */

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-32">
    <div className="relative w-24 h-24">
      {/* Triple cercles animés */}
      <div className="absolute inset-0 border-4 border-[#a34ee5]/20 rounded-full"></div>
      <div className="absolute inset-2 border-4 border-[#fec603]/30 rounded-full animate-spin"></div>
      <div className="absolute inset-4 border-4 border-t-[#a34ee5] rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
      
      {/* Glow center */}
      <div className="absolute inset-8 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-full blur-md opacity-60"></div>
    </div>
    <span className="text-gray-300 text-lg mt-8 font-bold tracking-wide animate-pulse">
      Chargement des partenaires...
    </span>
  </div>
);

const Partner = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPartner, setHoveredPartner] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setError(null);
        const response = await fetch(`${CONFIG.BASE_URL}/api/partners/`);
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const partnerData = Array.isArray(data) ? data : data.results || [];
        
        const activePartners = partnerData.filter(
          partner => partner.is_active === true || partner.isActive === true
        );
        
        setPartners(activePartners);
      } catch (error) {
        console.error("Erreur API partenaires:", error);
        setError(error.message || "Une erreur est survenue lors du chargement des partenaires");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handlePartnerClick = (websiteUrl) => {
    if (websiteUrl) {
      window.open(websiteUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Background Effects Globaux */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradients animés */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#a34ee5]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#fec603]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7828a8]/10 rounded-full blur-3xl"></div>
        
        {/* Grille de points subtile */}
        <div className="hidden md:block absolute inset-0 opacity-[0.015]" 
             style={{
               backgroundImage: 'radial-gradient(circle, #a34ee5 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      {/* Hero Section Ultra Moderne */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 lg:px-12 border-b border-[#a34ee5]/20">
        {/* Decoration Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-[#a34ee5]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-[#fec603]/20 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>

        <div className="relative max-w-[1400px] mx-auto">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-gradient-to-r from-[#41124f]/60 to-[#0a0a0a]/60 backdrop-blur-xl border border-[#a34ee5]/40 rounded-full shadow-lg shadow-[#a34ee5]/20">
            <Sparkles className="w-4 h-4 text-[#fec603] animate-pulse" />
            <span className="text-sm font-bold text-[#a34ee5] uppercase tracking-wider">
              Collaboration & Excellence
            </span>
          </div>

          {/* Main Title - Ultra Bold */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none">
            <span className="block text-white mb-2">Nos</span>
            <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient">
              PARTENAIRES
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-400 font-light max-w-3xl leading-relaxed mb-8">
            Rejoignez le{" "}
            <span className="text-[#fec603] font-bold">club des créatifs</span>{" "}
            qui font confiance à{" "}
            <span className="text-[#a34ee5] font-bold">TEKACOM</span>
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mt-12">
            {[
              { icon: Handshake, label: "Partenaires actifs", value: partners.length || "0", color: "from-[#a34ee5] to-[#7828a8]" },
              { icon: TrendingUp, label: "Projets réalisés", value: "500+", color: "from-[#fec603] to-[#a34ee5]" },
              { icon: Globe, label: "Pays couverts", value: "3+", color: "from-[#7828a8] to-[#a34ee5]" },
              { icon: Award, label: "Années d'expérience", value: "10+", color: "from-[#a34ee5] to-[#fec603]" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx}
                  className="group relative bg-[#41124f]/20 backdrop-blur-sm border border-[#a34ee5]/20 hover:border-[#a34ee5]/50 rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[#a34ee5]/20"
                >
                  {/* Glow effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`}></div>
                  
                  <div className="relative">
                    <Icon className="w-8 h-8 text-[#a34ee5] mb-3 group-hover:text-[#fec603] transition-colors" />
                    <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners Grid Section */}
      <section className="relative py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Section Header */}
          {!loading && !error && partners.length > 0 && (
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                Ils nous font{" "}
                <span className="bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text text-transparent">
                  confiance
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Découvrez les entreprises qui collaborent avec TEKACOM pour créer des expériences visuelles exceptionnelles
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && <LoadingSpinner />}

          {/* Error State */}
          {error && !loading && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-red-500/30 overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-red-500/20 blur-xl"></div>
                
                <div className="relative text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Erreur de chargement
                  </h3>
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

          {/* Empty State */}
          {!loading && !error && partners.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-[#a34ee5]/30 overflow-hidden">
                <div className="absolute -inset-1 bg-[#a34ee5]/10 blur-xl"></div>
                
                <div className="relative text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#a34ee5]/10 border border-[#a34ee5]/30 flex items-center justify-center">
                    <Handshake className="w-10 h-10 text-[#a34ee5]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Aucun partenaire pour le moment
                  </h3>
                  <p className="text-gray-400">
                    Soyez le premier à rejoindre notre réseau de partenaires créatifs !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Partners Grid - Ultra Moderne */}
          {!loading && !error && partners.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {partners.map((partner) => {
                const partnerName = partner.name_fr || partner.display_name || partner.name_en || "Partenaire";
                const partnerImage = partner.cover_image_url || partner.cover_image;
                const isHovered = hoveredPartner === partner.id;
                
                return (
                  <div
                    key={partner.id}
                    onClick={() => handlePartnerClick(partner.website_url)}
                    onMouseEnter={() => setHoveredPartner(partner.id)}
                    onMouseLeave={() => setHoveredPartner(null)}
                    className={`group relative ${partner.website_url ? 'cursor-pointer' : ''}`}
                    role={partner.website_url ? "button" : "article"}
                    tabIndex={partner.website_url ? 0 : undefined}
                    aria-label={partner.website_url ? `Visiter le site de ${partnerName}` : partnerName}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && partner.website_url) {
                        handlePartnerClick(partner.website_url);
                      }
                    }}
                  >
                    {/* Card avec effet 3D */}
                    <div className={`relative bg-[#41124f]/20 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-500 ${
                      isHovered 
                        ? 'border-[#a34ee5]/80 shadow-2xl shadow-[#a34ee5]/30 scale-105 -translate-y-2' 
                        : 'border-[#a34ee5]/20 hover:border-[#a34ee5]/50'
                    }`}>
                      
                      {/* Glow effect au hover */}
                      <div className={`absolute -inset-1 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500`}></div>
                      
                      {/* Image Container */}
                      <div className="relative aspect-square p-6 bg-gradient-to-br from-[#0a0a0a]/40 to-[#41124f]/20">
                        
                        {/* Effet de scan animé */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a34ee5]/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
                        
                        {partnerImage ? (
                          <img
                            src={partnerImage}
                            alt={`Logo ${partnerName}`}
                            className={`relative w-full h-full object-contain transition-all duration-500 ${
                              isHovered ? 'scale-110 rotate-3' : 'scale-100'
                            }`}
                            loading="lazy"
                            onError={(e) => {
                              console.error("❌ Erreur chargement image:", partnerImage);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback Icon */}
                        <Handshake className={`w-16 h-16 text-[#a34ee5]/40 mx-auto ${partnerImage ? 'hidden' : ''}`} />
                        
                        {/* Hover Overlay avec External Link */}
                        {partner.website_url && (
                          <div className={`absolute inset-0 bg-gradient-to-br from-[#a34ee5]/90 to-[#7828a8]/90 flex items-center justify-center transition-opacity duration-300 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                          }`}>
                            <div className="transform transition-all duration-500 scale-0 group-hover:scale-100">
                              <div className="bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-full p-4 shadow-2xl">
                                <ExternalLink className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Partner Name avec gradient au hover */}
                      <div className={`px-4 py-4 border-t transition-all duration-500 ${
                        isHovered 
                          ? 'bg-gradient-to-r from-[#a34ee5]/20 to-[#fec603]/20 border-[#a34ee5]/40' 
                          : 'bg-[#0a0a0a]/40 border-[#a34ee5]/20'
                      }`}>
                        <h3 className={`text-center text-sm font-bold truncate transition-all duration-300 ${
                          isHovered 
                            ? 'text-transparent bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text' 
                            : 'text-gray-300'
                        }`}>
                          {partnerName}
                        </h3>
                      </div>

                      {/* Sparkle effect coin haut droit */}
                      {isHovered && (
                        <div className="absolute top-2 right-2">
                          <Sparkles className="w-4 h-4 text-[#fec603] animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section Ultra Moderne */}
      <section className="relative py-20 md:py-28 px-6 lg:px-12 border-t border-[#a34ee5]/20 overflow-hidden">
        
        {/* Decorative animated elements */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#a34ee5]/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#fec603]/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }}></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          
          {/* Animated Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-3xl shadow-2xl shadow-[#a34ee5]/50 animate-bounce" style={{ animationDuration: '3s' }}>
            <Handshake className="w-12 h-12 text-white" />
          </div>
          
          {/* Title avec animation gradient */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
            <span className="block text-white mb-2">REJOIGNEZ</span>
            <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient">
              NOTRE CLUB
            </span>
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            Collaborez avec{" "}
            <span className="text-[#fec603] font-bold">l'agence créative #1 en Guinée</span>{" "}
            et participez à des projets qui{" "}
            <span className="text-[#a34ee5] font-bold">marquent les esprits</span>
          </p>

          {/* CTA Button Ultra Moderne */}
          <a
            href="/contacternous"
            className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-lg rounded-2xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-110 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fec603] to-[#a34ee5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <span className="relative">DEVENIR PARTENAIRE</span>
            <ArrowRight className="relative w-6 h-6 transition-transform group-hover:translate-x-2" />
            
            {/* Sparkle effect */}
            <Sparkles className="absolute top-2 right-2 w-5 h-5 text-white/50 animate-pulse" />
          </a>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { icon: Sparkles, text: "+200 Collaborations", color: "text-[#fec603]" },
              { icon: Heart, text: "Satisfaction garantie", color: "text-red-400" },
              { icon: Zap, text: "Projets innovants", color: "text-[#a34ee5]" },
              { icon: Award, text: "Expertise reconnue", color: "text-[#fec603]" },
            ].map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-[#41124f]/40 border border-[#a34ee5]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-6 h-6 ${badge.color}`} />
                  </div>
                  <span className="text-gray-400 font-semibold group-hover:text-white transition-colors">
                    {badge.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Style pour l'animation gradient */}
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

export default Partner;