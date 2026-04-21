import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChatBotNew from "../ChatBot/ChatbotNew";

const FondationPost = () => {
  const { i18n, t } = useTranslation(); // Utilisation de useTranslation pour la gestion des langues
  const [fondations, setFondations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggingImage, setDraggingImage] = useState(null);
  const [imagePositions, setImagePositions] = useState({});
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  useEffect(() => {
    const fetchFondations = async () => {
      try {
        const response = await fetch(apiUrl + "/api/fondationtamkine/"); 
        if (!response.ok) throw new Error(t('errors.loading_data'));
        const data = await response.json();

        const initialPositions = {};
        data.forEach((item, index) => {
          initialPositions[index] = { x: 0, y: 0 };
        });
        setImagePositions(initialPositions);

        setFondations(data);
      } catch (err) {
        console.error(t('errors.fetch_error'), err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFondations();
  }, [t]);

  const handleMouseDown = (index, e) => {
    setDraggingImage(index);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (draggingImage !== null) {
      e.preventDefault();
      setImagePositions(prev => ({
        ...prev,
        [draggingImage]: {
          x: prev[draggingImage].x + e.movementX,
          y: prev[draggingImage].y + e.movementY
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingImage(null);
  };

  const resetImagePosition = (index, e) => {
    e && e.stopPropagation();
    setImagePositions(prev => ({
      ...prev,
      [index]: { x: 0, y: 0 }
    }));
  };

  useEffect(() => {
    if (draggingImage !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingImage]);

  const getImageSrc = (fondation) => {
    let imageUrl = '/image_indispo.png';
    if (fondation.image) {
      if (fondation.image.startsWith("http")) {
        imageUrl = fondation.image;
      } else {
        imageUrl = `${apiUrl}${fondation.image}`;
      }
    }
    return imageUrl;
  };

  // Fonction améliorée pour découper le texte de manière plus intelligente
  const splitDescription = (description) => {
    if (!description) return { intro: '', main: '' };
    if (description.length < 300) {
      return { intro: description, main: '' };
    }
    
    // Recherche la fin d'une phrase proche de 300 caractères
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
    let intro = '';
    let sentenceCount = 0;
    let charCount = 0;
    
    for (const sentence of sentences) {
      if (charCount + sentence.length > 350) break;
      intro += sentence;
      charCount += sentence.length;
      sentenceCount++;
    }
    
    // Si aucune phrase complète n'a été trouvée, utiliser la méthode classique
    if (sentenceCount === 0) {
      const cutIndex = description.lastIndexOf(" ", 300);
      intro = description.substring(0, cutIndex);
      const main = description.substring(cutIndex).trim();
      return { intro, main };
    }
    
    const main = description.substring(intro.length).trim();
    return { intro, main };
  };

  return (
    // Centrage vertical amélioré avec plus d'espace en haut pour éviter la navbar
    <div className="flex justify-center items-center flex-col p-4 md:p-10 pt-32 md:pt-40 bg-gray-100 min-h-screen">
      <div className="w-full max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-lg">
        {loading && <p className="text-center text-lg">{t('common.loading')}</p>}
        {error && (
          <div className="text-red-600 text-center p-5 bg-white rounded-lg mb-5">
            <p className="text-lg mb-2"><strong>{t('common.error')}:</strong> {error}</p>
            <p>{t('errors.check_server')}</p>
          </div>
        )}

        <div className="flex flex-col gap-12">
          {fondations.length > 0 ? fondations.map((fondation, index) => {
            const { intro, main } = splitDescription(fondation[`description_${i18n.language}`] || fondation.description);

            return (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-visible">
                <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} mb-8 items-center`}>
                  <div className="w-full md:w-2/5 relative bg-gray-100 flex justify-center items-center p-6 min-h-64 rounded-lg mx-0 md:mx-4 mb-6 md:mb-0">
                    <div className="relative w-full h-full flex justify-center items-center">
                      <img
                        src={getImageSrc(fondation)}
                        alt={`${t('fondation.image_of')} ${fondation[`title_${i18n.language}`] || fondation.titre || t('common.title_unavailable')}`}
                        className="max-w-full max-h-72 object-contain select-none rounded-lg shadow-md"
                        style={{
                          cursor: draggingImage === index ? 'grabbing' : 'grab',
                          transform: `translate(${imagePositions[index]?.x || 0}px, ${imagePositions[index]?.y || 0}px)`,
                          transition: draggingImage === index ? 'none' : 'transform 0.2s ease',
                          zIndex: draggingImage === index ? 10 : 1,
                        }}
                        onMouseDown={(e) => handleMouseDown(index, e)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/image_indispo.png';
                        }}
                      />
                      {(imagePositions[index]?.x !== 0 || imagePositions[index]?.y !== 0) && (
                        <button
                          onClick={(e) => resetImagePosition(index, e)}
                          className="absolute bottom-2 right-2 bg-blue-900 text-white border-none rounded px-3 py-1 cursor-pointer text-xs z-10 hover:bg-blue-800 transition-colors"
                        >
                          {t('common.reset')}
                        </button>
                      )}
                    </div>
                    {draggingImage === index && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 px-3 rounded text-xs z-20">
                        {t('fondation.moving')}
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-3/5 p-6 flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl mb-5 text-blue-900 border-l-4 border-blue-900 pl-4 font-semibold">
                      {fondation[`title_${i18n.language}`] || fondation.titre || t('common.title_unavailable')}
                    </h2>

                    <p className="text-base md:text-lg text-gray-700 leading-relaxed hyphens-auto" style={{ hyphens: 'auto', textAlign: 'justify' }}>
                      {intro}
                    </p>
                  </div>
                </div>

                {main && (
                  <div className="px-4 md:px-10 pb-8">
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 hyphens-auto" style={{ hyphens: 'auto', textAlign: 'justify' }}>
                      {main}
                    </p>
                  </div>
                )}
              </div>
            );
          }) : !loading && (
            <div className="text-center py-8">
              <p>{t('fondation.no_fondations')}</p>
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

export default FondationPost;