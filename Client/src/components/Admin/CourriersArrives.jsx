// CourriersArrives.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate }                  from "react-router-dom";
import {
  Mail, Plus, Search, Eye, Pencil, Trash2,
  Printer, Download, X, Upload, ChevronRight,
  FileText, Check, AlertCircle, Loader2, ChevronLeft,
  Calendar, Building2, Hash, AlignLeft, Paperclip,
} from "lucide-react";
import CONFIG from "../../config/config.js";

// ── Palette INS ───────────────────────────────────────────
const C = {
  rouge:      "#CE1126",
  jaune:      "#FCD116",
  vert:       "#009A44",
  vertLight:  "#00C457",
  vertPale:   "#E8FFF3",
  vertGlow:   "#009A4420",
  dark:       "#0F2137",
  textSec:    "#4A6780",
  textDim:    "#8FA8C0",
  border:     "#DDE4ED",
  surface:    "#F5F7FA",
  white:      "#FFFFFF",
  danger:     "#CE1126",
  dangerPale: "#FFF0F2",
};

const token = () => localStorage.getItem("access");
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

// ── Helpers ───────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const today = () => new Date().toISOString().split("T")[0];

const FONCTIONS = [
  { code: "DG",  label: "Directeur Général"          },
  { code: "DGA", label: "Directeur Général Adjoint"  },
  { code: "DIR", label: "Le Directeur"               },
  { code: "SD",  label: "Le Sous Directeur"          },
];

// ════════════════════════════════════════════════════════
//  COMPOSANTS UTILITAIRES
// ════════════════════════════════════════════════════════

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = type === "success" ? C.vert : C.rouge;
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      background: bg, color: "#fff", borderRadius: "12px",
      padding: "13px 18px", fontSize: "13.5px", fontWeight: "600",
      display: "flex", alignItems: "center", gap: "9px",
      boxShadow: `0 8px 24px ${bg}40`,
      animation: "slideIn 0.3s cubic-bezier(0.34,1.4,0.64,1)",
    }}>
      {type === "success" ? <Check size={16}/> : <AlertCircle size={16}/>}
      {msg}
    </div>
  );
};

const FieldLabel = ({ children, icon: Icon }) => (
  <label style={{
    fontSize: "11px", fontWeight: "700", color: C.textSec,
    textTransform: "uppercase", letterSpacing: "0.09em",
    display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px",
  }}>
    {Icon && <Icon size={12} color={C.vert}/>} {children}
  </label>
);

const Input = ({ style, ...props }) => (
  <input
    {...props}
    style={{
      width: "100%", padding: "10px 13px",
      background: C.surface, border: `1.5px solid ${C.border}`,
      borderRadius: "10px", outline: "none",
      color: C.dark, fontSize: "13.5px",
      fontFamily: "'Segoe UI', sans-serif",
      transition: "border-color 0.15s, box-shadow 0.15s",
      boxSizing: "border-box",
      ...style,
    }}
    onFocus={e => { e.target.style.borderColor = C.vert; e.target.style.boxShadow = `0 0 0 3px ${C.vertGlow}`; }}
    onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
  />
);

const Textarea = ({ style, ...props }) => (
  <textarea
    {...props}
    style={{
      width: "100%", padding: "10px 13px",
      background: C.surface, border: `1.5px solid ${C.border}`,
      borderRadius: "10px", outline: "none",
      color: C.dark, fontSize: "13.5px", resize: "vertical", minHeight: "80px",
      fontFamily: "'Segoe UI', sans-serif",
      transition: "border-color 0.15s, box-shadow 0.15s",
      boxSizing: "border-box",
      ...style,
    }}
    onFocus={e => { e.target.style.borderColor = C.vert; e.target.style.boxShadow = `0 0 0 3px ${C.vertGlow}`; }}
    onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
  />
);

const Btn = ({ children, color = C.vert, outline = false, small = false, disabled = false, style = {}, ...props }) => (
  <button
    {...props}
    disabled={disabled}
    style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: "6px",
      padding: small ? "7px 14px" : "10px 18px",
      borderRadius: "10px",
      border: `1.5px solid ${outline ? color : "transparent"}`,
      background: outline ? "transparent" : color,
      color: outline ? color : "#fff",
      fontSize: small ? "12px" : "13px",
      fontWeight: "700", cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      transition: "all 0.15s",
      fontFamily: "'Segoe UI', sans-serif",
      ...style,
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
  >
    {children}
  </button>
);

// ════════════════════════════════════════════════════════
//  FORMULAIRE COURRIER
// ════════════════════════════════════════════════════════
const EMPTY_FORM = {
  date_arrivee: today(),
  origine: "",
  reference: "",
  date_envoi: "",
  objet: "",
  scan: null,
};

const FormCourrier = ({ courrier, onSave, onCancel }) => {
  const [form, setForm]           = useState(courrier ? {
    date_arrivee: courrier.date_arrivee || today(),
    origine:      courrier.origine      || "",
    reference:    courrier.reference    || "",
    date_envoi:   courrier.date_envoi   || "",
    objet:        courrier.objet        || "",
    scan:         null,
  } : EMPTY_FORM);
  const [preview,  setPreview]    = useState(courrier?.scan_url || null);
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState("");
  const fileRef                   = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    set("scan", f);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview("pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.origine || !form.reference || !form.objet) {
      setError("Les champs Origine, Référence et Objet sont obligatoires.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v && k !== "scan") fd.append(k, v); });
      if (form.scan) fd.append("scan", form.scan);

      const url    = courrier ? CONFIG.API_COURRIER_ARRIVE_DETAIL(courrier.id) : CONFIG.API_COURRIERS_ARRIVES;
      const method = courrier ? "PATCH" : "POST";

      const res  = await fetch(url, { method, headers: authHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      onSave(data);
    } catch (err) {
      setError("Erreur lors de l'enregistrement. Vérifiez les champs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

      {error && (
        <div style={{ background: C.dangerPale, border: `1px solid ${C.rouge}40`, borderRadius: "10px", padding: "11px 14px", color: C.rouge, fontSize: "13px", display: "flex", gap: "8px", alignItems: "center" }}>
          <AlertCircle size={15}/> {error}
        </div>
      )}

      {/* Ligne 1 : date arrivée + origine */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div>
          <FieldLabel icon={Calendar}>Date d'arrivée</FieldLabel>
          <Input type="date" value={form.date_arrivee} onChange={e => set("date_arrivee", e.target.value)} required/>
        </div>
        <div>
          <FieldLabel icon={Building2}>Origine</FieldLabel>
          <Input type="text" placeholder="Ex: BCRG" value={form.origine} onChange={e => set("origine", e.target.value)} required/>
        </div>
      </div>

      {/* Ligne 2 : référence + date envoi */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div>
          <FieldLabel icon={Hash}>Référence</FieldLabel>
          <Input type="text" placeholder="Référence du courrier" value={form.reference} onChange={e => set("reference", e.target.value)} required/>
        </div>
        <div>
          <FieldLabel icon={Calendar}>Date d'envoi (Du)</FieldLabel>
          <Input type="date" value={form.date_envoi} onChange={e => set("date_envoi", e.target.value)}/>
        </div>
      </div>

      {/* Objet */}
      <div>
        <FieldLabel icon={AlignLeft}>Objet</FieldLabel>
        <Textarea placeholder="Objet du courrier..." value={form.objet} onChange={e => set("objet", e.target.value)} required/>
      </div>

      {/* Scan */}
      <div>
        <FieldLabel icon={Paperclip}>Scan / Pièce jointe</FieldLabel>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${preview ? C.vert : C.border}`,
            borderRadius: "12px", padding: "20px",
            textAlign: "center", cursor: "pointer",
            background: preview ? C.vertPale : C.surface,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.vert}
          onMouseLeave={e => e.currentTarget.style.borderColor = preview ? C.vert : C.border}
        >
          {preview && preview !== "pdf" ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={preview} alt="scan" style={{ maxHeight: "140px", borderRadius: "8px", objectFit: "contain" }}/>
              <button type="button" onClick={e => { e.stopPropagation(); setPreview(null); set("scan", null); }}
                style={{ position: "absolute", top: "-8px", right: "-8px", width: "22px", height: "22px", borderRadius: "50%", background: C.rouge, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={12}/>
              </button>
            </div>
          ) : preview === "pdf" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: C.vert }}>
              <FileText size={28}/> <span style={{ fontWeight: "600", fontSize: "14px" }}>{form.scan?.name}</span>
              <button type="button" onClick={e => { e.stopPropagation(); setPreview(null); set("scan", null); }}
                style={{ marginLeft: "8px", background: "none", border: "none", cursor: "pointer", color: C.rouge }}>
                <X size={15}/>
              </button>
            </div>
          ) : (
            <>
              <Upload size={28} color={C.textDim} style={{ marginBottom: "8px" }}/>
              <div style={{ fontSize: "13px", color: C.textSec, fontWeight: "600" }}>Cliquez pour uploader</div>
              <div style={{ fontSize: "11px", color: C.textDim, marginTop: "4px" }}>Image (JPG, PNG) ou PDF — max 10 Mo</div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: "none" }}/>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
        <Btn type="button" outline color={C.textSec} onClick={onCancel}>Annuler</Btn>
        <Btn type="submit" disabled={saving}>
          {saving ? <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }}/> Enregistrement…</> : <><Check size={14}/> {courrier ? "Mettre à jour" : "Enregistrer"}</>}
        </Btn>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════
//  VUE DÉTAIL (fiche + tableau circulation)
// ════════════════════════════════════════════════════════
const DetailCourrier = ({ courrier, onClose, onEdit, onDeleted, onToast }) => {
  const [lignes, setLignes]   = useState(courrier.lignes_circulation || []);
  const [editing, setEditing] = useState(null); // id de ligne en cours d'édition
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  const handleSignSave = async (ligne) => {
    setSaving(true);
    try {
      const res = await fetch(CONFIG.API_COURRIER_ARRIVE_CIRC(courrier.id, ligne.id), {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setLignes(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
      setEditing(null);
      onToast("Ligne mise à jour.", "success");
    } catch {
      onToast("Erreur lors de la mise à jour.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer le courrier ${courrier.numero_ordre} ?`)) return;
    try {
      const res = await fetch(CONFIG.API_COURRIER_ARRIVE_DETAIL(courrier.id), {
        method: "DELETE", headers: authHeaders(),
      });
      if (res.ok || res.status === 204) {
        onToast("Courrier supprimé.", "success");
        onDeleted(courrier.id);
        onClose();
      }
    } catch { onToast("Erreur suppression.", "error"); }
  };

  const handlePrint = () => {
    const printWin = window.open("", "_blank", "width=900,height=700");
    printWin.document.write(buildPrintHTML(courrier, lignes));
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Entête fiche */}
      <div style={{ background: C.vertPale, border: `1px solid ${C.vert}30`, borderRadius: "12px", padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
              Numéro d'ordre
            </div>
            <div style={{ fontSize: "20px", fontWeight: "900", color: C.vert, letterSpacing: "0.04em" }}>
              {courrier.numero_ordre}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Btn small outline color={C.vert}   onClick={handlePrint}><Printer size={13}/> Imprimer</Btn>
            <Btn small outline color="#2563EB"  onClick={() => onEdit(courrier)}><Pencil size={13}/> Modifier</Btn>
            <Btn small outline color={C.rouge}  onClick={handleDelete}><Trash2 size={13}/> Supprimer</Btn>
          </div>
        </div>
      </div>

      {/* Grille infos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
        {[
          { label: "Date d'arrivée", value: fmt(courrier.date_arrivee) },
          { label: "Origine",        value: courrier.origine           },
          { label: "Référence",      value: courrier.reference         },
          { label: "Date d'envoi",   value: fmt(courrier.date_envoi)   },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: C.surface, borderRadius: "10px", padding: "14px 16px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "10.5px", color: C.textDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "5px" }}>{label}</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: C.dark }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Objet */}
      <div style={{ background: C.surface, borderRadius: "10px", padding: "14px 16px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "10.5px", color: C.textDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "6px" }}>Objet</div>
        <div style={{ fontSize: "14px", color: C.dark, lineHeight: "1.6" }}>{courrier.objet}</div>
      </div>

      {/* Scan */}
      {courrier.scan_url && (
        <div>
          <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "8px" }}>Pièce jointe</div>
          {courrier.scan_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            ? <img src={courrier.scan_url} alt="scan" style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "10px", border: `1px solid ${C.border}`, objectFit: "contain" }}/>
            : (
              <a href={courrier.scan_url} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: C.vert, fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
                <FileText size={18}/> Voir le document PDF
              </a>
            )
          }
        </div>
      )}

      {/* Tableau de circulation */}
      <div>
        <div style={{ fontSize: "13px", fontWeight: "800", color: C.dark, marginBottom: "12px", display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "4px", height: "16px", borderRadius: "2px", background: C.vert }}/> Tableau de Circulation
        </div>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: C.vertPale }}>
                {["Fonction", "Date", "Annotation", "Observation", "Action"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: "800", color: C.vert, textTransform: "uppercase", letterSpacing: "0.09em", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FONCTIONS.map((f, i) => {
                const ligne = lignes.find(l => l.fonction === f.code) || {};
                const isEd  = editing === ligne.id;
                return (
                  <tr key={f.code} style={{ background: i % 2 === 0 ? C.white : C.surface, borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 14px", fontWeight: "700", color: C.dark, whiteSpace: "nowrap" }}>{f.label}</td>
                    <td style={{ padding: "12px 14px", color: C.textSec }}>
                      {isEd ? <Input type="date" value={form.date_signature || ""} onChange={e => setForm(p => ({ ...p, date_signature: e.target.value }))} style={{ minWidth: "130px" }}/> : (ligne.date_signature ? fmt(ligne.date_signature) : <span style={{ color: C.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding: "12px 14px", color: C.textSec, maxWidth: "160px" }}>
                      {isEd ? <Input type="text" placeholder="Annotation" value={form.annotation || ""} onChange={e => setForm(p => ({ ...p, annotation: e.target.value }))}/> : (ligne.annotation || <span style={{ color: C.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding: "12px 14px", color: C.textSec, maxWidth: "160px" }}>
                      {isEd ? <Input type="text" placeholder="Observation" value={form.observation || ""} onChange={e => setForm(p => ({ ...p, observation: e.target.value }))}/> : (ligne.observation || <span style={{ color: C.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {isEd ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Btn small onClick={() => handleSignSave(ligne)} disabled={saving}><Check size={12}/></Btn>
                          <Btn small outline color={C.textSec} onClick={() => setEditing(null)}><X size={12}/></Btn>
                        </div>
                      ) : (
                        <Btn small outline color={C.vert} onClick={() => { setEditing(ligne.id); setForm({ date_signature: ligne.date_signature || "", annotation: ligne.annotation || "", observation: ligne.observation || "" }); }}>
                          <Pencil size={11}/> Signer
                        </Btn>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  HTML D'IMPRESSION
// ════════════════════════════════════════════════════════
const buildPrintHTML = (courrier, lignes) => `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Fiche Courrier ${courrier.numero_ordre}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 20px 28px; }
  .entete { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #009A44; padding-bottom: 14px; margin-bottom: 18px; }
  .bandeau { display: flex; height: 4px; margin-bottom: 10px; }
  .b1 { flex:1; background:#CE1126; } .b2 { flex:1; background:#FCD116; } .b3 { flex:1; background:#009A44; }
  .titre { font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: #0F2137; }
  .sous-titre { font-size: 11px; color: #4A6780; }
  .numero { font-size: 18px; font-weight: 900; color: #009A44; }
  .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .champ { background: #F5F7FA; border: 1px solid #DDE4ED; border-radius: 6px; padding: 10px 12px; }
  .champ-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #8FA8C0; margin-bottom: 3px; }
  .champ-val { font-size: 13px; font-weight: 700; }
  .objet { background: #F5F7FA; border: 1px solid #DDE4ED; border-radius: 6px; padding: 12px; margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { background: #E8FFF3; padding: 9px 12px; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.09em; color: #009A44; border: 1px solid #DDE4ED; }
  td { padding: 10px 12px; border: 1px solid #DDE4ED; font-size: 12px; min-height: 36px; }
  tr:nth-child(even) td { background: #F5F7FA; }
  .sign-zone { height: 40px; }
  .footer { margin-top: 28px; font-size: 10px; color: #8FA8C0; text-align: center; border-top: 1px solid #DDE4ED; padding-top: 10px; }
  @media print { @page { margin: 15mm; } }
</style></head><body>
<div class="bandeau"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div>
<div class="entete">
  <div>
    <div class="titre">MPCID — Institut National de la Statistique</div>
    <div class="sous-titre">République de Guinée · Fiche de Circulation du Courrier Arrivé</div>
  </div>
  <div style="text-align:right">
    <div class="numero">${courrier.numero_ordre}</div>
    <div class="sous-titre">Enregistré le ${fmt(courrier.date_arrivee)}</div>
  </div>
</div>
<div class="grille">
  <div class="champ"><div class="champ-label">Date d'arrivée</div><div class="champ-val">${fmt(courrier.date_arrivee)}</div></div>
  <div class="champ"><div class="champ-label">Origine</div><div class="champ-val">${courrier.origine}</div></div>
  <div class="champ"><div class="champ-label">Référence</div><div class="champ-val">${courrier.reference}</div></div>
  <div class="champ"><div class="champ-label">Date d'envoi</div><div class="champ-val">${fmt(courrier.date_envoi)}</div></div>
</div>
<div class="objet"><div class="champ-label">Objet</div><div style="margin-top:4px;font-size:13px">${courrier.objet}</div></div>
<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#009A44;margin-bottom:8px">Tableau de Circulation</div>
<table>
  <thead><tr><th>Fonction</th><th>Date</th><th>Annotation</th><th>Observation</th><th>Signature</th></tr></thead>
  <tbody>
    ${FONCTIONS.map(f => {
      const l = lignes.find(x => x.fonction === f.code) || {};
      return `<tr>
        <td><strong>${f.label}</strong></td>
        <td>${l.date_signature ? fmt(l.date_signature) : ""}</td>
        <td>${l.annotation || ""}</td>
        <td>${l.observation || ""}</td>
        <td class="sign-zone"></td>
      </tr>`;
    }).join("")}
  </tbody>
</table>
<div class="footer">Document généré par le Système de Gestion des Courriers — INS Guinée</div>
</body></html>`;

// ════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
const CourriersArrives = () => {
  const navigate = useNavigate();

  const [courriers, setCourriers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const PAGE_SIZE = 15;

  // Panels : null | "form-create" | "form-edit" | "detail"
  const [panel,    setPanel]    = useState(null);
  const [selected, setSelected] = useState(null); // courrier actif
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Chargement ────────────────────────────────────────
  const load = async (p = 1, q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, page_size: PAGE_SIZE });
      if (q) params.append("search", q);
      const res  = await fetch(`${CONFIG.API_COURRIERS_ARRIVES}?${params}`, { headers: authHeaders() });
      const data = await res.json();
      setCourriers(Array.isArray(data) ? data : (data.results || []));
      setTotal(data.count || 0);
    } catch { showToast("Erreur de chargement.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page, search); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  // ── Après enregistrement ──────────────────────────────
  const handleSaved = (data) => {
    if (panel === "form-create") {
      setCourriers(prev => [data, ...prev]);
      showToast(`Courrier ${data.numero_ordre} créé.`);
    } else {
      setCourriers(prev => prev.map(c => c.id === data.id ? data : c));
      setSelected(data);
      showToast("Courrier mis à jour.");
    }
    setPanel("detail");
  };

  const handleDeleted = (id) => {
    setCourriers(prev => prev.filter(c => c.id !== id));
  };

  const openDetail = async (courrier) => {
    // Charger le détail complet (avec lignes de circulation)
    try {
      const res  = await fetch(CONFIG.API_COURRIER_ARRIVE_DETAIL(courrier.id), { headers: authHeaders() });
      const data = await res.json();
      setSelected(data);
      setPanel("detail");
    } catch { showToast("Erreur de chargement du détail.", "error"); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ════════════════════════════════════════════════════
  //  RENDU
  // ════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: "'Segoe UI', 'Calibri', sans-serif", color: C.dark, position: "relative" }}>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* ── En-tête page ────────────────────────────── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.textDim, marginBottom: "8px" }}>
          <FileText size={12}/> Secrétariat DG
          <ChevronRight size={11}/>
          <span onClick={() => navigate("/secretariat/courriers")} style={{ cursor: "pointer", color: C.textSec }}>Courriers</span>
          <ChevronRight size={11}/>
          <span style={{ color: C.vert, fontWeight: "700" }}>Courriers Arrivés</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "900", color: C.dark, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Courriers Arrivés
            </h1>
            <p style={{ fontSize: "13px", color: C.textSec, margin: 0 }}>
              {total} courrier{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}
            </p>
          </div>
          <Btn onClick={() => { setSelected(null); setPanel("form-create"); }}>
            <Plus size={15}/> Nouveau courrier
          </Btn>
        </div>
        <div style={{ display: "flex", gap: "5px", marginTop: "12px" }}>
          <div style={{ width: "24px", height: "3px", borderRadius: "2px", background: C.rouge }}/>
          <div style={{ width: "24px", height: "3px", borderRadius: "2px", background: C.jaune }}/>
          <div style={{ width: "24px", height: "3px", borderRadius: "2px", background: C.vert  }}/>
        </div>
      </div>

      {/* ── Barre de recherche ───────────────────────── */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px", maxWidth: "480px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={15} color={C.textDim} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}/>
          <Input
            type="text"
            placeholder="Rechercher par numéro, origine, référence…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <Btn type="submit"><Search size={14}/> Chercher</Btn>
      </form>

      {/* ── Corps : liste + panel ────────────────────── */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

        {/* Liste */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.textDim }}>
              <Loader2 size={28} color={C.vert} style={{ animation: "spin 0.8s linear infinite", marginBottom: "12px" }}/>
              <div style={{ fontSize: "13px" }}>Chargement…</div>
            </div>
          ) : courriers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", background: C.surface, borderRadius: "14px", border: `1px dashed ${C.border}` }}>
              <Mail size={36} color={C.textDim} style={{ marginBottom: "12px" }}/>
              <div style={{ fontSize: "14px", fontWeight: "700", color: C.textSec, marginBottom: "6px" }}>Aucun courrier trouvé</div>
              <div style={{ fontSize: "12px", color: C.textDim }}>Cliquez sur "Nouveau courrier" pour commencer</div>
            </div>
          ) : (
            <>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: C.vertPale }}>
                      {["N° d'ordre", "Date arrivée", "Origine", "Référence", "Objet", "Scan", "Actions"].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "10px", fontWeight: "800", color: C.vert, textTransform: "uppercase", letterSpacing: "0.09em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courriers.map((c, i) => (
                      <tr key={c.id}
                        onClick={() => openDetail(c)}
                        style={{ background: i % 2 === 0 ? C.white : C.surface, borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.vertPale}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? C.white : C.surface}
                      >
                        <td style={{ padding: "11px 14px", fontWeight: "800", color: C.vert, whiteSpace: "nowrap" }}>{c.numero_ordre}</td>
                        <td style={{ padding: "11px 14px", color: C.textSec, whiteSpace: "nowrap" }}>{fmt(c.date_arrivee)}</td>
                        <td style={{ padding: "11px 14px", fontWeight: "600" }}>{c.origine}</td>
                        <td style={{ padding: "11px 14px", color: C.textSec }}>{c.reference}</td>
                        <td style={{ padding: "11px 14px", color: C.textSec, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.objet}</td>
                        <td style={{ padding: "11px 14px" }}>
                          {c.scan_url
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: C.vert, fontWeight: "700", fontSize: "11px" }}><Paperclip size={12}/> Oui</span>
                            : <span style={{ color: C.textDim, fontSize: "11px" }}>—</span>
                          }
                        </td>
                        <td style={{ padding: "11px 14px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button onClick={() => openDetail(c)} title="Consulter" style={{ background: C.vertPale, border: "none", borderRadius: "7px", padding: "5px 8px", cursor: "pointer", color: C.vert }}>
                              <Eye size={13}/>
                            </button>
                            <button onClick={() => { setSelected(c); setPanel("form-edit"); }} title="Modifier" style={{ background: "#EFF6FF", border: "none", borderRadius: "7px", padding: "5px 8px", cursor: "pointer", color: "#2563EB" }}>
                              <Pencil size={13}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
                  <Btn small outline color={C.vert} disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={13}/></Btn>
                  <span style={{ fontSize: "13px", color: C.textSec, fontWeight: "600" }}>Page {page} / {totalPages}</span>
                  <Btn small outline color={C.vert} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={13}/></Btn>
                </div>
              )}
            </>
          )}
        </div>

        {/* Panel latéral */}
        {panel && (
          <div style={{
            width: "520px", flexShrink: 0,
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: "16px", padding: "24px",
            position: "sticky", top: "20px",
            maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            animation: "slidePanel 0.25s cubic-bezier(0.34,1.4,0.64,1)",
          }}>
            {/* Titre panel */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: C.dark, margin: 0 }}>
                {panel === "form-create" ? "Nouveau courrier arrivé"
                  : panel === "form-edit" ? "Modifier le courrier"
                  : `Fiche — ${selected?.numero_ordre}`}
              </h3>
              <button onClick={() => setPanel(null)} style={{ background: C.surface, border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={16} color={C.textSec}/>
              </button>
            </div>

            {(panel === "form-create" || panel === "form-edit") && (
              <FormCourrier
                courrier={panel === "form-edit" ? selected : null}
                onSave={handleSaved}
                onCancel={() => setPanel(panel === "form-edit" && selected ? "detail" : null)}
              />
            )}

            {panel === "detail" && selected && (
              <DetailCourrier
                courrier={selected}
                onClose={() => setPanel(null)}
                onEdit={(c) => { setSelected(c); setPanel("form-edit"); }}
                onDeleted={handleDeleted}
                onToast={showToast}
              />
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slidePanel {
          from { opacity: 0; transform: translateX(16px) scale(0.98); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CourriersArrives;