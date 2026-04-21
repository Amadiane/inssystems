import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Tag, X, Check } from "lucide-react";
import CONFIG from "../../config/config";
import { useTheme } from "../../context/ThemeContext";

const Categories = () => {
  const navigate = useNavigate();
  const { tokens: SS } = useTheme();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newNom, setNewNom] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editNom, setEditNom] = useState("");
  const [updating, setUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("access");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // --- FETCH ---
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(CONFIG.API_CATEGORIE, { headers });
      const data = await res.json();
      if (res.ok) setCategories(data);
      else setError("Erreur lors du chargement");
    } catch { setError("Erreur serveur"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  // --- CREATE ---
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newNom.trim()) return;
    setCreating(true); setError(""); setSuccess("");
    try {
      const res = await fetch(CONFIG.API_CATEGORIE, {
        method: "POST", headers,
        body: JSON.stringify({ nom: newNom.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => [...prev, data]);
        setNewNom("");
        setSuccess("Catégorie créée !");
        setTimeout(() => setSuccess(""), 3000);
      } else { setError(data.nom?.[0] || "Erreur lors de la création"); }
    } catch { setError("Erreur serveur"); }
    finally { setCreating(false); }
  };

  // --- UPDATE ---
  const handleUpdate = async (id) => {
    if (!editNom.trim()) return;
    setUpdating(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${CONFIG.API_CATEGORIE}${id}/`, {
        method: "PUT", headers,
        body: JSON.stringify({ nom: editNom.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
        setEditingId(null);
        setSuccess("Catégorie modifiée !");
        setTimeout(() => setSuccess(""), 3000);
      } else { setError(data.nom?.[0] || "Erreur lors de la modification"); }
    } catch { setError("Erreur serveur"); }
    finally { setUpdating(false); }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    setDeletingId(id); setError(""); setSuccess("");
    try {
      const res = await fetch(`${CONFIG.API_CATEGORIE}${id}/`, { method: "DELETE", headers });
      if (res.ok || res.status === 204) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        setSuccess("Catégorie supprimée !");
        setTimeout(() => setSuccess(""), 3000);
      } else { setError("Erreur lors de la suppression"); }
    } catch { setError("Erreur serveur"); }
    finally { setDeletingId(null); }
  };

  // ── Styles partagés ──────────────────────────────────────────────
  const cardStyle = {
    background: SS.surface,
    border: `1px solid ${SS.border}`,
    borderRadius: "14px",
    padding: "20px",
  };

  const inputStyle = {
    flex: 1, padding: "10px 14px", borderRadius: "8px",
    background: SS.card, border: `1px solid ${SS.border}`,
    color: SS.text, fontSize: "14px", outline: "none",
  };

  const iconBtnStyle = (color, bg) => ({
    padding: "7px", borderRadius: "7px",
    background: bg, border: `1px solid ${color}40`,
    color, cursor: "pointer", display: "flex",
    alignItems: "center", transition: "opacity 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: SS.bg, padding: "2rem", color: SS.text, fontFamily: "var(--font-sans, sans-serif)" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Fil d'Ariane */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: SS.textDim }}>Gestion</span>
          <span style={{ fontSize: "12px", color: SS.textDim }}>/</span>
          <span style={{ fontSize: "12px", color: SS.gold }}>Catégories</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
          <button
            onClick={() => navigate("/dashboardAdmin")}
            style={{ padding: "8px 10px", borderRadius: "8px", border: `1px solid ${SS.border}`, background: SS.card, cursor: "pointer", display: "flex", alignItems: "center", color: SS.textMuted }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${SS.gold}20`, border: `1px solid ${SS.gold}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Tag size={19} color={SS.gold} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "600", color: SS.goldLight, lineHeight: 1.2 }}>Catégories</div>
              <div style={{ fontSize: "12px", color: SS.textDim }}>{categories.length} catégorie{categories.length > 1 ? "s" : ""}</div>
            </div>
          </div>
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

        {/* Formulaire création */}
        <div style={{ ...cardStyle, border: `1px solid ${SS.gold}50`, boxShadow: `0 4px 24px ${SS.gold}10`, marginBottom: "16px" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", color: SS.goldLight, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Tag size={16} color={SS.gold} />
            Nouvelle catégorie
          </div>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Nom de la catégorie"
              style={inputStyle}
              value={newNom}
              onChange={e => setNewNom(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={creating}
              style={{ padding: "10px 18px", borderRadius: "8px", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, border: "none", color: "#1A1208", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: creating ? 0.5 : 1, boxShadow: `0 2px 12px ${SS.gold}30`, whiteSpace: "nowrap" }}
            >
              <Plus size={16} />
              {creating ? "..." : "Ajouter"}
            </button>
          </form>
        </div>

        {/* Liste */}
        <div style={cardStyle}>
          <div style={{ fontSize: "15px", fontWeight: "600", color: SS.goldLight, marginBottom: "14px" }}>
            Liste ({categories.length})
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: SS.textDim }}>Chargement...</div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: SS.textDim }}>Aucune catégorie pour le moment</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: SS.card, border: `1px solid ${SS.border}`, transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = SS.borderHover}
                  onMouseLeave={e => e.currentTarget.style.borderColor = SS.border}
                >
                  {editingId === cat.id ? (
                    /* Mode édition */
                    <>
                      <input
                        type="text"
                        style={{ ...inputStyle, flex: 1, padding: "7px 12px", fontSize: "13px" }}
                        value={editNom}
                        onChange={e => setEditNom(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === "Enter") handleUpdate(cat.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        disabled={updating}
                        style={{ ...iconBtnStyle(SS.success, `${SS.success}20`), opacity: updating ? 0.5 : 1 }}
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={iconBtnStyle(SS.textMuted, SS.surface)}
                      >
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    /* Mode affichage */
                    <>
                      <Tag size={15} color={SS.gold} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: "14px", color: SS.text }}>{cat.nom}</span>
                      <button
                        onClick={() => { setEditingId(cat.id); setEditNom(cat.nom); }}
                        style={iconBtnStyle(SS.gold, `${SS.gold}18`)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        style={{ ...iconBtnStyle(SS.danger, `${SS.danger}18`), opacity: deletingId === cat.id ? 0.5 : 1 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Categories;