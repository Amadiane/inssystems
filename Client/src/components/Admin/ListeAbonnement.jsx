import React, { useEffect, useState } from "react";
import { 
  Trash2, Mail, CheckCircle, Loader2, X, Send, Clock,
  Filter, Search, Users, XCircle, ChevronLeft, ChevronRight,
  AlertCircle, Sparkles, TrendingUp, Zap, Eye
} from "lucide-react";
import CONFIG from "../../config/config.js";

/**
 * 🎨 LISTE ABONNEMENT - TEKACOM ULTRA MODERNE
 * Charte: violet #a34ee5, or #fec603, violet foncé #7828a8, noir #0a0a0a
 * Layout: Table moderne + Cards stats + Modal glassmorphism
 */

const ListeAbonnement = () => {
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAbonnement, setSelectedAbonnement] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Constants for NavAdmin spacing
  const NAVADMIN_HEIGHT = 80;
  const SCROLL_OFFSET = 20;

  const fetchAbonnements = async () => {
    setLoading(true);
    try {
      const res = await fetch(CONFIG.API_NEWSLETTER_LIST);
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setAbonnements(data);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Impossible de charger les abonnements");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAbonnements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet abonnement ?")) return;

    try {
      await fetch(CONFIG.API_NEWSLETTER_DELETE(id), { method: "DELETE" });
      setAbonnements(abonnements.filter((item) => item.id !== id));
      setSuccessMessage("✨ Supprimé !");
    } catch (error) {
      console.error(error);
      setError("Erreur lors de la suppression");
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      setError("Veuillez écrire un message.");
      return;
    }

    setReplyLoading(true);

    try {
      const res = await fetch(CONFIG.API_NEWSLETTER_REPLY(selectedAbonnement.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (res.ok) {
        setSuccessMessage("✨ Réponse envoyée !");
        setSelectedAbonnement(null);
        setReplyMessage("");
        fetchAbonnements();
      } else {
        setError("Erreur lors de l'envoi.");
      }
    } catch (error) {
      console.error(error);
      setError("Erreur lors de l'envoi");
    }

    setReplyLoading(false);
  };

  // Filtrer et rechercher
  const filteredAbonnements = abonnements.filter((item) => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "replied" ? item.is_replied :
      filter === "pending" ? !item.is_replied :
      true;
    
    const matchesSearch = item.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAbonnements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAbonnements = filteredAbonnements.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Stats
  const stats = {
    total: abonnements.length,
    pending: abonnements.filter(a => !a.is_replied).length,
    replied: abonnements.filter(a => a.is_replied).length,
    confirmed: abonnements.filter(a => a.is_confirmed).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#a34ee5]/30 border-t-[#fec603] rounded-full animate-spin"></div>
          <span className="text-gray-400 font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative pb-16">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a34ee5]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fec603]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-[1800px] mx-auto px-6 py-8">
        
        {/* HEADER COMPACT */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Newsletter</h1>
              <p className="text-xs text-gray-500">{filteredAbonnements.length} abonné{filteredAbonnements.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          <button
            onClick={fetchAbonnements}
            disabled={loading}
            className="p-3 bg-[#41124f]/40 hover:bg-[#41124f]/60 border border-[#a34ee5]/30 rounded-xl transition-all disabled:opacity-50"
          >
            <Zap className={`w-5 h-5 text-[#a34ee5] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1 text-red-300 text-sm font-medium">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400">
              <X size={18} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="flex-1 text-green-300 text-sm font-medium">{successMessage}</div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-400">
              <X size={18} />
            </button>
          </div>
        )}

        {/* STATS CARDS - Horizontal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#41124f]/20 backdrop-blur-xl border border-[#a34ee5]/30 rounded-2xl p-4 hover:border-[#a34ee5]/60 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#a34ee5]/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-[#a34ee5]" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
            </div>
            <p className="text-3xl font-black text-white">{stats.total}</p>
          </div>

          <div className="bg-[#41124f]/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-4 hover:border-yellow-500/60 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">En attente</span>
            </div>
            <p className="text-3xl font-black text-yellow-500">{stats.pending}</p>
          </div>

          <div className="bg-[#41124f]/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 hover:border-green-500/60 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">Répondus</span>
            </div>
            <p className="text-3xl font-black text-green-500">{stats.replied}</p>
          </div>

          <div className="bg-[#41124f]/20 backdrop-blur-xl border border-[#fec603]/30 rounded-2xl p-4 hover:border-[#fec603]/60 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#fec603]/20 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#fec603]" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase">Confirmés</span>
            </div>
            <p className="text-3xl font-black text-[#fec603]">{stats.confirmed}</p>
          </div>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="bg-[#41124f]/20 backdrop-blur-xl border border-[#a34ee5]/30 rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            
            {/* Filters - Pills style */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === "all"
                    ? 'bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white shadow-lg'
                    : 'bg-[#41124f]/40 text-gray-400 hover:text-white'
                }`}
              >
                Tous
              </button>

              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === "pending"
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                    : 'bg-[#41124f]/40 text-gray-400 hover:text-white'
                }`}
              >
                En attente
              </button>

              <button
                onClick={() => setFilter("replied")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === "replied"
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-[#41124f]/40 text-gray-400 hover:text-white'
                }`}
              >
                Répondus
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#41124f]/40 border border-[#a34ee5]/30 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#a34ee5]/60 transition-all"
              />
            </div>
          </div>
        </div>

        {/* GRID CARDS - Comme ServicePost/PortfolioPost */}
        {currentAbonnements.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-[#41124f]/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[#a34ee5]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun abonnement</h3>
            <p className="text-gray-500">Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentAbonnements.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-[#41124f]/20 backdrop-blur-xl border-2 border-[#a34ee5]/20 hover:border-[#a34ee5]/60 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-[#a34ee5]/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#a34ee5]/20 to-[#fec603]/20 rounded-xl flex items-center justify-center">
                          <Mail className="w-6 h-6 text-[#a34ee5]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500">Abonné #{item.id}</p>
                          <p className="text-sm font-black text-white mt-1">{item.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {item.is_confirmed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold">
                          <CheckCircle className="w-3 h-3" />
                          Confirmé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-500/20 border border-gray-500/40 text-gray-400 text-xs font-bold">
                          <XCircle className="w-3 h-3" />
                          Non confirmé
                        </span>
                      )}

                      {item.is_replied ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#a34ee5]/20 border border-[#a34ee5]/40 text-[#a34ee5] text-xs font-bold">
                          <CheckCircle className="w-3 h-3" />
                          Répondu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {/* Actions - Disposition horizontale */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedAbonnement(item)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] hover:from-[#7828a8] hover:to-[#a34ee5] text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Répondre
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#a34ee5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-[#41124f]/40 border border-[#a34ee5]/30 rounded-xl text-[#a34ee5] hover:bg-[#41124f]/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-3 rounded-xl font-bold transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white"
                            : "bg-[#41124f]/40 border border-[#a34ee5]/30 text-gray-400 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="text-gray-600">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-[#41124f]/40 border border-[#a34ee5]/30 rounded-xl text-[#a34ee5] hover:bg-[#41124f]/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL RÉPONSE - Glassmorphism */}
      {selectedAbonnement && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#a34ee5]/30 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header with gradient */}
            <div className="relative p-6 border-b border-[#a34ee5]/20">
              <div className="absolute inset-0 bg-gradient-to-r from-[#a34ee5]/10 to-[#fec603]/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#a34ee5] to-[#fec603] rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Répondre à l'abonné</h2>
                    <p className="text-sm text-gray-400">{selectedAbonnement.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAbonnement(null)}
                  className="p-2 bg-[#41124f]/40 hover:bg-[#41124f]/60 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Votre message
              </label>
              <textarea
                className="w-full bg-[#41124f]/40 border border-[#a34ee5]/30 rounded-xl p-4 h-40 text-white placeholder-gray-600 focus:outline-none focus:border-[#a34ee5]/60 transition-all resize-none"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Écrivez votre réponse ici..."
              />

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedAbonnement(null)}
                  className="flex-1 px-6 py-3 bg-[#41124f]/40 border border-[#a34ee5]/30 text-white rounded-xl font-bold hover:bg-[#41124f]/60 transition-all"
                >
                  Annuler
                </button>

                <button
                  onClick={handleReply}
                  disabled={replyLoading || !replyMessage.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] hover:from-[#7828a8] hover:to-[#a34ee5] text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {replyLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeAbonnement;