import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Package, CheckCircle, AlertCircle, XCircle, Play } from "lucide-react";
import CONFIG from "../../config/config.js";
import track from "../../utils/tracker";

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

// ── Palette identique à BoutiquePage ─────────────────────────────
const SS = {
  bg:          "#FFFFFF",
  surface:     "#FDFAF4",
  card:        "#F7F2E8",
  border:      "#EDE5CC",
  borderHover: "#C9A84C",
  gold:        "#C9A84C",
  goldLight:   "#8A6A20",
  goldDark:    "#5C3D00",
  text:        "#1A1208",
  textMuted:   "#8A6A20",
  textDim:     "#C8A85A",
  success:     "#1A6B3C",
  successBg:   "#D4EDDF",
  warning:     "#92600A",
  warningBg:   "#FEF3CC",
  danger:      "#A32020",
  dangerBg:    "#FDEAEA",
  orange:      "#C2450A",
  orangeBg:    "#FEF0E6",
};

// ── Icônes ────────────────────────────────────────────────────────
const WAIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.643a.5.5 0 0 0 .61.61l5.788-1.471A11.941 11.941 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.57-5.33-1.548l-.383-.232-3.968 1.01 1.01-3.968-.232-.383A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// ── Section vidéos réseaux sociaux ────────────────────────────────
const VideoSection = ({ produit, isMobile }) => {
  const videos = [
    produit.video_tiktok    && { url: produit.video_tiktok,    label: "Voir sur TikTok",    icon: <TikTokIcon size={16} />,    bg: "#010101", color: "#fff" },
    produit.video_instagram && { url: produit.video_instagram, label: "Voir sur Instagram", icon: <InstagramIcon size={16} />, bg: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", color: "#fff" },
    produit.video_facebook  && { url: produit.video_facebook,  label: "Voir sur Facebook",  icon: <FacebookIcon size={16} />,  bg: "#1877F2", color: "#fff" },
  ].filter(Boolean);

  if (videos.length === 0) return null;

  return (
    <div style={{ borderRadius: "12px", background: SS.surface, border: `1px solid ${SS.border}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", background: SS.card, borderBottom: `1px solid ${SS.border}`, display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${SS.gold}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={14} color={SS.gold} />
        </div>
        <div>
          <div style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "700", color: SS.text }}>Vu sur les réseaux</div>
          <div style={{ fontSize: "11px", color: SS.textMuted }}>Ce produit a été présenté en vidéo</div>
        </div>
      </div>
      {/* Boutons */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {videos.map((v, i) => (
          <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: isMobile ? "10px 12px" : "11px 14px", borderRadius: "10px", background: v.bg, color: v.color, textDecoration: "none", fontSize: isMobile ? "12px" : "13px", fontWeight: "700", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            {v.icon}
            {v.label}
            <span style={{ marginLeft: "auto", fontSize: "11px", opacity: 0.7 }}>↗</span>
          </a>
        ))}
        <div style={{ fontSize: "11px", color: SS.textDim, textAlign: "center", paddingTop: "2px" }}>
          Regardez la vidéo avant de commander
        </div>
      </div>
    </div>
  );
};

const ProduitDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const [produit, setProduit]                 = useState(null);
  const [stocks, setStocks]                   = useState([]);
  const [categories, setCategories]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedTaille, setSelectedTaille]   = useState("");
  const [selectedCouleur, setSelectedCouleur] = useState("");
  const [couleursDispos, setCouleursDispos]   = useState([]);
  const [stockDispo, setStockDispo]           = useState(null);
  const [copied, setCopied]                   = useState(false);

  useEffect(() => {
    track("visite_produit", { produit_id: id, produit_nom: produit?.nom });
  }, []);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rProduit, rStocks, rCats] = await Promise.all([
        fetch(`${CONFIG.API_PRODUIT}${id}/`),
        fetch(CONFIG.API_STOCK),
        fetch(CONFIG.API_CATEGORIE),
      ]);
      const [dProduit, dStocks, dCats] = await Promise.all([rProduit.json(), rStocks.json(), rCats.json()]);
      setProduit(dProduit);
      setStocks(Array.isArray(dStocks) ? dStocks.filter(s => String(s.produit) === String(id)) : []);
      setCategories(Array.isArray(dCats) ? dCats : []);
    } catch (err) { console.error("Erreur produit detail", err); }
    finally { setLoading(false); }
  };

  const taillesDispos = [...new Set(stocks.filter(s => s.quantite > 0).map(s => s.taille))];

  useEffect(() => {
    if (!selectedTaille) { setCouleursDispos([]); setSelectedCouleur(""); setStockDispo(null); return; }
    const couleurs = stocks.filter(s => s.taille === selectedTaille && s.quantite > 0).map(s => s.couleur);
    setCouleursDispos(couleurs);
    setSelectedCouleur(""); setStockDispo(null);
  }, [selectedTaille]);

  useEffect(() => {
    if (!selectedTaille || !selectedCouleur) { setStockDispo(null); return; }
    const s = stocks.find(s => s.taille === selectedTaille && s.couleur === selectedCouleur);
    setStockDispo(s ? s.quantite : 0);
  }, [selectedCouleur]);

  const totalStock = stocks.reduce((a, s) => a + s.quantite, 0);
  const getCatNom  = (catId) => categories.find(c => c.id === catId)?.nom || "";

  const genererMessageWA = () => {
    const url = window.location.href;
    const parties = [
      `Bonjour Santa'Style !`,
      ``,
      `Je suis intéressé(e) par cet article :`,
      ``,
      `*${produit?.nom}*`,
      selectedTaille  ? `Taille : ${selectedTaille}`   : null,
      selectedCouleur ? `Couleur : ${selectedCouleur}` : null,
      `Prix : ${Number(produit?.prix).toLocaleString("fr-FR")} GNF`,
      ``,
      `Lien : ${url}`,
      ``,
      `Est-ce disponible ? Merci !`,
    ].filter(l => l !== null).join("\n");
    return encodeURIComponent(parties);
  };

  const handleWhatsApp = () => {
    track("clic_whatsapp", { produit_id: id, produit_nom: produit?.nom });
    window.open(`https://api.whatsapp.com/send?phone=224620762508&text=${genererMessageWA()}`, "_blank");
  };

  const handlePartager = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: produit?.nom, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const getBadge = () => {
    if (totalStock === 0)  return { label: "Épuisé",                   bg: SS.dangerBg,  color: SS.danger,  icon: <XCircle    size={15} /> };
    if (totalStock <= 3)   return { label: `Plus que ${totalStock} !`, bg: SS.orangeBg,  color: SS.orange,  icon: <AlertCircle size={15} /> };
    if (totalStock <= 10)  return { label: "Stock limité",             bg: SS.warningBg, color: SS.warning, icon: <AlertCircle size={15} /> };
    return                        { label: "Disponible",               bg: SS.successBg, color: SS.success, icon: <CheckCircle size={15} /> };
  };

  const btnStyle = (selected, disabled = false) => ({
    padding: isMobile ? "7px 14px" : "8px 18px", borderRadius: "8px",
    border: `1px solid ${selected ? SS.gold : SS.border}`,
    background: selected ? SS.gold : SS.surface,
    color: selected ? "#1A1208" : disabled ? SS.textDim : SS.text,
    fontSize: isMobile ? "12px" : "13px", fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1, transition: "all 0.15s",
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: SS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ textAlign: "center", color: SS.textMuted }}>
        <Package size={48} color={`${SS.gold}50`} style={{ marginBottom: "12px" }} />
        <div style={{ fontSize: "15px" }}>Chargement...</div>
      </div>
    </div>
  );

  if (!produit || produit.detail) return (
    <div style={{ minHeight: "100vh", background: SS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "16px", color: SS.text, marginBottom: "16px" }}>Produit introuvable</div>
        <button onClick={() => navigate("/boutique")}
          style={{ padding: "10px 20px", borderRadius: "8px", background: SS.gold, border: "none", color: "#1A1208", fontWeight: "600", cursor: "pointer" }}>
          Retour boutique
        </button>
      </div>
    </div>
  );

  const b = getBadge();

  return (
    <div style={{ minHeight: "100vh", background: SS.bg, fontFamily: "var(--font-sans, sans-serif)", paddingTop: isMobile ? "60px" : "0" }}>

      {/* Breadcrumb */}
      <div style={{ background: SS.surface, borderBottom: `1px solid ${SS.border}`, padding: isMobile ? "10px 16px" : "12px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
          <button onClick={() => navigate("/boutique")}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: SS.textMuted, cursor: "pointer", fontSize: isMobile ? "12px" : "13px", flexShrink: 0 }}>
            <ArrowLeft size={15} /> {!isMobile && "Boutique"}
          </button>
          <span style={{ color: SS.textDim }}>/ </span>
          {!isMobile && getCatNom(produit.categorie) && <>
            <span style={{ color: SS.textDim, fontSize: "13px" }}>{getCatNom(produit.categorie)}</span>
            <span style={{ color: SS.textDim }}>/</span>
          </>}
          <span style={{ color: SS.gold, fontSize: isMobile ? "12px" : "13px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{produit.nom}</span>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "20px 16px" : "32px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "24px" : "48px", alignItems: "start" }}>

          {/* IMAGE */}
          <div>
            <div style={{ borderRadius: "16px", overflow: "hidden", background: SS.surface, border: `1px solid ${SS.border}`, aspectRatio: "3/4", position: "relative" }}>
              {produit.image_url ? (
                <img src={produit.image_url} alt={produit.nom}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={80} color={`${SS.gold}30`} />
                </div>
              )}
              {totalStock > 0 && totalStock <= 3 && (
                <div style={{ position: "absolute", top: "14px", left: "14px", padding: "4px 14px", borderRadius: "20px", background: SS.danger, color: "#fff", fontSize: isMobile ? "11px" : "12px", fontWeight: "700" }}>
                  Dernières pièces !
                </div>
              )}
              {totalStock === 0 && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ background: "#111", color: "#fff", padding: "10px 24px", borderRadius: "20px", fontSize: "15px", fontWeight: "700" }}>Épuisé</span>
                </div>
              )}
            </div>

            <button onClick={handlePartager}
              style={{ marginTop: "12px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: isMobile ? "10px" : "11px", borderRadius: "10px", background: SS.surface, border: `1px solid ${SS.border}`, color: SS.textMuted, fontSize: isMobile ? "12px" : "13px", fontWeight: "500", cursor: "pointer" }}>
              <Share2 size={15} />
              {copied ? "✓ Lien copié !" : "Partager ce produit"}
            </button>
          </div>

          {/* INFOS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <div>
              {getCatNom(produit.categorie) && (
                <div style={{ fontSize: "11px", color: SS.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                  {getCatNom(produit.categorie)}
                </div>
              )}
              <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "700", color: SS.text, margin: "0 0 10px", lineHeight: 1.2 }}>
                {produit.nom}
              </h1>
              <div style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "700", color: SS.goldLight }}>
                {Number(produit.prix).toLocaleString("fr-FR")} GNF
              </div>
            </div>

            {/* Badge stock */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: b.bg, border: `1px solid ${b.color}40` }}>
              <span style={{ color: b.color }}>{b.icon}</span>
              <span style={{ fontSize: isMobile ? "13px" : "14px", fontWeight: "600", color: b.color }}>{b.label}</span>
            </div>

            {produit.description && (
              <div style={{ fontSize: isMobile ? "13px" : "14px", color: SS.textMuted, lineHeight: 1.7, padding: "14px 16px", borderRadius: "10px", background: SS.surface, border: `1px solid ${SS.border}` }}>
                {produit.description}
              </div>
            )}

            {/* ✅ Section vidéos réseaux sociaux */}
            <VideoSection produit={produit} isMobile={isMobile} />

            {/* Tailles */}
            {taillesDispos.length > 0 && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
                  Taille {selectedTaille && <span style={{ color: SS.gold }}>· {selectedTaille}</span>}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {taillesDispos.map(t => (
                    <button key={t} onClick={() => setSelectedTaille(t === selectedTaille ? "" : t)} style={btnStyle(selectedTaille === t)}>
                      {t}
                    </button>
                  ))}
                  {[...new Set(stocks.filter(s => s.quantite === 0).map(s => s.taille))]
                    .filter(t => !taillesDispos.includes(t))
                    .map(t => (
                      <button key={t + "_epuise"} disabled style={btnStyle(false, true)}>
                        <span style={{ textDecoration: "line-through" }}>{t}</span>
                      </button>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Couleurs */}
            {selectedTaille && couleursDispos.length > 0 && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
                  Couleur {selectedCouleur && <span style={{ color: SS.gold }}>· {selectedCouleur}</span>}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {couleursDispos.map(c => (
                    <button key={c} onClick={() => setSelectedCouleur(c === selectedCouleur ? "" : c)} style={btnStyle(selectedCouleur === c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock sélection */}
            {stockDispo !== null && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", fontSize: isMobile ? "12px" : "13px", fontWeight: "500", background: stockDispo === 0 ? SS.dangerBg : SS.successBg, border: `1px solid ${stockDispo === 0 ? SS.danger : SS.success}40`, color: stockDispo === 0 ? SS.danger : SS.success }}>
                {stockDispo === 0 ? "Cette combinaison est épuisée" : `${stockDispo} pièce${stockDispo > 1 ? "s" : ""} disponible${stockDispo > 1 ? "s" : ""}`}
              </div>
            )}

            {/* Bouton WhatsApp */}
            {totalStock > 0 && (
              <button onClick={handleWhatsApp}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", padding: isMobile ? "14px" : "16px", borderRadius: "12px", border: "none", background: "#25D366", color: "#fff", fontSize: isMobile ? "14px" : "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(37,211,102,0.3)" }}>
                <WAIcon size={isMobile ? 18 : 22} />
                {isMobile ? (
                  selectedTaille && selectedCouleur ? "Commander" : "Disponibilité"
                ) : (
                  selectedTaille && selectedCouleur
                    ? `Commander — ${selectedTaille} / ${selectedCouleur}`
                    : "Demander la disponibilité"
                )}
              </button>
            )}

            <div style={{ textAlign: "center", fontSize: isMobile ? "11px" : "12px", color: SS.textDim }}>
              {selectedTaille && selectedCouleur
                ? "Le lien de ce produit sera inclus dans votre message"
                : "Sélectionnez taille et couleur, ou contactez-nous directement"
              }
            </div>

            {/* Infos livraison */}
            <div style={{ borderRadius: "10px", background: SS.surface, border: `1px solid ${SS.border}`, overflow: "hidden" }}>
              {[
                { icon: "🚚", text: "Livraison disponible à Conakry" },
                { icon: "✅", text: "Commande confirmée via WhatsApp" },
                { icon: "🔄", text: "Échange possible sous 24h" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: isMobile ? "10px 14px" : "12px 16px", borderBottom: i < 2 ? `1px solid ${SS.border}` : "none" }}>
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  <span style={{ fontSize: isMobile ? "12px" : "13px", color: SS.textMuted }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduitDetail;