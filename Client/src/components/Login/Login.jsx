import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import CONFIG from '../../config/config.js';

const C = {
  rouge:       "#CE1126",
  jaune:       "#FCD116",
  jauneDeep:   "#C9A000",
  vert:        "#009A44",
  vertLight:   "#00B84F",
  vertGlow:    "#009A4422",
  pageBg:      "#F5F7FA",
  white:       "#FFFFFF",
  surface:     "#F0F4F8",
  border:      "#DDE4ED",
  textPri:     "#0F2137",
  textSec:     "#4A6780",
  textDim:     "#8FA8C0",
  danger:      "#C0162A",
  dangerBg:    "#FFF0F2",
  rougeBorder: "#F5C0C7",
};

const INSLogo = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="35" fill="white" stroke={C.border} strokeWidth="1.5"/>
    <clipPath id="cc"><circle cx="36" cy="36" r="33"/></clipPath>
    <g clipPath="url(#cc)">
      <rect x="3" y="3" width="22" height="66" fill={C.rouge}/>
      <rect x="25" y="3" width="22" height="66" fill={C.jaune}/>
      <rect x="47" y="3" width="22" height="66" fill={C.vert}/>
    </g>
    <rect x="28" y="40" width="16" height="20" rx="1.5" fill="white" opacity="0.97"/>
    <rect x="31" y="30" width="10" height="12" rx="1" fill="white" opacity="0.97"/>
    <rect x="34" y="23" width="4" height="9" rx="0.5" fill="white" opacity="0.97"/>
    <circle cx="36" cy="21" r="2.5" fill={C.jaune}/>
    <rect x="29.5" y="43" width="4" height="4" rx="0.5" fill="#00000022"/>
    <rect x="38.5" y="43" width="4" height="4" rx="0.5" fill="#00000022"/>
    <rect x="29.5" y="50" width="4" height="5" rx="0.5" fill="#00000022"/>
    <rect x="38.5" y="50" width="4" height="5" rx="0.5" fill="#00000022"/>
  </svg>
);

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
        localStorage.setItem('access', data.access);
        localStorage.setItem('user', JSON.stringify({
          id:         data.id,
          username:   data.username,
          role:       data.role       || 'agent',
          first_name: data.first_name || '',
          last_name:  data.last_name  || '',
          service:    data.service    || 'secretariat',
        }));
        navigate('/dashboardAdmin');
      } else {
        setError(data.detail || "Identifiant ou mot de passe incorrect.");
      }
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = username.trim() && password && !loading;

  return (
    /* Conteneur plein écran, pas de scroll */
    <div style={{
      position: "fixed",
      inset: 0,
      background: C.pageBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', 'Calibri', sans-serif",
      overflow: "hidden",
    }}>
      {/* Motif points discret */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle at 1.5px 1.5px, ${C.border} 1.5px, transparent 0)`,
        backgroundSize: "28px 28px", opacity: 0.55,
        pointerEvents: "none",
      }}/>
      {/* Halos */}
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${C.vert}12 0%, transparent 65%)`, pointerEvents: "none" }}/>
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "260px", height: "260px", borderRadius: "50%", background: `radial-gradient(circle, ${C.rouge}10 0%, transparent 65%)`, pointerEvents: "none" }}/>

      {/* Carte */}
      <div style={{
        width: "100%",
        maxWidth: "420px",
        margin: "0 16px",
        background: C.white,
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.10)",
        border: `1px solid ${C.border}`,
        animation: "fadeUp 0.4s cubic-bezier(0.34,1.4,0.64,1) both",
      }}>

        {/* Bandeau tricolore haut */}
        <div style={{ display: "flex", height: "4px" }}>
          <div style={{ flex: 1, background: C.rouge }}/>
          <div style={{ flex: 1, background: C.jaune }}/>
          <div style={{ flex: 1, background: C.vert  }}/>
        </div>

        {/* Header compact */}
        <div style={{
          background: `linear-gradient(170deg, #EBF9F2 0%, #F8FCFF 55%, ${C.white} 100%)`,
          padding: "20px 32px 16px",
          textAlign: "center",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "inline-flex", marginBottom: "10px", filter: "drop-shadow(0 3px 8px rgba(0,154,68,0.15))" }}>
            <INSLogo size={56}/>
          </div>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.textDim, fontWeight: "700", marginBottom: "3px" }}>
            République de Guinée
          </div>
          <h1 style={{ fontSize: "18px", fontWeight: "900", color: C.textPri, margin: "0 0 2px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            INS – Guinée
          </h1>
          <p style={{ fontSize: "11.5px", color: C.textSec, margin: "0 0 10px", fontWeight: "500" }}>
            Institut National de la Statistique
          </p>
          {/* Séparateur tricolore */}
          <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
            <div style={{ width: "22px", height: "3px", borderRadius: "2px", background: C.rouge }}/>
            <div style={{ width: "22px", height: "3px", borderRadius: "2px", background: C.jaune }}/>
            <div style={{ width: "22px", height: "3px", borderRadius: "2px", background: C.vert  }}/>
          </div>
        </div>

        {/* Formulaire compact */}
        <div style={{ padding: "22px 32px 20px" }}>
          <div style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: C.textPri, margin: "0 0 3px" }}>
              Connexion
            </h2>
            <p style={{ fontSize: "12px", color: C.textSec, margin: 0 }}>
              Accédez à votre espace de gestion
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: "14px", padding: "10px 12px",
              background: C.dangerBg, border: `1px solid ${C.rougeBorder}`,
              borderRadius: "9px", color: C.danger,
              fontSize: "12.5px", display: "flex", alignItems: "center", gap: "7px", fontWeight: "500",
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>

            {/* Identifiant */}
            <div>
              <label style={{ fontSize: "10.5px", fontWeight: "700", color: C.textSec, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: "6px" }}>
                Identifiant
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: "9px", padding: "0 13px",
                background: focusUser ? C.white : C.surface,
                border: `1.5px solid ${focusUser ? C.vert : C.border}`,
                borderRadius: "10px",
                boxShadow: focusUser ? `0 0 0 3px ${C.vertGlow}` : "none",
                transition: "all 0.18s",
              }}>
                <User size={15} color={focusUser ? C.vert : C.textDim} style={{ flexShrink: 0 }}/>
                <input
                  type="text" placeholder="Votre identifiant" value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setFocusUser(true)} onBlur={() => setFocusUser(false)}
                  autoComplete="username"
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.textPri, fontSize: "13.5px", padding: "11px 0", fontFamily: "inherit" }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ fontSize: "10.5px", fontWeight: "700", color: C.textSec, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: "6px" }}>
                Mot de passe
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: "9px", padding: "0 13px",
                background: focusPass ? C.white : C.surface,
                border: `1.5px solid ${focusPass ? C.vert : C.border}`,
                borderRadius: "10px",
                boxShadow: focusPass ? `0 0 0 3px ${C.vertGlow}` : "none",
                transition: "all 0.18s",
              }}>
                <Lock size={15} color={focusPass ? C.vert : C.textDim} style={{ flexShrink: 0 }}/>
                <input
                  type={passwordVisible ? "text" : "password"} placeholder="••••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusPass(true)} onBlur={() => setFocusPass(false)}
                  autoComplete="current-password"
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.textPri, fontSize: "14px", padding: "11px 0", letterSpacing: passwordVisible ? "normal" : "0.16em", fontFamily: "inherit" }}
                />
                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim, display: "flex", padding: "3px", borderRadius: "5px", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = C.vert}
                  onMouseLeave={e => e.currentTarget.style.color = C.textDim}>
                  {passwordVisible ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button type="submit" disabled={!canSubmit}
              style={{
                marginTop: "4px", padding: "12px 18px",
                borderRadius: "10px", border: "none",
                background: canSubmit ? `linear-gradient(135deg, ${C.vert} 0%, ${C.vertLight} 100%)` : C.surface,
                color: canSubmit ? "#fff" : C.textDim,
                fontSize: "13px", fontWeight: "800",
                cursor: canSubmit ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                transition: "all 0.2s",
                letterSpacing: "0.05em", textTransform: "uppercase",
                boxShadow: canSubmit ? `0 5px 16px ${C.vert}35` : "none",
              }}
              onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 22px ${C.vert}45`; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = canSubmit ? `0 5px 16px ${C.vert}35` : "none"; }}>
              {loading ? (
                <>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }}/>
                  Connexion…
                </>
              ) : (
                <> Se connecter <ArrowRight size={15} strokeWidth={2.5}/> </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "11px 32px", background: C.surface, textAlign: "center" }}>
          <span style={{ fontSize: "10.5px", color: C.textDim, letterSpacing: "0.03em" }}>
            Accès réservé au personnel autorisé · INS Guinée
          </span>
        </div>

        {/* Bandeau tricolore bas */}
        <div style={{ display: "flex", height: "3px" }}>
          <div style={{ flex: 1, background: C.rouge }}/>
          <div style={{ flex: 1, background: C.jaune }}/>
          <div style={{ flex: 1, background: C.vert  }}/>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        input::placeholder { color: #8FA8C0; }
      `}</style>
    </div>
  );
};

export default Login;