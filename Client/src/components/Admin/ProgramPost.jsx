import React, { useState, useEffect } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import { Calendar, Clock, MapPin, Trophy, Image, Plus, Edit2, Trash2, Save, X } from "lucide-react";

const ProgramPost = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    home_team_name_fr: "",
    home_team_name_en: "",
    home_team_name_ar: "",
    away_team_name_fr: "",
    away_team_name_en: "",
    away_team_name_ar: "",
    location_fr: "",
    location_en: "",
    location_ar: "",
    match_date: "",
    match_time: "",
    description_fr: "",
    description_en: "",
    description_ar: "",
    home_score: 0,
    away_score: 0,
    home_team_logo: null,
    away_team_logo: null,
    banner_image: null,
  };

  const [formData, setFormData] = useState(initialForm);
  const [preview, setPreview] = useState({
    home_team_logo: null,
    away_team_logo: null,
    banner_image: null,
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data } = await axios.get(CONFIG.API_MATCH_LIST);
      setMatches(data);
    } catch (err) {
      console.error("❌ Erreur chargement matchs :", err);
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!file || typeof file === "string") return file;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CONFIG.CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_NAME}/upload`,
      data
    );
    return res.data.secure_url;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, [field]: file }));
    setPreview((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [homeLogoURL, awayLogoURL, bannerURL] = await Promise.all([
        uploadToCloudinary(formData.home_team_logo),
        uploadToCloudinary(formData.away_team_logo),
        uploadToCloudinary(formData.banner_image),
      ]);

      const payload = {
        home_team_name_fr: formData.home_team_name_fr,
        home_team_name_en: formData.home_team_name_en,
        home_team_name_ar: formData.home_team_name_ar,
        away_team_name_fr: formData.away_team_name_fr,
        away_team_name_en: formData.away_team_name_en,
        away_team_name_ar: formData.away_team_name_ar,
        location_fr: formData.location_fr,
        location_en: formData.location_en,
        location_ar: formData.location_ar,
        match_date: formData.match_date,
        match_time: formData.match_time,
        description_fr: formData.description_fr,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        home_score: Number(formData.home_score),
        away_score: Number(formData.away_score),
        home_team_logo: homeLogoURL || "",
        away_team_logo: awayLogoURL || "",
        banner_image: bannerURL || "",
      };

      if (editId) {
        await axios.put(CONFIG.API_MATCH_UPDATE(editId), payload);
      } else {
        await axios.post(CONFIG.API_MATCH_CREATE, payload);
      }

      await fetchMatches();
      resetForm();
    } catch (err) {
      console.error("❌ Erreur soumission :", err.response?.data || err);
      alert("⚠️ Erreur lors de la soumission — vérifie les champs requis.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (match) => {
    setEditId(match.id);
    setFormData({
      ...formData,
      ...match,
      home_team_logo: match.home_team_logo,
      away_team_logo: match.away_team_logo,
      banner_image: match.banner_image,
    });
    setPreview({
      home_team_logo: match.home_team_logo,
      away_team_logo: match.away_team_logo,
      banner_image: match.banner_image,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce match ?")) return;
    try {
      await axios.delete(CONFIG.API_MATCH_DELETE(id));
      fetchMatches();
    } catch (err) {
      console.error("❌ Erreur suppression :", err);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setPreview({
      home_team_logo: null,
      away_team_logo: null,
      banner_image: null,
    });
    setEditId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Effets de fond lumineux */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grille de fond */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header avec style e-sport */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-orange-500/30 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-400 to-white mb-3 tracking-tight">
            GESTION DES MATCHS
          </h1>
          <p className="text-blue-300 text-lg font-semibold">Créez et gérez les matchs de votre club</p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Formulaire avec effets e-sport */}
        <div className="relative group/form mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 rounded-3xl blur opacity-20 group-hover/form:opacity-40 transition duration-500"></div>
          <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-500/30 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`absolute inset-0 ${editId ? 'bg-orange-500/30' : 'bg-blue-500/30'} blur-xl rounded-lg`}></div>
                  <div className={`relative w-12 h-12 ${editId ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'} rounded-lg flex items-center justify-center shadow-xl`}>
                    {editId ? <Edit2 className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white">
                  {editId ? "MODIFIER LE MATCH" : "NOUVEAU MATCH"}
                </h2>
              </div>
              {editId && (
                <button
                  onClick={resetForm}
                  className="relative group/cancel"
                >
                  <div className="absolute inset-0 bg-red-500/30 blur-lg opacity-0 group-hover/cancel:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-2 px-4 py-2 bg-red-500/20 border-2 border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300">
                    <X className="w-4 h-4" />
                    <span className="font-semibold">Annuler</span>
                  </div>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Équipe à domicile */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h3 className="text-xl font-black text-orange-400">ÉQUIPE À DOMICILE</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["fr", "en", "ar"].map((lang) => (
                    <input
                      key={`home_${lang}`}
                      type="text"
                      name={`home_team_name_${lang}`}
                      placeholder={`Nom (${lang.toUpperCase()})`}
                      value={formData[`home_team_name_${lang}`]}
                      onChange={handleChange}
                      className="px-4 py-3 bg-white/5 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all duration-300"
                      required
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-3 bg-white/5 border-2 border-orange-500/30 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Image className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-300 font-semibold">Logo de l'équipe</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "home_team_logo")}
                      className="hidden"
                    />
                  </label>
                  {preview.home_team_logo && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full"></div>
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl">
                        <img src={preview.home_team_logo} alt="home logo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Équipe adverse */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-black text-blue-400">ÉQUIPE ADVERSE</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["fr", "en", "ar"].map((lang) => (
                    <input
                      key={`away_${lang}`}
                      type="text"
                      name={`away_team_name_${lang}`}
                      placeholder={`Nom (${lang.toUpperCase()})`}
                      value={formData[`away_team_name_${lang}`]}
                      onChange={handleChange}
                      className="px-4 py-3 bg-white/5 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                      required
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-3 bg-white/5 border-2 border-blue-500/30 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Image className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-300 font-semibold">Logo de l'équipe</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "away_team_logo")}
                      className="hidden"
                    />
                  </label>
                  {preview.away_team_logo && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full"></div>
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-2xl">
                        <img src={preview.away_team_logo} alt="away logo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lieu */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-green-400">LIEU DU MATCH</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["fr", "en", "ar"].map((lang) => (
                    <input
                      key={`loc_${lang}`}
                      type="text"
                      name={`location_${lang}`}
                      placeholder={`Lieu (${lang.toUpperCase()})`}
                      value={formData[`location_${lang}`]}
                      onChange={handleChange}
                      className="px-4 py-3 bg-white/5 border-2 border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all duration-300"
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Date, Heure & Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="date"
                    name="match_date"
                    value={formData.match_date}
                    onChange={handleChange}
                    className="w-full pl-16 pr-4 py-3 bg-white/5 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="time"
                    name="match_time"
                    value={formData.match_time}
                    onChange={handleChange}
                    className="w-full pl-16 pr-4 py-3 bg-white/5 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
                <input
                  type="number"
                  name="home_score"
                  value={formData.home_score}
                  onChange={handleChange}
                  placeholder="Score domicile"
                  className="px-4 py-3 bg-white/5 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all duration-300"
                />
                <input
                  type="number"
                  name="away_score"
                  value={formData.away_score}
                  onChange={handleChange}
                  placeholder="Score extérieur"
                  className="px-4 py-3 bg-white/5 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                />
              </div>

              {/* Bannière */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-pink-400">BANNIÈRE DU MATCH</h3>
                </div>
                <label className="cursor-pointer block">
                  <div className="px-4 py-8 bg-white/5 border-2 border-dashed border-pink-500/30 rounded-2xl hover:bg-white/10 transition-all duration-300 text-center">
                    {preview.banner_image ? (
                      <img src={preview.banner_image} alt="banner" className="w-full h-64 object-cover rounded-xl" />
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                          <Image className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-300 font-semibold">Cliquez pour ajouter une bannière</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "banner_image")}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Bouton Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group/submit"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 blur-xl opacity-50 group-hover/submit:opacity-75 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-black text-lg shadow-2xl border-2 border-orange-400/50 group-hover/submit:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-white">TRAITEMENT...</span>
                    </>
                  ) : editId ? (
                    <>
                      <Save className="w-6 h-6 text-white" />
                      <span className="text-white">MODIFIER</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-white" />
                      <span className="text-white">PUBLIER</span>
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Liste des matchs */}
        <div className="relative group/list">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl blur opacity-20 group-hover/list:opacity-30 transition duration-500"></div>
          <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-500/30 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-lg"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white">LISTE DES MATCHS ({matches.length})</h2>
            </div>
            
            {matches.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
                  <div className="relative w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-orange-500/30">
                    <Trophy className="w-12 h-12 text-orange-400" />
                  </div>
                </div>
                <p className="text-white text-xl font-bold mb-2">Aucun match programmé</p>
                <p className="text-gray-400">Créez votre premier match ci-dessus</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="relative group/match">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl blur opacity-0 group-hover/match:opacity-30 transition duration-300"></div>
                    <div className="relative bg-white/5 border-2 border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-3">
                            {match.home_team_logo && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full"></div>
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-3 border-orange-500 shadow-lg">
                                  <img src={match.home_team_logo} alt="Home" className="w-full h-full object-cover" />
                                </div>
                              </div>
                            )}
                            <span className="font-bold text-white text-lg">{match.home_team_name_fr}</span>
                          </div>

                          <div className="px-5 py-2 bg-gradient-to-r from-orange-500/20 to-blue-500/20 border border-orange-500/30 rounded-lg">
                            {match.home_score !== 0 || match.away_score !== 0 ? (
                              <span className="text-white font-black text-lg">{match.home_score} - {match.away_score}</span>
                            ) : (
                              <span className="text-orange-400 font-black">VS</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white text-lg">{match.away_team_name_fr}</span>
                            {match.away_team_logo && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full"></div>
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-3 border-blue-500 shadow-lg">
                                  <img src={match.away_team_logo} alt="Away" className="w-full h-full object-cover" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span className="text-sm font-semibold">{match.match_date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300 mt-1">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span className="text-sm font-semibold">{match.match_time}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(match)}
                              className="relative group/edit"
                            >
                              <div className="absolute inset-0 bg-blue-500/30 blur-lg opacity-0 group-hover/edit:opacity-100 transition-opacity rounded-lg"></div>
                              <div className="relative p-3 bg-blue-500/20 border-2 border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 hover:scale-110 transition-all duration-300">
                                <Edit2 className="w-5 h-5" />
                              </div>
                            </button>
                            <button
                              onClick={() => handleDelete(match.id)}
                              className="relative group/delete"
                            >
                              <div className="absolute inset-0 bg-red-500/30 blur-lg opacity-0 group-hover/delete:opacity-100 transition-opacity rounded-lg"></div>
                              <div className="relative p-3 bg-red-500/20 border-2 border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 hover:scale-110 transition-all duration-300">
                                <Trash2 className="w-5 h-5" />
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramPost;