import React, { useEffect, useState } from "react";
import { 
  Trash2, Mail, CheckCircle, Loader2, X, Send, Clock,
  Filter, Search, MessageSquare, AlertCircle, Eye, Tag, Calendar, Zap, ChevronLeft, ChevronRight
} from "lucide-react";
import CONFIG from "../../config/config.js";

const ListeContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [viewMode, setViewMode] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 🔹 Fetch contacts depuis l'API
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(CONFIG.API_CONTACT_LIST);
      if (!res.ok) throw new Error("Erreur de chargement des contacts");
      const data = await res.json();
      setContacts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les contacts");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // 🔹 Supprimer un contact
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce contact ?")) return;

    try {
      const res = await fetch(CONFIG.API_CONTACT_DELETE(id), { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");
      setContacts(contacts.filter(c => c.id !== id));
      setSuccessMessage("✨ Contact supprimé !");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    }
  };

  // 🔹 Répondre à un contact
  const handleReply = async () => {
    if (!replyMessage.trim()) {
      setError("Veuillez écrire un message");
      return;
    }

    setReplyLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_CONTACT_LIST}${selectedContact.id}/reply/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyMessage })
      });

      if (res.ok) {
        setSuccessMessage("✨ Réponse envoyée !");
        setContacts(contacts.map(c =>
          c.id === selectedContact.id ? { ...c, is_replied: true } : c
        ));
        setSelectedContact(null);
        setReplyMessage("");
        setViewMode(null);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi");
    }
    setReplyLoading(false);
  };

  // 🔹 Filtrage + recherche
  const filteredContacts = contacts.filter(item => {
    const matchesFilter = filter === "all"
      ? true
      : filter === "replied"
        ? item.is_replied
        : !item.is_replied;

    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    return matchesFilter && matchesSearch;
  });

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // 🔹 Stats
  const stats = {
    total: contacts.length,
    pending: contacts.filter(c => !c.is_replied).length,
    replied: contacts.filter(c => c.is_replied).length
  };

  // 🔹 Config catégories
  const getCategoryConfig = category => {
    const configs = {
      general: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/40" },
      support: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/40" },
      partnership: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/40" },
      other: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/40" },
    };
    return configs[category] || configs.other;
  };

  // 🔹 Loading screen
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#a34ee5]/30 border-t-[#fec603] rounded-full animate-spin"></div>
        <span className="text-gray-400 font-medium">Chargement...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative pb-16 p-6">

      {/* Messages d'erreur / succès */}
      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
        <span className="text-red-400">{error}</span>
        <button onClick={() => setError(null)} className="text-red-400"><X /></button>
      </div>}

      {successMessage && <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
        <span className="text-green-400">{successMessage}</span>
        <button onClick={() => setSuccessMessage(null)} className="text-green-400"><X /></button>
      </div>}

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 p-4 bg-[#41124f]/20 border border-[#a34ee5]/30 rounded-xl text-white">
          <p className="text-xs">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="flex-1 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-white">
          <p className="text-xs">En attente</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="flex-1 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-white">
          <p className="text-xs">Répondus</p>
          <p className="text-2xl font-bold">{stats.replied}</p>
        </div>
      </div>

      {/* Filtres + recherche */}
      <div className="flex gap-2 mb-6 items-center flex-wrap">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-xl font-bold ${filter==="all"?"bg-purple-500 text-white":"bg-[#41124f]/40 text-gray-400"}`}>Tous</button>
        <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-xl font-bold ${filter==="pending"?"bg-yellow-500 text-white":"bg-[#41124f]/40 text-gray-400"}`}>En attente</button>
        <button onClick={() => setFilter("replied")} className={`px-4 py-2 rounded-xl font-bold ${filter==="replied"?"bg-green-500 text-white":"bg-[#41124f]/40 text-gray-400"}`}>Répondus</button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 py-2 rounded-xl bg-[#41124f]/40 text-white border border-[#a34ee5]/30"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des contacts */}
      {currentContacts.length === 0 ? (
        <div className="text-center text-white py-32">
          Aucun message
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentContacts.map(item => {
            const categoryConfig = getCategoryConfig(item.category);
            return (
              <div key={item.id} className="bg-[#41124f]/20 border border-[#a34ee5]/30 rounded-xl p-4 text-white flex flex-col justify-between">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm">{item.email}</p>
                  <p className="text-xs">{item.subject || "Sans sujet"}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.category && <span className={`px-2 py-1 text-xs rounded-lg ${categoryConfig.bg} ${categoryConfig.text} border ${categoryConfig.border}`}>{item.category}</span>}
                    {item.is_replied 
                      ? <span className="px-2 py-1 text-xs rounded-lg bg-green-500/20 border border-green-500/30 text-green-400">Répondu</span>
                      : <span className="px-2 py-1 text-xs rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">En attente</span>
                    }
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setSelectedContact(item); setViewMode("view"); }} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-xl py-2 text-white flex items-center justify-center gap-2"><Eye />Voir</button>
                  <button onClick={() => { setSelectedContact(item); setViewMode("reply"); setReplyMessage(""); }} className="flex-1 bg-purple-500 text-white rounded-xl py-2 flex items-center justify-center gap-2"><Send />Répondre</button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 bg-red-500/20 hover:bg-red-500/40 rounded-xl py-2 flex items-center justify-center gap-2"><Trash2 /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-2 bg-[#41124f]/40 rounded-xl"><ChevronLeft /></button>
          {[...Array(totalPages)].map((_, idx) => {
            const page = idx+1;
            return <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-2 rounded-xl ${currentPage===page?"bg-purple-500 text-white":"bg-[#41124f]/40 text-gray-400"}`}>{page}</button>
          })}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="p-2 bg-[#41124f]/40 rounded-xl"><ChevronRight /></button>
        </div>
      )}

      {/* Modal Voir / Répondre */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a]/95 border border-[#a34ee5]/30 rounded-2xl w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{viewMode==="view"?"Détails du message":"Répondre"}</h2>
              <button onClick={() => { setSelectedContact(null); setViewMode(null); }} className="text-white"><X /></button>
            </div>

            {viewMode==="view" ? (
              <div className="space-y-4 text-white">
                <p><span className="font-bold">Email:</span> {selectedContact.email}</p>
                <p><span className="font-bold">Sujet:</span> {selectedContact.subject || "Sans sujet"}</p>
                <p><span className="font-bold">Message:</span> {selectedContact.message}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-white"><span className="font-bold">Sujet original:</span> {selectedContact.subject || "Sans sujet"}</p>
                <textarea
                  className="w-full p-4 h-40 rounded-xl bg-[#41124f]/40 border border-[#a34ee5]/30 text-white"
                  placeholder="Écrivez votre réponse..."
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedContact(null); setViewMode(null); }} className="flex-1 bg-[#41124f]/40 text-white rounded-xl py-2">Annuler</button>
                  <button onClick={handleReply} disabled={!replyMessage.trim() || replyLoading} className="flex-1 bg-purple-500 text-white rounded-xl py-2">{replyLoading?"Envoi...":"Envoyer"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ListeContacts;
