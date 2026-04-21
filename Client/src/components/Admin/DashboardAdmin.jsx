import React, { useEffect, useState } from "react";
import CONFIG from "../../config/config";
import { Navigate } from "react-router-dom";
import {
  ShoppingBag, Users, MessageCircle, Search,
  Eye, RefreshCw, BarChart3, Package, TrendingUp, Clock, Award, Zap
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Hook pour détecter mobile/tablette
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

// ✅ Métriques conservées — sans WA (toujours 0), sans visite_equipe/missions/commander/filtre_categorie
const LABELS = {
  visite_boutique: "Visite boutique",
  visite_produit:  "Visite produit",
  filtre_genre:    "Filtre genre",
  recherche:       "Recherche",
  visite_contact:  "Visite contact",
};

const ICONS_MAP = {
  visite_boutique: <ShoppingBag   size={15} />,
  visite_produit:  <Package       size={15} />,
  filtre_genre:    <Users         size={15} />,
  recherche:       <Search        size={15} />,
  visite_contact:  <MessageCircle size={15} />,
};

// ── Palette dorée Santa'Style ────────────────────────────
const G = {
  gold:      "#C9A84C",
  goldLight: "#8A6A20",
  goldDark:  "#5C3D00",
  goldPale:  "#F7F2E8",
  goldBorder:"#EDE5CC",  // valeur fixe — SS utilisé dans le composant via tokens
};

const DashboardAdmin = () => {
  const token = localStorage.getItem("access");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  const { tokens: SS } = useTheme();
  const { isMobile, isTablet } = useResponsive();

  const [stats,    setStats]    = useState(null);
  const [produits, setProduits] = useState({}); // ✅ map id → nom
  const [loading,  setLoading]  = useState(true);
  const [jours,    setJours]    = useState(30);
  const [refresh,  setRefresh]  = useState(0);

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/vendeurDashboard" replace />;

  // ✅ Charge stats + liste produits en parallèle
  const fetchStats = async () => {
    setLoading(true);
    try {
      const [resStats, resProduits] = await Promise.all([
        fetch(`${CONFIG.API_TRACK_STATS}?jours=${jours}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(CONFIG.API_PRODUIT), // lecture publique, pas de token
      ]);
      if (resStats.ok)   setStats(await resStats.json());
      if (resProduits.ok) {
        const data = await resProduits.json();
        const arr  = Array.isArray(data) ? data : (data.results || []);
        // ✅ Construit un dictionnaire id → nom pour résoudre les noms manquants
        const map  = {};
        arr.forEach(p => { map[String(p.id)] = p.nom; });
        setProduits(map);
      }
    } catch {}
    finally { setLoading(false); }
  };

  // ✅ Résout le nom d'un produit depuis le tracker ou le dictionnaire
  const resoudreNomProduit = (p) => {
    if (p.produit_nom && p.produit_nom.trim() !== "") return p.produit_nom;
    if (p.produit_id  && produits[String(p.produit_id)]) return produits[String(p.produit_id)];
    if (p.produit_id) return `Produit #${p.produit_id}`;
    return "—";
  };

  useEffect(() => { fetchStats(); }, [jours, refresh]);
  useEffect(() => {
    const iv = setInterval(() => setRefresh(r => r + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  // ── Nom affiché ──────────────────────────────────────
  const nomAdmin = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim()
    || user?.username || "Admin";
  const initiales = () => {
    const parts = nomAdmin.split(" ").filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (nomAdmin[0] || "A").toUpperCase();
  };

  // ── Heure de salutation ──────────────────────────────
  const heure = new Date().getHours();
  const salut = heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${G.gold}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <BarChart3 size={24} color={G.gold} />
        </div>
        <div style={{ color: SS.textMuted, fontSize: "14px", fontWeight: "500" }}>Chargement des statistiques...</div>
      </div>
    </div>
  );

  if (!stats) return null;

  const t      = stats.totaux;
  const maxJour  = stats.activite_jour.length > 0 ? Math.max(...stats.activite_jour.map(d => d.total)) : 1;
  const maxHeure = stats.heures.length > 0 ? Math.max(...stats.heures.map(h => h.total)) : 1;

  // ── Composants locaux ────────────────────────────────
  const StatCard = ({ label, value, icon, color, sub }) => (
    <div style={{
      background: SS.surface, border: `1px solid ${SS.border}`,
      borderRadius: "16px", padding: isMobile ? "16px" : "20px",
      position: "relative", overflow: "hidden",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${color}18`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: color, borderRadius: "16px 16px 0 0" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontSize: "11px", color: SS.textMuted, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: isMobile ? "24px" : "30px", fontWeight: "800", color: SS.text, lineHeight: 1, marginBottom: "6px", letterSpacing: "-0.02em" }}>
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      </div>
      {sub && <div style={{ fontSize: "12px", color: SS.textMuted }}>{sub}</div>}
    </div>
  );

  const SectionTitle = ({ children, icon }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
      {icon && <span style={{ color: G.gold, display: "flex" }}>{icon}</span>}
      <span style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {children}
      </span>
    </div>
  );

  const Card = ({ children, style = {} }) => (
    <div style={{ background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "16px", padding: isMobile ? "16px" : "20px", ...style }}>
      {children}
    </div>
  );

  const BarRow = ({ label, value, max, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: "600", color: SS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px" }}>
          {label}
        </div>
        <div style={{ height: "5px", borderRadius: "3px", background: SS.border, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.round((value / max) * 100)}%`, background: color, borderRadius: "3px", transition: "width 0.5s" }} />
        </div>
      </div>
      <span style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: "700", color, flexShrink: 0, minWidth: "28px", textAlign: "right" }}>{value}</span>
    </div>
  );

  // Colonnes responsive
  const getGridCols = () => {
    if (isMobile) return "1fr";
    if (isTablet) return "1fr 1fr";
    return "1fr 1fr";
  };

  const getKPIGridCols = () => {
    if (isMobile) return "1fr";
    if (isTablet) return "repeat(2, 1fr)";
    return "repeat(auto-fill, minmax(190px, 1fr))";
  };

  return (
    <div style={{ color: SS.text, fontFamily: "var(--font-sans, sans-serif)" }}>

      {/* ════ HEADER ════ */}
      <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px", flexDirection: isMobile ? "column" : "row" }}>

        {/* Profil admin */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", width: isMobile ? "100%" : "auto" }}>
          <div style={{
            width: isMobile ? "44px" : "52px", 
            height: isMobile ? "44px" : "52px", 
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${G.goldDark}, ${G.gold})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isMobile ? "18px" : "20px", 
            fontWeight: "800", color: "#fff",
            boxShadow: `0 4px 16px ${G.gold}40`, flexShrink: 0,
          }}>
            {initiales()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "800", color: SS.text, lineHeight: 1.2 }}>
              {salut}, {nomAdmin}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
              <span style={{ fontSize: isMobile ? "11px" : "12px", color: SS.textMuted }}>Administrateur · Santa'Style</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "20px", background: `${"#1A6B3C"}15`, border: `1px solid ${"#1A6B3C"}35`, fontSize: "10px", fontWeight: "700", color: "#1A6B3C" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1A6B3C", display: "inline-block" }} />
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", width: isMobile ? "100%" : "auto" }}>
          <div style={{ display: "flex", background: SS.card, borderRadius: "10px", padding: "3px", border: `1px solid ${SS.border}`, gap: "2px", flex: isMobile ? 1 : "none" }}>
            {[7, 30, 90].map(j => (
              <button key={j} onClick={() => setJours(j)} style={{
                padding: isMobile ? "6px 10px" : "6px 14px", 
                borderRadius: "8px", border: "none",
                fontSize: "12px", fontWeight: "700", cursor: "pointer",
                background: jours === j ? G.gold : "transparent",
                color: jours === j ? "#fff" : SS.textMuted,
                transition: "all 0.15s",
                flex: isMobile ? 1 : "none",
              }}>
                {j}j
              </button>
            ))}
          </div>
          <button onClick={() => { setLoading(true); setRefresh(r => r + 1); }}
            title="Actualiser"
            style={{ padding: "9px", borderRadius: "10px", background: SS.surface, border: `1px solid ${SS.border}`, cursor: "pointer", display: "flex", alignItems: "center", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = SS.card}
            onMouseLeave={e => e.currentTarget.style.background = SS.surface}>
            <RefreshCw size={16} color={SS.textMuted} />
          </button>
        </div>
      </div>

      {/* ════ KPI VISITEURS ════ */}
      <div style={{ display: "grid", gridTemplateColumns: getKPIGridCols(), gap: "14px", marginBottom: "20px" }}>
        <StatCard label="Visites boutique" value={t.visite_boutique} icon={<ShoppingBag size={16} />} color={G.gold}    sub={`${stats.uniques} visiteurs uniques`} />
        <StatCard label="Vues produits"    value={t.visite_produit}  icon={<Eye size={16} />}         color="#3B82F6"   sub={`${stats.top_produits.length} produits consultés`} />
        <StatCard label="Recherches"       value={t.recherche}       icon={<Search size={16} />}      color="#F59E0B"   sub={`${stats.recherches.length} termes uniques`} />
        <StatCard label="Contact"          value={t.visite_contact}  icon={<MessageCircle size={16} />} color={"#1A6B3C"} sub="Visites page contact" />
        <StatCard label="Filtres genre"    value={t.filtre_genre}    icon={<Users size={16} />}       color="#EC4899"   sub="Hommes / Femmes" />
      </div>

      {/* ════ ENTONNOIR ════ */}
      <Card style={{ marginBottom: "20px" }}>
        <SectionTitle icon={<TrendingUp size={14} />}>Entonnoir de conversion</SectionTitle>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "10px" : "1px", background: isMobile ? "transparent" : SS.border, borderRadius: "12px", overflow: "hidden" }}>
          {[
            { label: "Visiteurs",    val: t.visite_boutique, color: G.gold,    pct: 100 },
            { label: "Vues produit", val: t.visite_produit,  color: "#3B82F6", pct: t.visite_boutique > 0 ? Math.round((t.visite_produit / t.visite_boutique) * 100) : 0 },
            { label: "Contact",      val: t.visite_contact,  color: "#1A6B3C", pct: t.visite_boutique > 0 ? Math.round((t.visite_contact / t.visite_boutique) * 100) : 0 },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: isMobile ? "16px" : "20px 12px", background: SS.surface, borderRadius: isMobile ? "12px" : "0", border: isMobile ? `1px solid ${SS.border}` : "none" }}>
              <div style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "800", color: s.color, marginBottom: "2px", letterSpacing: "-0.02em" }}>
                {s.val.toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: SS.textMuted, fontWeight: "600", marginBottom: "10px" }}>{s.label}</div>
              <div style={{ height: "5px", borderRadius: "3px", background: SS.card }}>
                <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: "3px", transition: "width 0.6s" }} />
              </div>
              <div style={{ fontSize: "11px", color: s.color, marginTop: "5px", fontWeight: "700" }}>{s.pct}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ════ GRAPHES ════ */}
      <div style={{ display: "grid", gridTemplateColumns: getGridCols(), gap: "14px", marginBottom: "20px" }}>

        {/* Activité par jour */}
        <Card>
          <SectionTitle>Activité — {jours} derniers jours</SectionTitle>
          {stats.activite_jour.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: SS.textMuted, fontSize: "13px" }}>Aucune donnée</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "100px" }}>
                {stats.activite_jour.slice(-30).map((d, i) => (
                  <div key={i} title={`${d.jour} : ${d.total}`}
                    style={{ flex: 1, minWidth: "3px", borderRadius: "2px 2px 0 0", background: `linear-gradient(180deg, ${G.gold}CC, ${G.goldDark}88)`, height: `${Math.max((d.total / maxJour) * 100, 4)}%`, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.target.style.background = "#25D366"; }}
                    onMouseLeave={e => { e.target.style.background = `linear-gradient(180deg, ${G.gold}CC, ${G.goldDark}88)`; }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "10px", color: SS.textMuted }}>{stats.activite_jour[0]?.jour || ""}</span>
                <span style={{ fontSize: "10px", color: SS.textMuted }}>{stats.activite_jour[stats.activite_jour.length - 1]?.jour || ""}</span>
              </div>
            </>
          )}
        </Card>

        {/* Heures de pointe */}
        <Card>
          <SectionTitle icon={<Clock size={14} />}>Heures de pointe</SectionTitle>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "100px" }}>
            {Array.from({ length: 24 }, (_, h) => {
              const data  = stats.heures.find(x => x.heure === h);
              const total = data?.total || 0;
              const isHot = total > maxHeure * 0.7;
              return (
                <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  <div title={`${h}h : ${total}`}
                    style={{ width: "100%", borderRadius: "2px 2px 0 0", background: isHot ? "#25D366" : total > 0 ? G.gold : SS.card, height: `${total > 0 ? Math.max((total / maxHeure) * 100, 6) : 4}%`, marginTop: "auto", transition: "height 0.3s" }} />
                  {h % 6 === 0 && <span style={{ fontSize: "9px", color: SS.textMuted, marginTop: "2px" }}>{h}h</span>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ════ TOP PRODUITS + RECHERCHES ════ */}
      <div style={{ display: "grid", gridTemplateColumns: getGridCols(), gap: "14px", marginBottom: "20px" }}>

        {/* ✅ Top produits vus — affichage par nom avec rang médaillé */}
        <Card>
          <SectionTitle icon={<Package size={14} />}>Produits les plus vus</SectionTitle>
          {stats.top_produits.length === 0 ? (
            <div style={{ color: SS.textMuted, fontSize: "12px", textAlign: "center", padding: "1rem" }}>Aucune donnée</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {stats.top_produits.slice(0, 8).map((p, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const pct    = Math.round((p.total / stats.top_produits[0].total) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", width: "20px", flexShrink: 0, textAlign: "center" }}>
                        {medals[i] || <span style={{ fontSize: "11px", color: SS.textMuted }}>#{i + 1}</span>}
                      </span>
                      <span style={{ flex: 1, fontSize: isMobile ? "12px" : "13px", fontWeight: "600", color: SS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {resoudreNomProduit(p)}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: G.gold, flexShrink: 0 }}>
                        {p.total} vue{p.total > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div style={{ height: "4px", borderRadius: "2px", background: SS.card, marginLeft: "28px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? G.gold : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : `${G.gold}60`, borderRadius: "2px", transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recherches populaires */}
        <Card>
          <SectionTitle icon={<Search size={13} />}>Recherches populaires</SectionTitle>
          {stats.recherches.length === 0
            ? <div style={{ color: SS.textMuted, fontSize: "12px", textAlign: "center", padding: "1rem" }}>Aucune recherche</div>
            : stats.recherches.slice(0, 8).map((r, i) => (
                <BarRow key={i} label={`"${r.recherche}"`} value={r.total} max={stats.recherches[0].total} color="#F59E0B" />
              ))
          }
        </Card>
      </div>

      {/* ════ GENRE + ACTIVITÉ EN DIRECT ════ */}
      <div style={{ display: "grid", gridTemplateColumns: getGridCols(), gap: "14px", marginBottom: "20px" }}>

        {/* Répartition genre */}
        <Card>
          <SectionTitle icon={<Users size={14} />}>Répartition par genre</SectionTitle>
          {stats.genres.length === 0
            ? <div style={{ color: SS.textMuted, fontSize: "12px", textAlign: "center", padding: "1rem" }}>Aucun filtre utilisé</div>
            : stats.genres.map((g, i) => {
                const total = stats.genres.reduce((a, x) => a + x.total, 0);
                const pct   = Math.round((g.total / total) * 100);
                const map   = { hommes: { color: "#3B82F6", label: "Hommes" }, femmes: { color: "#EC4899", label: "Femmes" }, enfants: { color: "#10B981", label: "Enfants" }, accessoires: { color: "#7C3AED", label: "Accessoires" } };
                const cfg   = map[g.genre] || { color: G.gold, label: g.genre };
                return (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "600", color: SS.text }}>{cfg.label}</span>
                      <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "700", color: cfg.color }}>
                        {g.total.toLocaleString()} <span style={{ fontSize: "11px", color: SS.textMuted, fontWeight: "400" }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: "7px", borderRadius: "4px", background: SS.card }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: "4px", transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })
          }
        </Card>

        {/* Activité en direct */}
        <Card>
          <SectionTitle icon={<span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1A6B3C", display: "inline-block" }} />}>
            Activité en direct
          </SectionTitle>
          {stats.recentes.length === 0
            ? <div style={{ color: SS.textMuted, fontSize: "12px", textAlign: "center", padding: "1rem" }}>Aucune activité</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "260px", overflowY: "auto" }}>
                {stats.recentes.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "9px", background: SS.card }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${G.gold}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: G.gold }}>
                      {ICONS_MAP[r.type_action] || <Zap size={14} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: "600", color: SS.text }}>{LABELS[r.type_action] || r.type_action}</div>
                      {(r.produit_nom || r.recherche || r.genre) && (
                        <div style={{ fontSize: "11px", color: SS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.produit_nom || r.recherche || r.genre}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: "10px", color: SS.textMuted, flexShrink: 0 }}>{r.created_at}</span>
                  </div>
                ))}
              </div>
          }
        </Card>
      </div>

      {/* ════ TOUTES LES ACTIONS ════ */}
      <Card>
        <SectionTitle icon={<Award size={14} />}>Toutes les actions — {jours} derniers jours</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
          {Object.entries(LABELS).map(([key, label]) => (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "12px 14px", borderRadius: "12px",
              background: SS.card, border: `1px solid ${SS.border}`,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = G.gold + "60"}
            onMouseLeave={e => e.currentTarget.style.borderColor = SS.border}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${G.gold}12`, display: "flex", alignItems: "center", justifyContent: "center", color: G.gold, flexShrink: 0 }}>
                {ICONS_MAP[key]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "10px", color: SS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600" }}>
                  {label}
                </div>
                <div style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "800", color: SS.text, lineHeight: 1, letterSpacing: "-0.01em" }}>
                  {(t[key] || 0).toLocaleString("fr-FR")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardAdmin;