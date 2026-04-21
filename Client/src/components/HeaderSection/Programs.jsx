import React, { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Calendar, Clock, MapPin, Trophy, Zap } from "lucide-react";
import ChatBotNew from "../ChatBot/ChatbotNew";
import CONFIG from "../../config/config.js";
import { useTranslation } from "react-i18next";

const Programs = () => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);


  // ✅ Scroll vers le haut au chargement de la page
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

// ✅ Chargement des matchs depuis le backend Django
useEffect(() => {
  const fetchMatches = async () => {
    // ... ton code existant
  };
  fetchMatches();
}, []);


  // ✅ Chargement des matchs depuis le backend Django
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(CONFIG.API_MATCH_LIST);
        if (!response.ok) throw new Error("Erreur lors du chargement des matchs");
        const data = await response.json();
        setMatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur API :", err);
        setError("Impossible de charger les matchs pour le moment.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // ✅ Filtrage des matchs
  const filteredMatches = matches.filter(
    (match) =>
      match.home_team_name_fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.away_team_name_fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.location_fr?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDescription = (index) => {
    setExpandedMatch(expandedMatch === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] w-full">
      {/* Effets de fond lumineux */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header avec halo lumineux */}
      {/* <div className="relative py-16 text-center w-full"> */}
      <div className="relative pt-40 pb-16 text-center w-full">
        <div className="relative inline-block">
          {/* Halo lumineux */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-orange-500/30 to-blue-500/30 blur-3xl scale-150 animate-pulse"></div>
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-full mb-6 shadow-2xl shadow-orange-500/50 animate-pulse">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-400 to-white mb-4 tracking-tight">
              {t("calendar.title")}
            </h1>
            
            {/* Ligne animée */}
            <div className="relative w-32 h-1 mx-auto mt-6 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500 animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal - Même logique que Navlinks */}
      <div className="relative w-full flex items-center justify-center pb-16">
        <div className="w-[95%] lg:w-[90%] xl:w-[85%]">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
              <span className="text-white text-lg mt-6 font-semibold">Chargement des matchs...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border-2 border-red-500/50 text-white p-6 rounded-2xl shadow-2xl shadow-red-500/20 backdrop-blur-xl">
              <p className="font-bold text-xl mb-2 flex items-center gap-2">
                <Zap className="w-6 h-6 text-red-500" />
                Erreur
              </p>
              <p className="text-center text-red-500">{error}</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-500/30 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Trophy className="w-12 h-12 text-orange-400" />
              </div>
               <p className="text-center text-gray-400">{t("calendar.no_matches")}</p>
              <p className="text-gray-400 text-lg">Revenez bientôt pour découvrir nos prochains matchs</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredMatches.map((match, index) => (
                <div
                  key={match.id}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
                  
                  {/* Card principale */}
                  <div className="relative bg-[#0f1729]/80 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-orange-500/20 group-hover:border-orange-500/60 transition-all duration-500 shadow-2xl group-hover:shadow-orange-500/20 hover:scale-[1.02]">
                    {/* ✅ Bannière du match */}
                    <div className="relative h-72 overflow-hidden">
                      <img
                        src={
                          match.banner_image ||
                          "https://placehold.co/800x600/1a1a2e/ffffff?text=Match+Basketball"
                        }
                        alt={`${match.home_team_name_fr} vs ${match.away_team_name_fr}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) =>
                          (e.target.src =
                            "https://placehold.co/800x600/1a1a2e/ffffff?text=Image+indisponible")
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-[#0f1729]/60 to-transparent"></div>
                      
                      {/* Badge date avec glow */}
                      {/* <div className="absolute top-4 right-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-orange-500/50 blur-lg rounded-xl"></div>
                          <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-2 rounded-xl shadow-2xl border border-orange-400/50">
                            <div className="flex items-center gap-2 text-white">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-bold">{match.match_date}</span>
                            </div>
                          </div>
                        </div>
                      </div> */}

                      {/* Badge "LIVE" si le match est en cours (optionnel) */}
                      <div className="absolute top-4 left-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-500/50 blur-lg rounded-full"></div>
                          <div className="relative flex items-center gap-2 bg-red-500 px-4 py-1.5 rounded-full shadow-2xl border border-red-400/50">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            {/* <span className="text-white text-xs font-bold tracking-wider">À VENIR</span> */}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ✅ Infos principales */}
                    <div className="p-6 flex flex-col">
                      {/* Logos et noms des équipes */}
                      <div className="flex items-center justify-between mb-6">
                        {/* Équipe domicile */}
                        <div className="flex flex-col items-center flex-1">
                          <div className="relative">
                            <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full"></div>
                            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl shadow-orange-500/50 mb-3 bg-[#1a1f3a]">
                              <img
                                src={
                                  match.home_team_logo ||
                                  "https://placehold.co/100x100/ff6b35/ffffff?text=H"
                                }
                                alt="home team logo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <span className="font-bold text-white text-center text-sm leading-tight">
                            {match.home_team_name_fr}
                          </span>
                        </div>

                        {/* VS ou Score avec glow orange vif */}
                        <div className="flex flex-col items-center px-4">
                          {match.home_score !== null && match.away_score !== null && (match.home_score !== 0 || match.away_score !== 0) ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-orange-500/50 blur-2xl rounded-2xl"></div>
                              <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl px-6 py-4 border-2 border-orange-400/50 shadow-2xl">
                                <div className="flex items-center gap-4">
                                  <span className="text-4xl font-black text-white drop-shadow-lg">{match.home_score}</span>
                                  <span className="text-white text-2xl font-bold">-</span>
                                  <span className="text-4xl font-black text-white drop-shadow-lg">{match.away_score}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="absolute inset-0 bg-orange-500/50 blur-2xl rounded-2xl"></div>
                              <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-2xl px-8 py-4 shadow-2xl border-2 border-orange-400/50">
                                <span className="text-white font-black text-2xl tracking-wider drop-shadow-lg">VS</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Équipe adverse */}
                        <div className="flex flex-col items-center flex-1">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full"></div>
                            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-2xl shadow-blue-500/50 mb-3 bg-[#1a1f3a]">
                              <img
                                src={
                                  match.away_team_logo ||
                                  "https://placehold.co/100x100/004e89/ffffff?text=A"
                                }
                                alt="away team logo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <span className="font-bold text-white text-center text-sm leading-tight">
                            {match.away_team_name_fr}
                          </span>
                        </div>
                      </div>

                      {/* Détails du match */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-orange-500/20 hover:border-orange-500/40 transition-colors">
                        {/* Date */}
                          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-orange-500/20 hover:border-orange-500/40 transition-colors flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white text-sm font-bold">{match.match_date}</span>
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white text-sm font-bold">{match.match_time?.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white text-sm font-semibold leading-tight">{match.location_fr}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {match.description_fr && (
                        <div className="border-t border-white/10 pt-4">
                          <div
                            className={`overflow-hidden transition-all duration-500 ${
                              expandedMatch === index ? "max-h-96" : "max-h-20"
                            }`}
                          >
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {match.description_fr || t("calendar.no_description")}
                            </p>
                          </div>
                          <button
                            className="relative mt-3 w-full group/btn overflow-hidden"
                            onClick={() => toggleDescription(index)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 group-hover/btn:via-orange-500/40 transition-all duration-300"></div>
                            <div className="relative flex items-center justify-center py-3 bg-white/5 rounded-xl border border-orange-500/30 group-hover/btn:border-orange-500/60 transition-all duration-300">
                              <span>{expandedMatch === index ? t("calendar.hide_details") : t("calendar.show_details")}</span>
                              {expandedMatch === index ? (
                                <ChevronUp size={16} className="text-orange-400" />
                              ) : (
                                <ChevronDown size={16} className="text-orange-400" />
                              )}
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA avec style e-sport */}
      <div className="relative w-full bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-orange-500/10 backdrop-blur-xl border-t-2 border-orange-500/30 py-16 text-white text-center overflow-hidden">
        {/* Effets de fond */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative w-full flex items-center justify-center">
          <div className="w-[95%] lg:w-[90%] xl:w-[85%]">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-orange-500/30 blur-2xl rounded-full"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50 mx-auto">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-400 to-white">
               {t("calendar.join_title")}
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
              {t("calendar.join_text")}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contacter-tamkine"
                className="relative group/cta overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 blur-xl opacity-50 group-hover/cta:opacity-75 transition-opacity"></div>
                <div className="relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-lg shadow-2xl border-2 border-orange-400/50 group-hover/cta:scale-105 transition-transform">
                  {t("calendar.contact_us")}
                </div>
              </a>
              <a
                href="/community"
                className="relative group/cta overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 blur-xl opacity-50 group-hover/cta:opacity-75 transition-opacity"></div>
                <div className="relative px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-orange-500/50 rounded-xl font-bold text-lg hover:bg-white/20 group-hover/cta:scale-105 transition-all">
                  {t("calendar.join_us")}
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ChatBot */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

export default Programs;



