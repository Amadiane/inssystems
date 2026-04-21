import React, { useState, useEffect } from "react";
import { Video, Search, RefreshCw, X, Play, AlertCircle, Film } from "lucide-react";
import { useTranslation } from "react-i18next";
import ChatBotNew from "../ChatBot/ChatbotNew";
import CONFIG from "../../config/config.js";

const Videotheque = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // ✅ Scroll vers le haut au chargement de la page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(CONFIG.API_VIDEO_LIST);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      if (Array.isArray(data)) {
        setVideos(data);
        setError(null);
      } else {
        setError("Les données reçues ne sont pas valides.");
      }
    } catch (err) {
      console.error("Erreur API:", err);
      setError("Erreur de chargement des vidéos");
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getEmbedUrl = (url) => {
    const videoId = getYoutubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Recherche intelligente
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    
    if (value.trim().length > 1) {
      const results = videos.filter(video =>
        video.title_fr?.toLowerCase().includes(value.toLowerCase()) ||
        video.title_en?.toLowerCase().includes(value.toLowerCase()) ||
        video.comment_fr?.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    setSearchResults([]);
  };

  const handleResultClick = (video) => {
    handleVideoSelect(video);
    setSearchTerm("");
    setSearchOpen(false);
    setSearchResults([]);
  };

  const filteredVideos = videos.filter((video) =>
    (video.title_fr || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setTimeout(() => {
      const section = document.getElementById("video-player-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (showModal) closeModal();
        if (searchOpen) {
          setSearchOpen(false);
          setSearchResults([]);
          setSearchTerm("");
        }
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [showModal, searchOpen]);

  return (
    <div className="min-h-screen bg-[#0a0e27] pt-20">
      {/* 🎨 HEADER AVEC EFFETS */}
      <div className="relative overflow-hidden">
        {/* Effets de fond lumineux */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative py-24 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-blue-500/30 to-orange-500/30 blur-3xl scale-150 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50 animate-pulse mx-auto">
              <Film className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-400 to-white mb-4 tracking-tight">
            {t('videotheque.title')}
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto px-4 leading-relaxed mb-8">
            {t('videotheque.description')}
          </p>

          {/* Ligne animée */}
          <div className="relative w-32 h-1 mx-auto overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500 animate-pulse"></div>
          </div>

          {/* Actions (Recherche + Actualiser) */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Bouton recherche intelligent */}
            <button
              onClick={() => setSearchOpen(true)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-orange-500/30 hover:border-orange-500/60 rounded-xl text-white font-semibold flex items-center gap-2 transition-all backdrop-blur-xl"
            >
              <Search size={20} className="text-orange-400" />
              <span>{t('videotheque.search')}</span>
            </button>

            {/* Bouton actualiser */}
            <button
              onClick={fetchVideos}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              <span>{loading ? t('videotheque.loading') : t('videotheque.refresh')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📹 CONTENU PRINCIPAL */}
      <div className="w-full flex items-center justify-center pb-16 px-4">
        <div className="w-[95%] lg:w-[90%] xl:w-[85%]">
          {/* Vidéo sélectionnée */}
          {selectedVideo && (
            <div id="video-player-section" className="mb-12">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                
                <div className="relative bg-[#0f1729]/80 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-orange-500/20 shadow-2xl">
                  <div className="aspect-w-16 aspect-h-9 w-full">
                    <iframe
                      src={getEmbedUrl(selectedVideo.lien_video)}
                      title={selectedVideo.title_fr}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[400px] md:h-[500px] lg:h-[600px]"
                    ></iframe>
                  </div>

                  <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-orange-500/20">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{selectedVideo.title_fr}</h3>
                      <p className="text-gray-400">{selectedVideo.comment_fr}</p>
                    </div>
                    <button
                      onClick={() => handlePlayVideo(selectedVideo)}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 rounded-xl text-white font-bold flex items-center gap-2 transition-all"
                    >
                      <Play size={18} />
                      {t('videotheque.fullscreen')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section titre des vidéos */}
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-500 mb-8 flex items-center gap-3">
            <Video className="text-orange-400" size={32} />
            {selectedVideo ? t('videotheque.other_videos') : t('videotheque.all_videos')}
          </h3>

          {/* États */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
              <span className="text-white text-lg mt-6 font-semibold">{t('videotheque.loading_videos')}</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border-2 border-red-500/50 text-white p-6 rounded-2xl shadow-2xl shadow-red-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-red-400" size={24} />
                <p className="font-bold text-xl">{t('videotheque.error')}</p>
              </div>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={fetchVideos}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <RefreshCw size={18} />
                {t('videotheque.retry')}
              </button>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-500/30">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-12 h-12 text-orange-400" />
              </div>
              <p className="text-white text-2xl font-bold mb-2">{t('videotheque.no_videos_found')}</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-orange-400 hover:text-orange-300 font-semibold"
                >
                  {t('videotheque.clear_search')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
                  
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-blue-500/20 group-hover:border-blue-500/60 transition-all shadow-xl">
                    {/* Miniature */}
                    <div
                      className="relative cursor-pointer"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <img
                        src={video.cover_image}
                        alt={video.title_fr}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => (e.target.src = "https://placehold.co/400x300/1a1a2e/ffffff?text=Vidéo")}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Infos */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-bold text-white line-clamp-2 min-h-[3rem]">
                        {video.title_fr}
                      </h3>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVideoSelect(video)}
                          className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 text-sm font-semibold transition-all"
                        >
                          {t('videotheque.view')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayVideo(video);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 rounded-lg text-white text-sm font-semibold flex items-center gap-1 transition-all"
                        >
                          <Play size={14} />
                          {t('videotheque.fullscreen')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔍 OVERLAY DE RECHERCHE INTELLIGENT */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] animate-fadeIn">
          <div 
            className="absolute inset-0 bg-[#0a0e27]/95 backdrop-blur-xl"
            onClick={() => {
              setSearchOpen(false);
              setSearchResults([]);
              setSearchTerm("");
            }}
          ></div>
          
          <div className="relative h-full flex items-start justify-center pt-32 px-4">
            <div className="w-full max-w-3xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-blue-600 rounded-full mb-4 shadow-2xl shadow-orange-500/50">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-500 mb-2">
                  {t('videotheque.search_title')}
                </h2>
              </div>

              <form onSubmit={handleSearchSubmit} className="mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative flex items-center bg-white/10 border-2 border-orange-500/30 rounded-2xl px-6 py-4 focus-within:border-orange-500 transition-all">
                    <Search size={24} className="text-orange-400 mr-4 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder={t('videotheque.search_placeholder')}
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="bg-transparent outline-none text-lg text-white placeholder-gray-400 w-full"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setSearchResults([]);
                        }}
                        className="ml-4 p-2 hover:bg-white/10 rounded-full transition-all"
                      >
                        <X size={20} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Résultats */}
              {searchResults.length > 0 && (
                <div className="space-y-2 animate-fadeIn">
                  <p className="text-gray-400 text-sm mb-4 px-2">
                    {searchResults.length} {searchResults.length > 1 ? t('videotheque.results_found_plural') : t('videotheque.results_found')}
                  </p>
                  {searchResults.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleResultClick(video)}
                      className="w-full group"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-orange-500/20 hover:border-orange-500/40 rounded-xl p-4 transition-all">
                          <img
                            src={video.cover_image}
                            alt={video.title_fr}
                            className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => (e.target.src = "https://placehold.co/100x60/1a1a2e/ffffff?text=Video")}
                          />
                          <div className="flex-1 text-left">
                            <h3 className="text-white font-bold text-lg mb-1">{video.title_fr}</h3>
                            <p className="text-gray-400 text-sm line-clamp-1">{video.comment_fr}</p>
                          </div>
                          <Play size={20} className="text-orange-400 flex-shrink-0" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchResults([]);
                    setSearchTerm("");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-orange-500/30 hover:border-orange-500/60 rounded-xl text-white font-semibold transition-all"
                >
                  <X size={18} />
                  {t('videotheque.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎬 MODAL PLEIN ÉCRAN */}
      {showModal && selectedVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all z-10 shadow-2xl"
          >
            <X size={24} className="text-white" />
          </button>

          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 blur-3xl"></div>
              <div className="relative aspect-w-16 aspect-h-9">
                <iframe
                  src={getEmbedUrl(selectedVideo.lien_video)}
                  title={selectedVideo.title_fr}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-[300px] md:h-[500px] lg:h-[600px] rounded-2xl border-4 border-orange-500/30"
                ></iframe>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border-2 border-orange-500/20 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedVideo.title_fr}</h3>
              <p className="text-gray-300">{selectedVideo.comment_fr}</p>
            </div>
          </div>
        </div>
      )}

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

export default Videotheque;