import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CONFIG from "../../config/config.js";
import { 
  AlertCircle, 
  Handshake, 
  Users, 
  Target, 
  Briefcase,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  TrendingUp,
  Award,
  Rocket,
  Star,
  Heart,
  Shield,
  Layers
} from "lucide-react";

/**
 * 🎨 HOME PAGE V5 - ULTRA MODERNE TEKACOM
 * Design: Hero animé + Cards interactives + Navigation fluide
 * Charte graphique TEKACOM:
 * - Violet principal: #a34ee5
 * - Violet foncé: #41124f, #7828a8
 * - Or/Jaune: #fec603
 * - Noir: #0a0a0a
 * - Typographie: Poppins
 */

const Home = () => {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  // Helper pour obtenir l'URL de l'image
  const getImageUrl = (obj, field) => {
    if (!obj) return null;
    if (obj[`${field}_url`]) return obj[`${field}_url`];
    const img = obj[field];
    if (!img) return null;
    if (typeof img === "object" && img.url) return img.url;
    if (typeof img === "string") return img;
    return null;
  };

  // Fetch home-full
  useEffect(() => {
    const fetchHomeFull = async () => {
      try {
        const res = await fetch(CONFIG.API_HOME_FULL);
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = await res.json();
        
        // ✨ TRI DES MEMBRES DU PLUS ANCIEN AU PLUS RÉCENT
        if (data.latest_team_members && Array.isArray(data.latest_team_members)) {
          data.latest_team_members = data.latest_team_members.sort((a, b) => {
            // Tri par date de création si disponible
            if (a.created_at && b.created_at) {
              return new Date(a.created_at) - new Date(b.created_at);
            }
            // Sinon tri par ID (plus petit ID = plus ancien)
            return a.id - b.id;
          });
        }
        
        setHomeData(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeFull();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-[#a34ee5]/20 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-[#fec603]/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-4 border-4 border-t-[#a34ee5] rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-full blur-2xl opacity-30 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="bg-[#41124f]/20 border border-red-500/30 rounded-3xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-center text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const {
    home = {},
    partners = [],
    latest_team_members: team = [],
    services = [],
    portfolios = [],
  } = homeData || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Google Fonts - Poppins */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap');
      `}</style>
      
      {/* Animated Background - ABSOLUTE pas fixed - Couleurs TEKACOM */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Violet principal #a34ee5 */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#a34ee5]/10 rounded-full blur-[150px] animate-float" style={{ animationDuration: '8s' }}></div>
        {/* Or #fec603 */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#fec603]/10 rounded-full blur-[120px] animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        {/* Violet secondaire #7828a8 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7828a8]/10 rounded-full blur-[100px] animate-float" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
        
        {/* Grid pattern - Violet principal */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ 
          backgroundImage: 'radial-gradient(circle, #a34ee5 1px, transparent 1px)', 
          backgroundSize: '50px 50px' 
        }}></div>
      </div>

      {/* HERO SECTION - Full Width Background Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        
        {/* Background Image with Overlay */}
        {getImageUrl(home, "image") ? (
          <>
            {/* Image Background */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={getImageUrl(home, "image")}
                alt={home?.title_fr || "TEKACOM"}
                className="w-full h-full object-cover"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/80 to-transparent"></div>
              {/* Additional gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/80"></div>
            </div>
          </>
        ) : (
          /* Fallback gradient background if no image */
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0a0a0a] to-[#0a0a0a] overflow-hidden"></div>
        )}

        {/* Content Container */}
        <div className="relative z-10 w-full px-6 lg:px-12 py-20">
          <div className="max-w-7xl mx-auto">
            
            {/* Left Side - Text Content Overlay */}
            <div className="max-w-3xl space-y-8">
              
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#41124f]/80 backdrop-blur-xl border border-[#a34ee5]/50 rounded-full shadow-2xl shadow-[#a34ee5]/30"
                style={{ animation: 'fadeInUp 0.8s ease-out' }}
              >
                <Sparkles className="w-5 h-5 text-[#fec603] animate-pulse" />
                <span className="text-sm font-bold text-[#a34ee5] uppercase tracking-wider">
                  Bienvenue chez TEKACOM
                </span>
                <div className="w-2 h-2 bg-[#fec603] rounded-full animate-pulse"></div>
              </div>

              {/* Title */}
              <h1 
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none"
                style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
              >
                <span className="block text-white mb-4 drop-shadow-2xl">
                  {home?.title_fr || "Votre Vision"}
                </span>
                {/* Gradient TEKACOM: #a34ee5 → #fec603 → #7828a8 */}
                <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient-slow drop-shadow-2xl">
                  NOTRE EXPERTISE
                </span>
              </h1>

              {/* Divider Line */}
              <div 
                className="w-32 h-1 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-transparent rounded-full"
                style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}
              ></div>

              {/* Subtitle */}
              <p 
                className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-light leading-relaxed drop-shadow-lg"
                style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}
              >
                {home?.description_fr || "Transformons vos idées en réalités visuelles exceptionnelles"}
              </p>

              {/* CTA Buttons */}
              <div 
                className="flex flex-wrap gap-4 pt-4"
                style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
              >
                {/* CTA Principal - Gradient violet TEKACOM */}
                <button
                  onClick={() => navigate('/services')}
                  className="group relative px-10 py-5 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-lg rounded-2xl overflow-hidden shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-110"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Rocket className="w-6 h-6" />
                    Découvrir nos services
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                  {/* Hover gradient or TEKACOM */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#fec603] to-[#a34ee5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>

                {/* CTA Secondaire - Transparent avec bordure */}
                <button
                  onClick={() => navigate('/portfolio')}
                  className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center gap-3"
                >
                  <Eye className="w-6 h-6" />
                  Voir nos réalisations
                </button>
              </div>

              {/* Mini Stats - Gradient violet TEKACOM */}
              <div 
                className="flex flex-wrap gap-8 pt-4"
                style={{ animation: 'fadeInUp 0.8s ease-out 0.8s both' }}
              >
                {[
                  { icon: Users, value: team.length + '+', label: 'Experts' },
                  { icon: Briefcase, value: '500+', label: 'Projets' },
                  { icon: Handshake, value: partners.length + '+', label: 'Partenaires' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      {/* Icône avec gradient violet TEKACOM */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a34ee5] to-[#7828a8] flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-xs text-gray-300 uppercase tracking-wide">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"></div>
        
        {/* Scroll Indicator - Non cliquable, ne fait pas scroller */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Défiler</span>
            <div className="w-6 h-10 border-2 border-[#a34ee5]/50 rounded-full flex justify-center p-2">
              <div className="w-1 h-3 bg-[#a34ee5] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      {services.length > 0 && (
        <section className="relative py-16 px-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 bg-[#fec603]/10 border border-[#fec603]/30 rounded-full">
                <Briefcase className="w-5 h-5 text-[#fec603]" />
                <span className="text-sm font-bold text-[#fec603] uppercase">Nos Services</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                <span className="text-white">Notre </span>
                <span className="bg-gradient-to-r from-[#fec603] to-[#a34ee5] bg-clip-text text-transparent">
                  Expertise
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Des solutions créatives sur mesure pour propulser votre marque
              </p>
            </div>

            {/* Services Grid - Layout optimisé pour 3 services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
              {services.slice(0, 3).map((service, idx) => (
                <div
                  key={service.id}
                  className="group relative bg-[#41124f]/20 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#fec603]/20 hover:border-[#fec603]/60 transition-all duration-500 hover:scale-105 cursor-pointer"
                  onClick={() => navigate('/services')}
                  style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both` }}
                >
                  {/* Image - Hauteur augmentée */}
                  <div className="relative h-80 overflow-hidden bg-gradient-to-br from-[#0a0a0a]/40 to-[#41124f]/20 p-8 flex items-center justify-center">
                    {service.image_url || service.image ? (
                      <img
                        src={service.image_url || service.image}
                        alt={service.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Briefcase className="w-20 h-20 text-[#fec603]/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                    
                    {/* Badge numéro */}
                    <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-[#fec603] to-[#d4a000] rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-[#0a0a0a] font-black text-xl">{idx + 1}</span>
                    </div>
                  </div>

                  {/* Info - Contenu augmenté */}
                  <div className="relative p-8 bg-[#0a0a0a]/40 border-t border-[#fec603]/20">
                    <h3 className="text-xl font-black text-white mb-3 group-hover:text-[#fec603] transition-colors leading-tight">
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-400 line-clamp-3 mb-6 leading-relaxed">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-[#fec603]/10">
                      <span className="text-xs text-[#fec603] font-bold uppercase tracking-wide flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        En savoir plus
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#fec603] group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA avec stats */}
            <div className="text-center space-y-8">
              {/* Stats inline */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                {[
                  { icon: Zap, value: services.length + '+', label: 'Services disponibles' },
                  { icon: Award, value: '100%', label: 'Satisfaction client' },
                  { icon: Target, value: '24/7', label: 'Support dédié' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fec603] to-[#d4a000] flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-[#0a0a0a]" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bouton CTA - Gradient or TEKACOM */}
              <button
                onClick={() => navigate('/services')}
                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#fec603] to-[#d4a000] text-[#0a0a0a] font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-[#fec603]/30 hover:shadow-[#fec603]/50"
              >
                <span>Découvrir tous nos services</span>
                <Briefcase className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PORTFOLIO SECTION */}
      {portfolios.length > 0 && (
        <section className="relative py-16 px-6 bg-gradient-to-b from-[#41124f]/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 bg-[#a34ee5]/10 border border-[#a34ee5]/30 rounded-full">
                <Target className="w-5 h-5 text-[#a34ee5]" />
                <span className="text-sm font-bold text-[#a34ee5] uppercase">Nos Réalisations</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                <span className="text-white">Notre </span>
                <span className="bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text text-transparent">
                  Portfolio
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Découvrez nos créations exceptionnelles et projets réussis
              </p>
            </div>

            {/* Portfolio Grid - Layout optimisé pour 3 projets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
              {portfolios.slice(0, 3).map((project, idx) => (
                <div
                  key={project.id}
                  className="group relative bg-[#41124f]/20 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#a34ee5]/20 hover:border-[#a34ee5]/60 transition-all duration-500 hover:scale-105 cursor-pointer"
                  onClick={() => navigate('/portfolio')}
                  style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both` }}
                >
                  {/* Image - Ratio optimisé */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#0a0a0a]/40 to-[#41124f]/20 p-8 flex items-center justify-center">
                    {project.cover_photo ? (
                      <img
                        src={project.cover_photo}
                        alt={project.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Briefcase className="w-20 h-20 text-[#a34ee5]/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                    
                    {/* Badge numéro */}
                    <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-black text-xl">{idx + 1}</span>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#a34ee5]/95 via-[#a34ee5]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-end p-8">
                      <div className="bg-white/20 backdrop-blur-md border-2 border-white/50 rounded-full p-4 mb-4">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-white font-bold text-sm uppercase tracking-wide">Voir le projet</span>
                    </div>
                  </div>

                  {/* Info - Contenu augmenté */}
                  <div className="relative p-8 bg-[#0a0a0a]/40 border-t border-[#a34ee5]/20">
                    <h3 className="text-xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#a34ee5] group-hover:to-[#fec603] group-hover:bg-clip-text transition-all leading-tight">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-400 line-clamp-3 mb-6 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-[#a34ee5]/10">
                      <span className="text-xs text-[#a34ee5] font-bold uppercase tracking-wide flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Découvrir
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#a34ee5] group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA avec stats */}
            <div className="text-center space-y-8">
              {/* Stats inline */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                {[
                  { icon: Briefcase, value: portfolios.length + '+', label: 'Projets réalisés' },
                  { icon: Award, value: '98%', label: 'Clients satisfaits' },
                  { icon: TrendingUp, value: '5+', label: "Années d'expérience" },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a34ee5] to-[#7828a8] flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bouton CTA - Bordure violet TEKACOM */}
              <button
                onClick={() => navigate('/portfolio')}
                className="group inline-flex items-center gap-3 px-10 py-5 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold text-lg rounded-2xl hover:border-[#a34ee5]/80 hover:bg-[#41124f]/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#a34ee5]/30"
              >
                <span>Voir tout le portfolio</span>
                <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}
      
      {/* TEAM SECTION */}
      {team.length > 0 && (
        <section className="relative py-16 px-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 bg-[#a34ee5]/10 border border-[#a34ee5]/30 rounded-full">
                <Users className="w-5 h-5 text-[#a34ee5]" />
                <span className="text-sm font-bold text-[#a34ee5] uppercase">Notre Équipe</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                <span className="text-white">Des Talents </span>
                <span className="bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text text-transparent">
                  D'Exception
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Rencontrez les experts passionnés qui donnent vie à vos projets
              </p>
            </div>

            {/* Team Grid - Affichage de 3 membres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {team
                .sort((a, b) => {
                  // Tri par date de création si disponible
                  if (a.created_at && b.created_at) {
                    return new Date(a.created_at) - new Date(b.created_at);
                  }
                  // Sinon tri par ID (plus petit ID = plus ancien)
                  return a.id - b.id;
                })
                .slice(0, 3)
                .map((member, idx) => (
                <div
                  key={member.id}
                  className="group relative bg-[#41124f]/20 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#a34ee5]/20 hover:border-[#a34ee5]/60 transition-all duration-500 hover:scale-105 cursor-pointer"
                  onClick={() => navigate('/notreEquipe')}
                  style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both` }}
                >
                  {/* Photo */}
                  <div className="relative h-64 overflow-hidden">
                    {getImageUrl(member, "photo") ? (
                      <img
                        src={getImageUrl(member, "photo")}
                        alt={member.full_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#a34ee5]/20 to-[#fec603]/20 flex items-center justify-center">
                        <Users className="w-16 h-16 text-[#a34ee5]/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-[#a34ee5]/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="relative p-4">
                    <h3 className="text-lg font-black text-white mb-1 group-hover:text-[#a34ee5] transition-colors">
                      {member.full_name}
                    </h3>
                    <p className="text-sm text-[#fec603] font-medium">
                      {member.position_fr || member.position_en}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton CTA - Bordure violet TEKACOM */}
            <div className="text-center">
              <button
                onClick={() => navigate('/notreEquipe')}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold text-lg rounded-2xl hover:border-[#a34ee5]/80 hover:bg-[#41124f]/80 transition-all duration-300"
              >
                <span>Rencontrer l'équipe</span>
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PARTNERS SECTION */}
      {partners.length > 0 && (
        <section className="relative py-16 px-6 bg-gradient-to-b from-[#41124f]/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 bg-[#fec603]/10 border border-[#fec603]/30 rounded-full">
                <Handshake className="w-5 h-5 text-[#fec603]" />
                <span className="text-sm font-bold text-[#fec603] uppercase">Partenaires</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                <span className="text-white">Ils Nous Font </span>
                <span className="bg-gradient-to-r from-[#fec603] to-[#a34ee5] bg-clip-text text-transparent">
                  Confiance
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Découvrez les marques visionnaires qui ont choisi TEKACOM
              </p>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
              {partners.map((partner, idx) => (
                <div
                  key={partner.id}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-[#a34ee5]/10 hover:border-[#fec603]/40 transition-all duration-500 hover:scale-105 cursor-pointer flex items-center justify-center h-32"
                  onClick={() => navigate('/partner')}
                  style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.05}s both` }}
                >
                  {getImageUrl(partner, "cover_image") ? (
                    <img
                      src={getImageUrl(partner, "cover_image")}
                      alt={partner.name_fr}
                      className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <span className="text-white font-bold text-center text-sm">
                      {partner.name_fr || partner.name_en}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Bouton CTA - Gradient or TEKACOM */}
            <div className="text-center">
              <button
                onClick={() => navigate('/partner')}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#fec603] to-[#d4a000] text-[#0a0a0a] font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#fec603]/30 hover:shadow-[#fec603]/50"
              >
                <span>Découvrir tous nos partenaires</span>
                <Handshake className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL SECTION - Couleurs TEKACOM */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Glow effect - Gradient TEKACOM */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#a34ee5]/20 via-[#fec603]/20 to-[#a34ee5]/20 blur-3xl"></div>
          
          {/* Content */}
          <div className="relative">
            {/* Icône animée - Gradient violet TEKACOM */}
            <div className="inline-flex items-center justify-center w-24 h-24 mb-10 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-3xl shadow-2xl shadow-[#a34ee5]/50 animate-bounce" style={{ animationDuration: '3s' }}>
              <Zap className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8">
              <span className="block text-white mb-4">Prêt à Créer</span>
              {/* Gradient complet TEKACOM */}
              <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient-slow">
                QUELQUE CHOSE D'INCROYABLE ?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-400 font-light mb-12 max-w-3xl mx-auto">
              Contactez-nous dès aujourd'hui et transformons votre vision en réalité
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {/* Bouton principal - Gradient violet TEKACOM */}
              <button
                onClick={() => navigate('/contacternous')}
                className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-xl rounded-2xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-110 overflow-hidden"
              >
                {/* Hover gradient or TEKACOM */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#fec603] to-[#a34ee5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative">DÉMARRER UN PROJET</span>
                <Rocket className="relative w-7 h-7 group-hover:translate-x-2 transition-transform" />
              </button>

              {/* Bouton secondaire - Bordure violet TEKACOM */}
              <button
                onClick={() => navigate('/services')}
                className="inline-flex items-center gap-3 px-10 py-6 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold text-xl rounded-2xl hover:border-[#a34ee5]/80 hover:bg-[#41124f]/80 transition-all duration-300"
              >
                <Briefcase className="w-6 h-6" />
                <span>Nos Services</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Animations CSS */}
      <style jsx>{`
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

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes gradient-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 5s ease infinite;
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;