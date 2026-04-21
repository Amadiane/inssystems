import React, { useEffect, useState } from 'react';

const PlatformPost = () => {
  // États pour le formulaire
  const [titleFr, setTitleFr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  // États pour l'interface
  const [showForm, setShowForm] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fonction pour récupérer les plateformes
  const fetchPlatforms = async () => {
    try {
      const res = await fetch(apiUrl + "api/platformlinks/");
      const data = await res.json();
      setPlatforms(data);
    } catch (err) {
      console.error("Erreur lors du chargement des plateformes:", err);
      setMessage("❌ Erreur lors du chargement des plateformes");
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setTitleFr("");
    setTitleEn("");
    setTitleAr("");
    setDescriptionFr("");
    setDescriptionEn("");
    setDescriptionAr("");
    setUrl("");
    setIcon(null);
    setEditingId(null);
  };

  // Fonction pour charger les données d'édition
  const loadEditData = (platform) => {
    setTitleFr(platform.title_fr || "");
    setTitleEn(platform.title_en || "");
    setTitleAr(platform.title_ar || "");
    setDescriptionFr(platform.description_fr || "");
    setDescriptionEn(platform.description_en || "");
    setDescriptionAr(platform.description_ar || "");
    setUrl(platform.url || "");
    setEditingId(platform.id);
    setShowForm(true);
  };

  // Fonction pour créer ou mettre à jour une plateforme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append('title_fr', titleFr);
    formData.append('title_en', titleEn);
    formData.append('title_ar', titleAr);
    formData.append('description_fr', descriptionFr);
    formData.append('description_en', descriptionEn);
    formData.append('description_ar', descriptionAr);
    formData.append('url', url);
    if (icon) formData.append('icon', icon);

    try {
      const requestUrl = editingId 
        ? `${apiUrl}api/platformlinks/${editingId}/`
        : `${apiUrl}api/platformlinks/`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method: method,
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setMessage(editingId ? "✅ Plateforme mise à jour avec succès !" : "✅ Plateforme ajoutée avec succès !");
      resetForm();
      fetchPlatforms();
      setShowForm(false);
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une plateforme
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette plateforme ?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}api/platformlinks/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setMessage("✅ Plateforme supprimée avec succès !");
      fetchPlatforms();
    } catch (error) {
      setMessage(`❌ Erreur lors de la suppression: ${error.message}`);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  // Fonction pour obtenir le titre selon la langue
  const getTitle = (platform) => {
    switch(currentLanguage) {
      case 'en': return platform.title_en || platform.title_fr;
      case 'ar': return platform.title_ar || platform.title_fr;
      default: return platform.title_fr;
    }
  };

  // Fonction pour obtenir la description selon la langue
  const getDescription = (platform) => {
    switch(currentLanguage) {
      case 'en': return platform.description_en || platform.description_fr;
      case 'ar': return platform.description_ar || platform.description_fr;
      default: return platform.description_fr;
    }
  };

  // Logique de pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPlatforms = platforms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(platforms.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Styles responsifs
  const styles = {
    container: {
      padding: '15px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: '20px',
      gap: '10px',
    },
    title: {
      fontSize: 'clamp(20px, 4vw, 24px)',
      margin: '10px 0',
      color: '#1C1C47',
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
    },
    button: {
      padding: '10px 15px',
      backgroundColor: '#1C1C47',
      color: 'white',
      fontSize: '14px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '120px',
      textAlign: 'center',
    },
    languageButton: {
      padding: '8px 12px',
      backgroundColor: '#f0f0f0',
      color: '#333',
      fontSize: '12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    activeLanguageButton: {
      backgroundColor: '#1C1C47',
      color: 'white',
      borderColor: '#1C1C47',
    },
    formContainer: {
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      marginBottom: '30px',
    },
    form: {
      display: 'grid',
      gap: '20px',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '15px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '8px',
      fontWeight: '600',
      color: '#333',
      fontSize: '14px',
    },
    input: {
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid #e0e0e0',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      outline: 'none',
    },
    textarea: {
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid #e0e0e0',
      minHeight: '100px',
      fontSize: '16px',
      fontFamily: 'inherit',
      resize: 'vertical',
      transition: 'border-color 0.3s ease',
      outline: 'none',
    },
    submitButton: {
      padding: '15px',
      backgroundColor: '#1C1C47',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      justifySelf: 'start',
      minWidth: '200px',
    },
    message: {
      marginTop: '15px',
      padding: '12px',
      borderRadius: '8px',
      fontWeight: '500',
    },
    platformList: {
      display: 'grid',
      gap: '15px',
    },
    platformCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    platformHeader: {
      padding: '20px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      transition: 'background-color 0.3s ease',
    },
    platformTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: '#1C1C47',
    },
    expandIcon: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1C1C47',
    },
    platformContent: {
      padding: '20px',
    },
    platformInfo: {
      margin: '12px 0',
      lineHeight: '1.5',
    },
    infoLabel: {
      fontWeight: '600',
      color: '#333',
    },
    platformActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px',
      flexWrap: 'wrap',
    },
    actionButton: {
      padding: '10px 15px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      minWidth: '100px',
      textAlign: 'center',
    },
    editButton: {
      backgroundColor: '#e3f2fd',
      color: '#1565c0',
    },
    deleteButton: {
      backgroundColor: '#ffebee',
      color: '#c62828',
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '30px',
      flexWrap: 'wrap',
    },
    pageButton: {
      padding: '10px 15px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '40px',
      textAlign: 'center',
    },
    activePageButton: {
      backgroundColor: '#1C1C47',
      color: 'white',
      borderColor: '#1C1C47',
    },
    icon: {
      maxWidth: '80px',
      height: 'auto',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
    },
    languageSelector: {
      display: 'flex',
      gap: '5px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    noData: {
      textAlign: 'center',
      padding: '40px',
      color: '#666',
      fontSize: '16px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des plateformes</h1>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            style={styles.button}
          >
            {showForm ? 'Fermer' : editingId ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>

      {/* Sélecteur de langue */}
      <div style={styles.languageSelector}>
        <span style={{alignSelf: 'center', marginRight: '10px', fontWeight: '500'}}>Langue d'affichage:</span>
        {[
          {code: 'fr', label: 'Français'},
          {code: 'en', label: 'English'},
          {code: 'ar', label: 'العربية'}
        ].map(lang => (
          <button
            key={lang.code}
            onClick={() => setCurrentLanguage(lang.code)}
            style={{
              ...styles.languageButton,
              ...(currentLanguage === lang.code ? styles.activeLanguageButton : {})
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {showForm && (
        <section style={styles.formContainer}>
          <h2 style={styles.title}>
            {editingId ? 'Modifier la plateforme' : 'Ajouter une nouvelle plateforme'}
          </h2>
          <div style={styles.form}>
            {/* Titres */}
            <div>
              <h3 style={{margin: '0 0 15px 0', color: '#1C1C47'}}>Titres</h3>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Titre (Français) *</label>
                  <input 
                    type="text" 
                    value={titleFr} 
                    onChange={(e) => setTitleFr(e.target.value)} 
                    required 
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderColor = '#1C1C47'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title (English)</label>
                  <input 
                    type="text" 
                    value={titleEn} 
                    onChange={(e) => setTitleEn(e.target.value)} 
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderColor = '#1C1C47'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>العنوان (العربية)</label>
                  <input 
                    type="text" 
                    value={titleAr} 
                    onChange={(e) => setTitleAr(e.target.value)} 
                    style={{...styles.input, direction: 'rtl'}}
                    onFocus={(e) => e.target.style.borderColor = '#1C1C47'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <h3 style={{margin: '0 0 15px 0', color: '#1C1C47'}}>Descriptions</h3>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description (Français) *</label>
                  <textarea 
                    value={descriptionFr} 
                    onChange={(e) => setDescriptionFr(e.target.value)} 
                    required 
                    style={styles.textarea}
                    onFocus={(e) => e.target.style.borderColor = '#1C1C47'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description (English)</label>
                  <textarea 
                    value={descriptionEn} 
                    onChange={(e) => setDescriptionEn(e.target.value)} 
                    style={styles.textarea}
                    onFocus={(e) => e.target.style.borderColor = '#1C1C47'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>الوصف (العربية)</label>
                  <textarea 
                    value={descriptionAr} 
                    onChange={(e) => setDescriptionAr(e.target.value)} 
                    style={{...styles.textarea, direction: 'rtl'}}
                    onFocus={(e) => e.target.style.borderColor = '#1C1C47'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
              </div>
            </div>

            {/* URL et Icône */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>URL *</label>
                <input 
                  type="url" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  required 
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#1C1C47'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Icône (optionnelle)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setIcon(e.target.files[0])} 
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
              <button 
                type="button" 
                disabled={loading} 
                onClick={handleSubmit}
                style={{
                  ...styles.submitButton,
                  backgroundColor: loading ? '#ccc' : '#1C1C47',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? "Traitement..." : (editingId ? "Mettre à jour" : "Ajouter")}
              </button>
              
              {editingId && (
                <button 
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  style={{
                    ...styles.submitButton,
                    backgroundColor: '#6c757d'
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
          </div>

          {message && (
            <div style={{
              ...styles.message,
              backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e9',
              color: message.includes('❌') ? '#c62828' : '#2e7d32',
            }}>
              {message}
            </div>
          )}
        </section>
      )}

      <h2 style={styles.title}>Liste des plateformes ({platforms.length})</h2>
      
      <div style={styles.platformList}>
        {currentPlatforms.length === 0 ? (
          <div style={styles.noData}>
            Aucune plateforme publiée pour le moment.
          </div>
        ) : (
          currentPlatforms.map((platform) => (
            <div key={platform.id} style={styles.platformCard}>
              <div
                onClick={() => toggleExpand(platform.id)}
                style={{
                  ...styles.platformHeader,
                  backgroundColor: expanded === platform.id ? '#e8f4f8' : '#f8f9fa'
                }}
              >
                <h3 style={styles.platformTitle}>{getTitle(platform)}</h3>
                <span style={styles.expandIcon}>
                  {expanded === platform.id ? '−' : '+'}
                </span>
              </div>

              {expanded === platform.id && (
                <div style={styles.platformContent}>
                  <div style={styles.platformInfo}>
                    <span style={styles.infoLabel}>Description:</span> {getDescription(platform)}
                  </div>
                  <div style={styles.platformInfo}>
                    <span style={styles.infoLabel}>URL:</span>{' '}
                    <a 
                      href={platform.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{color: '#1C1C47', textDecoration: 'none'}}
                    >
                      {platform.url}
                    </a>
                  </div>
                  <div style={styles.platformInfo}>
                    <span style={styles.infoLabel}>Ajouté le:</span>{' '}
                    {new Date(platform.added_at).toLocaleDateString('fr-FR')}
                  </div>
                  
                  {/* Affichage des autres langues si disponibles */}
                  {currentLanguage !== 'fr' && platform.title_fr && (
                    <div style={styles.platformInfo}>
                      <span style={styles.infoLabel}>Titre (FR):</span> {platform.title_fr}
                    </div>
                  )}
                  {currentLanguage !== 'en' && platform.title_en && (
                    <div style={styles.platformInfo}>
                      <span style={styles.infoLabel}>Title (EN):</span> {platform.title_en}
                    </div>
                  )}
                  {currentLanguage !== 'ar' && platform.title_ar && (
                    <div style={styles.platformInfo}>
                      <span style={styles.infoLabel}>العنوان (AR):</span> {platform.title_ar}
                    </div>
                  )}

                  {platform.icon && (
                    <div style={styles.platformInfo}>
                      <span style={styles.infoLabel}>Icône:</span><br />
                      <img src={platform.icon} alt="icon" style={styles.icon} />
                    </div>
                  )}
                  
                  <div style={styles.platformActions}>
                    <button 
                      onClick={() => loadEditData(platform)}
                      style={{...styles.actionButton, ...styles.editButton}}
                    >
                      ✏️ Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(platform.id)}
                      style={{...styles.actionButton, ...styles.deleteButton}}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {platforms.length > itemsPerPage && (
        <div style={styles.paginationContainer}>
          <button 
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.pageButton,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ‹ Préc
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              style={{
                ...styles.pageButton,
                ...(currentPage === number ? styles.activePageButton : {})
              }}
            >
              {number}
            </button>
          ))}
          
          <button 
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.pageButton,
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Suiv ›
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatformPost;