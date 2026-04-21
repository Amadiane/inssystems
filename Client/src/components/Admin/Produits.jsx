import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Pencil, Trash2, X, Check,
  Package, Search, ChevronDown, Image as ImageIcon,
  Layers, AlertCircle, ArrowRight, Sparkles, Link as LinkIcon,
  Play
} from "lucide-react";
import CONFIG from "../../config/config";
import { useTheme } from "../../context/ThemeContext";

const GENRE_OPTIONS = [
  { value: "mixte",  label: "✨ Mixte / Accessoire" },
  { value: "homme",  label: "👔 Homme" },
  { value: "femme",  label: "👗 Femme" },
  { value: "enfant", label: "🧒 Enfant" },
];

const GENRE_STYLE = {
  homme:  { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  color: "#1d4ed8" },
  femme:  { bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.3)",  color: "#be185d" },
  enfant: { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)",   color: "#15803d" },
  mixte:  { bg: "rgba(201,168,76,0.12)",  border: "rgba(201,168,76,0.3)",  color: "#8A6A20" },
};

// ── Icônes réseaux sociaux ────────────────────────────────────────
const TikTokIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
  </svg>
);

const FacebookIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// ── Champ lien vidéo ──────────────────────────────────────────────
const VideoLinkField = ({ label, icon, color, placeholder, value, onChange, SS }) => (
  <div>
    <div style={{ fontSize: "11px", color: SS.textMuted, marginBottom: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ color }}>{icon}</span>
      {label} <span style={{ color: SS.textDim }}>(optionnel)</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 12px", borderRadius: "8px", background: SS.card, border: `1px solid ${value ? color + "60" : SS.border}`, transition: "border-color 0.2s" }}>
      <span style={{ color: value ? color : SS.textDim, display: "flex", flexShrink: 0 }}>{icon}</span>
      <input type="url" placeholder={placeholder}
        style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "9px 0" }}
        value={value || ""}
        onChange={e => onChange(e.target.value)} />
      {value && (
        <button type="button" onClick={() => window.open(value, "_blank")}
          title="Tester le lien"
          style={{ background: "none", border: "none", cursor: "pointer", color, display: "flex", padding: 0 }}>
          <Play size={13} />
        </button>
      )}
      {value && (
        <button type="button" onClick={() => onChange("")}
          style={{ background: "none", border: "none", cursor: "pointer", color: SS.textDim, display: "flex", padding: 0 }}>
          <X size={12} />
        </button>
      )}
    </div>
  </div>
);

const Produits = () => {
  const navigate = useNavigate();
  const { tokens: SS } = useTheme();

  const [produits, setProduits]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [stocks, setStocks]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [showForm, setShowForm]     = useState(false);

  const emptyForm = {
    nom: "", description: "", prix: "", categorie: "",
    image: null, est_nouveau: false, genre: "mixte",
    video_tiktok: "", video_instagram: "", video_facebook: "",
  };
  const emptyStock = { taille: "", couleur: "", quantite: "1" };

  const [form, setForm]                 = useState(emptyForm);
  const [stockForm, setStockForm]       = useState(emptyStock);
  const [ajouterStock, setAjouterStock] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  const [editingId, setEditingId]               = useState(null);
  const [editForm, setEditForm]                 = useState({});
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [updating, setUpdating]                 = useState(false);
  const [deletingId, setDeletingId]             = useState(null);
  const [confirmDeleteId, setConfirmDeleteId]   = useState(null);

  const token   = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rP, rC, rS] = await Promise.all([
        fetch(CONFIG.API_PRODUIT,               { headers }),
        fetch(CONFIG.API_CATEGORIE,             { headers }),
        fetch(CONFIG.API_STOCK,                 { headers }),
      ]);
      const [dP, dC, dS] = await Promise.all([rP.json(), rC.json(), rS.json()]);
      if (rP.ok) setProduits(Array.isArray(dP) ? dP : []);
      if (rC.ok) setCategories(Array.isArray(dC) ? dC : []);
      if (rS.ok) setStocks(Array.isArray(dS) ? dS : []);
    } catch { setError("Erreur serveur"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CONFIG.CLOUDINARY_UPLOAD_PRESET);
    fd.append("folder", "produits");
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_NAME}/image/upload`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
  };

  // ── Corps commun produit (création + édition) ─────────────────
  const buildBody = (f, imageUrl) => ({
    nom:             f.nom,
    description:     f.description || "",
    prix:            f.prix,
    categorie:       f.categorie || null,
    est_nouveau:     f.est_nouveau,
    genre:           f.genre,
    video_tiktok:    f.video_tiktok    || null,
    video_instagram: f.video_instagram || null,
    video_facebook:  f.video_facebook  || null,
    ...(imageUrl && { image: imageUrl }),
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess("");
    try {
      let imageUrl = null;
      if (form.image) imageUrl = await uploadToCloudinary(form.image);

      const resProduit = await fetch(CONFIG.API_PRODUIT, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(form, imageUrl)),
      });

      if (!resProduit.ok) {
        const txt = await resProduit.text();
        try {
          const json = JSON.parse(txt);
          setError(Object.entries(json).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | "));
        } catch { setError(`Erreur ${resProduit.status}`); }
        return;
      }

      const produit = await resProduit.json();
      let stockCree = false;
      if (ajouterStock && stockForm.taille && stockForm.couleur) {
        const resStock = await fetch(CONFIG.API_STOCK, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ produit: produit.id, taille: stockForm.taille.trim(), couleur: stockForm.couleur.trim(), quantite: parseInt(stockForm.quantite) || 1 }),
        });
        if (resStock.ok) {
          const stockData = await resStock.json();
          setStocks(prev => [stockData, ...prev]);
          stockCree = true;
        }
      }

      setProduits(prev => [produit, ...prev]);
      setForm(emptyForm); setStockForm(emptyStock);
      setImagePreview(null); setShowForm(false);
      setSuccess(stockCree ? `✅ "${produit.nom}" créé et visible en boutique` : `⚠️ "${produit.nom}" créé — ajoutez un stock`);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) { setError(err.message || "Erreur serveur"); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id) => {
    setUpdating(true); setError(""); setSuccess("");
    try {
      let imageUrl = editForm.imageUrl || null;
      if (editForm.image instanceof File) imageUrl = await uploadToCloudinary(editForm.image);

      const res = await fetch(`${CONFIG.API_PRODUIT}${id}/`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(editForm, imageUrl)),
      });

      if (!res.ok) {
        const txt = await res.text();
        try { const json = JSON.parse(txt); setError(Object.entries(json).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")); }
        catch { setError(`Erreur ${res.status}`); }
        return;
      }

      const data = await res.json();
      setProduits(prev => prev.map(p => p.id === id ? data : p));
      setEditingId(null); setEditImagePreview(null);
      setSuccess("Produit modifié !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.message || "Erreur serveur"); }
    finally { setUpdating(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id); setError("");
    try {
      const res = await fetch(`${CONFIG.API_PRODUIT}${id}/`, { method: "DELETE", headers });
      if (res.ok || res.status === 204) {
        setProduits(prev => prev.filter(p => p.id !== id));
        setStocks(prev => prev.filter(s => String(s.produit) !== String(id)));
        setConfirmDeleteId(null);
        setSuccess("Produit supprimé !");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch { setError("Erreur serveur"); }
    finally { setDeletingId(null); }
  };

  const filtered    = produits.filter(p => {
    const ms = p.nom.toLowerCase().includes(search.toLowerCase());
    const mc = filterCat ? String(p.categorie) === filterCat : true;
    return ms && mc;
  });

  const getCatNom   = id => categories.find(c => c.id === id)?.nom || "—";
  const getStocks   = id => stocks.filter(s => String(s.produit) === String(id));
  const getTotalQte = id => getStocks(id).reduce((a, s) => a + s.quantite, 0);

  const inputStyle   = { width: "100%", padding: "10px 14px", borderRadius: "8px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.text, fontSize: "14px", outline: "none" };
  const inputSmStyle = { width: "100%", padding: "7px 10px", borderRadius: "7px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.text, fontSize: "13px", outline: "none" };

  const Toggle = ({ value, onChange }) => (
    <button type="button" onClick={onChange}
      style={{ width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", background: value ? SS.gold : SS.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: value ? "23px" : "3px", transition: "left 0.2s" }} />
    </button>
  );

  const GenreBadge = ({ genre }) => {
    if (!genre || genre === "mixte") return null;
    const s = GENRE_STYLE[genre] || GENRE_STYLE.mixte;
    const labels = { homme: "👔 Homme", femme: "👗 Femme", enfant: "🧒 Enfant" };
    return <span style={{ padding: "2px 10px", borderRadius: "20px", background: s.bg, border: `1px solid ${s.border}`, fontSize: "11px", color: s.color, fontWeight: "600" }}>{labels[genre]}</span>;
  };

  // ── Badges vidéo sur la card produit ─────────────────────────
  const VideoBadges = ({ produit }) => {
    const links = [
      produit.video_tiktok    && { icon: <TikTokIcon size={11} />,    color: "#010101", url: produit.video_tiktok,    label: "TikTok" },
      produit.video_instagram && { icon: <InstagramIcon size={11} />, color: "#E1306C", url: produit.video_instagram, label: "Reels" },
      produit.video_facebook  && { icon: <FacebookIcon size={11} />,  color: "#1877F2", url: produit.video_facebook,  label: "Facebook" },
    ].filter(Boolean);
    if (links.length === 0) return null;
    return (
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "6px" }}>
        {links.map((l, i) => (
          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "20px", background: l.color + "15", border: `1px solid ${l.color}40`, fontSize: "10px", fontWeight: "700", color: l.color, textDecoration: "none" }}>
            {l.icon} {l.label}
          </a>
        ))}
      </div>
    );
  };

  // ── Section liens vidéo (formulaire) ─────────────────────────
  const VideoSection = ({ values, onChange }) => (
    <div style={{ padding: "14px 16px", borderRadius: "10px", background: SS.bg, border: `1px solid ${SS.border}`, marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <Play size={14} color={SS.gold} />
        <span style={{ fontSize: "12px", fontWeight: "700", color: SS.goldLight, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Liens vidéos réseaux sociaux
        </span>
        <span style={{ fontSize: "10px", color: SS.textDim }}>— tous optionnels</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <VideoLinkField
          label="TikTok" icon={<TikTokIcon size={14} />} color="#010101"
          placeholder="https://www.tiktok.com/@santastyle/video/..."
          value={values.video_tiktok}
          onChange={v => onChange("video_tiktok", v)} SS={SS} />
        <VideoLinkField
          label="Instagram / Reels" icon={<InstagramIcon size={14} />} color="#E1306C"
          placeholder="https://www.instagram.com/reel/..."
          value={values.video_instagram}
          onChange={v => onChange("video_instagram", v)} SS={SS} />
        <VideoLinkField
          label="Facebook" icon={<FacebookIcon size={14} />} color="#1877F2"
          placeholder="https://www.facebook.com/santastyle/videos/..."
          value={values.video_facebook}
          onChange={v => onChange("video_facebook", v)} SS={SS} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: SS.bg, padding: "2rem", color: SS.text, fontFamily: "var(--font-sans, sans-serif)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Fil d'Ariane */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: SS.textDim }}>Gestion</span>
          <span style={{ fontSize: "12px", color: SS.textDim }}>/</span>
          <span style={{ fontSize: "12px", color: SS.gold }}>Produits</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate("/dashboardAdmin")}
              style={{ padding: "8px 10px", borderRadius: "8px", border: `1px solid ${SS.border}`, background: SS.card, cursor: "pointer", display: "flex", alignItems: "center", color: SS.textMuted }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${SS.gold}20`, border: `1px solid ${SS.gold}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={19} color={SS.gold} />
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: SS.goldLight }}>Produits</div>
                <div style={{ fontSize: "12px", color: SS.textDim }}>
                  {produits.length} article{produits.length > 1 ? "s" : ""} —{" "}
                  <span style={{ color: SS.success }}>{produits.filter(p => getTotalQte(p.id) > 0).length} en ligne</span>
                  {produits.filter(p => getTotalQte(p.id) === 0).length > 0 && (
                    <span style={{ color: SS.danger }}> · {produits.filter(p => getTotalQte(p.id) === 0).length} sans stock</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(""); }}
            style={{ background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, border: "none", borderRadius: "8px", padding: "10px 20px", color: "#1A1208", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: `0 2px 12px ${SS.gold}30` }}>
            <Plus size={16} /> Nouveau produit
          </button>
        </div>

        {/* Rappel flux */}
        <div style={{ padding: "10px 16px", borderRadius: "10px", background: `${SS.gold}10`, border: `1px solid ${SS.gold}30`, marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: SS.goldLight }}><Package size={13} color={SS.gold} /><strong>1. Produit</strong></div>
          <ArrowRight size={12} color={SS.textDim} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: SS.goldLight }}><Layers size={13} color={SS.gold} /><strong>2. Stock</strong></div>
          <ArrowRight size={12} color={SS.textDim} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: SS.success }}><Check size={13} color={SS.success} /><strong>3. Visible en boutique</strong></div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "10px", background: `${SS.danger}18`, border: `1px solid ${SS.danger}40`, color: SS.danger, fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: SS.danger }}><X size={15} /></button>
          </div>
        )}
        {success && (
          <div style={{ padding: "12px 16px", borderRadius: "10px", background: `${SS.success}18`, border: `1px solid ${SS.success}40`, color: SS.success, fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span>{success}</span>
            <button onClick={() => setSuccess("")} style={{ background: "none", border: "none", cursor: "pointer", color: SS.success }}><X size={15} /></button>
          </div>
        )}

        {/* ── Formulaire création ── */}
        {showForm && (
          <div style={{ background: SS.surface, border: `1px solid ${SS.gold}50`, borderRadius: "14px", padding: "24px", marginBottom: "20px", boxShadow: `0 4px 24px ${SS.gold}10` }}>
            <div style={{ height: "3px", background: `linear-gradient(90deg, ${SS.goldDark}, ${SS.gold})`, borderRadius: "2px", marginBottom: "20px" }} />
            <div style={{ fontSize: "16px", fontWeight: "700", color: SS.goldLight, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={18} color={SS.gold} /> Nouveau produit
            </div>
            <form onSubmit={handleCreate}>

              {/* Infos produit */}
              <div style={{ marginBottom: "16px", padding: "16px", borderRadius: "10px", background: SS.bg, border: `1px solid ${SS.border}` }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: SS.textDim, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>Informations</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <input type="text" placeholder="Nom du produit *" style={inputStyle}
                    value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
                  <input type="number" placeholder="Prix (GNF) *" step="0.01" min="0" style={inputStyle}
                    value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} required />
                </div>
                <textarea placeholder="Description" rows={2} style={{ ...inputStyle, resize: "none", marginBottom: "12px" }}
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <select style={inputStyle} value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                    <option value="">— Catégorie —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                  <select style={inputStyle} value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>
                    {GENRE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, cursor: "pointer" }}>
                    <ImageIcon size={16} color={SS.gold} />
                    <span style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {form.image ? form.image.name : "Image"}
                    </span>
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files[0]; if (f) { setForm({ ...form, image: f }); setImagePreview(URL.createObjectURL(f)); } }} />
                  </label>
                </div>
                {imagePreview && (
                  <div style={{ position: "relative", width: "90px", height: "120px", marginTop: "12px" }}>
                    <img src={imagePreview} alt="preview" style={{ width: "90px", height: "120px", objectFit: "cover", borderRadius: "8px" }} />
                    <button type="button" onClick={() => { setImagePreview(null); setForm({ ...form, image: null }); }}
                      style={{ position: "absolute", top: "-6px", right: "-6px", padding: "2px", borderRadius: "50%", background: SS.danger, border: "none", cursor: "pointer", display: "flex", color: "#fff" }}>
                      <X size={11} />
                    </button>
                  </div>
                )}
              </div>

              {/* ✅ Liens vidéos réseaux sociaux */}
              <VideoSection
                values={{ video_tiktok: form.video_tiktok, video_instagram: form.video_instagram, video_facebook: form.video_facebook }}
                onChange={(field, value) => setForm({ ...form, [field]: value })} />

              {/* Badge Nouveau */}
              <div style={{ marginBottom: "16px", padding: "14px 16px", borderRadius: "10px", background: SS.bg, border: `1px solid ${form.est_nouveau ? SS.gold + "60" : SS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${SS.gold}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={15} color={SS.gold} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: SS.text }}>Badge "Nouveau"</div>
                    <div style={{ fontSize: "11px", color: SS.textDim }}>Affiché sur la carte en boutique</div>
                  </div>
                </div>
                <Toggle value={form.est_nouveau} onChange={() => setForm({ ...form, est_nouveau: !form.est_nouveau })} />
              </div>

              {/* Stock initial */}
              <div style={{ marginBottom: "16px", padding: "16px", borderRadius: "10px", background: SS.bg, border: `1px solid ${ajouterStock ? SS.gold + "50" : SS.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ajouterStock ? "14px" : "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Layers size={14} color={SS.gold} />
                    <span style={{ fontSize: "13px", fontWeight: "700", color: SS.goldLight }}>Stock initial</span>
                    <span style={{ fontSize: "11px", color: SS.textDim }}>(sinon "Épuisé")</span>
                  </div>
                  <Toggle value={ajouterStock} onChange={() => setAjouterStock(!ajouterStock)} />
                </div>
                {ajouterStock && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: SS.textMuted, marginBottom: "5px" }}>Taille</div>
                      <input type="text" placeholder="S, M, L, XL..." style={inputStyle}
                        value={stockForm.taille} onChange={e => setStockForm({ ...stockForm, taille: e.target.value })} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: SS.textMuted, marginBottom: "5px" }}>Couleur</div>
                      <input type="text" placeholder="Noir, Rouge..." style={inputStyle}
                        value={stockForm.couleur} onChange={e => setStockForm({ ...stockForm, couleur: e.target.value })} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: SS.textMuted, marginBottom: "5px" }}>Quantité</div>
                      <input type="number" min="1" style={inputStyle}
                        value={stockForm.quantite} onChange={e => setStockForm({ ...stockForm, quantite: e.target.value })} />
                    </div>
                  </div>
                )}
                {!ajouterStock && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", padding: "8px 12px", borderRadius: "8px", background: SS.warningBg, border: `1px solid ${SS.warning}40` }}>
                    <AlertCircle size={13} color={SS.warning} />
                    <span style={{ fontSize: "12px", color: SS.warning }}>Ajoutez le stock plus tard via <strong>Stocks</strong></span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setStockForm(emptyStock); setImagePreview(null); }}
                  style={{ padding: "10px 20px", borderRadius: "8px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, cursor: "pointer", fontSize: "14px" }}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  style={{ padding: "10px 24px", borderRadius: "8px", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, border: "none", color: "#1A1208", fontWeight: "700", fontSize: "14px", cursor: "pointer", opacity: submitting ? 0.5 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Package size={15} />{submitting ? "Création..." : "Créer le produit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtres */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "10px", background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "8px", padding: "0 14px" }}>
            <Search size={15} color={SS.textDim} />
            <input placeholder="Rechercher..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "14px", padding: "10px 0" }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "8px", padding: "0 14px" }}>
            <ChevronDown size={14} color={SS.textDim} />
            <select style={{ background: "none", border: "none", outline: "none", color: SS.text, fontSize: "14px", padding: "10px 0" }}
              value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Toutes catégories</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
            </select>
          </div>
        </div>

        {/* ── Grille produits ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: SS.textDim }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: SS.textDim }}>Aucun produit trouvé</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {filtered.map(produit => {
              const totalQte   = getTotalQte(produit.id);
              const stocksList = getStocks(produit.id);
              const sanStock   = totalQte === 0;

              return (
                <div key={produit.id}
                  style={{ background: SS.surface, border: `1px solid ${sanStock ? SS.danger + "50" : SS.border}`, borderRadius: "16px", overflow: "hidden", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = sanStock ? SS.danger + "80" : SS.borderHover}
                  onMouseLeave={e => e.currentTarget.style.borderColor = sanStock ? SS.danger + "50" : SS.border}>

                  {editingId === produit.id ? (
                    // ── Mode édition ──
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: SS.goldLight }}>Modifier — {produit.nom}</div>

                      {/* Image actuelle */}
                      <div>
                        <div style={{ fontSize: "11px", color: SS.textMuted, marginBottom: "6px" }}>Image</div>
                        {editImagePreview || editForm.imageUrl ? (
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <img src={editImagePreview || editForm.imageUrl} alt="current"
                              style={{ width: "80px", height: "100px", objectFit: "cover", borderRadius: "8px", border: `1px solid ${SS.border}` }} />
                          </div>
                        ) : (
                          <div style={{ width: "80px", height: "100px", borderRadius: "8px", background: SS.card, border: `1px solid ${SS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Package size={28} color={`${SS.gold}40`} />
                          </div>
                        )}
                      </div>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, cursor: "pointer", fontSize: "12px" }}>
                        <ImageIcon size={13} color={SS.gold} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {editForm.image instanceof File ? `✓ ${editForm.image.name}` : "Changer l'image (optionnel)"}
                        </span>
                        <input type="file" accept="image/*" style={{ display: "none" }}
                          onChange={e => { const f = e.target.files[0]; if (f) { setEditForm({ ...editForm, image: f }); setEditImagePreview(URL.createObjectURL(f)); } }} />
                      </label>

                      <input type="text" style={inputSmStyle} placeholder="Nom"
                        value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} />
                      <input type="number" step="0.01" style={inputSmStyle} placeholder="Prix"
                        value={editForm.prix} onChange={e => setEditForm({ ...editForm, prix: e.target.value })} />
                      <textarea rows={2} style={{ ...inputSmStyle, resize: "none" }} placeholder="Description"
                        value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                      <select style={inputSmStyle} value={editForm.categorie} onChange={e => setEditForm({ ...editForm, categorie: e.target.value })}>
                        <option value="">— Catégorie —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                      <select style={inputSmStyle} value={editForm.genre || "mixte"} onChange={e => setEditForm({ ...editForm, genre: e.target.value })}>
                        {GENRE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>

                      {/* ✅ Liens vidéos en édition */}
                      <div style={{ padding: "12px", borderRadius: "8px", background: SS.bg, border: `1px solid ${SS.border}` }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: SS.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                          <Play size={11} color={SS.gold} /> Vidéos réseaux
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <VideoLinkField label="TikTok" icon={<TikTokIcon size={13} />} color="#010101"
                            placeholder="lien TikTok..." value={editForm.video_tiktok}
                            onChange={v => setEditForm({ ...editForm, video_tiktok: v })} SS={SS} />
                          <VideoLinkField label="Instagram" icon={<InstagramIcon size={13} />} color="#E1306C"
                            placeholder="lien Reels..." value={editForm.video_instagram}
                            onChange={v => setEditForm({ ...editForm, video_instagram: v })} SS={SS} />
                          <VideoLinkField label="Facebook" icon={<FacebookIcon size={13} />} color="#1877F2"
                            placeholder="lien vidéo FB..." value={editForm.video_facebook}
                            onChange={v => setEditForm({ ...editForm, video_facebook: v })} SS={SS} />
                        </div>
                      </div>

                      {/* Toggle Nouveau */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", background: SS.bg, border: `1px solid ${editForm.est_nouveau ? SS.gold + "50" : SS.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <Sparkles size={13} color={SS.gold} />
                          <span style={{ fontSize: "12px", fontWeight: "600", color: SS.text }}>Badge "Nouveau"</span>
                        </div>
                        <Toggle value={editForm.est_nouveau} onChange={() => setEditForm({ ...editForm, est_nouveau: !editForm.est_nouveau })} />
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleUpdate(produit.id)} disabled={updating}
                          style={{ flex: 1, padding: "9px", borderRadius: "7px", background: `${SS.success}20`, border: `1px solid ${SS.success}40`, color: SS.success, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "13px", fontWeight: "600", opacity: updating ? 0.5 : 1 }}>
                          <Check size={14} />{updating ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                        <button onClick={() => { setEditingId(null); setEditImagePreview(null); }}
                          style={{ padding: "9px 14px", borderRadius: "7px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, cursor: "pointer" }}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ── Mode affichage ──
                    <>
                      <div style={{ position: "relative", paddingBottom: "125%", background: `linear-gradient(135deg, ${SS.card}, ${SS.surface})`, overflow: "hidden" }}>
                        {produit.image_url ? (
                          <img src={produit.image_url} alt={produit.nom}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                            onError={e => { e.target.style.display = "none"; }} />
                        ) : (
                          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            <Package size={36} color={`${SS.gold}40`} />
                            <span style={{ fontSize: "10px", color: SS.textDim }}>Pas d'image</span>
                          </div>
                        )}
                        {produit.est_nouveau && (
                          <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                            <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", background: SS.gold, color: "#1A1208", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Sparkles size={10} /> Nouveau
                            </span>
                          </div>
                        )}
                        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: sanStock ? SS.dangerBg : SS.successBg, color: sanStock ? SS.danger : SS.success }}>
                            {sanStock ? "Sans stock" : `${totalQte} pcs`}
                          </span>
                        </div>
                        {sanStock && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", background: "rgba(163,32,32,0.88)", display: "flex", alignItems: "center", gap: "5px" }}>
                            <AlertCircle size={11} color="#fff" />
                            <span style={{ fontSize: "11px", color: "#fff" }}>Invisible en boutique</span>
                          </div>
                        )}
                      </div>

                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: SS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px" }}>
                          {produit.nom}
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: SS.goldLight, marginBottom: "6px" }}>
                          {Number(produit.prix).toLocaleString("fr-FR")} GNF
                        </div>

                        {/* Badges catégorie + genre */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                          <span style={{ padding: "2px 10px", borderRadius: "20px", background: `${SS.gold}18`, border: `1px solid ${SS.gold}35`, fontSize: "11px", color: SS.gold }}>
                            {getCatNom(produit.categorie)}
                          </span>
                          <GenreBadge genre={produit.genre} />
                        </div>

                        {/* ✅ Badges vidéos */}
                        <VideoBadges produit={produit} />

                        {stocksList.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                            {stocksList.slice(0, 3).map(s => (
                              <span key={s.id} style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "10px", fontWeight: "600", background: s.quantite === 0 ? SS.dangerBg : SS.successBg, color: s.quantite === 0 ? SS.danger : SS.success }}>
                                {s.taille} · {s.couleur} ({s.quantite})
                              </span>
                            ))}
                            {stocksList.length > 3 && <span style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "10px", color: SS.textDim, background: SS.card }}>+{stocksList.length - 3}</span>}
                          </div>
                        )}

                        {confirmDeleteId === produit.id ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => handleDelete(produit.id)} disabled={deletingId === produit.id}
                              style={{ flex: 1, padding: "8px", borderRadius: "7px", background: `${SS.danger}25`, border: `1px solid ${SS.danger}50`, color: SS.danger, fontSize: "13px", fontWeight: "600", cursor: "pointer", opacity: deletingId === produit.id ? 0.5 : 1 }}>
                              {deletingId === produit.id ? "..." : "Confirmer"}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              style={{ flex: 1, padding: "8px", borderRadius: "7px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, fontSize: "13px", cursor: "pointer" }}>
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => {
                              setEditingId(produit.id); setEditImagePreview(null);
                              setEditForm({
                                nom:             produit.nom,
                                description:     produit.description || "",
                                prix:            produit.prix,
                                categorie:       produit.categorie || "",
                                imageUrl:        produit.image_url || null,
                                image:           null,
                                est_nouveau:     produit.est_nouveau ?? false,
                                genre:           produit.genre || "mixte",
                                video_tiktok:    produit.video_tiktok    || "",
                                video_instagram: produit.video_instagram || "",
                                video_facebook:  produit.video_facebook  || "",
                              });
                            }}
                            style={{ flex: 1, padding: "8px", borderRadius: "7px", background: `${SS.gold}18`, border: `1px solid ${SS.gold}35`, color: SS.gold, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                              <Pencil size={13} /> Modifier
                            </button>
                            <button onClick={() => setConfirmDeleteId(produit.id)}
                              style={{ flex: 1, padding: "8px", borderRadius: "7px", background: `${SS.danger}18`, border: `1px solid ${SS.danger}35`, color: SS.danger, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                              <Trash2 size={13} /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Produits;