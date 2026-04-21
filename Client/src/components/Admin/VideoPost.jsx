import React, { useEffect, useState } from "react";
import { Video, Loader2, Trash2, PlusCircle, Edit2, X, Play, ExternalLink } from "lucide-react";
import CONFIG from "../../config/config.js";

const VideoPost = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [formData, setFormData] = useState({
    title_fr: "",
    title_en: "",
    title_ar: "",
    comment_fr: "",
    comment_en: "",
    comment_ar: "",
    lien_video: "",
    cover_image: null,
  });
  const [preview, setPreview] = useState(null);

  // 🔄 Charger toutes les vidéos
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(CONFIG.API_VIDEO_LIST);
      if (!res.ok) throw new Error("Erreur de chargement des vidéos");
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des vidéos");
    } finally {
      setFetchLoading(false);
    }
  };

  // 📝 Gestion des champs
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 🔄 Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title_fr: "",
      title_en: "",
      title_ar: "",
      comment_fr: "",
      comment_en: "",
      comment_ar: "",
      lien_video: "",
      cover_image: null,
    });
    setPreview(null);
    setEditingId(null);
  };

  // ✅ Créer ou Mettre à jour
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });

      const url = editingId ? CONFIG.API_VIDEO_UPDATE(editingId) : CONFIG.API_VIDEO_CREATE;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      setSuccessMessage(editingId ? "Vidéo mise à jour avec succès !" : "Vidéo ajoutée avec succès !");
      resetForm();
      fetchVideos();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Supprimer une vidéo
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette vidéo ?")) return;

    try {
      const res = await fetch(CONFIG.API_VIDEO_DELETE(id), { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
      setSuccessMessage("Vidéo supprimée avec succès !");
      fetchVideos();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    }
  };

  // 🔄 Préparer le formulaire pour modification
  const handleEdit = (video) => {
    setEditingId(video.id);
    setFormData({
      title_fr: video.title_fr || "",
      title_en: video.title_en || "",
      title_ar: video.title_ar || "",
      comment_fr: video.comment_fr || "",
      comment_en: video.comment_en || "",
      comment_ar: video.comment_ar || "",
      lien_video: video.lien_video || "",
      cover_image: null,
    });
    setPreview(video.cover_image || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🎬 Extraire l'ID YouTube
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin inline-block text-orange-500" size={40} />
          <p className="mt-4 text-gray-300 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden">
      {/* Effets de fond lumineux */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grille de fond */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-lg"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-xl">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Gestion des Vidéos
            </h1>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            className="relative group w-full md:w-auto"
          >
            <div className="absolute inset-0 bg-orange-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-lg hover:shadow-xl hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 font-semibold">
              <PlusCircle size={18} /> {showForm ? "Fermer" : "Nouvelle Vidéo"}
            </div>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 text-red-300 p-4 mb-6 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/20 border-2 border-green-500/50 text-green-300 p-4 mb-6 rounded-xl backdrop-blur-sm">
            {successMessage}
          </div>
        )}

        {/* 🧾 FORMULAIRE */}
        {showForm && (
          <div className="relative mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-[#0f1729]/90 backdrop-blur-xl shadow-2xl p-6 md:p-8 rounded-2xl border-2 border-orange-500/30">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingId ? "✏️ Modifier la vidéo" : "➕ Ajouter une vidéo"}
              </h2>
              
              <div className="space-y-6">
                {/* Titres */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-4">📝 Titres</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">Titre (FR) *</label>
                      <input
                        type="text"
                        name="title_fr"
                        value={formData.title_fr}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">Title (EN)</label>
                      <input
                        type="text"
                        name="title_en"
                        value={formData.title_en}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">العنوان (AR)</label>
                      <input
                        type="text"
                        name="title_ar"
                        value={formData.title_ar}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                        style={{ direction: 'rtl' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Commentaires */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">💬 Commentaires</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">Commentaire (FR)</label>
                      <textarea
                        name="comment_fr"
                        value={formData.comment_fr}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">Comment (EN)</label>
                      <textarea
                        name="comment_en"
                        value={formData.comment_en}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">التعليق (AR)</label>
                      <textarea
                        name="comment_ar"
                        value={formData.comment_ar}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                        rows={3}
                        style={{ direction: 'rtl' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lien vidéo et Image */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">🔗 Lien vidéo (YouTube, etc.) *</label>
                    <input
                      type="url"
                      name="lien_video"
                      value={formData.lien_video}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-white/10 border-2 border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">🖼️ Image de couverture</label>
                    <input
                      type="file"
                      name="cover_image"
                      accept="image/*"
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/10 border-2 border-purple-500/30 rounded-lg text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition-all"
                    />
                  </div>
                </div>

                {preview && (
                  <div className="relative inline-block">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-purple-500 rounded-xl blur opacity-50"></div>
                    <img src={preview} alt="Aperçu" className="relative w-full max-w-md h-48 object-cover rounded-xl border-2 border-white/20 shadow-xl" />
                  </div>
                )}

                {/* Boutons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="relative group overflow-hidden flex-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-2xl hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Enregistrement...
                        </>
                      ) : (
                        editingId ? "Mettre à jour" : "Ajouter"
                      )}
                    </div>
                  </button>
                  <button
                    onClick={resetForm}
                    className="bg-gray-600/30 border-2 border-gray-500/50 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-600/50 transition-all font-semibold"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🖼️ GRID DES VIDÉOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {videos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Video size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Aucune vidéo pour le moment</p>
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="relative group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 h-full flex flex-col">
                  {/* Image/Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-transparent to-transparent z-10"></div>
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-orange-500/80 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </div>
                    {video.cover_image ? (
                      <img
                        src={video.cover_image}
                        alt={video.title_fr}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                        <Video size={48} className="text-white/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {video.title_fr}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 flex-1">
                      {video.comment_fr || "Aucun commentaire"}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(video);
                        }}
                        className="flex-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-1"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(video.id);
                        }}
                        className="flex-1 bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🔍 MODAL DÉTAILS */}
        {selectedVideo && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setSelectedVideo(null)}
          >
            <div 
              className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-[#0a0e27] rounded-3xl shadow-2xl border-2 border-orange-500/30 overflow-hidden">
                {/* Vidéo Player */}
                {selectedVideo.lien_video && getYouTubeId(selectedVideo.lien_video) ? (
                  <div className="relative aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.lien_video)}`}
                      title={selectedVideo.title_fr}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : selectedVideo.cover_image && (
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-transparent to-transparent z-10"></div>
                    <img
                      src={selectedVideo.cover_image}
                      alt={selectedVideo.title_fr}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Contenu */}
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                        {selectedVideo.title_fr}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedVideo.title_en && (
                          <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                            🇬🇧 {selectedVideo.title_en}
                          </span>
                        )}
                        {selectedVideo.title_ar && (
                          <span className="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30" style={{ direction: 'rtl' }}>
                            🇸🇦 {selectedVideo.title_ar}
                          </span>
                        )}
                      </div>
                      <a
                        href={selectedVideo.lien_video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        <ExternalLink size={16} />
                        Voir la vidéo sur la plateforme
                      </a>
                    </div>
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Commentaires */}
                  <div className="space-y-4 mb-6">
                    {selectedVideo.comment_fr && (
                      <div className="bg-white/5 p-4 rounded-xl border border-orange-500/30">
                        <p className="text-xs font-bold text-orange-400 mb-2">🇫🇷 FRANÇAIS</p>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedVideo.comment_fr}</p>
                      </div>
                    )}
                    {selectedVideo.comment_en && (
                      <div className="bg-white/5 p-4 rounded-xl border border-blue-500/30">
                        <p className="text-xs font-bold text-blue-400 mb-2">🇬🇧 ENGLISH</p>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedVideo.comment_en}</p>
                      </div>
                    )}
                    {selectedVideo.comment_ar && (
                      <div className="bg-white/5 p-4 rounded-xl border border-purple-500/30">
                        <p className="text-xs font-bold text-purple-400 mb-2">🇸🇦 العربية</p>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap" style={{ direction: 'rtl' }}>{selectedVideo.comment_ar}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        handleEdit(selectedVideo);
                        setSelectedVideo(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} /> Modifier
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedVideo.id);
                        setSelectedVideo(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-red-500/50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPost;