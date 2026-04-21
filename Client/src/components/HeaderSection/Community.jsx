import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Mail, User, MessageSquare, Briefcase, Loader2, CheckCircle2, AlertCircle, Sparkles, Users } from 'lucide-react';
import ChatBotNew from "../ChatBot/ChatbotNew";
import CONFIG from "../../config/config.js";

const Community = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    message: '',
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(CONFIG.API_COMMUNITY_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccessMessage("Votre demande a été envoyée avec succès !");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setForm({ name: '', email: '', role: '', message: '' });
      } else {
        setError("Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      setError("Impossible d'envoyer le formulaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-yellow-50/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête avec style Viali */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] opacity-30 blur-2xl rounded-full"></div>
            <div className="relative flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-[#FDB71A] animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E84E1B] via-[#F47920] to-[#FDB71A]">
                {t('REJOIGNEZ NOTRE COMMUNAUTÉ')}
              </h1>
              <Sparkles className="w-8 h-8 text-[#E84E1B] animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">{t('Faites partie de notre réseau')}</p>
        </div>

        {/* Messages de notification */}
        {error && (
          <div className="bg-red-50/90 backdrop-blur-sm text-red-700 border-2 border-red-200 p-4 rounded-2xl mb-6 flex items-center gap-3 shadow-lg shadow-red-100">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50/90 backdrop-blur-sm text-green-700 border-2 border-green-200 p-4 rounded-2xl mb-6 flex items-center gap-3 shadow-lg shadow-green-100 animate-pulse">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Formulaire moderne */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-[#F47920]/20 rounded-3xl shadow-2xl shadow-orange-200/50 p-6 md:p-10 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FDB71A] to-[#F47920] rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t('Rejoignez-nous')}</h2>
              <p className="text-gray-600 text-sm mt-1">{t('Devenez membre de notre communauté')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2 text-[#F47920]" />
                  {t('Nom complet')} *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder={t('Votre nom')}
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#F47920] focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none text-gray-900"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2 text-[#F47920]" />
                  {t('Email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="votre.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#F47920] focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none text-gray-900"
                />
              </div>
            </div>

            {/* Rôle */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Briefcase className="inline w-4 h-4 mr-2 text-[#F47920]" />
                {t('Rôle')} *
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#F47920] focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none bg-white text-gray-900"
              >
                <option value="">{t('-- Sélectionnez votre rôle --')}</option>
                <option value="partenaire" className="text-gray-900">{t('Partenaire')}</option>
                <option value="client" className="text-gray-900">{t('Client')}</option>
                <option value="fournisseur" className="text-gray-900">{t('Fournisseur')}</option>
                <option value="employe" className="text-gray-900">{t('Employé')}</option>
                <option value="autres" className="text-gray-900">{t('Autres')}</option>
              </select>
            </div>

            {/* Message */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <MessageSquare className="inline w-4 h-4 mr-2 text-[#F47920]" />
                {t('Message')}
              </label>
              <textarea
                name="message"
                placeholder={t('Parlez-nous de vous et de vos motivations...')}
                value={form.message}
                onChange={handleChange}
                rows="6"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#F47920] focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none resize-none text-gray-900"
              />
            </div>

            {/* Bouton d'envoi */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white font-bold rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-orange-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('Envoi en cours...')}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t('Envoyer')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <ChatBotNew />
    </div>
  );
};

export default Community;