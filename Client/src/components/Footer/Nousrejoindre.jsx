import React, { useState, useEffect } from 'react';
import ChatBotNew from "../ChatBot/ChatbotNew";


const NousRejoindre = () => {
  const [formData, setFormData] = useState({
    organisation: '',
    email: '',
    message: ''
  });
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  // Détecter la largeur de l'écran pour la responsivité
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(apiUrl + "/api/rejoindre/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setResponseMessage('Votre demande a été envoyée avec succès. Nous vous contacterons bientôt.');
        setFormData({ organisation: '', email: '', message: '' });
      } else {
        setResponseMessage(data.error || 'Une erreur est survenue lors de l\'envoi de votre demande.');
      }
    } catch (error) {
      setResponseMessage('Erreur de connexion au serveur, veuillez réessayer plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles adaptés selon la largeur de l'écran et les couleurs de Contacternous
  const getResponsiveStyles = () => {
    const isMobile = windowWidth < 640;
    const isTablet = windowWidth >= 640 && windowWidth < 768;
    
    return {
      pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #EBF5FF, #FFFFFF)',
        padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
      },
      container: {
        maxWidth: isMobile ? '100%' : isTablet ? '540px' : '600px',
        width: '100%',
        padding: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
        borderRadius: isMobile ? '0.75rem' : '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        margin: isMobile ? '0.5rem' : '0',
      },
      header: {
        textAlign: 'center',
        marginBottom: isMobile ? '1.5rem' : '2rem',
      },
      title: {
        fontSize: isMobile ? '1.5rem' : isTablet ? '1.7rem' : '2rem',
        color: '#1C1C47', // Couleur principale de Contacternous
        marginBottom: '0.5rem',
        fontWeight: 'bold',
      },
      subtitle: {
        fontSize: isMobile ? '0.9rem' : '1rem',
        color: '#666',
        marginBottom: isMobile ? '1rem' : '1.5rem',
      },
      formGroup: {
        marginBottom: isMobile ? '1rem' : '1.25rem',
      },
      label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: '#555',
      },
      input: {
        width: '100%',
        padding: isMobile ? '0.65rem' : '0.75rem',
        borderRadius: '0.5rem',
        border: '1px solid #ccc',
        fontSize: isMobile ? '0.9rem' : '1rem',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxSizing: 'border-box',
        outline: 'none',
        ':focus': {
          borderColor: '#1C1C47',
          boxShadow: '0 0 0 3px rgba(28, 28, 71, 0.2)',
        }
      },
      textarea: {
        width: '100%',
        padding: isMobile ? '0.65rem' : '0.75rem',
        borderRadius: '0.5rem',
        border: '1px solid #ccc',
        fontSize: isMobile ? '0.9rem' : '1rem',
        resize: 'vertical',
        minHeight: isMobile ? '100px' : '120px',
        boxSizing: 'border-box',
        outline: 'none',
        ':focus': {
          borderColor: '#1C1C47',
          boxShadow: '0 0 0 3px rgba(28, 28, 71, 0.2)',
        }
      },
      button: {
        padding: isMobile ? '0.75rem 1.5rem' : '0.85rem 2rem',
        backgroundColor: '#1C1C47', // Couleur principale de Contacternous
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: isMobile ? '0.9rem' : '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
        width: '100%',
      },
      message: {
        marginTop: '1.5rem',
        padding: isMobile ? '0.75rem' : '1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#e6f7e6',
        color: '#2c7c2c',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: isMobile ? '0.85rem' : '0.9rem',
      },
      error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
      },
      requiredMark: {
        color: '#c62828',
        marginLeft: '3px',
      },
      footer: {
        marginTop: isMobile ? '1.5rem' : '2rem',
        fontSize: isMobile ? '0.75rem' : '0.85rem',
        color: '#777',
        textAlign: 'center',
      }
    };
  };

  const styles = getResponsiveStyles();

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Rejoignez-nous</h2>
          <p style={styles.subtitle}>Complétez ce formulaire pour rejoindre notre réseau d'organisations</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Nom de l'organisation<span style={styles.requiredMark}>*</span>
            </label>
            <input
              type="text"
              name="organisation"
              value={formData.organisation}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Nom de votre organisation"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Email<span style={styles.requiredMark}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Email de contact"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Message<span style={styles.requiredMark}>*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              style={styles.textarea}
              placeholder="Parlez-nous de votre organisation et pourquoi vous souhaitez nous rejoindre..."
              rows={windowWidth < 640 ? "4" : "6"}
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={isSubmitting}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#161638'} // Version plus foncée comme dans ContacterNous
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1C1C47'}
          >
            {isSubmitting ? (
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg 
                  style={{
                    animation: 'spin 1s linear infinite',
                    marginRight: '10px',
                    width: '16px',
                    height: '16px'
                  }} 
                  viewBox="0 0 24 24"
                >
                  <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </span>
            ) : 'Soumettre la demande'}
          </button>
        </form>

        {responseMessage && (
          <div style={responseMessage.includes('erreur') ? { ...styles.message, ...styles.error } : styles.message}>
            {responseMessage}
          </div>
        )}

        <div style={styles.footer}>
          <p>En soumettant ce formulaire, vous acceptez d'être contacté concernant votre demande d'adhésion.</p>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotNew />
      </div>
    </div>
  );
};

export default NousRejoindre;