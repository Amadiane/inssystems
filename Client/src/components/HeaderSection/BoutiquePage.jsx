import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ShoppingBag, Package, Sparkles } from "lucide-react";
import CONFIG from "../../config/config.js";
import track from "../../utils/tracker";

const SS = {
  bg: "#FFFFFF", surface: "#FDFAF4", card: "#F7F2E8",
  border: "#EDE5CC", borderHover: "#C9A84C",
  gold: "#C9A84C", goldLight: "#8A6A20", goldDark: "#5C3D00",
  text: "#1A1208", textMuted: "#8A6A20", textDim: "#C8A85A",
  success: "#1A6B3C", successBg: "#D4EDDF",
  warning: "#92600A", warningBg: "#FEF3CC",
  danger: "#A32020", dangerBg: "#FDEAEA",
  orange: "#C2450A", orangeBg: "#FEF0E6",
};

const GENRE_CONFIG = {
  hommes:      { label: "👔 Hommes",      bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)",  color: "#1d4ed8" },
  femmes:      { label: "👗 Femmes",      bg: "rgba(236,72,153,0.1)",  border: "rgba(236,72,153,0.3)",  color: "#be185d" },
  enfants:     { label: "🧒 Enfants",     bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   color: "#15803d" },
  accessoires: { label: "👜 Accessoires", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)",  color: "#7c3aed" },
};

const WAIcon = ({ size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.643a.5.5 0 0 0 .61.61l5.788-1.471A11.941 11.941 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.57-5.33-1.548l-.383-.232-3.968 1.01 1.01-3.968-.232-.383A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const BadgeStock = ({ total }) => {
  const s = { padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" };
  if (total === 0)  return <span style={{ ...s, background: SS.dangerBg,  color: SS.danger,  border: `1px solid ${SS.danger}40`  }}>Épuisé</span>;
  if (total <= 3)   return <span style={{ ...s, background: SS.orangeBg,  color: SS.orange,  border: `1px solid ${SS.orange}40`  }}>⚡ {total} restant{total > 1 ? "s" : ""}</span>;
  if (total <= 10)  return <span style={{ ...s, background: SS.warningBg, color: SS.warning, border: `1px solid ${SS.warning}40` }}>Stock limité</span>;
  return              <span style={{ ...s, background: SS.successBg, color: SS.success, border: `1px solid ${SS.success}40` }}>✓ Disponible</span>;
};

// ── Sélecteur genre ────────────────────────────────────────────────
const GenreSelector = ({ onSelect }) => {
  const [hovered, setHovered] = useState(null);
  const choices = [
    { value: "hommes",      icon: "👔", label: "Homme",       sub: "Mode masculine",  borderColor: "rgba(59,130,246,0.5)",  hoverBg: "#E6F1FB" },
    { value: "femmes",      icon: "👗", label: "Femme",       sub: "Mode féminine",   borderColor: "rgba(236,72,153,0.5)",  hoverBg: "#FBEAF0" },
    { value: "enfants",     icon: "🧒", label: "Enfant",      sub: "Mode enfantine",  borderColor: "rgba(34,197,94,0.5)",   hoverBg: "#F0FDF4" },
    { value: "accessoires", icon: "👜", label: "Accessoires", sub: "Sacs & bijoux",   borderColor: "rgba(168,85,247,0.5)",  hoverBg: "#FAF5FF" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(255,252,245,0.97)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "40px 36px", maxWidth: "500px", width: "100%", border: "1px solid #EDE5CC", boxShadow: "0 24px 64px rgba(201,168,76,0.12), 0 4px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <div style={{ padding: "6px 18px 6px 8px", borderRadius: "30px", background: "linear-gradient(135deg, #8A6A20, #C9A84C)", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: "14px", fontWeight: "900", fontFamily: "serif" }}>S</span>
            </div>
            <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>Santa'Style</span>
          </div>
        </div>
        <div style={{ fontSize: "26px", fontWeight: "800", color: SS.text, textAlign: "center", marginBottom: "8px" }}>Bienvenue !</div>
        <div style={{ fontSize: "15px", color: SS.textMuted, textAlign: "center", marginBottom: "28px" }}>Que cherchez-vous aujourd'hui ?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          {choices.map(c => (
            <button key={c.value} onClick={() => onSelect(c.value)}
              onMouseEnter={() => setHovered(c.value)} onMouseLeave={() => setHovered(null)}
              style={{ padding: "22px 12px", borderRadius: "16px", textAlign: "center", cursor: "pointer", border: `2px solid ${hovered === c.value ? c.borderColor : SS.border}`, background: hovered === c.value ? c.hoverBg : SS.surface, transition: "all 0.18s", outline: "none", transform: hovered === c.value ? "translateY(-3px)" : "none", boxShadow: hovered === c.value ? "0 8px 24px rgba(201,168,76,0.12)" : "none" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px", lineHeight: 1 }}>{c.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: SS.text, marginBottom: "3px" }}>{c.label}</div>
              <div style={{ fontSize: "11px", color: SS.textMuted }}>{c.sub}</div>
            </button>
          ))}
        </div>
        <button onClick={() => onSelect("tout")}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", background: `linear-gradient(135deg, ${SS.goldLight}, ${SS.gold})`, border: "none", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 16px rgba(201,168,76,0.25)", transition: "opacity 0.15s" }}>
          <ShoppingBag size={16} /> Voir toute la boutique
        </button>
        <div style={{ textAlign: "center", marginTop: "14px", fontSize: "12px", color: SS.textDim }}>
          Vous pourrez changer à tout moment depuis les filtres
        </div>
      </div>
    </div>
  );
};

// ── Carte produit ──────────────────────────────────────────────────
const CarteProduit = ({ produit, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const total  = produit.stocks?.reduce((a, s) => a + s.quantite, 0) ?? 0;
  const epuise = total === 0;
  const isNew  = () => produit.est_nouveau === true;

  const envoyerWA = (e) => {
    track("clic_whatsapp", { produit_id: produit.id, produit_nom: produit.nom });
    e.stopPropagation();
    const msg = encodeURIComponent(`Bonjour Santa'Style ! 👋\nJe souhaite commander :\n\n🛍️ *${produit.nom}*\n💰 Prix : ${Number(produit.prix).toLocaleString("fr-FR")} GNF\n🔗 Lien : ${window.location.origin}/boutique/${produit.id}\n\nEst-ce disponible ?`);
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER || "224620762508"}?text=${msg}`, "_blank");
  };

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: "18px", overflow: "hidden", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", cursor: epuise ? "default" : "pointer", transform: hovered && !epuise ? "translateY(-6px)" : "none", boxShadow: hovered && !epuise ? `0 20px 48px rgba(201,168,76,0.15), 0 8px 16px rgba(0,0,0,0.06)` : "0 1px 6px rgba(0,0,0,0.06)", border: `1px solid ${hovered && !epuise ? SS.gold + "60" : SS.border}` }}>
      <div onClick={() => !epuise && onClick(produit)}
        style={{ position: "relative", paddingBottom: "130%", background: SS.surface, overflow: "hidden" }}>
        {produit.image_url ? (
          <>
            <img src={produit.image_url} alt={produit.nom}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transition: "transform 0.5s", transform: hovered && !epuise ? "scale(1.06)" : "scale(1)", filter: epuise ? "brightness(0.5) saturate(0.7)" : "brightness(1)" }}
              onError={e => { e.target.style.display = "none"; }} />
            {!epuise && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(0,0,0,0.50), transparent)", pointerEvents: "none" }} />}
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Package size={52} color={`${SS.gold}35`} />
            <span style={{ fontSize: "11px", color: SS.textDim }}>Pas d'image</span>
          </div>
        )}
        {epuise && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
            <span style={{ background: "rgba(0,0,0,0.8)", color: "#fff", padding: "10px 24px", borderRadius: "30px", fontSize: "15px", fontWeight: "800", border: "1px solid rgba(255,255,255,0.2)" }}>Épuisé</span>
          </div>
        )}
        {!epuise && produit.image_url && (
          <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              {Number(produit.prix).toLocaleString("fr-FR")} GNF
            </span>
          </div>
        )}
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "5px" }}>
          {isNew() && (
            <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", background: SS.gold, color: "#1A1208", display: "flex", alignItems: "center", gap: "4px" }}>
              <Sparkles size={10} /> Nouveau
            </span>
          )}
          {!epuise && total <= 3 && (
            <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: SS.danger, color: "#fff" }}>🔥 Dernières pièces</span>
          )}
        </div>
        {!epuise && total <= 10 && (
          <div style={{ position: "absolute", top: "12px", right: "12px" }}>
            <span style={{ padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: "rgba(255,255,255,0.92)", color: SS.warning }}>
              {total} restant{total > 1 ? "s" : ""}
            </span>
          </div>
        )}
        {!epuise && hovered && (
          <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
            <button onClick={envoyerWA}
              style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#25D366", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(37,211,102,0.5)" }}>
              <WAIcon size={20} />
            </button>
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div onClick={() => !epuise && onClick(produit)}
          style={{ fontSize: "15px", fontWeight: "700", color: SS.text, marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: epuise ? "default" : "pointer" }}>
          {produit.nom}
        </div>
        {produit.description && (
          <div style={{ fontSize: "12px", color: SS.textMuted, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {produit.description}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "16px", fontWeight: "800", color: SS.goldLight }}>
            {Number(produit.prix).toLocaleString("fr-FR")} GNF
          </span>
          <BadgeStock total={total} />
        </div>
        {total > 0 && total <= 10 && (
          <div style={{ marginBottom: "10px" }}>
            <div style={{ height: "3px", borderRadius: "2px", background: SS.border, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "2px", width: `${Math.min((total / 15) * 100, 100)}%`, background: total <= 3 ? SS.danger : SS.warning }} />
            </div>
          </div>
        )}
        {!epuise && (
          <button onClick={envoyerWA}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "11px", borderRadius: "10px", border: "none", background: "#25D366", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", marginBottom: "8px", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <WAIcon size={16} /> Commander
          </button>
        )}
        <button onClick={() => onClick(produit)}
          style={{ width: "100%", padding: "9px", borderRadius: "10px", background: "transparent", border: `1px solid ${SS.border}`, color: epuise ? SS.textDim : SS.goldLight, fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { if (!epuise) { e.currentTarget.style.background = SS.surface; e.currentTarget.style.borderColor = SS.gold; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = SS.border; }}>
          Voir le détail
        </button>
      </div>
    </div>
  );
};

// ── Page principale ────────────────────────────────────────────────
const BoutiquePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [produits, setProduits]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [search, setSearch]           = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [filtreDispo, setFiltreDispo] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [showGenreSelector, setShowGenreSelector] = useState(() => !sessionStorage.getItem("ss_genre_choisi"));

  const filtreNouveau = searchParams.get("filtre") === "nouveau";
  const filtreGenre   = searchParams.get("cat") || "";
  const searchParam   = searchParams.get("q") || "";

  useEffect(() => { track("visite_boutique"); }, []);
  useEffect(() => { if (filtreGenre) track("filtre_genre", { genre: filtreGenre }); }, [filtreGenre]);
  useEffect(() => { if (search.length > 2) track("recherche", { recherche: search }); }, [search]);
  useEffect(() => { if (searchParam) setSearch(searchParam); }, [searchParam]);
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rP, rC, rS] = await Promise.all([fetch(CONFIG.API_PRODUIT), fetch(CONFIG.API_CATEGORIE), fetch(`${CONFIG.BASE_URL}/api/stocks/`)]);
      if (!rS.ok) console.error(`❌ API stocks ${rS.status}`);
      const [dP, dC, dS] = await Promise.all([rP.json(), rC.json(), rS.json()]);
      const produitsData = Array.isArray(dP) ? dP : [];
      const stocksData   = Array.isArray(dS) ? dS : [];
      setProduits(produitsData.map(p => ({ ...p, stocks: stocksData.filter(s => String(s.produit) === String(p.id)) })));
      setCategories(Array.isArray(dC) ? dC : []);
    } catch (err) { console.error("Erreur boutique", err); }
    finally { setLoading(false); }
  };

  const handleGenreSelect = (choix) => {
    sessionStorage.setItem("ss_genre_choisi", choix);
    setShowGenreSelector(false);
    if (choix !== "tout") {
      const params = new URLSearchParams(searchParams);
      params.set("cat", choix);
      setSearchParams(params);
    }
  };

  const genreValue = filtreGenre ? filtreGenre.replace(/s$/, "").replace(/accessoires/, "accessoire") : "";
  const getCatNomRecherche = (id) => categories.find(c => c.id === id)?.nom || "";

  const filtered = produits.filter(p => {
    const total = p.stocks?.reduce((a, s) => a + s.quantite, 0) ?? 0;
    const terme = search.toLowerCase().trim();
    const ms = !terme || p.nom.toLowerCase().includes(terme) || (p.description || "").toLowerCase().includes(terme) || getCatNomRecherche(p.categorie).toLowerCase().includes(terme);
    const mc = selectedCat ? p.categorie === selectedCat : true;
    const md = filtreDispo ? total > 0 : true;
    const mn = filtreNouveau ? p.est_nouveau === true : true;
    const mg = filtreGenre ? (p.genre === filtreGenre || p.genre === genreValue) : true;
    return ms && mc && md && mn && mg;
  });

  const totalDispo   = produits.filter(p => (p.stocks?.reduce((a, s) => a + s.quantite, 0) ?? 0) > 0).length;
  const totalEpuises = produits.filter(p => (p.stocks?.reduce((a, s) => a + s.quantite, 0) ?? 0) === 0).length;
  const getCatNom    = id => categories.find(c => c.id === id)?.nom || "";
  const effacerFiltre = (param) => { searchParams.delete(param); setSearchParams(searchParams); };

  const heroTitre =
    filtreNouveau               ? "Nos Nouveautés"
    : filtreGenre === "hommes"      ? "Collection Hommes"
    : filtreGenre === "femmes"      ? "Collection Femmes"
    : filtreGenre === "enfants"     ? "Collection Enfants"
    : filtreGenre === "accessoires" ? "Accessoires"
    : "Santa'Style Boutique";

  const heroSous =
    filtreNouveau               ? "Les derniers articles ajoutés"
    : filtreGenre === "hommes"      ? "Mode masculine · Élégance et style"
    : filtreGenre === "femmes"      ? "Mode féminine · Tendances & Raffinement"
    : filtreGenre === "enfants"     ? "Mode enfantine · Confort & Couleurs"
    : filtreGenre === "accessoires" ? "Sacs, bijoux & bien plus"
    : "Hommes · Femmes · Enfants · Accessoires";

  const genreTabs = [
    { val: "",            label: "Tous" },
    { val: "hommes",      label: "👔 Hommes" },
    { val: "femmes",      label: "👗 Femmes" },
    { val: "enfants",     label: "🧒 Enfants" },
    { val: "accessoires", label: "👜 Accessoires" },
  ];

  return (
    <>
      {showGenreSelector && <GenreSelector onSelect={handleGenreSelect} />}

      <div style={{ minHeight: "100vh", background: SS.bg, fontFamily: "var(--font-sans, sans-serif)" }}>

        {/* Hero */}
        <div style={{ paddingTop: "96px", paddingBottom: "52px", paddingLeft: "24px", paddingRight: "24px", textAlign: "center", position: "relative", overflow: "hidden", background: SS.bg, borderBottom: `1px solid ${SS.border}` }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${SS.gold}12 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 16px", borderRadius: "20px", background: `${SS.gold}12`, border: `1px solid ${SS.gold}35`, fontSize: "11px", color: SS.goldLight, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px", fontWeight: "700" }}>
              <Sparkles size={11} color={SS.gold} />
              {filtreNouveau ? "Nouveautés" : filtreGenre ? `Collection ${filtreGenre}` : "Nouvelle Collection"}
            </div>
            <h1 style={{ fontSize: "46px", fontWeight: "900", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {filtreGenre || filtreNouveau ? (
                <span style={{ color: SS.text }}>{heroTitre}</span>
              ) : (
                <>
                  <span style={{ background: "linear-gradient(135deg, #8A6A20, #C9A84C, #E8C96A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Santa'Style</span>
                  <span style={{ color: SS.text }}> Boutique</span>
                </>
              )}
            </h1>
            <p style={{ fontSize: "16px", color: SS.textMuted, margin: "0 0 32px", fontWeight: "400", letterSpacing: "0.04em" }}>
              {heroSous}
            </p>
            {/* ✅ Barre infos — "Sélection internationale" à la place d'une mention de pays */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "20px", padding: "12px 28px", borderRadius: "40px", background: SS.surface, border: `1px solid ${SS.border}`, fontSize: "13px", color: SS.textMuted, flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                {totalDispo} articles disponibles
              </span>
              <span style={{ opacity: 0.3 }}>|</span>
              {/* ✅ "Sélection internationale" — neutre, sans pays */}
              <span>🌍 Sélection internationale</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>💬 Commande WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "32px 16px 60px" }}>

          {/* Tabs genre */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "inline-flex", background: SS.surface, borderRadius: "12px", padding: "4px", border: `1px solid ${SS.border}`, flexWrap: "wrap", gap: "2px" }}>
              {genreTabs.map(tab => {
                const isActive = filtreGenre === tab.val;
                const cfg = GENRE_CONFIG[tab.val];
                return (
                  <button key={tab.val}
                    onClick={() => { const p = new URLSearchParams(searchParams); if (tab.val) p.set("cat", tab.val); else p.delete("cat"); setSearchParams(p); }}
                    style={{ padding: "8px 18px", borderRadius: "9px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", transition: "all 0.15s", background: isActive ? (cfg ? cfg.bg : SS.gold) : "transparent", color: isActive ? (cfg ? cfg.color : "#1A1208") : SS.textMuted, boxShadow: isActive ? "0 1px 6px rgba(0,0,0,0.08)" : "none" }}>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recherche */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: `1px solid ${SS.border}`, borderRadius: "12px", padding: "0 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <Search size={16} color={SS.textDim} />
              <input placeholder="Rechercher un article, une catégorie..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "14px", padding: "13px 0" }}
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><X size={15} color={SS.textDim} /></button>}
            </div>
            <button onClick={() => setFiltreDispo(!filtreDispo)}
              style={{ padding: "0 20px", borderRadius: "12px", cursor: "pointer", border: `1px solid ${filtreDispo ? SS.gold : SS.border}`, background: filtreDispo ? `${SS.gold}15` : "#fff", color: filtreDispo ? SS.goldDark : SS.textMuted, fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "7px", transition: "all 0.15s" }}>
              <SlidersHorizontal size={15} /> Disponibles
            </button>
          </div>

          {/* ✅ Catégories — affichage normal depuis la BDD, les noms viennent du backend */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={() => setSelectedCat(null)}
              style={{ padding: "8px 20px", borderRadius: "24px", fontSize: "13px", fontWeight: "700", border: `1px solid ${!selectedCat ? SS.gold : SS.border}`, background: !selectedCat ? SS.gold : "#fff", color: !selectedCat ? "#1A1208" : SS.textMuted, cursor: "pointer", transition: "all 0.15s" }}>
              Tout ({produits.length})
            </button>
            {categories.map(cat => {
              const count  = produits.filter(p => p.categorie === cat.id).length;
              const active = selectedCat === cat.id;
              return (
                <button key={cat.id} onClick={() => setSelectedCat(active ? null : cat.id)}
                  style={{ padding: "8px 20px", borderRadius: "24px", fontSize: "13px", fontWeight: "500", border: `1px solid ${active ? SS.gold : SS.border}`, background: active ? SS.gold : "#fff", color: active ? "#1A1208" : SS.textMuted, cursor: "pointer", transition: "all 0.15s" }}>
                  {cat.nom} ({count})
                </button>
              );
            })}
          </div>

          {/* Résumé + badges */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: SS.textMuted, padding: "5px 14px", borderRadius: "20px", background: SS.surface, border: `1px solid ${SS.border}` }}>
              {filtered.length} article{filtered.length > 1 ? "s" : ""}
            </span>
            {filtreNouveau && (
              <span style={{ fontSize: "12px", color: SS.goldDark, padding: "5px 14px", borderRadius: "20px", background: `${SS.gold}15`, border: `1px solid ${SS.gold}50`, display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                <Sparkles size={11} color={SS.gold} /> Nouveautés
                <button onClick={() => effacerFiltre("filtre")} style={{ background: "none", border: "none", cursor: "pointer", color: SS.goldLight, display: "flex", padding: 0 }}><X size={12} /></button>
              </span>
            )}
            {filtreGenre && GENRE_CONFIG[filtreGenre] && (
              <span style={{ fontSize: "12px", padding: "5px 14px", borderRadius: "20px", background: GENRE_CONFIG[filtreGenre].bg, border: `1px solid ${GENRE_CONFIG[filtreGenre].border}`, color: GENRE_CONFIG[filtreGenre].color, display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                {GENRE_CONFIG[filtreGenre].label}
                <button onClick={() => effacerFiltre("cat")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: "inherit" }}><X size={12} /></button>
              </span>
            )}
            {totalDispo > 0 && (
              <span style={{ fontSize: "12px", color: SS.success, padding: "5px 14px", borderRadius: "20px", background: SS.successBg, border: `1px solid ${SS.success}40` }}>
                ✓ {totalDispo} disponible{totalDispo > 1 ? "s" : ""}
              </span>
            )}
            {totalEpuises > 0 && (
              <span style={{ fontSize: "12px", color: SS.danger, padding: "5px 14px", borderRadius: "20px", background: SS.dangerBg, border: `1px solid ${SS.danger}40` }}>
                {totalEpuises} épuisé{totalEpuises > 1 ? "s" : ""}
              </span>
            )}
            {selectedCat && (
              <span style={{ fontSize: "12px", color: SS.gold, padding: "5px 14px", borderRadius: "20px", background: `${SS.gold}12`, border: `1px solid ${SS.gold}40`, display: "flex", alignItems: "center", gap: "6px" }}>
                {getCatNom(selectedCat)}
                <button onClick={() => setSelectedCat(null)} style={{ background: "none", border: "none", cursor: "pointer", color: SS.gold, display: "flex", padding: 0 }}><X size={12} /></button>
              </span>
            )}
            <button onClick={() => setShowGenreSelector(true)}
              style={{ marginLeft: "auto", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: SS.surface, border: `1px solid ${SS.border}`, color: SS.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              Changer de genre
            </button>
          </div>

          {/* Grille produits */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "6rem 0", color: SS.textMuted }}>
              <ShoppingBag size={48} color={`${SS.gold}40`} style={{ display: "block", margin: "0 auto 16px" }} />
              <div style={{ fontSize: "15px" }}>Chargement...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "6rem 0", color: SS.textMuted }}>
              <Package size={48} color={`${SS.gold}40`} style={{ display: "block", margin: "0 auto 16px" }} />
              <div style={{ fontSize: "18px", fontWeight: "600", color: SS.text, marginBottom: "8px" }}>
                {filtreNouveau ? "Aucune nouveauté pour le moment"
                  : filtreGenre ? `Aucun article ${filtreGenre} pour le moment`
                  : search ? `Aucun résultat pour "${search}"`
                  : "Aucun article trouvé"}
              </div>
              <button onClick={() => { setSearch(""); setSelectedCat(null); setFiltreDispo(false); setSearchParams(new URLSearchParams()); }}
                style={{ padding: "11px 24px", borderRadius: "10px", background: SS.gold, border: "none", color: "#1A1208", fontWeight: "700", cursor: "pointer" }}>
                Voir tous les articles
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "20px" }}>
              {filtered.map(p => (
                <CarteProduit key={p.id} produit={p} onClick={() => navigate(`/boutique/${p.id}`)} />
              ))}
            </div>
          )}

          {/* Footer CTA */}
          {!loading && filtered.length > 0 && (
            <div style={{ marginTop: "64px", padding: "32px", borderRadius: "20px", background: SS.surface, border: `1px solid ${SS.border}`, textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "700", color: SS.goldDark, marginBottom: "8px" }}>
                Vous cherchez quelque chose de spécifique ?
              </div>
              <div style={{ fontSize: "14px", color: SS.textMuted, marginBottom: "20px" }}>
                Notre équipe répond rapidement sur WhatsApp.
              </div>
              <button
                onClick={() => window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER || "224620762508"}?text=${encodeURIComponent("Bonjour Santa'Style ! 👋\nJe cherche un article spécifique, pouvez-vous m'aider ?")}`, "_blank")}
                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 32px", borderRadius: "12px", border: "none", background: "#25D366", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(37,211,102,0.3)", transition: "opacity 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <WAIcon size={20} /> Nous contacter
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BoutiquePage;