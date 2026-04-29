// Personnel.jsx — Gestion des agents RH COMPLET
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Plus, Search, Eye, Pencil, Trash2, X, Upload, Check,
  AlertCircle, Loader2, ChevronRight, ChevronLeft, ArrowLeft,
  FileDown, Printer, Paperclip, User, Building2, Calendar,
  Hash, Phone, Mail, GraduationCap, Coins, Shield, Download,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTheme } from "../../context/ThemeContext";

const token   = () => localStorage.getItem("access");
const authHdr = () => ({ Authorization: `Bearer ${token()}` });
const fmt     = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const today   = () => new Date().toISOString().split("T")[0];
const fmtGNF  = (v) => { try { return v && parseFloat(v)>0 ? `${parseFloat(v).toLocaleString("fr-FR")} GNF` : "—"; } catch { return "—"; } };

const mkSS = (tokens, isLight) => ({
  bg:           tokens.bg          || (isLight ? "#F5F7FA"             : "#080C10"),
  surface:      tokens.surface     || (isLight ? "#F5F7FA"             : "#111820"),
  card:         tokens.card        || (isLight ? "#FFFFFF"              : "#161E28"),
  hover:        isLight ? "#F0F4F8" : "#1A2535",
  text:         tokens.text        || (isLight ? "#0F2137"             : "#F0F4F8"),
  textSec:      tokens.textSec     || (isLight ? "#4A6780"             : "#7A8FA6"),
  textDim:      tokens.textDim     || (isLight ? "#8FA8C0"             : "#3D5166"),
  border:       tokens.border      || (isLight ? "#E2E8F0"             : "rgba(255,255,255,0.07)"),
  accent:       "#009A44",
  accentBg:     isLight ? "#E8FFF3"             : "rgba(0,154,68,0.1)",
  accentBorder: isLight ? "rgba(0,154,68,0.35)" : "rgba(0,154,68,0.3)",
  accentGlow:   "rgba(0,154,68,0.12)",
  isLight,
});

// ── PDF download ─────────────────────────────────────────────
const downloadPDF = async (url, filename, hdrs) => {
  const res = await fetch(url, { headers: hdrs });
  if (!res.ok) throw new Error();
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

// ════════════════════════════════════════════════════════
//  UI ATOMS
// ════════════════════════════════════════════════════════
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t=setTimeout(onClose,3500); return()=>clearTimeout(t); }, []);
  const ok = type==="success";
  return (<div style={{ position:"fixed",bottom:28,right:28,zIndex:8000,display:"flex",alignItems:"center",gap:10,padding:"13px 20px",borderRadius:12,border:`1px solid ${ok?"rgba(0,154,68,0.35)":"rgba(206,17,38,0.35)"}`,background:ok?"rgba(0,154,68,0.1)":"rgba(206,17,38,0.1)",color:ok?"#009A44":"#CE1126",fontSize:13.5,fontWeight:700,animation:"toastIn 0.3s ease",backdropFilter:"blur(12px)" }}>{ok?<Check size={15}/>:<AlertCircle size={15}/>} {msg}</div>);
};
const FLabel = ({ children, icon:I, SS }) => (<div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>{I&&<I size={11} color={SS.accent}/>}<span style={{ fontSize:10,fontWeight:800,color:SS.textDim,textTransform:"uppercase",letterSpacing:"0.12em" }}>{children}</span></div>);
const FInput = ({ SS, style, ...p }) => (<input {...p} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",...style }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.background=SS.card;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.background=SS.surface;e.target.style.boxShadow="none";}}/>);
const FSelect = ({ SS, children, style, ...p }) => (<select {...p} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",cursor:"pointer",...style }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.boxShadow="none";}}>{children}</select>);
const Btn = ({ SS, children, variant="primary", small=false, disabled=false, style={}, ...p }) => {
  const V={ primary:{bg:SS.accent,border:SS.accent,color:SS.isLight?"#fff":"#080C10"},outline:{bg:SS.accentBg,border:SS.accentBorder,color:SS.accent},ghost:{bg:"transparent",border:SS.border,color:SS.textSec},danger:{bg:"rgba(206,17,38,0.08)",border:"rgba(206,17,38,0.3)",color:"#CE1126"},blue:{bg:"rgba(37,99,235,0.08)",border:"rgba(37,99,235,0.3)",color:"#2563EB"} };
  const s=V[variant]||V.primary;
  return (<button {...p} disabled={disabled} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:small?"7px 14px":"10px 20px",borderRadius:9,border:`1px solid ${s.border}`,background:s.bg,color:s.color,fontSize:small?12:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,transition:"all 0.15s",fontFamily:"inherit",...style }} onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity="0.8";e.currentTarget.style.transform="translateY(-1px)";}}} onMouseLeave={e=>{e.currentTarget.style.opacity=disabled?"0.45":"1";e.currentTarget.style.transform="none";}}>{children}</button>);
};

// ── Badge type ────────────────────────────────────────────────
const BadgeType = ({ type }) => {
  const cfg = type==="fonctionnaire"
    ? { color:"#2563EB", bg:"rgba(37,99,235,0.1)", border:"rgba(37,99,235,0.3)", label:"Fonctionnaire" }
    : { color:"#C9A000", bg:"rgba(201,160,0,0.1)", border:"rgba(201,160,0,0.3)", label:"Contractuel" };
  return <span style={{ fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:6,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}` }}>{cfg.label}</span>;
};

// ── Upload fichier zone ───────────────────────────────────────
const UploadZone = ({ label, field, value, onChange, SS }) => {
  const ref = useRef();
  const [preview, setPreview] = useState(value || null);
  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    onChange(field, f);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview("file:" + f.name);
  };
  return (
    <div>
      <FLabel SS={SS}>{label}</FLabel>
      <div onClick={()=>ref.current.click()} style={{ border:`1.5px dashed ${preview?SS.accentBorder:SS.border}`,borderRadius:10,padding:16,textAlign:"center",cursor:"pointer",background:preview?SS.accentBg:SS.surface,transition:"all 0.2s",minHeight:68,display:"flex",alignItems:"center",justifyContent:"center" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.background=SS.accentBg;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=preview?SS.accentBorder:SS.border;e.currentTarget.style.background=preview?SS.accentBg:SS.surface;}}
      >
        {preview && typeof preview==="string" && preview.startsWith("blob:") && (<img src={preview} alt="" style={{ maxHeight:56,borderRadius:6,objectFit:"contain" }}/>)}
        {preview && typeof preview==="string" && preview.startsWith("http") && (<div style={{ display:"flex",alignItems:"center",gap:6,color:SS.accent }}><Check size={14}/><span style={{ fontSize:12,fontWeight:700 }}>Fichier existant</span></div>)}
        {preview && typeof preview==="string" && preview.startsWith("file:") && (<div style={{ display:"flex",alignItems:"center",gap:6,color:SS.accent }}><Paperclip size={14}/><span style={{ fontSize:12,fontWeight:700 }}>{preview.replace("file:","")}</span></div>)}
        {!preview && (<div style={{ color:SS.textDim }}><Upload size={18} style={{ marginBottom:4 }}/><div style={{ fontSize:11,fontWeight:600 }}>Cliquer pour ajouter</div></div>)}
      </div>
      <input ref={ref} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display:"none" }}/>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  FORMULAIRE AGENT
// ════════════════════════════════════════════════════════
const FormAgent = ({ agent, directions, fonctions, onSave, onCancel, SS }) => {
  const empty = { type_employe:"contractuel", matricule_fp:"", nom:"", prenom:"", sexe:"M", date_naissance:"", lieu_naissance:"", nationalite:"Guinéenne", adresse:"", email:"", telephone:"", direction:"", fonction:"", diplome:"", diplome_date:"", diplome_lieu:"", date_debut:today(), date_fin:"", salaire:"", prime:"", cnss_id:"", cnss_date_debut:"", cnss_date_fin:"" };
  const [form, setForm] = useState(agent ? { ...empty, ...agent, direction:agent.direction||"", fonction:agent.fonction||"" } : empty);
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [net, setNet] = useState(0);

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));
  const setFile = (k,v) => setFiles(f => ({ ...f, [k]:v }));

  // Calcul net auto
  useEffect(() => {
    const sal = parseFloat(form.salaire)||0;
    const pri = parseFloat(form.prime)||0;
    setNet(form.type_employe==="fonctionnaire" ? sal+pri : sal);
  }, [form.salaire, form.prime, form.type_employe]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nom||!form.prenom||!form.date_debut) { setError("Nom, Prénom et Date de début sont obligatoires."); return; }
    if (!files.rib && !agent?.rib) { setError("Le RIB est obligatoire."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>{ if(v!=null&&v!=="") fd.append(k,v); });
      Object.entries(files).forEach(([k,v])=>{ if(v) fd.append(k,v); });
      const url = agent ? CONFIG.API_RH_PERSONNEL_DETAIL(agent.id) : CONFIG.API_RH_PERSONNEL;
      const res = await fetch(url, { method:agent?"PATCH":"POST", headers:authHdr(), body:fd });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      onSave(data);
    } catch(err) { console.error(err); setError("Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  const isFon = form.type_employe === "fonctionnaire";
  const G = ({ children }) => (<div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>{children}</div>);

  return (
    <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:20 }}>
      {error&&<div style={{ background:"rgba(206,17,38,0.08)",border:"1px solid rgba(206,17,38,0.25)",borderRadius:10,padding:"12px 16px",color:"#CE1126",fontSize:13,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={14}/> {error}</div>}

      {/* Type d'employé */}
      <div style={{ background:SS.surface,borderRadius:12,padding:"16px 18px",border:`1px solid ${SS.border}` }}>
        <FLabel SS={SS}>Type d'employé</FLabel>
        <div style={{ display:"flex",gap:10 }}>
          {["contractuel","fonctionnaire"].map(t=>(
            <button key={t} type="button" onClick={()=>set("type_employe",t)}
              style={{ flex:1,padding:"10px 16px",borderRadius:9,border:`1px solid ${form.type_employe===t?SS.accentBorder:SS.border}`,background:form.type_employe===t?SS.accentBg:"transparent",color:form.type_employe===t?SS.accent:SS.textSec,fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s",textTransform:"capitalize" }}>
              {t==="fonctionnaire"?"Fonctionnaire":"Contractuel"}
            </button>
          ))}
        </div>
        {isFon && (
          <div style={{ marginTop:14 }}>
            <FLabel icon={Hash} SS={SS}>Matricule Fonction Publique</FLabel>
            <FInput SS={SS} type="text" placeholder="Ex: FP-2023-0001" value={form.matricule_fp} onChange={e=>set("matricule_fp",e.target.value)}/>
          </div>
        )}
      </div>

      {/* Identité */}
      <div>
        <div style={{ fontSize:11,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}><User size={13}/> Identité</div>
        <G>
          <div><FLabel SS={SS}>Nom</FLabel><FInput SS={SS} type="text" placeholder="Nom de famille" value={form.nom} onChange={e=>set("nom",e.target.value)} required/></div>
          <div><FLabel SS={SS}>Prénom</FLabel><FInput SS={SS} type="text" placeholder="Prénom" value={form.prenom} onChange={e=>set("prenom",e.target.value)} required/></div>
        </G>
        <div style={{ height:14 }}/>
        <G>
          <div><FLabel SS={SS}>Sexe</FLabel><FSelect SS={SS} value={form.sexe} onChange={e=>set("sexe",e.target.value)}><option value="M">Masculin</option><option value="F">Féminin</option></FSelect></div>
          <div><FLabel SS={SS}>Nationalité</FLabel><FInput SS={SS} type="text" value={form.nationalite} onChange={e=>set("nationalite",e.target.value)}/></div>
        </G>
        <div style={{ height:14 }}/>
        <G>
          <div><FLabel icon={Calendar} SS={SS}>Date de naissance</FLabel><FInput SS={SS} type="date" value={form.date_naissance} onChange={e=>set("date_naissance",e.target.value)}/></div>
          <div><FLabel SS={SS}>Lieu de naissance</FLabel><FInput SS={SS} type="text" placeholder="Ville, Préfecture" value={form.lieu_naissance} onChange={e=>set("lieu_naissance",e.target.value)}/></div>
        </G>
      </div>

      {/* Contact */}
      <div>
        <div style={{ fontSize:11,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}><Phone size={13}/> Contact</div>
        <G>
          <div><FLabel icon={Mail} SS={SS}>Email</FLabel><FInput SS={SS} type="email" placeholder="agent@ins.gov.gn" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
          <div><FLabel icon={Phone} SS={SS}>Téléphone</FLabel><FInput SS={SS} type="tel" placeholder="+224 6XX XXX XXX" value={form.telephone} onChange={e=>set("telephone",e.target.value)}/></div>
        </G>
        <div style={{ height:14 }}/>
        <FLabel SS={SS}>Adresse résidentielle</FLabel>
        <FInput SS={SS} type="text" placeholder="Quartier, Commune, Conakry" value={form.adresse} onChange={e=>set("adresse",e.target.value)}/>
      </div>

      {/* Poste */}
      <div>
        <div style={{ fontSize:11,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}><Building2 size={13}/> Poste & Affectation</div>
        <G>
          <div>
            <FLabel SS={SS}>Direction</FLabel>
            <FSelect SS={SS} value={form.direction} onChange={e=>set("direction",e.target.value)}>
              <option value="">— Sélectionner —</option>
              {directions.map(d=>(<option key={d.id} value={d.id}>{d.nom}</option>))}
            </FSelect>
          </div>
          <div>
            <FLabel SS={SS}>Fonction</FLabel>
            <FSelect SS={SS} value={form.fonction} onChange={e=>set("fonction",e.target.value)}>
              <option value="">— Sélectionner —</option>
              {fonctions.map(f=>(<option key={f.id} value={f.id}>{f.titre}</option>))}
            </FSelect>
          </div>
        </G>
        <div style={{ height:14 }}/>
        <G>
          <div><FLabel icon={Calendar} SS={SS}>Date de début</FLabel><FInput SS={SS} type="date" value={form.date_debut} onChange={e=>set("date_debut",e.target.value)} required/></div>
          <div><FLabel icon={Calendar} SS={SS}>Date de fin (facultative)</FLabel><FInput SS={SS} type="date" value={form.date_fin} onChange={e=>set("date_fin",e.target.value)}/></div>
        </G>
      </div>

      {/* Diplôme */}
      <div>
        <div style={{ fontSize:11,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}><GraduationCap size={13}/> Diplôme</div>
        <FLabel SS={SS}>Diplôme obtenu</FLabel>
        <FInput SS={SS} type="text" placeholder="Ex: Licence, Master, Doctorat" value={form.diplome} onChange={e=>set("diplome",e.target.value)} style={{ marginBottom:14 }}/>
        <G>
          <div><FLabel icon={Calendar} SS={SS}>Date d'obtention</FLabel><FInput SS={SS} type="date" value={form.diplome_date} onChange={e=>set("diplome_date",e.target.value)}/></div>
          <div><FLabel SS={SS}>Lieu d'obtention</FLabel><FInput SS={SS} type="text" placeholder="Université, École" value={form.diplome_lieu} onChange={e=>set("diplome_lieu",e.target.value)}/></div>
        </G>
      </div>

      {/* Rémunération */}
      <div style={{ background:SS.surface,borderRadius:12,padding:"16px 18px",border:`1px solid ${SS.border}` }}>
        <div style={{ fontSize:11,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}><Coins size={13}/> Rémunération</div>
        <G>
          <div><FLabel SS={SS}>Salaire de base (GNF)</FLabel><FInput SS={SS} type="number" min="0" placeholder="0" value={form.salaire} onChange={e=>set("salaire",e.target.value)}/></div>
          {isFon && (<div><FLabel SS={SS}>Prime gouvernementale (GNF)</FLabel><FInput SS={SS} type="number" min="0" placeholder="0" value={form.prime} onChange={e=>set("prime",e.target.value)}/></div>)}
        </G>
        <div style={{ marginTop:12,padding:"10px 14px",background:SS.accentBg,border:`1px solid ${SS.accentBorder}`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontSize:12,fontWeight:700,color:SS.textSec }}>Net à payer (calcul auto)</span>
          <span style={{ fontSize:16,fontWeight:900,color:SS.accent }}>{fmtGNF(net)}</span>
        </div>
      </div>

      {/* CNSS */}
      <div>
        <div style={{ fontSize:11,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}><Shield size={13}/> CNSS</div>
        <FLabel SS={SS}>Identifiant CNSS</FLabel>
        <FInput SS={SS} type="text" placeholder="Ex: CNSS-001234" value={form.cnss_id} onChange={e=>set("cnss_id",e.target.value)} style={{ marginBottom:14 }}/>
        <G>
          <div><FLabel icon={Calendar} SS={SS}>Date de début CNSS</FLabel><FInput SS={SS} type="date" value={form.cnss_date_debut} onChange={e=>set("cnss_date_debut",e.target.value)}/></div>
          <div><FLabel icon={Calendar} SS={SS}>Date de fin CNSS</FLabel><FInput SS={SS} type="date" value={form.cnss_date_fin} onChange={e=>set("cnss_date_fin",e.target.value)}/></div>
        </G>
      </div>

      {/* Pièces jointes */}
      <div>
        <div style={{ fontSize:11,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}><Paperclip size={13}/> Pièces jointes</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <UploadZone label="Photo" field="photo" value={agent?.photo_url} onChange={setFile} SS={SS}/>
          <UploadZone label="Pièce d'identité (CIN / Passeport)" field="piece_identite" value={agent?.piece_identite_url} onChange={setFile} SS={SS}/>
          <UploadZone label="RIB *" field="rib" value={agent?.rib_url} onChange={setFile} SS={SS}/>
          <UploadZone label="Autres pièces" field="autres_pieces" value={agent?.autres_pieces} onChange={setFile} SS={SS}/>
        </div>
      </div>

      <div style={{ display:"flex",gap:10,justifyContent:"flex-end",paddingTop:8,borderTop:`1px solid ${SS.border}` }}>
        <Btn SS={SS} variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn SS={SS} disabled={saving}>{saving?<><Loader2 size={13} style={{ animation:"spin 0.7s linear infinite" }}/> Enregistrement…</>:<><Check size={13}/> {agent?"Mettre à jour":"Enregistrer"}</>}</Btn>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════
//  DÉTAIL AGENT
// ════════════════════════════════════════════════════════
const DetailAgent = ({ agent, onClose, onEdit, onDeleted, onToast, SS }) => {
  const [pdfLoad, setPdfLoad] = useState(false);

  const handlePDF = async () => {
    setPdfLoad(true);
    try { await downloadPDF(CONFIG.API_RH_PERSONNEL_PDF(agent.id), `agent_${agent.matricule_interne}.pdf`, authHdr()); onToast("PDF téléchargé.","success"); }
    catch { onToast("Erreur PDF.","error"); }
    finally { setPdfLoad(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer ${agent.nom_complet} ?`)) return;
    try {
      const res = await fetch(CONFIG.API_RH_PERSONNEL_DETAIL(agent.id), { method:"DELETE", headers:authHdr() });
      if (res.ok||res.status===204) { onToast("Agent supprimé.","success"); onDeleted(agent.id); onClose(); }
    } catch { onToast("Erreur suppression.","error"); }
  };

  const isFon = agent.type_employe==="fonctionnaire";

  const Info = ({ label, value, accent }) => (
    <div>
      <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:13.5,fontWeight:700,color:accent?SS.accent:SS.text }}>{value||"—"}</div>
    </div>
  );

  const Section = ({ title, icon:I, children }) => (
    <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:14,overflow:"hidden",marginBottom:16 }}>
      <div style={{ padding:"12px 18px",borderBottom:`1px solid ${SS.border}`,display:"flex",alignItems:"center",gap:8,background:SS.surface }}>
        <div style={{ width:4,height:14,borderRadius:2,background:SS.accent }}/>
        <I size={13} color={SS.accent}/>
        <span style={{ fontSize:11,fontWeight:800,color:SS.text,textTransform:"uppercase",letterSpacing:"0.1em" }}>{title}</span>
      </div>
      <div style={{ padding:"16px 18px" }}>{children}</div>
    </div>
  );

  const Grid = ({ children }) => (<div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>{children}</div>);

  return (
    <div style={{ animation:"pageIn 0.25s ease" }}>
      {/* Topbar */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:14 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <button onClick={onClose} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;}}><ArrowLeft size={15}/> Retour</button>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}>
              <span style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em" }}>Fiche agent</span>
              <BadgeType type={agent.type_employe}/>
              {!agent.actif&&<span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:6,background:"rgba(206,17,38,0.1)",color:"#CE1126" }}>Inactif</span>}
              {agent.cnss_expire&&<span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:6,background:"rgba(206,17,38,0.1)",color:"#CE1126" }}>CNSS expiré</span>}
            </div>
            <div style={{ fontSize:20,fontWeight:900,color:SS.text }}>{agent.nom_complet}</div>
            <div style={{ fontSize:12,color:SS.accent,fontWeight:700,fontFamily:"monospace" }}>{agent.matricule_interne}</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <Btn SS={SS} small variant="outline"  onClick={handlePDF} disabled={pdfLoad}>{pdfLoad?<><Loader2 size={13} style={{ animation:"spin 0.7s linear infinite" }}/> PDF…</>:<><FileDown size={13}/> Fiche PDF</>}</Btn>
          <Btn SS={SS} small variant="blue"    onClick={()=>onEdit(agent)}><Pencil size={13}/> Modifier</Btn>
          <Btn SS={SS} small variant="danger"  onClick={handleDelete}><Trash2 size={13}/> Supprimer</Btn>
        </div>
      </div>

      {/* Contenu 2 colonnes */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
        <div>
          <Section title="Identité" icon={User}>
            <Grid>
              <Info label="Nom" value={agent.nom}/>
              <Info label="Prénom" value={agent.prenom}/>
              <Info label="Sexe" value={agent.sexe==="M"?"Masculin":"Féminin"}/>
              <Info label="Nationalité" value={agent.nationalite}/>
              <Info label="Date de naissance" value={fmt(agent.date_naissance)}/>
              <Info label="Lieu de naissance" value={agent.lieu_naissance}/>
              <Info label="Email" value={agent.email}/>
              <Info label="Téléphone" value={agent.telephone}/>
            </Grid>
            {agent.adresse&&<div style={{ marginTop:12 }}><Info label="Adresse" value={agent.adresse}/></div>}
          </Section>

          <Section title="Poste & Contrat" icon={Building2}>
            <Grid>
              <Info label="Direction" value={agent.direction_nom} accent/>
              <Info label="Fonction"  value={agent.fonction_nom}/>
              <Info label="Date de début" value={fmt(agent.date_debut)}/>
              <Info label="Date de fin" value={agent.date_fin?fmt(agent.date_fin):"En cours"}/>
            </Grid>
            {isFon&&agent.matricule_fp&&<div style={{ marginTop:12 }}><Info label="Matricule Fonction Publique" value={agent.matricule_fp}/></div>}
          </Section>

          {agent.diplome&&(
            <Section title="Diplôme" icon={GraduationCap}>
              <Grid>
                <Info label="Diplôme" value={agent.diplome}/>
                <Info label="Date d'obtention" value={fmt(agent.diplome_date)}/>
                <Info label="Lieu" value={agent.diplome_lieu}/>
              </Grid>
            </Section>
          )}
        </div>

        <div>
          <Section title="Rémunération" icon={Coins}>
            <Grid>
              <Info label="Salaire de base" value={fmtGNF(agent.salaire)}/>
              {isFon&&<Info label="Prime gouvernementale" value={fmtGNF(agent.prime)}/>}
            </Grid>
            <div style={{ marginTop:12,padding:"12px 16px",background:SS.accentBg,border:`1px solid ${SS.accentBorder}`,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:12,fontWeight:700,color:SS.textSec }}>Net à payer</span>
              <span style={{ fontSize:18,fontWeight:900,color:SS.accent }}>{fmtGNF(agent.net_a_payer)}</span>
            </div>
          </Section>

          {agent.cnss_id&&(
            <Section title="CNSS" icon={Shield}>
              <Grid>
                <Info label="Identifiant CNSS" value={agent.cnss_id}/>
                <Info label="Date de début" value={fmt(agent.cnss_date_debut)}/>
                <Info label="Date de fin" value={agent.cnss_date_fin?fmt(agent.cnss_date_fin):"—"}/>
                {agent.cnss_expire&&<div style={{ gridColumn:"1/-1",padding:"8px 12px",background:"rgba(206,17,38,0.08)",borderRadius:8,color:"#CE1126",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6 }}><AlertCircle size={13}/> CNSS expiré — action requise</div>}
              </Grid>
            </Section>
          )}

          <Section title="Pièces jointes" icon={Paperclip}>
            {[{l:"Photo",url:agent.photo_url},{l:"Pièce d'identité",url:agent.piece_identite_url},{l:"RIB",url:agent.rib_url},{l:"Autres",url:agent.autres_pieces}].map(({l,url})=>url?(
              <div key={l} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${SS.border}` }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><Paperclip size={13} color={SS.accent}/><span style={{ fontSize:12,fontWeight:600,color:SS.text }}>{l}</span></div>
                <button onClick={()=>window.open(url,"_blank")} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:11,fontWeight:600,cursor:"pointer" }}><Download size={11}/> Voir</button>
              </div>
            ) : (
              <div key={l} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${SS.border}` }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><Paperclip size={13} color={SS.textDim}/><span style={{ fontSize:12,color:SS.textDim }}>{l}</span></div>
                <span style={{ fontSize:11,color:SS.textDim }}>—</span>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
const Personnel = () => {
  const navigate = useNavigate();
  const { tokens, isLight } = useTheme();
  const SS = mkSS(tokens, isLight);

  const [view,       setView]       = useState("list");
  const [agents,     setAgents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [formMode,   setFormMode]   = useState("create");
  const [toast,      setToast]      = useState(null);
  const [directions, setDirections] = useState([]);
  const [fonctions,  setFonctions]  = useState([]);
  const [filterType, setFilterType] = useState("");
  const PAGE_SIZE = 20;

  const showToast = (msg, type="success") => setToast({msg,type});

  // Charger référentiels
  useEffect(() => {
    fetch(CONFIG.API_RH_DIRECTIONS, { headers:authHdr() }).then(r=>r.json()).then(d=>setDirections(Array.isArray(d)?d:(d.results||[]))).catch(()=>{});
    fetch(CONFIG.API_RH_FONCTIONS,  { headers:authHdr() }).then(r=>r.json()).then(d=>setFonctions(Array.isArray(d)?d:(d.results||[]))).catch(()=>{});
  }, []);

  const load = useCallback(async (p=1, q="", type="") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, page_size:PAGE_SIZE });
      if (q.trim()) params.append("search", q.trim());
      if (type) params.append("type_employe", type);
      const res  = await fetch(`${CONFIG.API_RH_PERSONNEL}?${params}`, { headers:authHdr() });
      const data = await res.json();
      setAgents(Array.isArray(data)?data:(data.results||[]));
      setTotal(data.count||0);
    } catch { showToast("Erreur de chargement.","error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(page,search,filterType); },[page]);
  useEffect(()=>{ const t=setTimeout(()=>{setPage(1);load(1,search,filterType);},400); return()=>clearTimeout(t); },[search,filterType]);

  const openDetail = async (a) => {
    try { const res=await fetch(CONFIG.API_RH_PERSONNEL_DETAIL(a.id),{headers:authHdr()}); const data=await res.json(); setSelected(data); setView("detail"); }
    catch { showToast("Erreur chargement.","error"); }
  };
  const openForm = (a=null) => { setSelected(a); setFormMode(a?"edit":"create"); setView("form"); };
  const handleSaved = (data) => {
    if (formMode==="create"){setAgents(prev=>[data,...prev]);showToast(`Agent ${data.matricule_interne} créé.`);}
    else{setAgents(prev=>prev.map(a=>a.id===data.id?data:a));showToast("Agent mis à jour.");}
    setSelected(data); setView("detail");
  };
  const handleDeleted = (id) => { setAgents(prev=>prev.filter(a=>a.id!==id)); setView("list"); };
  const totalPages = Math.ceil(total/PAGE_SIZE);

  const crumbs = [
    {l:"RH",a:()=>navigate("/personnel")},{l:"Personnel",a:()=>{setView("list");setSelected(null);}},
    ...(view==="detail"&&selected?[{l:selected.nom_complet,a:null}]:[]),
    ...(view==="form"?[{l:formMode==="create"?"Nouveau":"Modifier",a:null}]:[]),
  ];

  return (
    <div style={{ fontFamily:"inherit",color:SS.text }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes rowIn{from{opacity:0}to{opacity:1}}input[type="date"]::-webkit-calendar-picker-indicator{filter:${isLight?"none":"invert(1)"}}select option{background:${SS.card};color:${SS.text}}`}</style>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* Fil d'ariane */}
      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:20,fontSize:12,color:SS.textDim,flexWrap:"wrap" }}>
        {crumbs.map((bc,i)=>(<span key={i} style={{ display:"flex",alignItems:"center",gap:6 }}>{i>0&&<ChevronRight size={11} color={SS.textDim}/>}<span onClick={bc.a||undefined} style={{ cursor:bc.a?"pointer":"default",color:i===crumbs.length-1?SS.accent:SS.textSec,fontWeight:i===crumbs.length-1?700:500 }} onMouseEnter={e=>{if(bc.a)e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{if(bc.a)e.currentTarget.style.color=i===crumbs.length-1?SS.accent:SS.textSec;}}>{bc.l}</span></span>))}
      </div>

      {/* ── LISTE ── */}
      {view==="list"&&(
        <div style={{ animation:"pageIn 0.2s ease" }}>
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:24 }}>
            <div><h1 style={{ fontSize:28,fontWeight:900,color:SS.text,margin:"0 0 6px",letterSpacing:"-0.02em" }}>Personnel</h1><div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:6,height:6,borderRadius:"50%",background:SS.accent,boxShadow:`0 0 8px ${SS.accent}` }}/><span style={{ fontSize:13,color:SS.textSec }}><span style={{ color:SS.accent,fontWeight:700 }}>{total}</span> agent{total>1?"s":""}</span></div></div>
            <button onClick={()=>openForm(null)} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:10,border:"none",background:SS.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:`0 6px 24px ${SS.accentGlow}` }} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}><Plus size={15} strokeWidth={2.5}/> Nouvel agent</button>
          </div>

          {/* Filtres */}
          <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
            <div style={{ flex:1,minWidth:220,position:"relative" }}>
              <Search size={14} color={SS.textDim} style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
              {loading&&search&&<Loader2 size={13} color={SS.accent} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",animation:"spin 0.7s linear infinite" }}/>}
              <input type="text" placeholder="Nom, prénom, matricule…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:"100%",padding:"11px 13px 11px 38px",background:SS.card,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.boxShadow="none";}}/>
            </div>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ padding:"11px 14px",background:SS.card,border:`1px solid ${filterType?SS.accentBorder:SS.border}`,borderRadius:10,outline:"none",color:filterType?SS.accent:SS.textSec,fontSize:13,fontFamily:"inherit",cursor:"pointer",minWidth:160 }}>
              <option value="">Tous les types</option><option value="fonctionnaire">Fonctionnaires</option><option value="contractuel">Contractuels</option>
            </select>
            {(search||filterType)&&<button onClick={()=>{setSearch("");setFilterType("");}} style={{ padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600 }}><X size={13}/> Réinitialiser</button>}
          </div>

          {/* Tableau */}
          {loading&&!search&&!filterType?(<div style={{ textAlign:"center",padding:"80px 0" }}><Loader2 size={32} color={SS.accent} style={{ animation:"spin 0.8s linear infinite",marginBottom:16 }}/><div style={{ fontSize:13,color:SS.textDim }}>Chargement…</div></div>)
          :agents.length===0?(<div style={{ textAlign:"center",padding:"80px 0",background:SS.card,borderRadius:16,border:`1px solid ${SS.border}` }}><Users size={40} color={SS.textDim} style={{ marginBottom:16 }}/><div style={{ fontSize:15,fontWeight:700,color:SS.textSec,marginBottom:8 }}>{search?"Aucun résultat":"Aucun agent enregistré"}</div>{!search&&<div style={{ fontSize:12,color:SS.textDim }}>Cliquez sur "Nouvel agent" pour commencer</div>}</div>)
          :(<>
            <div style={{ border:`1px solid ${SS.border}`,borderRadius:14,overflow:"hidden",opacity:loading?0.5:1 }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead><tr style={{ background:SS.surface,borderBottom:`1px solid ${SS.border}` }}>{["Matricule","Nom & Prénom","Type","Direction","Fonction","Net/mois","Statut","Actions"].map(h=>(<th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:9.5,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap" }}>{h}</th>))}</tr></thead>
                <tbody>
                  {agents.map((a,i)=>(
                    <tr key={a.id} onClick={()=>openDetail(a)} style={{ background:i%2===0?SS.card:SS.surface,borderBottom:`1px solid ${SS.border}`,cursor:"pointer",transition:"background 0.12s",animation:`rowIn 0.3s ease ${i*0.03}s both` }} onMouseEnter={e=>e.currentTarget.style.background=SS.hover} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?SS.card:SS.surface}>
                      <td style={{ padding:"12px 14px",fontFamily:"monospace",fontSize:11,color:SS.accent,fontWeight:700,whiteSpace:"nowrap" }}>{a.matricule_interne}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <div style={{ fontWeight:700,color:SS.text }}>{a.nom_complet}</div>
                        {a.email&&<div style={{ fontSize:11,color:SS.textDim }}>{a.email}</div>}
                      </td>
                      <td style={{ padding:"12px 14px" }}><BadgeType type={a.type_employe}/></td>
                      <td style={{ padding:"12px 14px",color:SS.textSec,fontSize:12,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.direction_nom||"—"}</td>
                      <td style={{ padding:"12px 14px",color:SS.textSec,fontSize:12,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.fonction_nom||"—"}</td>
                      <td style={{ padding:"12px 14px",color:SS.accent,fontWeight:700,fontSize:12,whiteSpace:"nowrap" }}>{fmtGNF(a.net_a_payer)}</td>
                      <td style={{ padding:"12px 14px" }}>
                        {a.actif
                          ? <span style={{ fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:6,background:"rgba(0,154,68,0.1)",color:"#009A44" }}>Actif</span>
                          : <span style={{ fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:6,background:"rgba(206,17,38,0.1)",color:"#CE1126" }}>Inactif</span>}
                        {a.cnss_expire&&<span style={{ marginLeft:5,fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:6,background:"rgba(206,17,38,0.08)",color:"#CE1126" }}>CNSS!</span>}
                      </td>
                      <td style={{ padding:"12px 10px" }} onClick={e=>e.stopPropagation()}>
                        <div style={{ display:"flex",gap:5 }}>
                          <button onClick={()=>openDetail(a)} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:SS.textSec,transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;e.currentTarget.style.background=SS.accentBg;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;e.currentTarget.style.background="transparent";}}><Eye size={12}/></button>
                          <button onClick={()=>openForm(a)} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:SS.textSec,transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(37,99,235,0.35)";e.currentTarget.style.color="#2563EB";e.currentTarget.style.background="rgba(37,99,235,0.08)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;e.currentTarget.style.background="transparent";}}><Pencil size={11}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages>1&&(<div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:20 }}><button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1px solid ${SS.border}`,background:"transparent",color:page===1?SS.textDim:SS.textSec,cursor:page===1?"not-allowed":"pointer",fontSize:12,fontWeight:600 }}><ChevronLeft size={14}/> Précédent</button><span style={{ fontSize:12,color:SS.textDim }}>Page <span style={{ color:SS.accent,fontWeight:800 }}>{page}</span> / {totalPages}</span><button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1px solid ${SS.border}`,background:"transparent",color:page===totalPages?SS.textDim:SS.textSec,cursor:page===totalPages?"not-allowed":"pointer",fontSize:12,fontWeight:600 }}>Suivant <ChevronRight size={14}/></button></div>)}
          </>)}
        </div>
      )}

      {view==="detail"&&selected&&(<DetailAgent agent={selected} onClose={()=>{setView("list");setSelected(null);}} onEdit={openForm} onDeleted={handleDeleted} onToast={showToast} SS={SS}/>)}

      {view==="form"&&(
        <div style={{ animation:"pageIn 0.2s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:28 }}>
            <button onClick={()=>setView(selected?"detail":"list")} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;}}><ArrowLeft size={15}/> Retour</button>
            <div><div style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3 }}>{formMode==="create"?"Nouvel agent":"Modifier"}</div><h2 style={{ fontSize:20,fontWeight:800,color:SS.text,margin:0 }}>{formMode==="create"?"Dossier de personnel":"Modifier — "+selected?.nom_complet}</h2></div>
          </div>
          <div style={{ maxWidth:800,background:SS.card,border:`1px solid ${SS.border}`,borderRadius:16,padding:32,boxShadow:isLight?"0 4px 24px rgba(0,0,0,0.06)":"0 4px 24px rgba(0,0,0,0.3)" }}>
            <FormAgent agent={formMode==="edit"?selected:null} directions={directions} fonctions={fonctions} onSave={handleSaved} onCancel={()=>setView(selected&&formMode==="edit"?"detail":"list")} SS={SS}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personnel;