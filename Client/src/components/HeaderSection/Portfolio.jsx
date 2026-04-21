import React, { useEffect, useState } from "react";
import { 
  Briefcase, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Loader2, 
  Image as ImageIcon,
  Sparkles,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  Zap,
  CheckCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import CONFIG from "../../config/config.js";

/**
 * 🎨 PAGE PORTFOLIO ULTRA MODERNE - TEKACOM
 * Layout masonry optimisé avec galerie 8 photos + CTAs stratégiques
 */

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-32">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-4 border-[#a34ee5]/20 rounded-full"></div>
      <div className="absolute inset-2 border-4 border-[#fec603]/30 rounded-full animate-spin"></div>
      <div className="absolute inset-4 border-4 border-t-[#a34ee5] rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
      <div className="absolute inset-8 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-full blur-md opacity-60"></div>
    </div>
    <span className="text-gray-300 text-lg mt-8 font-bold animate-pulse">Chargement du portfolio...</span>
  </div>
);

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError(null);
        const res = await fetch(CONFIG.API_PORTFOLIO_LIST);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        const projectData = Array.isArray(data) ? data : data.results || [];
        
        const activeProjects = projectData.filter(project => project.is_active === true);
        
        console.log(`💼 Projets actifs: ${activeProjects.length}`);
        setProjects(activeProjects);
      } catch (err) {
        console.error("Erreur API Portfolio:", err);
        setError(err.message || "Une erreur est survenue lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
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
              Nos Réalisations
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none">
            <span className="block text-white mb-2">Notre</span>
            <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient">
              PORTFOLIO
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-400 font-light max-w-3xl leading-relaxed mb-8">
            Découvrez nos{" "}
            <span className="text-[#fec603] font-bold">créations exceptionnelles</span>{" "}
            et{" "}
            <span className="text-[#a34ee5] font-bold">projets réussis</span>
          </p>

          {/* Quick CTA */}
          <a
            href="/contacternous"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-bold text-lg rounded-xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-105 group"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Créons ensemble</span>
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
          {!loading && !error && projects.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-[#a34ee5]/30">
                <div className="absolute -inset-1 bg-[#a34ee5]/10 blur-xl"></div>
                <div className="relative text-center">
                  <Briefcase className="w-16 h-16 text-[#a34ee5] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Aucun projet disponible</h3>
                  <p className="text-gray-400">Notre portfolio arrive bientôt !</p>
                </div>
              </div>
            </div>
          )}

          {/* Projects Masonry Grid */}
          {!loading && !error && projects.length > 0 && (
            <>
              {/* Section Header avec count */}
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  <span className="bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text text-transparent">
                    {projects.length}
                  </span>{" "}
                  {projects.length > 1 ? 'Projets' : 'Projet'} réalisés
                </h2>
                <p className="text-gray-400 text-lg">Cliquez pour découvrir les détails et la galerie complète</p>
              </div>

              {/* Grid Uniforme - Toutes les cartes ont la même taille */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {projects.map((project, index) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={handleProjectClick}
                    index={index}
                  />
                ))}
              </div>

              {/* CTA Intermédiaire */}
              <div className="mt-20 relative">
                <div className="relative bg-gradient-to-r from-[#41124f]/40 via-[#a34ee5]/20 to-[#41124f]/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#a34ee5]/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#fec603]/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative text-center max-w-3xl mx-auto">
                    <Zap className="w-12 h-12 text-[#fec603] mx-auto mb-6" />
                    <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                      Votre projet mérite le meilleur
                    </h3>
                    <p className="text-gray-400 text-lg mb-8">
                      Transformons vos idées en réalisations exceptionnelles
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <a
                        href="/contacternous"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#a34ee5]/50"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Demander un devis</span>
                      </a>
                      <a
                        href="tel:+224626741478"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold rounded-xl hover:border-[#a34ee5]/80 transition-all"
                      >
                        <Phone className="w-5 h-5" />
                        <span>+224 611 92 98 92</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Final */}
      {!loading && !error && projects.length > 0 && (
        <section className="relative py-20 md:py-28 px-6 lg:px-12 border-t border-[#a34ee5]/20">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#a34ee5]/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse" style={{ animationDuration: '6s' }}></div>
          
          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-3xl shadow-2xl shadow-[#a34ee5]/50 animate-bounce" style={{ animationDuration: '3s' }}>
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="block text-white mb-2">Prêt à</span>
              <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent">
                CRÉER L'EXCEPTION ?
              </span>
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-400 font-light mb-12 max-w-3xl mx-auto">
              Rejoignez nos clients satisfaits et donnons vie à{" "}
              <span className="text-[#a34ee5] font-bold">votre vision créative</span>
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contacternous"
                className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-lg rounded-2xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-110 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#fec603] to-[#a34ee5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative">DÉMARRER UN PROJET</span>
                <ArrowRight className="relative w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </a>

              <a
                href="mailto:contact@tekacom.gn"
                className="inline-flex items-center gap-3 px-8 py-5 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold text-lg rounded-2xl hover:border-[#a34ee5]/80 hover:bg-[#41124f]/80 transition-all duration-300"
              >
                <Mail className="w-6 h-6" />
                <span>contact@tekacom.gn</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* MODAL Project Details */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={handleCloseModal}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
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
      `}</style>
    </div>
  );
};

// Project Card Component (Uniform Height)
const ProjectCard = ({ project, onClick, index }) => {
  const projectImage = project.cover_photo;
  
  const additionalImages = [1, 2, 3, 4, 5, 6, 7, 8].filter(
    (num) => project[`image_${num}`]
  ).length;

  // ✅ Hauteur uniforme pour toutes les cartes
  const uniformHeight = 'aspect-[4/5]'; // Ratio constant pour toutes

  return (
    <div
      onClick={() => onClick(project)}
      className="group relative cursor-pointer break-inside-avoid mb-6 md:mb-8"
      style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
    >
      <div className="relative bg-[#41124f]/20 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#a34ee5]/20 hover:border-[#a34ee5]/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#a34ee5]/30">
        
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-3xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500"></div>
        
        {/* Image - Hauteur uniforme pour toutes les cartes */}
        <div className={`relative ${uniformHeight} overflow-hidden bg-gradient-to-br from-[#0a0a0a]/40 to-[#41124f]/20 p-6 md:p-8 flex items-center justify-center`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a34ee5]/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
          
          {projectImage ? (
            <img
              src={projectImage}
              alt={project.title}
              className="relative max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Briefcase className={`w-20 h-20 text-[#a34ee5]/40 ${projectImage ? 'hidden' : ''}`} />
          
          {/* Badge images count */}
          {additionalImages > 0 && (
            <div className="absolute top-4 right-4">
              <div className="px-3 py-2 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] rounded-xl text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#a34ee5]/50">
                <ImageIcon className="w-4 h-4" />
                <span>+{additionalImages}</span>
              </div>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#a34ee5]/95 via-[#a34ee5]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-end p-6">
            <div className="bg-white/20 backdrop-blur-md border-2 border-white/50 rounded-full p-4 mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-bold text-sm uppercase tracking-wide">Voir le projet</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#0a0a0a]/40 border-t border-[#a34ee5]/20 group-hover:bg-gradient-to-r group-hover:from-[#a34ee5]/20 group-hover:to-[#fec603]/20 transition-all duration-500">
          <h3 className="font-black text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#a34ee5] group-hover:to-[#fec603] group-hover:bg-clip-text transition-all duration-300 mb-2">
            {project.title}
          </h3>
          
          {project.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-4">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#fec603] font-bold uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Découvrir
            </span>
            <ArrowRight className="w-5 h-5 text-[#a34ee5] group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* Bottom gradient bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
};

// Modal Component avec galerie
const ProjectModal = ({ project, onClose, currentImageIndex, setCurrentImageIndex }) => {
  // Construire tableau de toutes les images
  const allImages = [
    project.cover_photo,
    ...([1, 2, 3, 4, 5, 6, 7, 8]
      .map(num => project[`image_${num}`])
      .filter(Boolean))
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0a0a0a] border border-[#a34ee5]/30 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Ultra compact */}
        <div className="relative bg-gradient-to-r from-[#a34ee5] to-[#7828a8] px-4 py-3 md:px-6 md:py-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#fec603]/20 rounded-full blur-3xl"></div>
          
          <button
            className="absolute top-2 right-2 md:top-3 md:right-3 w-9 h-9 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 z-10"
            onClick={onClose}
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>

          <h2 className="relative text-lg md:text-xl lg:text-2xl font-black text-white pr-12 md:pr-16 mb-1.5">
            {project.title}
          </h2>
          
          <div className="relative inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <CheckCircle className="w-3 h-3 text-white" />
            <span className="text-[10px] md:text-xs text-white font-semibold">Projet réalisé par TEKACOM</span>
          </div>
        </div>

        {/* Content - Scrollable avec meilleure gestion d'espace */}
        <div className="px-4 pt-4 pb-3 md:px-6 md:pt-6 md:pb-4 overflow-y-auto flex-1 bg-gradient-to-br from-[#0a0a0a] via-[#41124f]/10 to-[#0a0a0a]">
          
          {/* Image viewer - Hauteur augmentée pour voir le haut de l'image */}
          {allImages.length > 0 && (
            <div className="mb-4 md:mb-6">
              <div className="relative w-full rounded-2xl overflow-hidden bg-[#0a0a0a] border border-[#a34ee5]/20 flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '60vh' }}>
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain p-6 md:p-8"
                />
                
                {/* Navigation arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/70 hover:bg-black/90 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/70 hover:bg-black/90 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                    >
                      <ChevronRightIcon className="w-6 h-6 text-white" />
                    </button>
                    
                    {/* Counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/30">
                      <span className="text-white font-bold text-sm">
                        {currentImageIndex + 1} / {allImages.length}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails - Plus petites */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-[#a34ee5] ring-2 ring-[#a34ee5]/50 scale-105' 
                          : 'border-[#a34ee5]/20 hover:border-[#a34ee5]/60'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === currentImageIndex && (
                        <div className="absolute inset-0 bg-[#a34ee5]/20"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description - Version ultra compacte */}
          {project.description && (
            <div className="bg-[#41124f]/20 backdrop-blur-sm p-4 rounded-xl border border-[#a34ee5]/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-lg flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-black text-white text-base">Description</h3>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                {project.description}
              </p>
            </div>
          )}

          {/* CTA Box - Version ultra compacte */}
          <div className="bg-gradient-to-r from-[#a34ee5]/10 to-[#fec603]/10 p-4 rounded-xl border border-[#a34ee5]/30">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#fec603] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1 text-sm">Projet similaire en tête ?</h4>
                <p className="text-gray-300 text-xs mb-2">
                  Discutons de votre vision et créons ensemble
                </p>
                <a
                  href="/contacternous"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-bold text-xs rounded-lg hover:scale-105 transition-all shadow-lg"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Démarrer mon projet</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Ultra compact */}
        <div className="bg-gradient-to-r from-[#41124f]/40 to-[#0a0a0a]/40 px-4 py-2.5 md:px-6 md:py-3 border-t-2 border-[#a34ee5]/20">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#fec603] rounded-full animate-pulse"></div>
              <span className="text-[10px] md:text-xs text-gray-400 font-medium">Réalisation TEKACOM</span>
            </div>

            <a
              href="/contacternous"
              className="px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-bold text-[10px] md:text-xs rounded-lg hover:scale-105 transition-all shadow-xl inline-flex items-center gap-1.5 md:gap-2"
            >
              <Briefcase className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span>Lancer un projet</span>
              <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;