import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListeRejoindre = () => {
  const [rejoindres, setRejoindres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedRejoindre, setExpandedRejoindre] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rejoindresPerPage] = useState(6);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  const fetchRejoindres = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl + "/api/rejoindre/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const data = await response.json();
      setRejoindres(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejoindres();
  }, [navigate]);

  // Réinitialiser les états de notification après 3 secondes
  useEffect(() => {
    if (deleteSuccess || deleteError) {
      const timer = setTimeout(() => {
        setDeleteSuccess(false);
        setDeleteError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess, deleteError]);

  // Fonction pour supprimer une demande
  const handleDeleteRejoindre = async (id) => {
    try {
      setDeleteLoading(true);
      const response = await fetch(`${apiUrl}/api/rejoindre/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      
      // Mise à jour réussie - mettre à jour l'état de succès
      setDeleteSuccess(true);
      setDeleteError(null);
      setDeleteConfirmId(null);
      
      // Mise à jour de la liste des demandes
      setRejoindres(prevRejoindres => prevRejoindres.filter(rejoindre => rejoindre.id !== id));
      
      // Vérifier si après suppression la page actuelle est vide, revenir à la page précédente
      const remainingRejoindres = filteredRejoindres.filter(rejoindre => rejoindre.id !== id);
      const maxPage = Math.max(1, Math.ceil(remainingRejoindres.length / rejoindresPerPage));
      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
      }
      
    } catch (err) {
      setDeleteError(err.message);
      setDeleteSuccess(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredRejoindres = rejoindres.filter(item =>
    (item.nom && item.nom.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.message && item.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedRejoindres = [...filteredRejoindres].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now());
    } else if (sortOrder === 'name') {
      return a.nom.localeCompare(b.nom);
    }
    return 0;
  });

  // Pagination
  const indexOfLastRejoindre = currentPage * rejoindresPerPage;
  const indexOfFirstRejoindre = indexOfLastRejoindre - rejoindresPerPage;
  const currentRejoindres = sortedRejoindres.slice(indexOfFirstRejoindre, indexOfLastRejoindre);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleExpand = (id) => {
    if (expandedRejoindre === id) {
      setExpandedRejoindre(null);
    } else {
      setExpandedRejoindre(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-md max-w-lg w-full">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="w-6 h-6 mr-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Une erreur est survenue</h2>
              <p className="text-sm">{error}</p>
              <button 
                className="mt-3 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition duration-150"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Notifications de succès/erreur */}
        {deleteSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50 flex items-center">
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Demande supprimée avec succès</span>
          </div>
        )}
        
        {deleteError && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50 flex items-center">
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Erreur lors de la suppression: {deleteError}</span>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Demandes de Rejoindre</h1>
                <p className="text-blue-100 mt-1">
                  {filteredRejoindres.length} {filteredRejoindres.length > 1 ? 'demandes' : 'demande'} reçues
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-white hover:bg-blue-50 text-blue-700 font-medium py-2 px-4 rounded-md text-sm transition duration-150 shadow-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Tableau de bord
                </button>
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou message..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to page 1 when searching
                  }}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="name">Nom (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des demandes */}
          <div className="px-6 py-4">
            {sortedRejoindres.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune demande trouvée</h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Aucune demande de rejoindre pour le moment.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentRejoindres.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div 
                      className={`px-6 py-4 cursor-pointer flex justify-between items-center hover:bg-blue-50 transition-colors ${expandedRejoindre === item.id ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-medium">
                          {item.nom ? item.nom.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">{item.nom}</h2>
                          <p className="text-sm text-gray-600">{item.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 hidden md:block">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                          }) : 'Date inconnue'}
                        </span>
                        <div className={`transform transition-transform ${expandedRejoindre === item.id ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {expandedRejoindre === item.id && (
                      <div className="p-6 border-t border-gray-100 bg-white">
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <p className="text-gray-700 whitespace-pre-line">{item.message}</p>
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-3">
                          <span className="text-sm text-gray-500 md:hidden">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric'
                            }) : 'Date inconnue'}
                          </span>
                          <div className="flex items-center space-x-4">
                            <button
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`mailto:${item.email}?subject=Réponse à votre demande&body=Bonjour ${item.nom},`);
                              }}
                            >
                              <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Répondre par email
                            </button>
                            
                            {deleteConfirmId === item.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  disabled={deleteLoading}
                                  className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRejoindre(item.id);
                                  }}
                                >
                                  {deleteLoading ? (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  Confirmer
                                </button>
                                <button
                                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(null);
                                  }}
                                >
                                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <button
                                className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(item.id);
                                }}
                              >
                                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {sortedRejoindres.length > rejoindresPerPage && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600'}`}
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {[...Array(Math.ceil(sortedRejoindres.length / rejoindresPerPage))].map((_, index) => {
                    const pageNumber = index + 1;
                    // Display limited page numbers with ellipsis
                    if (
                      pageNumber === 1 || 
                      pageNumber === Math.ceil(sortedRejoindres.length / rejoindresPerPage) ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-3 py-1 border-t border-b ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white font-medium'
                              : 'bg-white text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span key={pageNumber} className="px-2 py-1 border-t border-b text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage < Math.ceil(sortedRejoindres.length / rejoindresPerPage) ? currentPage + 1 : currentPage)}
                    disabled={currentPage === Math.ceil(sortedRejoindres.length / rejoindresPerPage)}
                    className={`px-3 py-1 rounded-r-md border ${currentPage === Math.ceil(sortedRejoindres.length / rejoindresPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600'}`}
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {/* <p>© {new Date().getFullYear()} Fondation Tamkine. Tous droits réservés.</p> */}
          <p>© {new Date().getFullYear()} Jorfof Club. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default ListeRejoindre;