import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Pencil, Trash2, X, Check,
  Layers, Search, ChevronDown, Package,
  AlertCircle, Eye
} from "lucide-react";
import CONFIG from "../../config/config";
import { useTheme } from "../../context/ThemeContext";

const Stocks = () => {
  const navigate = useNavigate();
  const { tokens: SS } = useTheme();

  const [stocks, setStocks]     = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [search, setSearch]     = useState("");
  const [filterProduit, setFilterProduit] = useState("");
  const [showForm, setShowForm] = useState(false);

  const emptyForm = { produit: "", taille: "", couleur: "", quantite: "1" };
  const [form, setForm]           = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [editQte, setEditQte]       = useState("");
  const [updating, setUpdating]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Produit sélectionné dans le formulaire
  const [produitChoisi, setProduitChoisi]     = useState(null);
  const [variantesExistantes, setVariantesExistantes] = useState([]);

  const token   = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rS, rP] = await Promise.all([
        fetch(`${CONFIG.BASE_URL}/api/stocks/`, { headers }),
        fetch(CONFIG.API_PRODUIT,               { headers }),
      ]);
      const [dS, dP] = await Promise.all([rS.json(), rP.json()]);
      if (rS.ok) setStocks(Array.isArray(dS) ? dS : []);
      if (rP.ok) setProduits(Array.isArray(dP) ? dP : []);
    } catch { setError("Erreur serveur"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Quand on choisit un produit → afficher ses variantes existantes
  const handleSelectProduit = (produitId) => {
    setForm({ ...emptyForm, produit: produitId });
    if (!produitId) { setProduitChoisi(null); setVariantesExistantes([]); return; }
    const p = produits.find(p => String(p.id) === String(produitId));
    setProduitChoisi(p || null);
    setVariantesExistantes(stocks.filter(s => String(s.produit) === String(produitId)));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.produit || !form.taille || !form.couleur) {
      setError("Sélectionnez un produit, une taille et une couleur.");
      return;
    }
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${CONFIG.BASE_URL}/api/stocks/`, {
        method: "POST", headers,
        body: JSON.stringify({
          produit:  form.produit,
          taille:   form.taille.trim(),
          couleur:  form.couleur.trim(),
          quantite: parseInt(form.quantite) || 1,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStocks(prev => [data, ...prev]);
        const nom = produits.find(p => String(p.id) === String(form.produit))?.nom || "";
        setSuccess(`✅ ${nom} · ${form.taille} · ${form.couleur} · ${form.quantite} pcs — visible en boutique !`);
        setForm(emptyForm); setProduitChoisi(null); setVariantesExistantes([]); setShowForm(false);
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(Object.entries(data).map(([k, v]) =>
          `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") || "Erreur");
      }
    } catch { setError("Erreur serveur"); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id) => {
    setUpdating(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${CONFIG.BASE_URL}/api/stocks/${id}/`, {
        method: "PATCH", headers,
        body: JSON.stringify({ quantite: parseInt(editQte) }),
      });
      const data = await res.json();
      if (res.ok) {
        setStocks(prev => prev.map(s => s.id === id ? data : s));
        setEditingId(null);
        setSuccess("Quantité mise à jour !");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch { setError("Erreur serveur"); }
    finally { setUpdating(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/api/stocks/${id}/`, { method: "DELETE", headers });
      if (res.ok || res.status === 204) {
        setStocks(prev => prev.filter(s => s.id !== id));
        setConfirmDeleteId(null);
        setSuccess("Stock supprimé !");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {}
    finally { setDeletingId(null); }
  };

  const filtered = stocks.filter(s => {
    const ms = (s.produit_nom || "").toLowerCase().includes(search.toLowerCase())
            || (s.taille  || "").toLowerCase().includes(search.toLowerCase())
            || (s.couleur || "").toLowerCase().includes(search.toLowerCase());
    const mp = filterProduit ? String(s.produit) === filterProduit : true;
    return ms && mp;
  });

  // Grouper par produit
  const grouped = filtered.reduce((acc, s) => {
    const key = String(s.produit);
    if (!acc[key]) acc[key] = { nom: s.produit_nom, id: s.produit, items: [] };
    acc[key].items.push(s);
    return acc;
  }, {});

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.text, fontSize: "14px", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: SS.bg, padding: "2rem", color: SS.text, fontFamily: "var(--font-sans, sans-serif)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Fil d'Ariane */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: SS.textDim }}>Gestion</span>
          <span style={{ fontSize: "12px", color: SS.textDim }}>/</span>
          <span style={{ fontSize: "12px", color: SS.gold }}>Stocks</span>
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
                <Layers size={19} color={SS.gold} />
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: SS.goldLight }}>Stocks</div>
                <div style={{ fontSize: "12px", color: SS.textDim }}>{stocks.length} variante{stocks.length > 1 ? "s" : ""}</div>
              </div>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(""); setForm(emptyForm); setProduitChoisi(null); }}
            style={{ background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, border: "none", borderRadius: "8px", padding: "10px 20px", color: "#1A1208", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: `0 2px 12px ${SS.gold}30` }}>
            <Plus size={16} />
            Ajouter un stock
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "10px", background: `${SS.danger}18`, border: `1px solid ${SS.danger}40`, color: SS.danger, fontSize: "14px", display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: SS.danger }}><X size={15} /></button>
          </div>
        )}
        {success && (
          <div style={{ padding: "12px 16px", borderRadius: "10px", background: `${SS.success}18`, border: `1px solid ${SS.success}40`, color: SS.success, fontSize: "14px", display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span>{success}</span>
            <button onClick={() => setSuccess("")} style={{ background: "none", border: "none", cursor: "pointer", color: SS.success }}><X size={15} /></button>
          </div>
        )}

        {/* ── Formulaire ── */}
        {showForm && (
          <div style={{ background: SS.surface, border: `1px solid ${SS.gold}50`, borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: `0 4px 24px ${SS.gold}10` }}>
            <div style={{ height: "3px", background: `linear-gradient(90deg, ${SS.goldDark}, ${SS.gold})`, borderRadius: "2px", marginBottom: "20px" }} />
            <div style={{ fontSize: "16px", fontWeight: "700", color: SS.goldLight, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={18} color={SS.gold} />
              Ajouter un stock
            </div>

            <form onSubmit={handleCreate}>

              {/* Étape 1 : Choisir le produit */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
                  1. Choisissez le produit
                </div>
                <select style={inputStyle} value={form.produit}
                  onChange={e => handleSelectProduit(e.target.value)} required>
                  <option value="">— Sélectionnez un produit —</option>
                  {produits.map(p => {
                    const total = stocks.filter(s => String(s.produit) === String(p.id)).reduce((a, s) => a + s.quantite, 0);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.nom} — {total === 0 ? "⚠️ Aucun stock" : `${total} pcs en stock`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Variantes déjà existantes pour ce produit */}
              {produitChoisi && variantesExistantes.length > 0 && (
                <div style={{ marginBottom: "20px", padding: "14px", borderRadius: "10px", background: SS.bg, border: `1px solid ${SS.border}` }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
                    Variantes déjà enregistrées pour <span style={{ color: SS.gold }}>{produitChoisi.nom}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {variantesExistantes.map(v => (
                      <div key={v.id} style={{
                        padding: "6px 12px", borderRadius: "8px",
                        background: v.quantite === 0 ? SS.dangerBg : SS.successBg,
                        border: `1px solid ${(v.quantite === 0 ? SS.danger : SS.success)}40`,
                        fontSize: "12px", fontWeight: "600",
                        color: v.quantite === 0 ? SS.danger : SS.success,
                      }}>
                        {v.taille} · {v.couleur} · {v.quantite} pcs
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "12px", color: SS.textDim, marginTop: "10px" }}>
                    Vous pouvez ajouter une nouvelle variante ci-dessous, ou modifier les quantités dans le tableau.
                  </div>
                </div>
              )}

              {/* Étape 2 : Définir la variante */}
              {form.produit && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
                    2. Définissez la variante
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: SS.textMuted, marginBottom: "5px" }}>Taille *</div>
                      <input type="text" placeholder="S, M, L, XL, 38, 40..." style={inputStyle}
                        value={form.taille} onChange={e => setForm({ ...form, taille: e.target.value })} required />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: SS.textMuted, marginBottom: "5px" }}>Couleur *</div>
                      <input type="text" placeholder="Noir, Rouge, Blanc..." style={inputStyle}
                        value={form.couleur} onChange={e => setForm({ ...form, couleur: e.target.value })} required />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: SS.textMuted, marginBottom: "5px" }}>Quantité *</div>
                      <input type="number" min="1" style={inputStyle}
                        value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} required />
                    </div>
                  </div>
                </div>
              )}

              {/* Résumé */}
              {form.produit && form.taille && form.couleur && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: SS.successBg, border: `1px solid ${SS.success}40`, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} color={SS.success} />
                  <span style={{ fontSize: "13px", color: SS.success }}>
                    <strong>{produitChoisi?.nom}</strong> · {form.taille} · {form.couleur} · <strong>{form.quantite} pcs</strong> sera visible en boutique
                  </span>
                </div>
              )}

              {!form.produit && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: SS.warningBg, border: `1px solid ${SS.warning}40`, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={14} color={SS.warning} />
                  <span style={{ fontSize: "12px", color: SS.warning }}>Sélectionnez d'abord un produit</span>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button"
                  onClick={() => { setShowForm(false); setForm(emptyForm); setProduitChoisi(null); setVariantesExistantes([]); }}
                  style={{ padding: "10px 20px", borderRadius: "8px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, cursor: "pointer", fontSize: "14px" }}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting || !form.produit || !form.taille || !form.couleur}
                  style={{ padding: "10px 24px", borderRadius: "8px", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, border: "none", color: "#1A1208", fontWeight: "700", fontSize: "14px", cursor: "pointer", opacity: submitting || !form.produit || !form.taille || !form.couleur ? 0.5 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={15} />
                  {submitting ? "Enregistrement..." : "Enregistrer le stock"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtres */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "10px", background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "8px", padding: "0 14px" }}>
            <Search size={15} color={SS.textDim} />
            <input placeholder="Rechercher (produit, taille, couleur)..."
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "14px", padding: "10px 0" }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "8px", padding: "0 14px" }}>
            <ChevronDown size={14} color={SS.textDim} />
            <select style={{ background: "none", border: "none", outline: "none", color: SS.text, fontSize: "14px", padding: "10px 0" }}
              value={filterProduit} onChange={e => setFilterProduit(e.target.value)}>
              <option value="">Tous les produits</option>
              {produits.map(p => <option key={p.id} value={String(p.id)}>{p.nom}</option>)}
            </select>
          </div>
        </div>

        {/* ── Tableau groupé par produit ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: SS.textDim }}>Chargement...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: SS.textDim }}>
            <Layers size={40} color={`${SS.gold}40`} style={{ marginBottom: "12px" }} />
            <div>Aucun stock enregistré</div>
            <div style={{ fontSize: "13px", marginTop: "8px", color: SS.textDim }}>
              Créez d'abord des produits, puis ajoutez leurs stocks ici
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {Object.values(grouped).map(group => {
              const totalQte = group.items.reduce((a, s) => a + s.quantite, 0);
              const prodImg  = produits.find(p => String(p.id) === String(group.id))?.image_url;

              return (
                <div key={group.id} style={{ background: SS.surface, border: `1px solid ${totalQte === 0 ? SS.danger + "50" : SS.border}`, borderRadius: "14px", overflow: "hidden" }}>

                  {/* Header groupe */}
                  <div style={{ padding: "12px 20px", background: SS.card, borderBottom: `1px solid ${SS.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
                    {prodImg ? (
                      <img src={prodImg} alt={group.nom} style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: SS.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Package size={16} color={`${SS.gold}60`} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: SS.text }}>{group.nom}</div>
                      <div style={{ fontSize: "12px", color: SS.textDim }}>{group.items.length} variante{group.items.length > 1 ? "s" : ""}</div>
                    </div>
                    <span style={{ padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: totalQte === 0 ? SS.dangerBg : SS.successBg, color: totalQte === 0 ? SS.danger : SS.success }}>
                      {totalQte === 0 ? "Épuisé" : `${totalQte} pcs`}
                    </span>
                  </div>

                  {/* Entêtes colonnes */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", padding: "8px 20px", background: SS.bg }}>
                    {["Taille", "Couleur", "Quantité", "Actions"].map((h, i) => (
                      <div key={i} style={{ fontSize: "10px", color: SS.textDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: i === 3 ? "right" : "left" }}>
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Lignes variantes */}
                  {group.items.map((stock, i) => (
                    <div key={stock.id}
                      style={{ borderTop: `1px solid ${SS.border}`, transition: "background 0.15s" }}
                      onMouseEnter={e => { if (editingId !== stock.id) e.currentTarget.style.background = SS.card; }}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                      {editingId === stock.id ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", padding: "10px 20px", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: SS.text }}>{stock.taille}</span>
                          <span style={{ fontSize: "13px", color: SS.textMuted }}>{stock.couleur}</span>
                          <input type="number" min="0" value={editQte}
                            onChange={e => setEditQte(e.target.value)}
                            style={{ padding: "7px 10px", borderRadius: "7px", background: SS.card, border: `1px solid ${SS.gold}`, color: SS.text, fontSize: "14px", fontWeight: "700", outline: "none", textAlign: "center", width: "100%" }}
                            autoFocus />
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button onClick={() => handleUpdate(stock.id)} disabled={updating}
                              style={{ padding: "6px 12px", borderRadius: "7px", background: `${SS.success}20`, border: `1px solid ${SS.success}40`, color: SS.success, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600" }}>
                              <Check size={13} />{updating ? "..." : "OK"}
                            </button>
                            <button onClick={() => setEditingId(null)}
                              style={{ padding: "6px 8px", borderRadius: "7px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, cursor: "pointer" }}>
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", padding: "12px 20px", alignItems: "center" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "6px", background: `${SS.gold}18`, border: `1px solid ${SS.gold}35`, fontSize: "13px", color: SS.gold, fontWeight: "600", display: "inline-block" }}>
                            {stock.taille}
                          </span>
                          <span style={{ fontSize: "13px", color: SS.textMuted }}>{stock.couleur}</span>
                          <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", display: "inline-block", background: stock.quantite === 0 ? SS.dangerBg : stock.quantite <= 5 ? SS.warningBg : SS.successBg, color: stock.quantite === 0 ? SS.danger : stock.quantite <= 5 ? SS.warning : SS.success }}>
                            {stock.quantite} pcs
                          </span>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            {confirmDeleteId === stock.id ? (
                              <>
                                <button onClick={() => handleDelete(stock.id)} disabled={deletingId === stock.id}
                                  style={{ padding: "4px 10px", borderRadius: "6px", background: `${SS.danger}25`, border: `1px solid ${SS.danger}50`, color: SS.danger, fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                                  {deletingId === stock.id ? "..." : "Oui"}
                                </button>
                                <button onClick={() => setConfirmDeleteId(null)}
                                  style={{ padding: "4px 10px", borderRadius: "6px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, fontSize: "12px", cursor: "pointer" }}>
                                  Non
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditingId(stock.id); setEditQte(String(stock.quantite)); }}
                                  style={{ padding: "6px 8px", borderRadius: "7px", background: `${SS.gold}18`, border: `1px solid ${SS.gold}35`, color: SS.gold, cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => setConfirmDeleteId(stock.id)}
                                  style={{ padding: "6px 8px", borderRadius: "7px", background: `${SS.danger}18`, border: `1px solid ${SS.danger}35`, color: SS.danger, cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Résumé */}
        {!loading && stocks.length > 0 && (
          <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: `${stocks.filter(s => s.quantite > 5).length} en stock`,    color: SS.success, bg: SS.successBg },
              { label: `${stocks.filter(s => s.quantite > 0 && s.quantite <= 5).length} stock faible`, color: SS.warning, bg: SS.warningBg },
              { label: `${stocks.filter(s => s.quantite === 0).length} épuisé`,    color: SS.danger,  bg: SS.dangerBg  },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "10px", background: item.bg, border: `1px solid ${item.color}40` }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, display: "inline-block" }} />
                <span style={{ fontSize: "13px", color: item.color }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stocks;