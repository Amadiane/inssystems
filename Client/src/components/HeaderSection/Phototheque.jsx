import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  RefreshCw,
  Camera,
  FolderOpen,
  X,
  ZoomIn,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ChatBotNew from "../ChatBot/ChatbotNew";
import CONFIG from "../../config/config.js";

const Phototheque = () => {
  const { t, i18n } = useTranslation();
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [openAlbum, setOpenAlbum] = useState(null);

  // ✅ Scroll vers le haut au chargement de la page
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

  // 🟢 Charger albums + photos
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [albumRes, photoRes] = await Promise.all([
        fetch(CONFIG.API_ALBUM_LIST),
        fetch(CONFIG.API_PHOTO_LIST),
      ]);

      if (!albumRes.ok || !photoRes.ok) throw new Error("Erreur de chargement");

      const [albumData, photoData] = await Promise.all([
        albumRes.json(),
        photoRes.json(),
      ]);

      // Vérifie et normalise les URLs Cloudinary
      const normalizeUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        if (url.startsWith("/")) return `${CONFIG.BASE_URL}${url}`;
        return `${CONFIG.BASE_URL}/${url}`;
      };

      const albumsWithUrls = albumData.map((a) => ({
        ...a,
        image: normalizeUrl(a.image),
      }));

      const photosWithUrls = photoData.map((p) => ({
        ...p,
        image: normalizeUrl(p.image),
      }));

      setAlbums(albumsWithUrls);
      setPhotos(photosWithUrls);
      setError("");
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 Filtrage albums
  const filteredAlbums = albums.filter((album) => {
    const term = searchTerm.toLowerCase();
    return (
      album.title_fr?.toLowerCase().includes(term) ||
      album.title_en?.toLowerCase().includes(term)
    );
  });

  // 🔄 Récupérer photos d’un album
  const getPhotosByAlbum = (albumId) =>
    photos.filter((photo) => photo.album === albumId);

  return (
    <div className="min-h-screen bg-[#0a0e27] pt-40">
      {/* 🧠 En-tête */}
      <div className="relative text-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 blur-3xl rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="relative py-10">
          <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-orange-500/50">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-400 to-white mt-6 mb-4">
            {t("phototheque.titre", "PHOTOTHÈQUE")}
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            {t(
              "phototheque.sous_titre",
              "Découvrez notre collection de photos illustrant nos activités et événements."
            )}
          </p>
        </div>
      </div>

      {/* 🔍 Barre de recherche */}
      <div className="flex justify-end px-6 mb-8">
        <div className="flex items-center gap-2 bg-white/10 border border-orange-500/20 rounded-full px-3 py-2">
          <Search size={18} className="text-orange-400" />
          <input
            type="text"
            placeholder={t("phototheque.recherche", "Rechercher...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none placeholder-gray-400 w-40"
          />
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="ml-3 p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full text-white transition-all"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 📸 Albums */}
      <div className="w-[90%] mx-auto pb-20">
        {loading ? (
          <p className="text-center text-gray-400">
            {t("chargement", "Chargement...")}
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-orange-500/20">
            <FolderOpen className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <p className="text-white font-bold text-xl">
              {t("aucun_album", "Aucun album trouvé")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAlbums.map((album) => {
              const isOpen = openAlbum === album.id;
              const albumPhotos = getPhotosByAlbum(album.id);
              const desc =
                i18n.language === "fr"
                  ? album.description_fr
                  : album.description_en;

              return (
                <div
                  key={album.id}
                  className="bg-[#10142c]/80 border border-orange-500/20 rounded-3xl shadow-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenAlbum(isOpen ? null : album.id)}
                    className="w-full flex justify-between items-center p-6"
                  >
                    <div className="flex items-center gap-6">
                      <img
                        src={album.image || "/image_indispo.png"}
                        alt={album.title_fr}
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-orange-500"
                        onError={(e) =>
                          (e.target.src = "/image_indispo.png")
                        }
                      />
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-white">
                          {i18n.language === "fr"
                            ? album.title_fr
                            : album.title_en}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                          📸 {albumPhotos.length}{" "}
                          {t("photos", "photos")}
                        </p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="text-orange-400" size={28} />
                    ) : (
                      <ChevronDown className="text-orange-400" size={28} />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-6 border-t border-orange-500/20">
                      {desc && (
                        <p className="text-gray-300 mb-6 italic leading-relaxed">
                          {desc}
                        </p>
                      )}

                      {/* Photos de l’album */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {albumPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            onClick={() =>
                              setZoomedImage({
                                src: photo.image || "/image_indispo.png",
                                title:
                                  i18n.language === "fr"
                                    ? photo.title_fr
                                    : photo.title_en,
                                comment:
                                  i18n.language === "fr"
                                    ? photo.comment_fr
                                    : photo.comment_en,
                              })
                            }
                            className="relative group cursor-pointer"
                          >
                            <img
                              src={photo.image || "/image_indispo.png"}
                              alt={photo.title_fr}
                              className="w-full h-48 object-cover rounded-2xl border-2 border-orange-500/20 group-hover:border-orange-500 transition-all"
                              onError={(e) =>
                                (e.target.src = "/image_indispo.png")
                              }
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <ZoomIn className="text-white" size={28} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔍 MODAL IMAGE */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50"
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-8 right-8 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
          >
            <X className="text-white" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl mx-auto text-center"
          >
            <img
              src={zoomedImage.src}
              alt={zoomedImage.title}
              className="max-h-[70vh] mx-auto rounded-2xl border-4 border-orange-500/30"
            />
            <p className="text-white text-xl font-bold mt-6">
              {zoomedImage.title}
            </p>
            <p className="text-gray-400 mt-2">{zoomedImage.comment}</p>
          </div>
        </div>
      )}

      {/* 🤖 CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

export default Phototheque;
