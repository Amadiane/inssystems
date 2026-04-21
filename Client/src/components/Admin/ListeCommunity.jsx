// import React, { useEffect, useState } from "react";
// import { Users, Loader2, Trash2, Eye, Send, X, Calendar, Briefcase, MessageCircle, CheckCircle, Clock } from "lucide-react";
// import CONFIG from "../../config/config.js";

// const ListeCommunity = () => {
//   const [communityList, setCommunityList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [replyMessage, setReplyMessage] = useState(null);
//   const [sending, setSending] = useState(false);
//   const [filterStatus, setFilterStatus] = useState("all"); // all, replied, pending

//   // 📥 Charger la liste
//   useEffect(() => {
//     fetchCommunity();
//   }, []);

//   const fetchCommunity = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(CONFIG.API_COMMUNITY_LIST);
//       if (!response.ok) throw new Error("Erreur de chargement");
//       const data = await response.json();
//       setCommunityList(data);
//     } catch (err) {
//       console.error("Erreur lors du chargement :", err);
//       setError("Impossible de charger la liste des membres.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 📬 Préparer la réponse
//   const handleReply = (member) => {
//     setSelectedMember(member);
//     setReplyMessage("");
//   };

//   // 📤 Envoyer la réponse par mail
//   const sendReply = async () => {
//     if (!replyMessage.trim()) {
//       setError("Veuillez écrire un message.");
//       return;
//     }

//     setSending(true);
//     setError(null);

//     try {
//       const response = await fetch(CONFIG.API_COMMUNITY_REPLY(selectedMember.id), {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ reply: replyMessage }),
//       });
      
//       if (response.ok) {
//         setSuccessMessage("Réponse envoyée avec succès !");
        
//         // 🧠 Met à jour le membre dans le state local
//         setCommunityList(prevList =>
//           prevList.map(m =>
//             m.id === selectedMember.id ? { ...m, is_replied: true } : m
//           )
//         );

//         // Nettoyage
//         setSelectedMember(null);
//         setReplyMessage(null);
//       } else {
//         setError("Erreur lors de l'envoi du mail.");
//       }
//     } catch (err) {
//       console.error("Erreur d'envoi :", err);
//       setError("Erreur lors de l'envoi de l'email");
//     } finally {
//       setSending(false);
//     }
//   };

//   // 🗑️ Supprimer
//   const handleDelete = async (id) => {
//     if (!window.confirm("Voulez-vous vraiment supprimer ce membre ?")) return;

//     try {
//       const response = await fetch(CONFIG.API_COMMUNITY_DELETE(id), {
//         method: "DELETE",
//       });
      
//       if (!response.ok) throw new Error("Erreur de suppression");
      
//       setCommunityList((prev) => prev.filter((item) => item.id !== id));
//       setSuccessMessage("Membre supprimé avec succès !");
//     } catch (err) {
//       console.error("Erreur lors de la suppression :", err);
//       setError("Erreur lors de la suppression");
//     }
//   };

//   // Filtrer les membres
//   const filteredMembers = communityList.filter(member => {
//     if (filterStatus === "replied") return member.is_replied;
//     if (filterStatus === "pending") return !member.is_replied;
//     return true;
//   });

//   // Couleurs par rôle
//   const getRoleColor = (role) => {
//     const colors = {
//       player: "bg-blue-500/20 text-blue-300 border-blue-500/50",
//       coach: "bg-green-500/20 text-green-300 border-green-500/50",
//       fan: "bg-purple-500/20 text-purple-300 border-purple-500/50",
//       volunteer: "bg-orange-500/20 text-orange-300 border-orange-500/50",
//       sponsor: "bg-pink-500/20 text-pink-300 border-pink-500/50",
//       other: "bg-gray-500/20 text-gray-300 border-gray-500/50",
//     };
//     return colors[role] || colors.other;
//   };

//   const getRoleLabel = (role) => {
//     const labels = {
//       player: "Joueur",
//       coach: "Entraîneur",
//       fan: "Supporter",
//       volunteer: "Bénévole",
//       sponsor: "Sponsor",
//       other: "Autre",
//     };
//     return labels[role] || role;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="animate-spin inline-block text-orange-500" size={40} />
//           <p className="mt-4 text-gray-300 text-lg">Chargement...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden">
//       {/* Effets de fond lumineux */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/3 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-1/2 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
//       </div>

//       {/* Grille de fond */}
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

//       <div className="relative max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-lg"></div>
//               <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-xl">
//                 <Users className="w-6 h-6 text-white" />
//               </div>
//             </div>
//             <div>
//               <h1 className="text-2xl md:text-3xl font-black text-white">
//                 Membres de la Communauté
//               </h1>
//               <p className="text-sm text-gray-400 mt-1">
//                 {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''}
//               </p>
//             </div>
//           </div>

//           {/* Filtres de statut */}
//           <div className="flex gap-2 flex-wrap">
//             <button
//               onClick={() => setFilterStatus("all")}
//               className={`px-4 py-2 rounded-lg font-semibold transition-all ${
//                 filterStatus === "all"
//                   ? "bg-orange-500 text-white"
//                   : "bg-white/10 text-gray-300 hover:bg-white/20"
//               }`}
//             >
//               Tous ({communityList.length})
//             </button>
//             <button
//               onClick={() => setFilterStatus("pending")}
//               className={`px-4 py-2 rounded-lg font-semibold transition-all ${
//                 filterStatus === "pending"
//                   ? "bg-yellow-500 text-white"
//                   : "bg-white/10 text-gray-300 hover:bg-white/20"
//               }`}
//             >
//               En attente ({communityList.filter(c => !c.is_replied).length})
//             </button>
//             <button
//               onClick={() => setFilterStatus("replied")}
//               className={`px-4 py-2 rounded-lg font-semibold transition-all ${
//                 filterStatus === "replied"
//                   ? "bg-green-500 text-white"
//                   : "bg-white/10 text-gray-300 hover:bg-white/20"
//               }`}
//             >
//               Répondus ({communityList.filter(c => c.is_replied).length})
//             </button>
//           </div>
//         </div>

//         {/* Messages */}
//         {error && (
//           <div className="bg-red-500/20 border-2 border-red-500/50 text-red-300 p-4 mb-6 rounded-xl backdrop-blur-sm">
//             {error}
//           </div>
//         )}
//         {successMessage && (
//           <div className="bg-green-500/20 border-2 border-green-500/50 text-green-300 p-4 mb-6 rounded-xl backdrop-blur-sm">
//             {successMessage}
//           </div>
//         )}

//         {/* Liste des membres */}
//         <div className="space-y-4">
//           {filteredMembers.length === 0 ? (
//             <div className="text-center py-12">
//               <Users size={64} className="mx-auto text-gray-600 mb-4" />
//               <p className="text-gray-400 text-lg">Aucun membre trouvé</p>
//             </div>
//           ) : (
//             filteredMembers.map((member) => (
//               <div key={member.id} className="relative group">
//                 <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
//                 <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50">
                  
//                   <div className="p-4 md:p-6">
//                     {/* Header du membre */}
//                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2 flex-wrap">
//                           <h3 className="text-lg font-bold text-white">
//                             {member.name}
//                           </h3>
//                           {member.is_replied ? (
//                             <span className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
//                               <CheckCircle size={14} /> Répondu
//                             </span>
//                           ) : (
//                             <span className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
//                               <Clock size={14} /> En attente
//                             </span>
//                           )}
//                           <span className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getRoleColor(member.role)}`}>
//                             <Briefcase size={12} />
//                             {getRoleLabel(member.role)}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-400 mb-2">📧 {member.email}</p>
//                         {member.created_at && (
//                           <span className="flex items-center gap-1 text-xs text-gray-500">
//                             <Calendar size={12} />
//                             Inscrit le {new Date(member.created_at).toLocaleDateString("fr-FR", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                               hour: "2-digit",
//                               minute: "2-digit"
//                             })}
//                           </span>
//                         )}
//                       </div>

//                       {/* Actions */}
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => setSelectedMember(member)}
//                           className="bg-blue-500/20 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold flex items-center gap-2"
//                         >
//                           <Eye size={16} /> Voir
//                         </button>
//                         <button
//                           onClick={() => handleReply(member)}
//                           className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all text-sm font-semibold flex items-center gap-2"
//                         >
//                           <Send size={16} /> Répondre
//                         </button>
//                         <button
//                           onClick={() => handleDelete(member.id)}
//                           className="bg-red-500/20 border border-red-500/50 text-red-300 p-2 rounded-lg hover:bg-red-500/30 transition-all"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Message si présent */}
//                     {member.message && (
//                       <div className="bg-white/5 p-3 rounded-lg border border-white/10">
//                         <p className="text-xs font-bold text-purple-400 mb-1 flex items-center gap-1">
//                           <MessageCircle size={12} /> MESSAGE
//                         </p>
//                         <p className="text-gray-300 text-sm line-clamp-2">{member.message}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* 🔍 MODAL DÉTAILS */}
//         {selectedMember && replyMessage === null && (
//           <div 
//             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
//             onClick={() => setSelectedMember(null)}
//           >
//             <div 
//               className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50"></div>
//               <div className="relative bg-[#0a0e27] rounded-3xl shadow-2xl border-2 border-orange-500/30 overflow-hidden">
                
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 p-6 md:p-8 border-b border-white/10">
//                   <div className="flex justify-between items-start gap-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-3 flex-wrap">
//                         <h2 className="text-2xl md:text-3xl font-black text-white">
//                           {selectedMember.name}
//                         </h2>
//                         {selectedMember.is_replied ? (
//                           <span className="flex items-center gap-1 bg-green-500/30 border border-green-500/50 text-green-300 px-3 py-1.5 rounded-full text-sm font-semibold">
//                             <CheckCircle size={16} /> Répondu
//                           </span>
//                         ) : (
//                           <span className="flex items-center gap-1 bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 px-3 py-1.5 rounded-full text-sm font-semibold">
//                             <Clock size={16} /> En attente
//                           </span>
//                         )}
//                         <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold ${getRoleColor(selectedMember.role)}`}>
//                           <Briefcase size={14} />
//                           {getRoleLabel(selectedMember.role)}
//                         </span>
//                       </div>
//                       <p className="text-lg text-orange-400 font-semibold mb-2">
//                         📧 {selectedMember.email}
//                       </p>
//                       {selectedMember.created_at && (
//                         <span className="flex items-center gap-1 text-sm text-gray-400">
//                           <Calendar size={14} />
//                           Inscrit le {new Date(selectedMember.created_at).toLocaleString("fr-FR")}
//                         </span>
//                       )}
//                     </div>
//                     <button
//                       onClick={() => setSelectedMember(null)}
//                       className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
//                     >
//                       <X size={20} />
//                     </button>
//                   </div>
//                 </div>
                
//                 {/* Contenu */}
//                 <div className="p-6 md:p-8">
//                   {/* Message */}
//                   {selectedMember.message ? (
//                     <div className="bg-white/5 p-4 rounded-xl border border-purple-500/30 mb-6">
//                       <p className="text-xs font-bold text-purple-400 mb-2">MESSAGE DU MEMBRE</p>
//                       <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedMember.message}</p>
//                     </div>
//                   ) : (
//                     <div className="bg-white/5 p-4 rounded-xl border border-gray-500/30 mb-6">
//                       <p className="text-gray-400 italic text-center">Aucun message laissé</p>
//                     </div>
//                   )}

//                   {/* Actions */}
//                   <div className="flex flex-col sm:flex-row gap-3">
//                     <button
//                       onClick={() => {
//                         handleReply(selectedMember);
//                       }}
//                       className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-green-500/50 transition-all font-bold flex items-center justify-center gap-2"
//                     >
//                       <Send size={18} /> Répondre
//                     </button>
//                     <button
//                       onClick={() => {
//                         handleDelete(selectedMember.id);
//                         setSelectedMember(null);
//                       }}
//                       className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-red-500/50 transition-all font-bold flex items-center justify-center gap-2"
//                     >
//                       <Trash2 size={18} /> Supprimer
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 📬 MODAL RÉPONSE */}
//         {selectedMember && replyMessage !== null && (
//           <div 
//             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
//             onClick={() => {
//               setSelectedMember(null);
//               setReplyMessage(null);
//             }}
//           >
//             <div 
//               className="relative max-w-2xl w-full"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50"></div>
//               <div className="relative bg-[#0a0e27] rounded-3xl shadow-2xl border-2 border-green-500/30 overflow-hidden">
                
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 border-b border-white/10">
//                   <div className="flex justify-between items-start gap-4">
//                     <div className="flex-1">
//                       <h2 className="text-xl md:text-2xl font-black text-white mb-2">
//                         Répondre à {selectedMember.name}
//                       </h2>
//                       <p className="text-sm text-gray-400 mb-2">
//                         📧 {selectedMember.email}
//                       </p>
//                       <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getRoleColor(selectedMember.role)}`}>
//                         <Briefcase size={12} />
//                         {getRoleLabel(selectedMember.role)}
//                       </span>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setSelectedMember(null);
//                         setReplyMessage(null);
//                       }}
//                       className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
//                     >
//                       <X size={20} />
//                     </button>
//                   </div>
//                 </div>
                
//                 {/* Formulaire */}
//                 <div className="p-6">
//                   {selectedMember.message && (
//                     <div className="bg-white/5 p-3 rounded-lg border border-white/10 mb-4">
//                       <p className="text-xs font-bold text-orange-400 mb-1">MESSAGE ORIGINAL</p>
//                       <p className="text-white text-sm">{selectedMember.message}</p>
//                     </div>
//                   )}

//                   <label className="block font-semibold text-gray-300 mb-2">Votre réponse *</label>
//                   <textarea
//                     value={replyMessage}
//                     onChange={(e) => setReplyMessage(e.target.value)}
//                     rows="6"
//                     placeholder="Écrivez votre réponse ici..."
//                     className="w-full px-4 py-3 bg-white/10 border-2 border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all resize-none"
//                   ></textarea>

//                   <div className="flex gap-3 mt-6">
//                     <button
//                       onClick={sendReply}
//                       disabled={sending || !replyMessage.trim()}
//                       className="relative group overflow-hidden flex-1"
//                     >
//                       <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
//                       <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-2xl hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
//                         {sending ? (
//                           <>
//                             <Loader2 className="animate-spin" size={18} />
//                             Envoi...
//                           </>
//                         ) : (
//                           <>
//                             <Send size={18} /> Envoyer
//                           </>
//                         )}
//                       </div>
//                     </button>
//                     <button
//                       onClick={() => {
//                         setSelectedMember(null);
//                         setReplyMessage(null);
//                       }}
//                       className="bg-gray-600/30 border-2 border-gray-500/50 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-600/50 transition-all font-semibold"
//                     >
//                       Annuler
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ListeCommunity;



import React, { useEffect, useState } from "react";
import { 
  Trash2, 
  Mail, 
  CheckCircle, 
  Loader2, 
  X, 
  Send,
  Clock,
  Filter,
  Search,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Tag,
  Calendar,
  Users,
  Briefcase
} from "lucide-react";
import CONFIG from "../../config/config.js";

// 🎨 Centralisation des couleurs VIALI
const COLORS = {
  gradientStart: "#FDB71A",
  gradientMid: "#F47920",
  gradientEnd: "#E84E1B",
  textPrimary: "#1f2937",
  textSecondary: "#4b5563",
};

// 🎯 Composants réutilisables
const GradientButton = ({ onClick, children, disabled = false, variant = "primary", className = "", type = "button" }) => {
  const variants = {
    primary: "bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white shadow-lg shadow-orange-400/40 hover:shadow-xl hover:shadow-orange-400/50",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-400/40 hover:shadow-xl hover:shadow-red-400/50",
    secondary: "bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Alert = ({ type, message, onClose }) => {
  const types = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: AlertCircle,
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: CheckCircle,
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.text} border-2 ${config.border} p-4 rounded-xl mb-6 flex items-center gap-3 shadow-lg`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X size={18} />
      </button>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative w-16 h-16 md:w-20 md:h-20">
      <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-t-[#F47920] rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-gray-700 font-semibold text-lg">Chargement...</p>
  </div>
);

const ListeCommunity = () => {
  const [communityList, setCommunityList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [viewMode, setViewMode] = useState(null); // "view" or "reply"
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Charger la liste
  const fetchCommunity = async () => {
    setLoading(true);
    try {
      const response = await fetch(CONFIG.API_COMMUNITY_LIST);
      if (!response.ok) throw new Error("Erreur de chargement");
      const data = await response.json();
      setCommunityList(data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
      setError("Impossible de charger la liste des membres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, []);

  // Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce membre ?")) return;

    try {
      const response = await fetch(CONFIG.API_COMMUNITY_DELETE(id), {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Erreur de suppression");
      
      setCommunityList((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage("Membre supprimé avec succès !");
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setError("Erreur lors de la suppression");
    }
  };

  // Répondre
  const handleReply = async () => {
    if (!replyMessage.trim()) {
      setError("Veuillez écrire un message.");
      return;
    }

    setReplyLoading(true);
    setError(null);

    try {
      const response = await fetch(CONFIG.API_COMMUNITY_REPLY(selectedMember.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyMessage }),
      });
      
      if (response.ok) {
        setSuccessMessage("Réponse envoyée avec succès !");
        
        setCommunityList(prevList =>
          prevList.map(m =>
            m.id === selectedMember.id ? { ...m, is_replied: true } : m
          )
        );

        setSelectedMember(null);
        setReplyMessage("");
        setViewMode(null);
      } else {
        setError("Erreur lors de l'envoi du mail.");
      }
    } catch (err) {
      console.error("Erreur d'envoi :", err);
      setError("Erreur lors de l'envoi de l'email");
    } finally {
      setReplyLoading(false);
    }
  };

  // Filtrer et rechercher
  const filteredMembers = communityList.filter((item) => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "replied" ? item.is_replied :
      filter === "pending" ? !item.is_replied :
      true;
    
    const matchesSearch = 
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Statistiques
  const stats = {
    total: communityList.length,
    pending: communityList.filter(c => !c.is_replied).length,
    replied: communityList.filter(c => c.is_replied).length,
  };

  // Couleurs des rôles
  const getRoleConfig = (role) => {
    const configs = {
      partenaire: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      client: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      fournisseur: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      employe: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
      autres: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    };
    return configs[role] || configs.autres;
  };

  const getRoleLabel = (role) => {
    const labels = {
      partenaire: "Partenaire",
      client: "Client",
      fournisseur: "Fournisseur",
      employe: "Employé",
      autres: "Autres",
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {/* Decorative background */}
      <div className="fixed top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-[#FDB71A]/10 to-[#F47920]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-tr from-[#E84E1B]/10 to-[#FDB71A]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FDB71A] to-[#F47920] blur-xl opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-[#FDB71A] via-[#F47920] to-[#E84E1B] p-3 rounded-2xl shadow-xl shadow-orange-400/50">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E84E1B] via-[#F47920] to-[#FDB71A]">
                Membres de la Communauté
              </h1>
              <p className="text-gray-600 text-sm md:text-base font-medium">
                Gérez les membres et répondez aux demandes
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-bold">Total Membres</span>
              <Users className="w-5 h-5 text-[#F47920]" />
            </div>
            <p className="text-2xl md:text-3xl font-black text-gray-800">{stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-bold">En attente</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl md:text-3xl font-black text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-bold">Répondus</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl md:text-3xl font-black text-green-600">{stats.replied}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-2 border-orange-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filtres */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600" />
              <button
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  filter === "all"
                    ? "bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white shadow-lg shadow-orange-400/40"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setFilter("all")}
              >
                Tous
              </button>

              <button
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  filter === "pending"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setFilter("pending")}
              >
                En attente
              </button>

              <button
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  filter === "replied"
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setFilter("replied")}
              >
                Répondus
              </button>
            </div>

            {/* Recherche */}
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : currentMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FDB71A]/20 to-[#F47920]/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-[#F47920]" />
              </div>
              <p className="text-gray-600 font-bold text-lg">Aucun membre trouvé</p>
              <p className="text-gray-400 text-sm">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b-2 border-orange-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                        Membre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {currentMembers.map((member) => {
                      const roleConfig = getRoleConfig(member.role);
                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-orange-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-800">
                              #{member.id}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#FDB71A]/20 to-[#F47920]/20 rounded-full flex items-center justify-center">
                                <Mail className="w-4 h-4 text-[#F47920]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 text-xs font-bold ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                              <Briefcase className="w-3 h-3" />
                              {getRoleLabel(member.role)}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {member.created_at ? new Date(member.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              }) : 'N/A'}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            {member.is_replied ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                <CheckCircle className="w-3 h-3" />
                                Répondu
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                                <Clock className="w-3 h-3" />
                                En attente
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedMember(member);
                                  setViewMode("view");
                                }}
                                className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200 transition-colors"
                                title="Voir"
                              >
                                <Eye className="w-5 h-5" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedMember(member);
                                  setViewMode("reply");
                                  setReplyMessage("");
                                }}
                                className="p-2 rounded-lg bg-gradient-to-br from-[#FDB71A]/10 to-[#F47920]/10 text-[#F47920] hover:from-[#FDB71A]/20 hover:to-[#F47920]/20 transition-colors"
                                title="Répondre"
                              >
                                <Send className="w-5 h-5" />
                              </button>

                              <button
                                onClick={() => handleDelete(member.id)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-4 border-t-2 border-orange-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600 font-medium">
                    Page <span className="font-bold text-gray-800">{currentPage}</span> sur{" "}
                    <span className="font-bold text-gray-800">{totalPages}</span>
                    {" "}• Affichage de{" "}
                    <span className="font-bold text-gray-800">{startIndex + 1}</span>-
                    <span className="font-bold text-gray-800">{Math.min(endIndex, filteredMembers.length)}</span> sur{" "}
                    <span className="font-bold text-gray-800">{filteredMembers.length}</span> résultat(s)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white border-2 border-orange-200 text-[#F47920] hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page numbers */}
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
                            className={`px-3 py-2 rounded-lg font-bold text-sm transition-colors ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white shadow-lg shadow-orange-400/40"
                                : "bg-white border-2 border-orange-200 text-gray-700 hover:bg-orange-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={pageNum} className="text-gray-400">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white border-2 border-orange-200 text-[#F47920] hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODALE VUE/RÉPONSE */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-orange-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {viewMode === "view" ? (
                    <Eye className="w-6 h-6 text-white" />
                  ) : (
                    <Send className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {viewMode === "view" ? "Détails du membre" : "Répondre au membre"}
                  </h2>
                  <p className="text-orange-100 text-sm">{selectedMember.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setViewMode(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {viewMode === "view" ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                    <p className="text-xs font-bold text-orange-600 mb-1">EMAIL</p>
                    <p className="text-gray-800 font-medium">{selectedMember.email}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                    <p className="text-xs font-bold text-orange-600 mb-1">RÔLE</p>
                    <p className="text-gray-800 font-medium">{getRoleLabel(selectedMember.role)}</p>
                  </div>

                  {selectedMember.message && (
                    <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                      <p className="text-xs font-bold text-orange-600 mb-1">MESSAGE</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedMember.message}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedMember.created_at ? new Date(selectedMember.created_at).toLocaleString('fr-FR') : 'N/A'}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <GradientButton
                      onClick={() => setViewMode("reply")}
                      className="flex-1"
                    >
                      <Send className="w-5 h-5" />
                      Répondre
                      </GradientButton>
                                          <GradientButton
                                            variant="secondary"
                                            onClick={() => {
                                              setSelectedContact(null);
                                              setViewMode(null);
                                            }}
                                            className="flex-1"
                                          >
                                            Fermer
                                          </GradientButton>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="mb-4 bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                                          <p className="text-xs font-bold text-orange-600 mb-1">SUJET ORIGINAL</p>
                                          <p className="text-gray-800 font-medium">{selectedContact.subject || "Sans sujet"}</p>
                                        </div>
                      
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                          Votre message
                                        </label>
                                        <textarea
                                          className="w-full border-2 border-orange-200 rounded-xl p-4 h-40 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none"
                                          value={replyMessage}
                                          onChange={(e) => setReplyMessage(e.target.value)}
                                          placeholder="Écrivez votre réponse ici..."
                                        />
                      
                                        {/* Footer */}
                                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                          <GradientButton
                                            variant="secondary"
                                            onClick={() => {
                                              setSelectedContact(null);
                                              setViewMode(null);
                                            }}
                                            className="flex-1 sm:flex-none"
                                          >
                                            Annuler
                                          </GradientButton>
                      
                                          <GradientButton
                                            onClick={handleReply}
                                            disabled={replyLoading || !replyMessage.trim()}
                                            className="flex-1"
                                          >
                                            {replyLoading ? (
                                              <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Envoi en cours...
                                              </>
                                            ) : (
                                              <>
                                                <Send className="w-5 h-5" />
                                                Envoyer la réponse
                                              </>
                                            )}
                                          </GradientButton>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      };
                      
export default ListeCommunity;