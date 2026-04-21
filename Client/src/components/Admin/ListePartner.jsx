// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const ListPartners = () => {
//   const [partenaires, setPartenaires] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortOrder, setSortOrder] = useState('newest');
//   const [expandedPartner, setExpandedPartner] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [partnersPerPage] = useState(6);
//   const [deleteConfirmId, setDeleteConfirmId] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [deleteError, setDeleteError] = useState(null);
//   const [deleteSuccess, setDeleteSuccess] = useState(false);
//   const navigate = useNavigate();
//   const apiUrl = import.meta.env.VITE_API_BACKEND;

//   const fetchPartenaires = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(apiUrl + "/api/partners/", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('accessToken')}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`Erreur HTTP! statut: ${response.status}`);
//       }

//       const data = await response.json();
//       setPartenaires(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // if (!localStorage.getItem('accessToken')) {
//     //   navigate('/login');
//     //   return;
//     // }
//     fetchPartenaires();
//   }, [navigate]);

//   // Réinitialiser les états de notification après 3 secondes
//   useEffect(() => {
//     if (deleteSuccess || deleteError) {
//       const timer = setTimeout(() => {
//         setDeleteSuccess(false);
//         setDeleteError(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [deleteSuccess, deleteError]);

//   // Fonction pour supprimer un partenaire
//   const handleDeletePartner = async (id) => {
//     if (!id) {
//       setDeleteError("ID invalide, suppression impossible.");
//       return;
//     }
  
//     try {
//       setDeleteLoading(true);
  
//       // Effectuer la requête DELETE avec l'ID dans le corps de la requête
//       const response = await fetch(apiUrl + "/api/partners/", {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json', // Assurez-vous que le body est en JSON
//           Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Token d'authentification
//         },
//         body: JSON.stringify({ id }) // Passer l'ID du partenaire à supprimer dans le body
//       });
  
//       if (!response.ok) {
//         throw new Error(`Erreur lors de la suppression. Statut: ${response.status}`);
//       }
  
//       // Si la suppression réussit, mettre à jour l'état
//       setDeleteSuccess(true);
//       setDeleteError(null);
      
//       // Mise à jour de la liste des partenaires (enlever le partenaire supprimé)
//       setPartenaires(prevPartenaires => prevPartenaires.filter(partner => partner.id !== id));
  
//       // Vérifier si après suppression la page actuelle est vide, revenir à la page précédente
//       const remainingPartners = filteredPartenaires.filter(partner => partner.id !== id);
//       const maxPage = Math.max(1, Math.ceil(remainingPartners.length / partnersPerPage));
//       if (currentPage > maxPage) {
//         setCurrentPage(maxPage);
//       }
  
//     } catch (err) {
//       setDeleteError(err.message);
//       setDeleteSuccess(false);
//     } finally {
//       setDeleteLoading(false);
//     }
//   };
  
  
  

//   const safeString = (value) => (value ? value.toLowerCase() : '');

//   // Fonctions pour filtrer et trier les partenaires
//   const filteredPartenaires = partenaires.filter((p) =>
//     safeString(p.first_name).includes(searchTerm.toLowerCase()) ||
//     safeString(p.last_name).includes(searchTerm.toLowerCase()) ||
//     safeString(p.email).includes(searchTerm.toLowerCase()) ||
//     safeString(p.organisation).includes(searchTerm.toLowerCase())
//   );

//   const sortedPartenaires = [...filteredPartenaires].sort((a, b) => {
//     if (sortOrder === 'newest') {
//       return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
//     } else if (sortOrder === 'oldest') {
//       return new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now());
//     } else if (sortOrder === 'name') {
//       return (a.first_name + ' ' + a.last_name).localeCompare(b.first_name + ' ' + b.last_name);
//     }
//     return 0;
//   });

//   // Pagination
//   const indexOfLastPartner = currentPage * partnersPerPage;
//   const indexOfFirstPartner = indexOfLastPartner - partnersPerPage;
//   const currentPartners = sortedPartenaires.slice(indexOfFirstPartner, indexOfLastPartner);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const toggleExpand = (id) => {
//     if (expandedPartner === id) {
//       setExpandedPartner(null);
//     } else {
//       setExpandedPartner(id);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
//         <div className="text-center">
//           <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mx-auto"></div>
//           <p className="mt-4 text-lg text-gray-700">Chargement des partenaires...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-md max-w-lg w-full">
//           <div className="flex items-center">
//             <div className="py-1">
//               <svg className="w-6 h-6 mr-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//               </svg>
//             </div>
//             <div>
//               <h2 className="font-semibold text-lg">Une erreur est survenue</h2>
//               <p className="text-sm">{error}</p>
//               <button 
//                 className="mt-3 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition duration-150"
//                 onClick={() => window.location.reload()}
//               >
//                 Réessayer
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Notifications de succès/erreur */}
//         {deleteSuccess && (
//           <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50 flex items-center">
//             <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//             <span>Partenaire supprimé avec succès</span>
//           </div>
//         )}
        
//         {deleteError && (
//           <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50 flex items-center">
//             <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//             <span>Erreur lors de la suppression: {deleteError}</span>
//           </div>
//         )}

//         <div className="bg-white shadow-xl rounded-xl overflow-hidden">
//           {/* En-tête */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Partenaires</h1>
//                 <p className="text-blue-100 mt-1">
//                   {filteredPartenaires.length} {filteredPartenaires.length > 1 ? 'partenaires' : 'partenaire'} enregistrés
//                 </p>
//               </div>
//               <div className="flex items-center space-x-4 mt-4 md:mt-0">
//                 <button 
//                   onClick={() => navigate('/dashboard')}
//                   className="bg-white hover:bg-blue-50 text-blue-700 font-medium py-2 px-4 rounded-md text-sm transition duration-150 shadow-sm flex items-center"
//                 >
//                   <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                   </svg>
//                   Tableau de bord
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Barre de recherche et filtres */}
//           <div className="bg-white px-6 py-4 border-b border-gray-200">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div className="relative flex-grow">
//                 <input
//                   type="text"
//                   placeholder="Rechercher par nom, email ou organisation..."
//                   className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setCurrentPage(1); // Reset to page 1 when searching
//                   }}
//                 />
//                 <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//               <div className="flex-shrink-0">
//                 <select
//                   value={sortOrder}
//                   onChange={(e) => setSortOrder(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
//                 >
//                   <option value="newest">Plus récents</option>
//                   <option value="oldest">Plus anciens</option>
//                   <option value="name">Nom (A-Z)</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Liste des partenaires */}
//           <div className="px-6 py-4">
//             {sortedPartenaires.length === 0 ? (
//               <div className="text-center py-16">
//                 <svg className="mx-auto h-16 w-16 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//                 <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun partenaire trouvé</h3>
//                 <p className="mt-2 text-gray-500">
//                   {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Aucun partenaire enregistré pour le moment.'}
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {currentPartners.map((partner) => (
//                   <div key={partner.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
//                     <div 
//                       className={`px-6 py-4 cursor-pointer flex justify-between items-center hover:bg-blue-50 transition-colors ${expandedPartner === partner.id ? 'bg-blue-50' : ''}`}
//                       onClick={() => toggleExpand(partner.id)}
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-medium">
//                           {partner.first_name.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <h2 className="text-lg font-semibold text-gray-800">{partner.first_name} {partner.last_name}</h2>
//                           <p className="text-sm text-gray-600">{partner.email}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-3">
//                         <span className="text-xs text-gray-500 hidden md:block">
//                           {partner.created_at ? new Date(partner.created_at).toLocaleDateString() : 'Date inconnue'}
//                         </span>
//                         <div className={`transform transition-transform ${expandedPartner === partner.id ? 'rotate-180' : ''}`}>
//                           <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>
                    
//                     {expandedPartner === partner.id && (
//                       <div className="p-6 border-t border-gray-100 bg-white">
//                         <div className="bg-blue-50 p-4 rounded-lg mb-4">
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                               <p className="text-sm text-gray-500 mb-1">Organisation</p>
//                               <p className="text-gray-700 font-medium">{partner.organisation || 'Non spécifiée'}</p>
//                             </div>
//                             <div>
//                               <p className="text-sm text-gray-500 mb-1">Site Web</p>
//                               <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{partner.website_url || 'Non spécifié'}</a>
//                             </div>
//                             <div>
//                               <p className="text-sm text-gray-500 mb-1">Téléphone</p>
//                               <p className="text-gray-700">{partner.phone || 'Non spécifié'}</p>
//                             </div>
//                             <div>
//                               <p className="text-sm text-gray-500 mb-1">Date d'ajout</p>
//                               <p className="text-gray-700">{partner.created_at ? new Date(partner.created_at).toLocaleDateString() : 'Date inconnue'}</p>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex justify-between items-center flex-wrap gap-3">
//                           <span className="text-sm text-gray-500 md:hidden">
//                             {partner.created_at ? new Date(partner.created_at).toLocaleDateString() : 'Date inconnue'}
//                           </span>
//                           <div className="flex items-center space-x-4">
//                             <button
//                               className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 window.open(`mailto:${partner.email}?subject=Fondation Tamkine`);
//                               }}
//                             >
//                               <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                               </svg>
//                               Contacter par email
//                             </button>
                            
//                             {deleteConfirmId === partner.id ? (
//                               <div className="flex items-center space-x-2">
//                                 <button
//                                   disabled={deleteLoading}
//                                   className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleDeletePartner(partner.id);
//                                   }}
//                                 >
//                                   {deleteLoading ? (
//                                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                   ) : (
//                                     <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                     </svg>
//                                   )}
//                                   Confirmer
//                                 </button>
//                                 <button
//                                   className="flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setDeleteConfirmId(null);
//                                   }}
//                                 >
//                                   <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                   </svg>
//                                   Annuler
//                                 </button>
//                               </div>
//                             ) : (
//                               <button
//                                 className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   setDeleteConfirmId(partner.id);
//                                 }}
//                               >
//                                 <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                 </svg>
//                                 Supprimer
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Pagination */}
//             {sortedPartenaires.length > partnersPerPage && (
//               <div className="flex justify-center mt-8">
//                 <nav className="flex items-center">
//                   <button
//                     onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
//                     disabled={currentPage === 1}
//                     className={`px-3 py-1 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600'}`}
//                   >
//                     <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                   </button>
                  
//                   {[...Array(Math.ceil(sortedPartenaires.length / partnersPerPage))].map((_, index) => {
//                     const pageNumber = index + 1;
//                     // Display limited page numbers with ellipsis
//                     if (
//                       pageNumber === 1 || 
//                       pageNumber === Math.ceil(sortedPartenaires.length / partnersPerPage) ||
//                       (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
//                     ) {
//                       return (
//                         <button
//                           key={pageNumber}
//                           onClick={() => paginate(pageNumber)}
//                           className={`px-3 py-1 border-t border-b ${
//                             currentPage === pageNumber
//                               ? 'bg-blue-600 text-white font-medium'
//                               : 'bg-white text-blue-600 hover:bg-blue-50'
//                           }`}
//                         >
//                           {pageNumber}
//                         </button>
//                       );
//                     } else if (
//                       pageNumber === currentPage - 2 ||
//                       pageNumber === currentPage + 2
//                     ) {
//                       return (
//                         <span key={pageNumber} className="px-2 py-1 border-t border-b text-gray-500">
//                           ...
//                         </span>
//                       );
//                     }
//                     return null;
//                   })}
                  
//                   <button
//                     onClick={() => paginate(currentPage < Math.ceil(sortedPartenaires.length / partnersPerPage) ? currentPage + 1 : currentPage)}
//                     disabled={currentPage === Math.ceil(sortedPartenaires.length / partnersPerPage)}
//                     className={`px-3 py-1 rounded-r-md border ${currentPage === Math.ceil(sortedPartenaires.length / partnersPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600'}`}
//                   >
//                     <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </button>
//                 </nav>
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Footer */}
//         <div className="mt-6 text-center text-sm text-gray-500">
//           {/* <p>© {new Date().getFullYear()} Fondation Tamkine. Tous droits réservés.</p> */}
//           <p>© {new Date().getFullYear()} Jorfof Club. Tous droits réservés.</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ListPartners;

import React, { useEffect, useState } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";;
import { Link } from "react-router-dom";
import { Loader2, PlusCircle, Globe } from "lucide-react";

const ListPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger la liste des partenaires depuis ton backend Django
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get(CONFIG.API_PARTNER_LIST);
        setPartners(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        setError("Impossible de charger la liste des partenaires.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Si en cours de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
        <span className="ml-2 text-gray-600">Chargement des partenaires...</span>
      </div>
    );
  }

  // Si erreur
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white shadow rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            🤝 Liste des partenaires
          </h1>
          <Link
            to="/partners/new"
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Ajouter un partenaire
          </Link>
        </div>

        {partners.length === 0 ? (
          <p className="text-center text-gray-500">Aucun partenaire trouvé.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="border rounded-2xl shadow-sm hover:shadow-md transition bg-white"
              >
                {/* Image de couverture */}
                {partner.couverture ? (
                  <img
                    src={partner.couverture}
                    alt={partner.titre_fr}
                    className="w-full h-40 object-cover rounded-t-2xl"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-t-2xl text-gray-400">
                    📷 Pas d'image
                  </div>
                )}

                <div className="p-4">
                  {/* Titre */}
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {partner.titre_fr}
                  </h2>

                  {/* Description courte */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {partner.description_fr || "Aucune description disponible."}
                  </p>

                  {/* Lien externe */}
                  {partner.site_url && (
                    <a
                      href={partner.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 text-sm hover:underline"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Voir le site
                    </a>
                  )}

                  {/* Vidéo (optionnelle) */}
                  {partner.video && (
                    <video
                      src={partner.video}
                      controls
                      className="w-full mt-3 rounded-lg"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPartners;
