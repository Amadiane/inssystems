import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';  // Import de useTranslation
import ChatBotNew from "../ChatBot/ChatbotNew";

const Document = () => {
  const { t } = useTranslation();  // Initialisation du hook de traduction
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggingDocument, setDraggingDocument] = useState(null);
  const [documentPositions, setDocumentPositions] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(apiUrl + "/api/documents/");
        if (!response.ok) throw new Error("Erreur lors du chargement des documents.");
        const data = await response.json();

        const initialPositions = {};
        data.forEach((item, index) => {
          initialPositions[index] = { x: 0, y: 0 };
        });
        setDocumentPositions(initialPositions);
        setDocuments(data);
      } catch (err) {
        console.error("Erreur de fetch:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = searchTerm === "" || 
      document.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (document.description && document.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleMouseDown = (index, e) => {
    setDraggingDocument(index);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (draggingDocument !== null) {
      e.preventDefault();
      setDocumentPositions(prev => ({
        ...prev,
        [draggingDocument]: {
          x: (prev[draggingDocument]?.x || 0) + e.movementX,
          y: (prev[draggingDocument]?.y || 0) + e.movementY
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingDocument(null);
  };

  const resetDocumentPosition = (index, e) => {
    e && e.stopPropagation();
    setDocumentPositions(prev => ({
      ...prev,
      [index]: { x: 0, y: 0 }
    }));
  };

  const toggleDescription = (index) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getDocumentSrc = (document) => {
    let fileUrl = '/file_indispo.pdf';
    if (document.fichier) {
      if (document.fichier.startsWith("http")) {
        fileUrl = document.fichier;
      } else {
        fileUrl = `${apiUrl}${document.fichier}`;
      }
    }
    return fileUrl;
  };

  const getImageSrc = (document) => {
    let imgUrl = '/placeholder-image.jpg';
    if (document.couverture) {
      if (document.couverture.startsWith("http")) {
        imgUrl = document.couverture;
      } else {
        imgUrl = `${apiUrl}${document.couverture}`;
      }
    }
    return imgUrl;
  };

  const splitDescription = (description) => {
    if (!description) return { intro: '', main: '' };
    
    const isMobile = windowWidth <= 768;
    const cutLength = isMobile ? 100 : 200;
    
    if (description.length < cutLength) {
      return { intro: description, main: '' };
    }

    const cutIndex = description.lastIndexOf(" ", cutLength);
    const intro = description.substring(0, cutIndex > 0 ? cutIndex : cutLength);
    const main = description.substring(cutIndex > 0 ? cutIndex : cutLength).trim();
    return { intro: intro + '...', main };
  };

  const getGridColumns = () => {
    if (windowWidth <= 640) return 1;
    if (windowWidth <= 1024) return 2;
    return 3;
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  return (
    <div style={{
      margin: '0',
      padding: '0',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'Arial, Helvetica, sans-serif',
      display: 'flex',
      justifyContent: 'center', // Ajouté pour centrer le contenu
      alignItems: 'center',
      flexDirection: 'column',
    }}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}>
      {/* TITRE PRINCIPAL TRÈS VISIBLE */}
      <header style={{
        width: '100%',
        backgroundColor: '#1C1C47',
        color: 'white',
        textAlign: 'center',
        padding: '60px 20px 70px',
        marginBottom: '0',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center', // Ajouté pour centrer le contenu
        zIndex: '2',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        background: 'linear-gradient(135deg, #1C1C47 0%, #1C1C47 100%)',
      }}>
        <div className="pt-16">
    {/* Titre principal très visible */}
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-wide text-shadow-xl">{t('FONDATION DOCUMENTS')}</h1>

    {/* Barre sous le titre */}
    <div className="w-24 h-1 bg-white mx-auto mb-6 rounded-full"></div>

    {/* Description */}
    <p className="max-w-3xl mx-auto text-base md:text-lg opacity-90 font-light">
      {t('Centre de documentation officiel')}
    </p>
  </div>
      </header>

            {/* Zone principale */}
            <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '30px auto 0',
        padding: '0 20px 60px',
        position: 'relative',
        zIndex: '2',
      }}>
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: windowWidth <= 768 ? '25px 20px' : '35px 40px',
          boxShadow: '0 6px 30px rgba(0,0,0,0.12)',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: windowWidth <= 768 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: windowWidth <= 768 ? 'flex-start' : 'center',
            marginBottom: '30px',
          }}>
            <h2 style={{ 
              fontSize: windowWidth <= 768 ? '22px' : '26px',
              color: '#1C1C47',
              fontWeight: '600',
              margin: windowWidth <= 768 ? '0 0 15px 0' : '0',
            }}>
              {t('Documents disponibles')}
            </h2>
            
            <div style={{ 
              display: 'flex',
              flexDirection: windowWidth <= 768 ? 'column' : 'row',
              alignItems: windowWidth <= 768 ? 'stretch' : 'center',
              gap: '10px',
              width: windowWidth <= 768 ? '100%' : 'auto'
            }}>
              <button 
                onClick={toggleViewMode}
                style={{
                  padding: '12px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#1C1C47',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  fontSize: '15px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  width: windowWidth <= 768 ? '100%' : 'auto',
                }}
              >
                {viewMode === 'grid' ? `📱 ${t('Vue Liste')}` : `📊 ${t('Vue Grille')}`}
              </button>
            </div>
          </div>
          
          <div style={{
            position: 'relative',
            marginBottom: '30px',
          }}>
            <input 
              type="text" 
              placeholder={t('Rechercher un document...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px',
                paddingLeft: '45px',
                border: '1px solid #e1e4e8',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            />
            <span style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#1C1C47',
              fontSize: '20px',
            }}>
              🔍
            </span>
          </div>

          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '60px 0',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{
                  border: '3px solid #1C1C47',
                  borderTop: '3px solid transparent',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '15px',
                }}></div>
                <p style={{ fontSize: '17px', color: '#666' }}>{t('Chargement des documents...')}</p>
              </div>
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          )}
          
          {error && (
            <div style={{
              backgroundColor: '#fff5f5',
              border: '1px solid #1C1C47',
              borderRadius: '8px',
              padding: '20px',
              color: '#1C1C47',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '16px', margin: '0' }}>{error}</p>
            </div>
          )}
          
          {!loading && !error && filteredDocuments.length === 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px dashed #ccc',
            }}>
              <div>
                <p style={{ fontSize: '18px', color: '#555', margin: '0 0 10px 0' }}>{t('Aucun document trouvé')}</p>
                <p style={{ fontSize: '16px', color: '#777', margin: '0' }}>{t('Essayez de modifier votre recherche')}</p>
              </div>
            </div>
          )}
          
          {/* Documents Container - Changes based on viewMode */}
          <div style={{ 
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? `repeat(${getGridColumns()}, 1fr)` : '1fr',
            gap: viewMode === 'grid' ? '24px' : '20px',
            flexDirection: 'column',
          }}>
            {filteredDocuments.map((document, index) => {
              const { intro, main } = splitDescription(document.description);
              const hasAdditionalContent = main.length > 0;
              const position = documentPositions[index] || { x: 0, y: 0 };

              // Grid or List Item
              return (
                <div 
                  key={index}
                  style={{
                    border: '1px solid #e1e4e8',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.3s',
                    position: 'relative',
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    cursor: draggingDocument === index ? 'grabbing' : 'grab',
                    display: 'flex',
                    flexDirection: viewMode === 'list' && windowWidth > 640 ? 'row' : 'column',
                  }}
                  onMouseDown={(e) => handleMouseDown(index, e)}
                >
                  {/* Document Image/Cover */}
                  {document.couverture && (
                    <div style={{
                      width: viewMode === 'list' && windowWidth > 640 ? '180px' : '100%',
                      minWidth: viewMode === 'list' && windowWidth > 640 ? '180px' : 'auto',
                      height: viewMode === 'list' && windowWidth > 640 ? '180px' : '200px',
                      overflow: 'hidden',
                      borderBottom: viewMode === 'list' && windowWidth > 640 ? 'none' : '1px solid #eaeaea',
                      borderRight: viewMode === 'list' && windowWidth > 640 ? '1px solid #eaeaea' : 'none',
                      position: 'relative',
                    }}>
                      <img 
                        src={getImageSrc(document)} 
                        alt={document.titre} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.3s ease',
                        }} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      {viewMode === 'grid' && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                          padding: '15px',
                        }}>
                          <h3 style={{ 
                            margin: '0',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#fff',
                            lineHeight: '1.4',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}>
                            {document.titre}
                          </h3>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Document Content */}
                  <div style={{
                    padding: '20px',
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    {/* Show title in list view or if no cover image */}
                    {(viewMode === 'list' || !document.couverture) && (
                      <h3 style={{ 
                        margin: '0 0 12px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1C1C47',
                        lineHeight: '1.4'
                      }}>
                        {document.titre}
                      </h3>
                    )}
                    
                    {/* Description */}
                    <div style={{ marginBottom: '15px', flex: '1' }}>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '15px',
                        color: '#555',
                        lineHeight: '1.6'
                      }}>
                        {intro}
                      </p>
                      
                      {expandedDescriptions[index] && main && (
                        <p style={{ 
                          margin: '10px 0 0 0', 
                          fontSize: '15px',
                          color: '#555',
                          lineHeight: '1.6'
                        }}>
                          {main}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      flexWrap: windowWidth <= 640 ? 'wrap' : 'nowrap',
                      gap: windowWidth <= 640 ? '10px' : '0',
                    }}>
                      {hasAdditionalContent && (
                        <button 
                          onClick={(e) => toggleDescription(index, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#1C1C47',
                            fontSize: '14px',
                            cursor: 'pointer',
                            padding: '6px 0',
                            fontWeight: '500',
                            order: windowWidth <= 640 ? '2' : '1',
                            width: windowWidth <= 640 ? '100%' : 'auto',
                            textAlign: windowWidth <= 640 ? 'center' : 'left',
                          }}
                        >
                          {expandedDescriptions[index] ? '- Voir moins' : '+ Voir plus'}
                        </button>
                      )}
                      
                      <a 
                        href={getDocumentSrc(document)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          backgroundColor: '#1C1C47',
                          color: 'white',
                          padding: '10px 18px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'inline-flex',
                          alignItems: 'center',
                          marginLeft: 'auto',
                          boxShadow: '0 2px 4px rgba(28,28,71,0.3)',
                          transition: 'all 0.2s',
                          order: windowWidth <= 640 ? '1' : '2',
                          width: windowWidth <= 640 ? '100%' : 'auto',
                          justifyContent: windowWidth <= 640 ? 'center' : 'flex-start',
                        }}
                      >
                        <span style={{ marginRight: '8px' }}>📄</span>
                        {t('Télécharger')}
                      </a>
                    </div>
                  </div>
                  
                  {/* Reset position button */}
                  {(position.x !== 0 || position.y !== 0) && (
                    <button
                      onClick={(e) => resetDocumentPosition(index, e)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        zIndex: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      ↩
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

export default Document;
