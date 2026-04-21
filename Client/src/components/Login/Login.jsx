import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import CONFIG from '../../config/config.js';

const SS = {
  bg:        "#F7F3EC",
  surface:   "#EDE5D0",
  card:      "#E4D9C0",
  border:    "#D4C08A",
  gold:      "#C9A84C",
  goldLight: "#8A6A20",
  goldDark:  "#5C3D00",
  text:      "#2C1A00",
  textMuted: "#8A6A20",
  textDim:   "#B8A070",
  danger:    "#A32020",
  dangerBg:  "#FDEAEA",
};

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername]               = useState('');
  const [password, setPassword]               = useState('');
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusUser, setFocusUser]             = useState(false);
  const [focusPass, setFocusPass]             = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(CONFIG.API_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok && data.access) {
        // ✅ Token JWT
        localStorage.setItem('access', data.access);

        // ✅ Toutes les infos utilisateur — id obligatoire pour filtrer les ventes
        localStorage.setItem('user', JSON.stringify({
          id:         data.id,
          username:   data.username,
          role:       data.role       || 'vendeur',
          first_name: data.first_name || '',
          last_name:  data.last_name  || '',
        }));

        // ✅ Redirection selon rôle
        if (data.role === 'admin') {
          navigate('/dashboardAdmin');
        } else {
          navigate('/vendeurDashboard');
        }
      } else {
        setError(data.detail || "Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch {
      setError('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: SS.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", fontFamily: "var(--font-sans, sans-serif)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${SS.gold}15 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: `radial-gradient(circle, ${SS.gold}10 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, ${SS.gold}18 1px, transparent 0)`, backgroundSize: "32px 32px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
        <div style={{
          background: "#fff", border: `1px solid ${SS.border}`,
          borderRadius: "20px", padding: "40px 36px",
          boxShadow: `0 8px 40px ${SS.gold}20`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${SS.goldDark}, ${SS.gold}, ${SS.goldDark})` }} />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "64px", height: "64px", borderRadius: "16px",
              background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`,
              boxShadow: `0 4px 20px ${SS.gold}40`, marginBottom: "16px",
            }}>
              <Shield size={28} color="#fff" />
            </div>
            <div style={{ fontSize: "11px", color: SS.textDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
              Santa'Style
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: SS.goldDark, margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              Administration
            </h1>
            <p style={{ fontSize: "13px", color: SS.textMuted, margin: 0 }}>
              Connectez-vous à votre espace
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div style={{ marginBottom: "20px", padding: "12px 14px", background: SS.dangerBg, border: `1px solid ${SS.danger}40`, borderRadius: "10px", color: SS.danger, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Identifiant */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <User size={13} color={SS.gold} /> Nom d'utilisateur
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", background: SS.surface, border: `1px solid ${focusUser ? SS.gold : SS.border}`, borderRadius: "10px", boxShadow: focusUser ? `0 0 0 3px ${SS.gold}20` : "none", transition: "all 0.2s" }}>
                <User size={16} color={focusUser ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                <input type="text" placeholder="Votre identifiant" value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setFocusUser(true)} onBlur={() => setFocusUser(false)}
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "14px", padding: "12px 0" }} />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Lock size={13} color={SS.gold} /> Mot de passe
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", background: SS.surface, border: `1px solid ${focusPass ? SS.gold : SS.border}`, borderRadius: "10px", boxShadow: focusPass ? `0 0 0 3px ${SS.gold}20` : "none", transition: "all 0.2s" }}>
                <Lock size={16} color={focusPass ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                <input type={passwordVisible ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusPass(true)} onBlur={() => setFocusPass(false)}
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "14px", padding: "12px 0" }} />
                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: SS.textDim, display: "flex", padding: 0 }}>
                  {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button type="submit" disabled={loading || !username || !password}
              style={{
                marginTop: "8px", padding: "14px", borderRadius: "10px", border: "none",
                background: loading || !username || !password
                  ? SS.card
                  : `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`,
                color: loading || !username || !password ? SS.textDim : "#fff",
                fontSize: "15px", fontWeight: "700",
                cursor: loading || !username || !password ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s",
                boxShadow: loading || !username || !password ? "none" : `0 4px 16px ${SS.gold}40`,
              }}>
              {loading ? (
                <>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${SS.textDim}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                  Connexion...
                </>
              ) : (
                <> Se connecter <ArrowRight size={17} /> </>
              )}
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: `1px solid ${SS.border}`, textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: SS.textDim }}>Accès réservé aux administrateurs</div>
            <div style={{ fontSize: "11px", color: SS.textDim, marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <Shield size={11} color={SS.gold} /> Santa'Style — Système de gestion
            </div>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default Login;