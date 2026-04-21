import React, { useEffect, useState } from "react";
import { FileText, Loader2, Trash2, PlusCircle, Edit2, X } from "lucide-react";
import CONFIG from "../../config/config.js";

const Createpost = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    title_fr: "",
    title_en: "",
    title_ar: "",
    content_fr: "",
    content_en: "",
    content_ar: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);

  // 🔄 Charger tous les articles
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(CONFIG.API_NEWS_LIST);
      if (!res.ok) throw new Error("Erreur de chargement des articles");
      const data = await res.json();
      setNewsList(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des articles");
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
      content_fr: "",
      content_en: "",
      content_ar: "",
      image: null,
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

      const url = editingId ? CONFIG.API_NEWS_UPDATE(editingId) : CONFIG.API_NEWS_CREATE;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      setSuccessMessage(editingId ? "Article mis à jour avec succès !" : "Article publié avec succès !");
      resetForm();
      fetchNews();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Supprimer un article
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet article ?")) return;

    try {
      const res = await fetch(CONFIG.API_NEWS_DELETE(id), { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
      setSuccessMessage("Article supprimé avec succès !");
      fetchNews();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    }
  };

  // 🔄 Préparer le formulaire pour modification
  const handleEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      title_fr: post.title_fr || "",
      title_en: post.title_en || "",
      title_ar: post.title_ar || "",
      content_fr: post.content_fr || "",
      content_en: post.content_en || "",
      content_ar: post.content_ar || "",
      image: null,
    });
    setPreview(post.image || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Gestion des Articles Blog
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
              <PlusCircle size={18} /> {showForm ? "Fermer" : "Nouvel Article"}
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
                {editingId ? "✏️ Modifier l'article" : "➕ Créer un article"}
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

                {/* Contenus */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">📄 Contenus</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">Contenu (FR) *</label>
                      <textarea
                        name="content_fr"
                        value={formData.content_fr}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">Content (EN)</label>
                      <textarea
                        name="content_en"
                        value={formData.content_en}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-300 mb-2">المحتوى (AR)</label>
                      <textarea
                        name="content_ar"
                        value={formData.content_ar}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                        rows={4}
                        style={{ direction: 'rtl' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block font-semibold text-gray-300 mb-2">🖼️ Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-white/10 border-2 border-purple-500/30 rounded-lg text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition-all"
                  />
                  {preview && (
                    <div className="mt-4 relative inline-block">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-purple-500 rounded-xl blur opacity-50"></div>
                      <img src={preview} alt="Aperçu" className="relative w-full max-w-md h-48 object-cover rounded-xl border-2 border-white/20 shadow-xl" />
                    </div>
                  )}
                </div>

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
                        editingId ? "Mettre à jour" : "Publier"
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

        {/* 🖼️ GRID DES ARTICLES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {newsList.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Aucun article pour le moment</p>
            </div>
          ) : (
            newsList.map((post) => (
              <div key={post.id} className="relative group cursor-pointer" onClick={() => setSelectedPost(post)}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 h-full flex flex-col">
                  {/* Image */}
                  {post.image ? (
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-transparent to-transparent z-10"></div>
                      <img
                        src={post.image}
                        alt={post.title_fr}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                      <FileText size={48} className="text-white/30" />
                    </div>
                  )}
                  
                  {/* Contenu */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {post.title_fr}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 flex-1">
                      {post.content_fr || "Aucun contenu"}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(post);
                        }}
                        className="flex-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-1"
                      >
                        <Edit2 size={14} /> Modifier
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post.id);
                        }}
                        className="flex-1 bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🔍 MODAL DÉTAILS */}
        {selectedPost && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setSelectedPost(null)}
          >
            <div 
              className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-[#0a0e27] rounded-3xl shadow-2xl border-2 border-orange-500/30 overflow-hidden">
                {/* Header avec image */}
                {selectedPost.image && (
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-transparent to-transparent z-10"></div>
                    <img
                      src={selectedPost.image}
                      alt={selectedPost.title_fr}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Contenu */}
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                        {selectedPost.title_fr}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.title_en && (
                          <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                            🇬🇧 {selectedPost.title_en}
                          </span>
                        )}
                        {selectedPost.title_ar && (
                          <span className="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30" style={{ direction: 'rtl' }}>
                            🇸🇦 {selectedPost.title_ar}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Contenus */}
                  <div className="space-y-4 mb-6">
                    {selectedPost.content_fr && (
                      <div className="bg-white/5 p-4 rounded-xl border border-orange-500/30">
                        <p className="text-xs font-bold text-orange-400 mb-2">🇫🇷 FRANÇAIS</p>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedPost.content_fr}</p>
                      </div>
                    )}
                    {selectedPost.content_en && (
                      <div className="bg-white/5 p-4 rounded-xl border border-blue-500/30">
                        <p className="text-xs font-bold text-blue-400 mb-2">🇬🇧 ENGLISH</p>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedPost.content_en}</p>
                      </div>
                    )}
                    {selectedPost.content_ar && (
                      <div className="bg-white/5 p-4 rounded-xl border border-purple-500/30">
                        <p className="text-xs font-bold text-purple-400 mb-2">🇸🇦 العربية</p>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap" style={{ direction: 'rtl' }}>{selectedPost.content_ar}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        handleEdit(selectedPost);
                        setSelectedPost(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} /> Modifier l'article
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedPost.id);
                        setSelectedPost(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-red-500/50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> Supprimer l'article
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

export default Createpost;