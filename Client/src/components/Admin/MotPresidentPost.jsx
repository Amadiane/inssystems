import React, { useState, useEffect } from "react";
import { MessageSquare, Loader2, Trash2, PlusCircle, Edit2, X } from "lucide-react";
import CONFIG from "../../config/config.js";

const MotPresidentPost = () => {
  const [motPresidents, setMotPresidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMot, setSelectedMot] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    title_fr: "",
    title_en: "",
    title_ar: "",
    description_fr: "",
    description_en: "",
    description_ar: "",
    image: null,
  });

  useEffect(() => {
    fetchMotPresidents();
  }, []);

  const fetchMotPresidents = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(CONFIG.API_MOTPRESIDENT_LIST);
      if (!res.ok) throw new Error("Erreur de chargement des messages");
      const data = await res.json();
      setMotPresidents(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des messages");
    } finally {
      setFetchLoading(false);
    }
  };

  // ✅ Fonction robuste pour récupérer l'image correcte
  const getImageSrc = (mot) => {
    const img = mot.image_url || mot.image;
    if (!img) return "https://placehold.co/600x400/1a1a2e/ffffff?text=President";

    // Si c’est déjà une URL Cloudinary complète
    if (img.startsWith("http")) {
      // Ajoute .jpg si manquant (erreur ERR_CONNECTION_RESET si absent)
      if (!img.match(/\.(jpg|jpeg|png|webp|gif)$/)) return `${img}.jpg`;
      return img;
    }

    // Sinon, on suppose que c’est un chemin local (dev)
    return `${CONFIG.MEDIA_URL}${img}`;
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CONFIG.CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Erreur upload Cloudinary:", err);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      title_fr: "",
      title_en: "",
      title_ar: "",
      description_fr: "",
      description_en: "",
      description_ar: "",
      image: null,
    });
    setPreview(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let imageUrl = null;
      if (formData.image) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      const payload = {
        title_fr: formData.title_fr,
        title_en: formData.title_en,
        title_ar: formData.title_ar,
        description_fr: formData.description_fr,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        image: imageUrl,
      };

      const url = editingId ? CONFIG.API_MOTPRESIDENT_UPDATE(editingId) : CONFIG.API_MOTPRESIDENT_CREATE;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      setSuccessMessage(editingId ? "Message mis à jour avec succès !" : "Message ajouté avec succès !");
      resetForm();
      fetchMotPresidents();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    try {
      const res = await fetch(CONFIG.API_MOTPRESIDENT_DELETE(id), { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
      setSuccessMessage("Message supprimé avec succès !");
      fetchMotPresidents();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    }
  };

  const handleEdit = (mot) => {
    setEditingId(mot.id);
    setFormData({
      title_fr: mot.title_fr || "",
      title_en: mot.title_en || "",
      title_ar: mot.title_ar || "",
      description_fr: mot.description_fr || "",
      description_en: mot.description_en || "",
      description_ar: mot.description_ar || "",
      image: null,
    });
    setPreview(getImageSrc(mot));
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

  // 🖼️ --- le reste du rendu inchangé, mais remplace chaque `mot.image_url` par `getImageSrc(mot)` ---


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
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Gestion du Mot du Président
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
              <PlusCircle size={18} /> {showForm ? "Fermer" : "Nouveau Message"}
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
                {editingId ? "✏️ Modifier le message" : "➕ Ajouter un message"}
              </h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">🇫🇷 Titre (FR) *</label>
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
                    <label className="block font-semibold text-gray-300 mb-2">🇬🇧 Title (EN) *</label>
                    <input
                      type="text"
                      name="title_en"
                      value={formData.title_en}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2 text-right" dir="rtl">🇸🇦 العنوان (AR) *</label>
                  <input
                    type="text"
                    name="title_ar"
                    value={formData.title_ar}
                    onChange={handleChange}
                    dir="rtl"
                    className="w-full px-4 py-3 bg-white/10 border-2 border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">📝 Description (FR) *</label>
                  <textarea
                    name="description_fr"
                    value={formData.description_fr}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-white/10 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">📝 Description (EN) *</label>
                  <textarea
                    name="description_en"
                    value={formData.description_en}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2 text-right" dir="rtl">📝 الوصف (AR) *</label>
                  <textarea
                    name="description_ar"
                    value={formData.description_ar}
                    onChange={handleChange}
                    dir="rtl"
                    rows="4"
                    className="w-full px-4 py-3 bg-white/10 border-2 border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">🖼️ Photo du président *</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-white/10 border-2 border-purple-500/30 rounded-lg text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition-all"
                    required={!editingId}
                  />
                  {preview && (
                    <div className="mt-4 relative inline-block">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-purple-500 rounded-xl blur opacity-50"></div>
                      <div className="relative bg-white p-4 rounded-xl">
                        <img src={preview} alt="Aperçu" className="w-full max-w-xs h-32 object-contain" />
                      </div>
                    </div>
                  )}
                </div>

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

        {/* 🖼️ GRID DES MESSAGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {motPresidents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Aucun message pour le moment</p>
            </div>
          ) : (
            motPresidents.map((mot) => (
              <div key={mot.id} className="relative group cursor-pointer" onClick={() => setSelectedMot(mot)}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-orange-500/20 to-purple-500/20">
                    {mot.image_url ? (
                      <img
                        src={mot.image_url}
                        alt={mot.title_en}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MessageSquare size={48} className="text-white/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {mot.title_fr}
                    </h3>
                    {mot.title_en && (
                      <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                        {mot.title_en}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 line-clamp-3 mb-3">
                      {mot.description_fr}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-3 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(mot);
                        }}
                        className="flex-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Edit2 size={14} /> Modifier
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(mot.id);
                        }}
                        className="flex-1 bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all text-xs font-semibold flex items-center justify-center gap-1"
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
        {selectedMot && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setSelectedMot(null)}
          >
            <div 
              className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-[#0a0e27] rounded-3xl shadow-2xl border-2 border-orange-500/30 overflow-hidden">
                {/* Image grande taille */}
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-orange-500/20 to-purple-500/20">
                  {selectedMot.image_url ? (
                    <img
                      src={selectedMot.image_url}
                      alt={selectedMot.title_en}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MessageSquare size={96} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Contenu */}
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                        {selectedMot.title_fr}
                      </h2>
                      {selectedMot.title_en && (
                        <p className="text-lg text-orange-400 font-semibold">
                          🇬🇧 {selectedMot.title_en}
                        </p>
                      )}
                      {selectedMot.title_ar && (
                        <p className="text-lg text-green-400 font-semibold" dir="rtl">
                          🇸🇦 {selectedMot.title_ar}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedMot(null)}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-blue-500/30">
                      <p className="text-xs font-bold text-blue-400 mb-2">🇫🇷 MESSAGE</p>
                      <p className="text-gray-300 leading-relaxed">{selectedMot.description_fr}</p>
                    </div>

                    {selectedMot.description_en && (
                      <div className="bg-white/5 p-4 rounded-xl border border-green-500/30">
                        <p className="text-xs font-bold text-green-400 mb-2">🇬🇧 MESSAGE</p>
                        <p className="text-gray-300 leading-relaxed">{selectedMot.description_en}</p>
                      </div>
                    )}

                    {selectedMot.description_ar && (
                      <div className="bg-white/5 p-4 rounded-xl border border-purple-500/30" dir="rtl">
                        <p className="text-xs font-bold text-purple-400 mb-2">🇸🇦 الرسالة</p>
                        <p className="text-gray-300 leading-relaxed">{selectedMot.description_ar}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        handleEdit(selectedMot);
                        setSelectedMot(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} /> Modifier
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedMot.id);
                        setSelectedMot(null);
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

export default MotPresidentPost;