import React, { useEffect, useState } from "react";
import CONFIG from "../../config/config";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ShoppingBag, DollarSign, Package,
  RefreshCw, Zap, Tag, Layers, Plus, Clock, AlertCircle
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Hook responsive
const useResponsive = () => {
  const [viewport, setViewport] = useState({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return viewport;
};

// ── Config badges action ──────────────────────────────────
const ACTION_CONFIG = {
  create: { label: "Création",     color: "#1A6B3C", bg: "rgba(26,107,60,0.12)"  },
  update: { label: "Modification", color: "#1d4ed8", bg: "rgba(59,130,246,0.12)" },
  delete: { label: "Suppression",  color: "#A32020", bg: "rgba(163,32,32,0.12)"  },
  vente:  { label: "Vente",        color: "#C9A84C", bg: "rgba(201,168,76,0.12)" },
};

// ── Composant principal ───────────────────────────────────
const VendeurDashboard = () => {
  const token    = localStorage.getItem("access");
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const { tokens: SS } = useTheme();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const [ventes,    setVentes]    = useState([]);
  const [stocks,    setStocks]    = useState([]);
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refresh,   setRefresh]   = useState(0);
  const [venteCles, setVenteCles] = useState([]); // pour debug

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/dashboardAdmin" replace />;

  // ── Fetch toutes les données ──────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [rV, rS, rL] = await Promise.all([
          fetch(CONFIG.API_VENTE,                               { headers }),
          fetch(CONFIG.API_STOCK,                               { headers }),
          fetch(`${CONFIG.API_ACTIVITY}?ordering=-created_at`,  { headers }),
        ]);
        const [dV, dS, dL] = await Promise.all([rV.json(), rS.json(), rL.json()]);

        const ventesArr = Array.isArray(dV) ? dV : (dV.results || []);
        setVentes(ventesArr);
        setStocks(Array.isArray(dS) ? dS : (dS.results || []));
        setLogs(  Array.isArray(dL) ? dL : (dL.results || []));

        // Capturer les clés de la 1ère vente pour debug
        if (ventesArr.length > 0) {
          setVenteCles(Object.keys(ventesArr[0]));
        }
      } catch (e) {
        console.error("VendeurDashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [refresh]);

  // Auto-refresh toutes les 30s
  useEffect(() => {
    const iv = setInterval(() => setRefresh(r => r + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  // ── Filtre mes ventes ─────────────────────────────────
  const username = (user?.username || "").toLowerCase().trim();
  const userId   = String(user?.id ?? "");

  const mesVentes = ventes.filter(v => {
    if (!v) return false;
    return (
      (v.vendeur_nom && String(v.vendeur_nom).toLowerCase().trim() === username) ||
      (userId        && v.vendeur && String(v.vendeur) === userId)
    );
  });

  // ── Nom affiché ───────────────────────────────────────
  const nomAffiche = [user?.first_name, user?.last_name]
    .filter(Boolean).join(" ").trim() || user?.username || "Vendeur";

  const initiales = () => {
    const parts = nomAffiche.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (nomAffiche[0] || "?").toUpperCase();
  };

  // ── Stats ─────────────────────────────────────────────
  const totalCA         = mesVentes.reduce((a, v) => a + parseFloat(v.prix_total || 0), 0);
  const totalUnites     = mesVentes.reduce((a, v) => a + (v.quantite || 0), 0);
  const stocksCritiques = stocks.filter(s => s.quantite > 0 && s.quantite <= 3).length;
  const stocksEpuises   = stocks.filter(s => s.quantite === 0).length;

  // ── Card stats ────────────────────────────────────────
  const card = (titre, valeur, icon, couleur, sous = null) => (
    <div style={{ background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "16px", padding: isMobile ? "16px 18px" : "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: isMobile ? "11px" : "12px", color: SS.textMuted, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {titre}
        </span>
        <div style={{ width: isMobile ? "30px" : "34px", height: isMobile ? "30px" : "34px", borderRadius: "9px", background: `${couleur}20`, display: "flex", alignItems: "center", justifyContent: "center", color: couleur }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: isMobile ? "26px" : "32px", fontWeight: "800", color: SS.text, lineHeight: 1 }}>{valeur}</div>
      {sous && <div style={{ fontSize: "12px", color: SS.textDim, marginTop: "6px" }}>{sous}</div>}
    </div>
  );

  // ─────────────────────────────────────────────────────
  return (
    <div style={{ color: SS.text, fontFamily: "var(--font-sans, sans-serif)" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px", flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", width: isMobile ? "100%" : "auto" }}>
          {/* Avatar initiales */}
          <div style={{
            width: isMobile ? "46px" : "52px", height: isMobile ? "46px" : "52px", borderRadius: "14px",
            background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isMobile ? "18px" : "20px", fontWeight: "800", color: "#fff",
            boxShadow: `0 4px 18px ${SS.gold}40`, flexShrink: 0,
          }}>
            {initiales()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "800", color: SS.goldDark, margin: 0, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nomAffiche}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: SS.textDim }}>Espace vendeur · Santa'Style</span>
              <span style={{
                padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700",
                background: SS.successBg, color: SS.success, border: `1px solid ${SS.success}30`,
              }}>
                En ligne
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", width: isMobile ? "100%" : "auto" }}>
          <button onClick={() => navigate("/ventes")}
            style={{ padding: "9px 18px", borderRadius: "10px", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, border: "none", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: `0 2px 10px ${SS.gold}35`, flex: isMobile ? 1 : "none", justifyContent: "center" }}>
            <Plus size={15} /> {!isMobile && "Nouvelle vente"}
          </button>
          <button onClick={() => setRefresh(r => r + 1)}
            style={{ padding: "9px", borderRadius: "10px", background: SS.surface, border: `1px solid ${SS.border}`, cursor: "pointer", display: "flex", alignItems: "center" }}
            title="Actualiser">
            <RefreshCw size={15} color={SS.textMuted} />
          </button>
        </div>
      </div>

      {/* ── Carte debug — s'affiche uniquement si problème de filtre ── */}
      {!loading && ventes.length > 0 && mesVentes.length === 0 && (
        <div style={{
          marginBottom: "20px", padding: "14px 16px", borderRadius: "12px",
          background: "#FFF8E1", border: "1px solid #FFB300",
          display: "flex", gap: "12px", alignItems: "flex-start",
        }}>
          <AlertCircle size={18} color="#E65100" style={{ flexShrink: 0, marginTop: "1px" }} />
          <div style={{ fontSize: isMobile ? "11px" : "12px", color: "#5D4037", lineHeight: 1.8 }}>
            <strong>Diagnostic filtre vendeur</strong><br />
            {ventes.length} vente(s) totales — aucune ne correspond à votre compte.<br />
            <strong>Votre username :</strong>{" "}
            <code style={{ background: "#FFF3E0", padding: "1px 5px", borderRadius: "3px" }}>{username || "non défini"}</code>
            {" · "}
            <strong>Votre id :</strong>{" "}
            <code style={{ background: "#FFF3E0", padding: "1px 5px", borderRadius: "3px" }}>{userId || "non défini ← corriger Login.jsx"}</code>
            <br />
            <strong>Champs de la 1ère vente :</strong>{" "}
            <code style={{ background: "#FFF3E0", padding: "1px 5px", borderRadius: "3px" }}>
              {venteCles.join(", ")}
            </code>
            <br />
            <strong>Valeurs des champs "vendeur" :</strong>{" "}
            {venteCles
              .filter(k => k.toLowerCase().includes("vendeur"))
              .map(k => (
                <code key={k} style={{ background: "#FFF3E0", padding: "1px 5px", borderRadius: "3px", marginRight: "6px" }}>
                  {k} = {JSON.stringify(ventes[0][k])}
                </code>
              ))
            }
          </div>
        </div>
      )}

      {/* ── Métriques ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {card("Mes ventes",       mesVentes.length,                         <ShoppingBag size={17} />, SS.gold,      "Transactions enregistrées")}
        {card("Mon CA",           `${totalCA.toLocaleString("fr-FR")} GNF`, <DollarSign  size={17} />, SS.goldLight, "Chiffre d'affaires total")}
        {card("Unités vendues",   totalUnites,                              <Package     size={17} />, SS.success,   "Articles vendus")}
        {card("Stocks critiques", stocksCritiques,                          <Zap         size={17} />, "#C2450A",    `${stocksEpuises} épuisé${stocksEpuises > 1 ? "s" : ""}`)}
      </div>

      {/* ── Accès rapides ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Ventes",     path: "/ventes",     icon: <ShoppingBag size={20} />, color: SS.gold    },
          { label: "Produits",   path: "/produits",   icon: <Package     size={20} />, color: "#1d4ed8"  },
          { label: "Stocks",     path: "/stocks",     icon: <Layers      size={20} />, color: SS.success },
          { label: "Catégories", path: "/categories", icon: <Tag         size={20} />, color: "#7c3aed"  },
        ].map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)}
            style={{ padding: isMobile ? "16px 12px" : "18px 14px", borderRadius: "14px", background: SS.surface, border: `1px solid ${SS.border}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.boxShadow = `0 4px 16px ${item.color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = SS.border;  e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
              {item.icon}
            </div>
            <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "700", color: SS.text }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* ── Deux colonnes : mes ventes + activité équipe ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>

        {/* Mes dernières ventes */}
        <div style={{ background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "16px", padding: isMobile ? "16px" : "20px" }}>
          <div style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Mes dernières ventes
            <button onClick={() => navigate("/ventes")}
              style={{ fontSize: "11px", color: SS.gold, background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>
              Voir tout →
            </button>
          </div>

          {loading ? (
            <div style={{ color: SS.textDim, fontSize: "13px", textAlign: "center", padding: "2rem" }}>Chargement...</div>
          ) : mesVentes.length === 0 ? (
            <div style={{ color: SS.textDim, fontSize: "13px", textAlign: "center", padding: "2rem" }}>
              Aucune vente enregistrée
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {mesVentes.slice(0, 6).map((v, i) => (
                <div key={v.id || i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: SS.card, border: `1px solid ${SS.border}` }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${SS.gold}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ShoppingBag size={14} color={SS.gold} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "600", color: SS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.produit_nom || `Produit #${v.produit}`}
                    </div>
                    <div style={{ fontSize: "11px", color: SS.textMuted }}>
                      {[v.taille, v.couleur, `qté ${v.quantite}`].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: "700", color: SS.goldLight, flexShrink: 0, textAlign: "right" }}>
                    {Number(v.prix_total || 0).toLocaleString("fr-FR")} GNF
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activité récente de l'équipe */}
        <div style={{ background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "16px", padding: isMobile ? "16px" : "20px" }}>
          <div style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={14} color={SS.gold} />
            Activité récente — équipe
          </div>

          {loading ? (
            <div style={{ color: SS.textDim, fontSize: "13px", textAlign: "center", padding: "2rem" }}>Chargement...</div>
          ) : logs.length === 0 ? (
            <div style={{ color: SS.textDim, fontSize: "13px", textAlign: "center", padding: "2rem" }}>Aucune activité</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: isMobile ? "250px" : "300px", overflowY: "auto" }}>
              {logs.slice(0, 12).map((log, i) => {
                const cfg    = ACTION_CONFIG[log.action] || { label: log.action, color: SS.textMuted, bg: SS.card };
                const isMine = log.user_username === user?.username;
                return (
                  <div key={log.id || i} style={{
                    display: "flex", alignItems: "flex-start", gap: "10px",
                    padding: "8px 10px", borderRadius: "8px",
                    background: isMine ? `${SS.gold}08` : SS.card,
                    border: isMine ? `1px solid ${SS.gold}30` : "none",
                  }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ShoppingBag size={12} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? "11px" : "12px", color: SS.text, fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.description || "—"}
                      </div>
                      <div style={{ fontSize: "10px", color: SS.textDim, marginTop: "2px", display: "flex", gap: "6px" }}>
                        {log.user_username && (
                          <span style={{ fontWeight: "700", color: isMine ? SS.goldLight : SS.textDim }}>
                            {isMine ? "Vous" : log.user_username}
                          </span>
                        )}
                        {log.created_at && new Date(log.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "20px", background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VendeurDashboard;