import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, ArrowLeft, User, Lock, Eye, EyeOff,
  UserPlus, Users, Trash2, X, Check, Crown,
  ShoppingBag, Calendar, AtSign, BadgeCheck, Pencil, Save,
  Clock, Plus, Edit, LogIn
} from "lucide-react";
import CONFIG from "../../config/config";
import { useTheme } from "../../context/ThemeContext";

// ── Helpers ────────────────────────────────────────────────
const iStyle = (SS, focused) => ({
  display: "flex", alignItems: "center", gap: "10px",
  padding: "0 14px",
  background: SS.surface,
  border: `1px solid ${focused ? SS.gold : SS.border}`,
  borderRadius: "10px",
  boxShadow: focused ? `0 0 0 3px ${SS.gold}20` : "none",
  transition: "all 0.2s",
});

const Label = ({ children, SS }) => (
  <div style={{ fontSize: "11px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
    {children}
  </div>
);

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";

// ── Config actions historique ──────────────────────────────
const ACTION_CONFIG = {
  create: { label: "Création",     color: "#1A6B3C", bg: "rgba(26,107,60,0.12)",   icon: <Plus   size={13} /> },
  update: { label: "Modification", color: "#1d4ed8", bg: "rgba(59,130,246,0.12)",  icon: <Edit   size={13} /> },
  delete: { label: "Suppression",  color: "#A32020", bg: "rgba(163,32,32,0.12)",   icon: <Trash2 size={13} /> },
  vente:  { label: "Vente",        color: "#C9A84C", bg: "rgba(201,168,76,0.12)",  icon: <ShoppingBag size={13} /> },
  login:  { label: "Connexion",    color: "#7c3aed", bg: "rgba(168,85,247,0.12)",  icon: <LogIn  size={13} /> },
};

const BadgeAction = ({ action, SS }) => {
  const cfg = ACTION_CONFIG[action] || { label: action, color: SS.textMuted, bg: SS.surface, icon: null };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", background: cfg.bg, color: cfg.color, fontSize: "11px", fontWeight: "700" }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ── Modal détail + édition employé ────────────────────────
const ModalEmploye = ({ emp, onClose, onUpdate, onDelete, SS }) => {
  const [mode, setMode]             = useState("view");
  const [firstName, setFirstName]   = useState(emp.first_name || "");
  const [lastName, setLastName]     = useState(emp.last_name  || "");
  const [email, setEmail]           = useState(emp.email      || "");
  const [role, setRole]             = useState(emp.role       || "vendeur");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [fFirst, setFFirst] = useState(false);
  const [fLast,  setFLast]  = useState(false);
  const [fEmail, setFEmail] = useState(false);
  const [fPass,  setFPass]  = useState(false);

  const token   = localStorage.getItem("access");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { first_name: firstName, last_name: lastName, email, role };
      if (password) body.password = password;
      // ✅ CONFIG.API_REGISTER + id
      const res  = await fetch(`${CONFIG.API_REGISTER}${emp.id}/`, {
        method: "PATCH", headers, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) { onUpdate(data); setMode("view"); setPassword(""); }
    } catch {} finally { setSaving(false); }
  };

  const getRoleStyle = (r) => r === "admin"
    ? { bg: `${SS.gold}18`, color: SS.goldLight, border: `1px solid ${SS.gold}40`, label: "Administrateur", icon: <Crown size={13} /> }
    : { bg: SS.successBg,   color: SS.success,   border: `1px solid ${SS.success}40`, label: "Vendeur", icon: <ShoppingBag size={13} /> };

  const rs = getRoleStyle(emp.role);

  const getInitiales = () => {
    const fn = emp.first_name?.[0] || "";
    const ln = emp.last_name?.[0]  || "";
    return (fn + ln).toUpperCase() || emp.username?.[0]?.toUpperCase() || "?";
  };

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(44,26,0,0.55)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "480px", background: SS.surface, borderRadius: "20px", overflow: "hidden", boxShadow: `0 24px 60px ${SS.gold}30`, border: `1px solid ${SS.border}`, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        <div style={{ height: "3px", background: `linear-gradient(90deg, ${SS.goldDark}, ${SS.gold}, ${SS.goldDark})`, flexShrink: 0 }} />

        {/* Header modal */}
        <div style={{ padding: "20px 24px", background: SS.card, borderBottom: `1px solid ${SS.border}`, display: "flex", alignItems: "center", gap: "14px", flexShrink: 0, flexWrap: "wrap" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "800", color: "#fff", boxShadow: `0 4px 16px ${SS.gold}40`, flexShrink: 0 }}>
            {getInitiales()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "17px", fontWeight: "700", color: SS.goldDark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {emp.first_name && emp.last_name ? `${emp.first_name} ${emp.last_name}` : emp.username}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: SS.textMuted }}>@{emp.username}</span>
              <span style={{ padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: rs.bg, color: rs.color, border: rs.border, display: "flex", alignItems: "center", gap: "4px" }}>
                {rs.icon} {rs.label}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { key: "view", icon: <BadgeCheck size={14} />, label: "Profil"    },
              { key: "edit", icon: <Pencil     size={14} />, label: "Modifier"  },
            ].map(tab => (
              <button key={tab.key} onClick={() => setMode(tab.key)}
                style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${mode === tab.key ? SS.gold : SS.border}`, background: mode === tab.key ? `${SS.gold}18` : "transparent", color: mode === tab.key ? SS.goldDark : SS.textMuted, fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s" }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <button onClick={onClose}
            style={{ padding: "7px", borderRadius: "8px", background: SS.surface, border: `1px solid ${SS.border}`, cursor: "pointer", display: "flex", color: SS.textMuted, flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: SS.bg }}>

          {/* Mode vue */}
          {mode === "view" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { icon: <User size={14} />,       label: "Prénom",         value: emp.first_name || "—" },
                { icon: <User size={14} />,       label: "Nom",            value: emp.last_name  || "—" },
                { icon: <AtSign size={14} />,     label: "Identifiant",    value: `@${emp.username}` },
                { icon: <BadgeCheck size={14} />, label: "Email",          value: emp.email      || "—" },
                { icon: <Crown size={14} />,      label: "Rôle",           value: getRoleStyle(emp.role).label },
                { icon: <Check size={14} />,      label: "Statut",         value: emp.is_active ? "Actif" : "Inactif" },
                { icon: <Calendar size={14} />,   label: "Inscription",    value: formatDate(emp.date_joined) },
                { icon: <Calendar size={14} />,   label: "Dernière conn.", value: formatDate(emp.last_login) },
              ].map((info, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: i % 2 === 0 ? SS.surface : SS.card, borderRadius: "10px", border: `1px solid ${SS.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: SS.gold }}>{info.icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{info.label}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: SS.text }}>{info.value}</span>
                </div>
              ))}
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: emp.is_active ? SS.successBg : SS.dangerBg, border: `1px solid ${emp.is_active ? SS.success : SS.danger}40`, display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: emp.is_active ? SS.success : SS.danger }} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: emp.is_active ? SS.success : SS.danger }}>
                  Compte {emp.is_active ? "actif" : "inactif"}
                </span>
                {emp.is_superuser && (
                  <span style={{ marginLeft: "auto", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: `${SS.gold}20`, color: SS.goldDark, border: `1px solid ${SS.gold}40` }}>
                    Super Admin
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mode édition */}
          {mode === "edit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "10px 14px", borderRadius: "10px", background: `${SS.gold}10`, border: `1px solid ${SS.gold}30`, fontSize: "12px", color: SS.goldDark, display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={13} color={SS.gold} /> Modifiez les champs souhaités puis sauvegardez.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <Label SS={SS}>Prénom</Label>
                  <div style={iStyle(SS, fFirst)}>
                    <User size={14} color={fFirst ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      onFocus={() => setFFirst(true)} onBlur={() => setFFirst(false)}
                      style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "10px 0" }} />
                  </div>
                </div>
                <div>
                  <Label SS={SS}>Nom</Label>
                  <div style={iStyle(SS, fLast)}>
                    <User size={14} color={fLast ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      onFocus={() => setFLast(true)} onBlur={() => setFLast(false)}
                      style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "10px 0" }} />
                  </div>
                </div>
              </div>

              <div>
                <Label SS={SS}>Email</Label>
                <div style={iStyle(SS, fEmail)}>
                  <AtSign size={14} color={fEmail ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFEmail(true)} onBlur={() => setFEmail(false)}
                    placeholder="email@exemple.com"
                    style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "10px 0" }} />
                </div>
              </div>

              <div>
                <Label SS={SS}>
                  Nouveau mot de passe{" "}
                  <span style={{ fontSize: "10px", fontWeight: "400", color: SS.textDim }}>(laisser vide pour ne pas changer)</span>
                </Label>
                <div style={iStyle(SS, fPass)}>
                  <Lock size={14} color={fPass ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                  <input type={showPass ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFPass(true)} onBlur={() => setFPass(false)}
                    placeholder="••••••••"
                    style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "10px 0" }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: SS.textDim, display: "flex", padding: 0 }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <Label SS={SS}>Rôle</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { val: "vendeur", label: "Vendeur", icon: <ShoppingBag size={15} />, desc: "Accès ventes" },
                    { val: "admin",   label: "Admin",   icon: <Crown size={15} />,       desc: "Accès complet" },
                  ].map(r => (
                    <button key={r.val} type="button" onClick={() => setRole(r.val)}
                      style={{ padding: "11px", borderRadius: "10px", cursor: "pointer", border: `1px solid ${role === r.val ? SS.gold : SS.border}`, background: role === r.val ? `${SS.gold}15` : SS.surface, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", transition: "all 0.15s" }}>
                      <span style={{ color: role === r.val ? SS.gold : SS.textDim }}>{r.icon}</span>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: role === r.val ? SS.goldDark : SS.text }}>{r.label}</span>
                      <span style={{ fontSize: "10px", color: SS.textDim }}>{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving}
                style={{ padding: "13px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, color: "#fff", fontSize: "14px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: `0 4px 16px ${SS.gold}35` }}>
                {saving
                  ? <><div style={{ width: "15px", height: "15px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />Sauvegarde...</>
                  : <><Save size={16} /> Sauvegarder les modifications</>
                }
              </button>

              {/* Zone danger */}
              <div style={{ padding: "14px", borderRadius: "10px", background: SS.dangerBg, border: `1px solid ${SS.danger}30` }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: SS.danger, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Trash2 size={13} /> Zone de danger
                </div>
                {!confirmDel ? (
                  <button onClick={() => setConfirmDel(true)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "transparent", border: `1px solid ${SS.danger}50`, color: SS.danger, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    Supprimer cet employé
                  </button>
                ) : (
                  <div>
                    <div style={{ fontSize: "13px", color: SS.danger, marginBottom: "10px" }}>
                      Confirmer la suppression de <strong>@{emp.username}</strong> ?
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => onDelete(emp.id)}
                        style={{ flex: 1, padding: "10px", borderRadius: "8px", background: SS.danger, border: "none", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                        Oui, supprimer
                      </button>
                      <button onClick={() => setConfirmDel(false)}
                        style={{ flex: 1, padding: "10px", borderRadius: "8px", background: SS.surface, border: `1px solid ${SS.border}`, color: SS.textMuted, fontSize: "13px", cursor: "pointer" }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "14px 24px", borderTop: `1px solid ${SS.border}`, background: SS.surface, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ padding: "9px 24px", borderRadius: "10px", background: SS.card, border: `1px solid ${SS.border}`, color: SS.textMuted, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Composant Historique ───────────────────────────────────
const HistoriqueTab = ({ SS, employes }) => {
  const token = localStorage.getItem("access");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [page, setPage]           = useState(1);
  const PER_PAGE = 15;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterUser)   params.set("user",   filterUser);
      if (filterAction) params.set("action", filterAction);

      // ✅ CONFIG.API_ACTIVITY
      const res  = await fetch(`${CONFIG.API_ACTIVITY}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setLogs(Array.isArray(data) ? data : data.results || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [filterUser, filterAction]);
  useEffect(() => { setPage(1); }, [filterUser, filterAction]);

  const total      = logs.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const paginated  = logs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      {/* Filtres */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${SS.border}`, background: SS.surface, color: SS.textMuted, fontSize: "13px", cursor: "pointer", outline: "none" }}>
          <option value="">Toutes les actions</option>
          <option value="create">Création</option>
          <option value="update">Modification</option>
          <option value="delete">Suppression</option>
          <option value="vente">Vente</option>
          <option value="login">Connexion</option>
        </select>

        {/* Filtre par employé — admin seulement */}
        {isAdmin && employes.length > 0 && (
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${SS.border}`, background: SS.surface, color: SS.textMuted, fontSize: "13px", cursor: "pointer", outline: "none" }}>
            <option value="">Tous les employés</option>
            {employes.map(u => (
              <option key={u.id} value={u.id}>
                {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username} ({u.role})
              </option>
            ))}
          </select>
        )}

        {(filterAction || filterUser) && (
          <button onClick={() => { setFilterAction(""); setFilterUser(""); }}
            style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${SS.border}`, background: SS.surface, color: SS.textMuted, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
            <X size={13} /> Réinitialiser
          </button>
        )}

        <span style={{ marginLeft: "auto", fontSize: "12px", color: SS.textDim, display: "flex", alignItems: "center" }}>
          {total} entrée{total > 1 ? "s" : ""}
        </span>
      </div>

      {/* Liste des logs */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: SS.textDim }}>
          <Clock size={36} color={`${SS.gold}40`} style={{ marginBottom: "10px" }} />
          <div>Chargement...</div>
        </div>
      ) : paginated.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: SS.textDim, background: SS.surface, borderRadius: "12px", border: `1px solid ${SS.border}` }}>
          <Clock size={36} color={`${SS.gold}30`} style={{ marginBottom: "10px" }} />
          <div>Aucune action enregistrée</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {paginated.map((log, i) => (
            <div key={log.id || i}
              style={{ background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px", transition: "background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background = SS.card}
              onMouseLeave={e => e.currentTarget.style.background = SS.surface}>

              {/* Icône modèle */}
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: `${SS.gold}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: SS.gold }}>
                <ShoppingBag size={15} />
              </div>

              {/* Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", color: SS.text, fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.description || "—"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                  <BadgeAction action={log.action} SS={SS} />
                  {log.model_name && (
                    <span style={{ fontSize: "10px", color: SS.textDim, background: SS.card, padding: "2px 8px", borderRadius: "20px", border: `1px solid ${SS.border}` }}>
                      {log.model_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Utilisateur — admin seulement */}
              {isAdmin && (
                <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: `${SS.gold}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: SS.goldLight }}>
                      {(log.user_username || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: SS.text }}>{log.user_username || "—"}</div>
                    <div style={{ fontSize: "10px", color: SS.textDim }}>{log.user_role || ""}</div>
                  </div>
                </div>
              )}

              {/* Date */}
              <div style={{ fontSize: "11px", color: SS.textDim, flexShrink: 0, textAlign: "right" }}>
                {log.created_at ? new Date(log.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: "6px 14px", borderRadius: "8px", border: `1px solid ${SS.border}`, background: SS.surface, color: SS.textMuted, fontSize: "12px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>
            ← Préc.
          </button>
          <span style={{ fontSize: "12px", color: SS.textDim }}>
            {page} / {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            style={{ padding: "6px 14px", borderRadius: "8px", border: `1px solid ${SS.border}`, background: SS.surface, color: SS.textMuted, fontSize: "12px", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>
            Suiv. →
          </button>
        </div>
      )}
    </div>
  );
};

// ── Page principale ────────────────────────────────────────
const RegisterEmployee = () => {
  const navigate = useNavigate();
  const { tokens: SS } = useTheme();

  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [role, setRole]           = useState("vendeur");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [employes, setEmployes]               = useState([]);
  const [loadingEmployes, setLoadingEmployes] = useState(true);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  // ✅ 3 onglets : creer / liste / historique
  const [activeTab, setActiveTab] = useState("liste");
  const [fFirst, setFFirst] = useState(false);
  const [fLast,  setFLast]  = useState(false);
  const [fUser,  setFUser]  = useState(false);
  const [fPass,  setFPass]  = useState(false);

  const token   = localStorage.getItem("access");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchEmployes = async () => {
    setLoadingEmployes(true);
    try {
      // ✅ CONFIG.API_REGISTER au lieu de BASE_URL/api/users/
      const res  = await fetch(CONFIG.API_REGISTER, { headers });
      const data = await res.json();
      setEmployes(Array.isArray(data) ? data : data.results || []);
    } catch { setEmployes([]); }
    finally { setLoadingEmployes(false); }
  };

  useEffect(() => { fetchEmployes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      // ✅ CONFIG.API_REGISTER
      const res  = await fetch(CONFIG.API_REGISTER, {
        method: "POST", headers,
        body: JSON.stringify({ username, password, role, first_name: firstName, last_name: lastName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Employé créé avec succès !");
        setUsername(""); setPassword(""); setRole("vendeur"); setFirstName(""); setLastName("");
        fetchEmployes();
        setTimeout(() => { setSuccess(""); setActiveTab("liste"); }, 1500);
      } else {
        setError(Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") || "Erreur");
      }
    } catch { setError("Erreur serveur"); }
    finally { setLoading(false); }
  };

  const handleUpdate = (updated) => {
    setEmployes(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelectedEmploye(updated);
  };

  const handleDelete = async (id) => {
    // ✅ CONFIG.API_REGISTER + id
    const res = await fetch(`${CONFIG.API_REGISTER}${id}/`, { method: "DELETE", headers });
    if (res.ok || res.status === 204) {
      setEmployes(prev => prev.filter(e => e.id !== id));
      setSelectedEmploye(null);
    }
  };

  const getRoleStyle = (r) => r === "admin"
    ? { bg: `${SS.gold}18`, color: SS.goldLight, border: `1px solid ${SS.gold}40`, label: "Admin", icon: <Crown size={11} /> }
    : { bg: SS.successBg,   color: SS.success,   border: `1px solid ${SS.success}40`, label: "Vendeur", icon: <ShoppingBag size={11} /> };

  const getInitiales = (emp) => {
    const fn = emp.first_name?.[0] || "";
    const ln = emp.last_name?.[0]  || "";
    return (fn + ln).toUpperCase() || emp.username?.[0]?.toUpperCase() || "?";
  };

  // ✅ 3 onglets
  const tabs = [
    { key: "liste",      icon: <Users     size={15} />, label: "Équipe",          count: employes.length },
    { key: "creer",      icon: <UserPlus  size={15} />, label: "Nouvel employé",  count: null  },
    { key: "historique", icon: <Clock     size={15} />, label: "Historique",      count: null  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: SS.bg, color: SS.text, fontFamily: "var(--font-sans, sans-serif)" }}>

      {selectedEmploye && (
        <ModalEmploye
          emp={selectedEmploye}
          onClose={() => setSelectedEmploye(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          SS={SS}
        />
      )}

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>

        {/* Fil d'Ariane */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: SS.textDim }}>Gestion</span>
          <span style={{ fontSize: "12px", color: SS.textDim }}>/</span>
          <span style={{ fontSize: "12px", color: SS.gold }}>Employés</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
          <button onClick={() => navigate("/dashboardAdmin")}
            style={{ padding: "8px 10px", borderRadius: "8px", border: `1px solid ${SS.border}`, background: SS.card, cursor: "pointer", display: "flex", alignItems: "center", color: SS.textMuted }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${SS.gold}20`, border: `1px solid ${SS.gold}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={19} color={SS.gold} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "600", color: SS.goldLight, lineHeight: 1.2 }}>Employés</div>
              <div style={{ fontSize: "12px", color: SS.textDim }}>{employes.length} membre{employes.length > 1 ? "s" : ""}</div>
            </div>
          </div>
        </div>

        {/* ✅ Tabs — 3 onglets */}
        <div style={{ display: "flex", marginBottom: "24px", background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "14px", padding: "4px", gap: "4px" }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "11px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "700", transition: "all 0.2s", background: activeTab === tab.key ? `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})` : "transparent", color: activeTab === tab.key ? "#fff" : SS.textMuted, boxShadow: activeTab === tab.key ? `0 4px 16px ${SS.gold}35` : "none" }}>
              {tab.icon}
              <span style={{ display: "none" }}>{tab.label}</span>
              {/* Label visible seulement si assez de place */}
              <span style={{ display: "inline" }}>{tab.label}</span>
              {tab.count !== null && (
                <span style={{ padding: "1px 7px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : `${SS.gold}18`, color: activeTab === tab.key ? "#fff" : SS.goldLight }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB LISTE ── */}
        {activeTab === "liste" && (
          <div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {[
                { label: "Total",    value: employes.length,                                 color: SS.gold,      bg: `${SS.gold}12` },
                { label: "Admins",   value: employes.filter(e => e.role === "admin").length,  color: SS.goldLight, bg: `${SS.gold}18` },
                { label: "Vendeurs", value: employes.filter(e => e.role !== "admin").length,  color: SS.success,   bg: SS.successBg   },
              ].map((s, i) => (
                <div key={i} style={{ padding: "14px", borderRadius: "12px", background: s.bg, border: `1px solid ${s.color}30`, textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: SS.textMuted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {loadingEmployes ? (
              <div style={{ textAlign: "center", padding: "3rem", color: SS.textDim }}>
                <Users size={36} color={`${SS.gold}40`} style={{ marginBottom: "10px" }} />
                <div>Chargement...</div>
              </div>
            ) : employes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: SS.textDim, background: SS.surface, borderRadius: "14px", border: `1px solid ${SS.border}` }}>
                <Users size={36} color={`${SS.gold}40`} style={{ marginBottom: "10px" }} />
                <div style={{ fontSize: "14px", marginBottom: "12px" }}>Aucun employé enregistré</div>
                <button onClick={() => setActiveTab("creer")}
                  style={{ padding: "9px 20px", borderRadius: "8px", background: SS.gold, border: "none", color: "#1A1208", fontWeight: "700", cursor: "pointer" }}>
                  Créer le premier employé
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {employes.map(emp => {
                  const rs = getRoleStyle(emp.role);
                  return (
                    <div key={emp.id}
                      style={{ background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${SS.gold}15`; e.currentTarget.style.borderColor = SS.gold + "50"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = SS.border; }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: SS.card, border: `1px solid ${SS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: SS.goldDark, flexShrink: 0 }}>
                        {getInitiales(emp)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: SS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {emp.first_name && emp.last_name ? `${emp.first_name} ${emp.last_name}` : emp.username}
                        </div>
                        <div style={{ fontSize: "11px", color: SS.textMuted }}>@{emp.username}</div>
                      </div>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: rs.bg, color: rs.color, border: rs.border, display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                        {rs.icon} {rs.label}
                      </span>
                      <button onClick={() => setSelectedEmploye(emp)}
                        style={{ padding: "7px 12px", borderRadius: "8px", background: `${SS.gold}15`, border: `1px solid ${SS.gold}35`, color: SS.goldDark, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "600", flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.background = `${SS.gold}28`}
                        onMouseLeave={e => e.currentTarget.style.background = `${SS.gold}15`}>
                        <Pencil size={13} /> Gérer
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB CRÉER ── */}
        {activeTab === "creer" && (
          <div style={{ background: SS.surface, border: `1px solid ${SS.gold}50`, borderRadius: "14px", overflow: "hidden", boxShadow: `0 4px 24px ${SS.gold}10` }}>
            <div style={{ height: "3px", background: `linear-gradient(90deg, ${SS.goldDark}, ${SS.gold}, ${SS.goldDark})` }} />
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "11px", background: `${SS.gold}20`, border: `1px solid ${SS.gold}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserPlus size={20} color={SS.gold} />
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: SS.goldLight }}>Créer un compte employé</div>
                  <div style={{ fontSize: "12px", color: SS.textDim }}>Vendeur ou administrateur</div>
                </div>
              </div>

              {error && (
                <div style={{ padding: "12px 14px", borderRadius: "10px", background: SS.dangerBg, border: `1px solid ${SS.danger}40`, color: SS.danger, fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span>{error}</span>
                  <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: SS.danger }}><X size={14} /></button>
                </div>
              )}
              {success && (
                <div style={{ padding: "12px 14px", borderRadius: "10px", background: SS.successBg, border: `1px solid ${SS.success}40`, color: SS.success, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <Check size={15} /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <Label SS={SS}>Prénom</Label>
                    <div style={iStyle(SS, fFirst)}>
                      <User size={14} color={fFirst ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                      <input type="text" placeholder="Prénom" value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        onFocus={() => setFFirst(true)} onBlur={() => setFFirst(false)}
                        style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "10px 0" }} required />
                    </div>
                  </div>
                  <div>
                    <Label SS={SS}>Nom</Label>
                    <div style={iStyle(SS, fLast)}>
                      <User size={14} color={fLast ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                      <input type="text" placeholder="Nom" value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        onFocus={() => setFLast(true)} onBlur={() => setFLast(false)}
                        style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "10px 0" }} required />
                    </div>
                  </div>
                </div>

                <div>
                  <Label SS={SS}>Identifiant</Label>
                  <div style={iStyle(SS, fUser)}>
                    <Shield size={14} color={fUser ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                    <input type="text" placeholder="lettres, chiffres, @/./+/-/_" value={username}
                      onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9@.+\-_]/g, ""))}
                      onFocus={() => setFUser(true)} onBlur={() => setFUser(false)}
                      style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "10px 0" }} required />
                  </div>
                </div>

                <div>
                  <Label SS={SS}>Mot de passe</Label>
                  <div style={iStyle(SS, fPass)}>
                    <Lock size={14} color={fPass ? SS.gold : SS.textDim} style={{ flexShrink: 0 }} />
                    <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFPass(true)} onBlur={() => setFPass(false)}
                      style={{ flex: 1, background: "none", border: "none", outline: "none", color: SS.text, fontSize: "13px", padding: "10px 0" }} required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: SS.textDim, display: "flex", padding: 0 }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label SS={SS}>Rôle</Label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {[
                      { val: "vendeur", label: "Vendeur", icon: <ShoppingBag size={18} />, desc: "Gestion des ventes" },
                      { val: "admin",   label: "Admin",   icon: <Crown size={18} />,       desc: "Accès complet" },
                    ].map(r => (
                      <button key={r.val} type="button" onClick={() => setRole(r.val)}
                        style={{ padding: "14px", borderRadius: "10px", cursor: "pointer", border: `2px solid ${role === r.val ? SS.gold : SS.border}`, background: role === r.val ? `${SS.gold}15` : SS.card, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all 0.15s" }}>
                        <span style={{ color: role === r.val ? SS.gold : SS.textDim }}>{r.icon}</span>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: role === r.val ? SS.goldDark : SS.text }}>{r.label}</span>
                        <span style={{ fontSize: "11px", color: SS.textDim }}>{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{ marginTop: "4px", padding: "12px 18px", borderRadius: "8px", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, border: "none", color: "#1A1208", fontWeight: "600", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: `0 2px 12px ${SS.gold}30` }}>
                  {loading
                    ? <><div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#1A1208", animation: "spin 0.8s linear infinite" }} />Création...</>
                    : <><UserPlus size={16} /> Créer l'employé</>
                  }
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB HISTORIQUE ── */}
        {activeTab === "historique" && (
          <HistoriqueTab SS={SS} employes={employes} />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RegisterEmployee;