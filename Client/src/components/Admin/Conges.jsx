// Conges.jsx — Gestion des congés COMPLET
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Plus, Search, Eye, Pencil, Trash2, X, Check,
  AlertCircle, Loader2, ChevronRight, ChevronLeft, ArrowLeft,
  FileDown, Clock, CheckCircle2, XCircle, Users, Download,
  ThumbsUp, ThumbsDown, Ban,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTheme } from "../../context/ThemeContext";

const token   = () => localStorage.getItem("access");
const authHdr = () => ({ Authorization: `Bearer ${token()}` });
const fmt     = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const today   = () => new Date().toISOString().split("T")[0];

const mkSS = (tokens, isLight) => ({
  bg:SS_bg(tokens,isLight), surface:SS_sur(tokens,isLight), card:SS_card(tokens,isLight),
  hover:isLight?"#F0F4F8":"#1A2535",
  text:tokens.text||(isLight?"#0F2137":"#F0F4F8"), textSec:tokens.textSec||(isLight?"#4A6780":"#7A8FA6"), textDim:tokens.textDim||(isLight?"#8FA8C0":"#3D5166"),
  border:tokens.border||(isLight?"#E2E8F0":"rgba(255,255,255,0.07)"),
  accent:"#009A44", accentBg:isLight?"#E8FFF3":"rgba(0,154,68,0.1)", accentBorder:isLight?"rgba(0,154,68,0.35)":"rgba(0,154,68,0.3)", accentGlow:"rgba(0,154,68,0.12)", isLight,
});
function SS_bg(t,l){ return t.bg||(l?"#F5F7FA":"#080C10"); }
function SS_sur(t,l){ return t.surface||(l?"#F5F7FA":"#111820"); }
function SS_card(t,l){ return t.card||(l?"#FFFFFF":"#161E28"); }

const STATUT_META = {
  en_attente:  { label:"En attente",              color:"#F59E0B", bg:"rgba(245,158,11,0.1)",  icon:Clock         },
  validee_sup: { label:"Validé supérieur",         color:"#2563EB", bg:"rgba(37,99,235,0.1)",  icon:CheckCircle2  },
  validee_drh: { label:"Validé DRH",              color:"#009A44", bg:"rgba(0,154,68,0.1)",   icon:CheckCircle2  },
  refusee:     { label:"Refusée",                 color:"#CE1126", bg:"rgba(206,17,38,0.1)",  icon:XCircle       },
  annulee:     { label:"Annulée",                 color:"#7A8FA6", bg:"rgba(122,143,166,0.1)",icon:Ban           },
};
const TYPE_META = {
  annuel:    { label:"Congé annuel",       color:"#009A44" },
  maladie:   { label:"Congé maladie",      color:"#CE1126" },
  maternite: { label:"Congé maternité",    color:"#C9A000" },
  sans_solde:{ label:"Congé sans solde",   color:"#7A8FA6" },
  autre:     { label:"Autre",              color:"#2563EB" },
};

const downloadPDF = async (url, filename, hdrs) => {
  const res = await fetch(url, { headers: hdrs }); if (!res.ok) throw new Error();
  const blob = await res.blob(); const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
};

const Toast = ({ msg, type, onClose }) => { useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[]);const ok=type==="success";return(<div style={{position:"fixed",bottom:28,right:28,zIndex:8000,display:"flex",alignItems:"center",gap:10,padding:"13px 20px",borderRadius:12,border:`1px solid ${ok?"rgba(0,154,68,0.35)":"rgba(206,17,38,0.35)"}`,background:ok?"rgba(0,154,68,0.1)":"rgba(206,17,38,0.1)",color:ok?"#009A44":"#CE1126",fontSize:13.5,fontWeight:700,animation:"toastIn 0.3s ease",backdropFilter:"blur(12px)"}}>{ok?<Check size={15}/>:<AlertCircle size={15}/>} {msg}</div>); };
const FLabel = ({ children, SS }) => (<div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}><span style={{ fontSize:10,fontWeight:800,color:SS.textDim,textTransform:"uppercase",letterSpacing:"0.12em" }}>{children}</span></div>);
const FInput = ({ SS, style, ...p }) => (<input {...p} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",...style }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.background=SS.card;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.background=SS.surface;e.target.style.boxShadow="none";}}/>);
const FArea = ({ SS, style, ...p }) => (<textarea {...p} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,resize:"vertical",minHeight:80,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",...style }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.background=SS.card;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.background=SS.surface;e.target.style.boxShadow="none";}}/>);
const FSelect = ({ SS, children, ...p }) => (<select {...p} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",cursor:"pointer" }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.boxShadow="none";}}>{children}</select>);
const Btn = ({ SS, children, variant="primary", small=false, disabled=false, style={}, ...p }) => {
  const V={primary:{bg:SS.accent,border:SS.accent,color:SS.isLight?"#fff":"#080C10"},outline:{bg:SS.accentBg,border:SS.accentBorder,color:SS.accent},ghost:{bg:"transparent",border:SS.border,color:SS.textSec},danger:{bg:"rgba(206,17,38,0.08)",border:"rgba(206,17,38,0.3)",color:"#CE1126"},blue:{bg:"rgba(37,99,235,0.08)",border:"rgba(37,99,235,0.3)",color:"#2563EB"},amber:{bg:"rgba(245,158,11,0.08)",border:"rgba(245,158,11,0.35)",color:"#D97706"}};
  const s=V[variant]||V.primary;
  return (<button {...p} disabled={disabled} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:small?"7px 14px":"10px 20px",borderRadius:9,border:`1px solid ${s.border}`,background:s.bg,color:s.color,fontSize:small?12:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,transition:"all 0.15s",fontFamily:"inherit",...style }} onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity="0.8";e.currentTarget.style.transform="translateY(-1px)";}}} onMouseLeave={e=>{e.currentTarget.style.opacity=disabled?"0.45":"1";e.currentTarget.style.transform="none";}}>{children}</button>);
};

const BadgeStatut = ({ statut }) => {
  const m = STATUT_META[statut]||STATUT_META.en_attente;
  const I = m.icon;
  return (<span style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:6,background:m.bg,color:m.color }}><I size={10}/>{m.label}</span>);
};

// ════════════════════════════════════════════════════════
//  MODALE VALIDATION
// ════════════════════════════════════════════════════════
const ValidationModal = ({ conge, onConfirm, onCancel, SS }) => {
  const [action, setAction] = useState("valider_sup");
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);

  const canValiderSup = conge.statut==="en_attente";
  const canValiderDrh = conge.statut==="validee_sup";

  const confirm = async () => {
    setLoading(true);
    await onConfirm(action, commentaire);
    setLoading(false);
  };

  const actions = [
    ...(canValiderSup?[{v:"valider_sup",l:"Valider (Supérieur)",I:ThumbsUp,c:"#009A44"}]:[]),
    ...(canValiderDrh?[{v:"valider_drh",l:"Valider DRH",I:CheckCircle2,c:"#009A44"}]:[]),
    {v:"refuser",l:"Refuser",I:ThumbsDown,c:"#CE1126"},
    {v:"annuler",l:"Annuler",I:Ban,c:"#7A8FA6"},
  ];

  return (
    <div style={{ position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)" }}>
      <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:16,padding:28,maxWidth:460,width:"90%",boxShadow:"0 24px 64px rgba(0,0,0,0.3)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:SS.accentBg,border:`1px solid ${SS.accentBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Calendar size={20} color={SS.accent}/></div>
          <div><div style={{ fontSize:15,fontWeight:800,color:SS.text }}>Gérer la demande</div><div style={{ fontSize:12,color:SS.textSec }}>{conge.personnel_nom} — {conge.nombre_jours} jour{conge.nombre_jours>1?"s":""}</div></div>
        </div>
        <div style={{ marginBottom:18 }}>
          {actions.map(({v,l,I,c})=>(
            <button key={v} onClick={()=>setAction(v)} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",marginBottom:8,borderRadius:9,border:`1px solid ${action===v?`${c}55`:SS.border}`,background:action===v?`${c}12`:"transparent",color:action===v?c:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s",textAlign:"left" }}>
              <I size={15} color={action===v?c:SS.textDim}/> {l}
            </button>
          ))}
        </div>
        {(action==="refuser"||action==="valider_drh")&&(
          <div style={{ marginBottom:18 }}>
            <FLabel SS={SS}>Commentaire {action==="refuser"?"(motif)":""}</FLabel>
            <FArea SS={SS} placeholder="Commentaire optionnel…" value={commentaire} onChange={e=>setCommentaire(e.target.value)} style={{ minHeight:70 }}/>
          </div>
        )}
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ padding:"9px 18px",borderRadius:9,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer" }}>Annuler</button>
          <button onClick={confirm} disabled={loading} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:9,border:"none",background:SS.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1 }}>
            {loading?<><Loader2 size={13} style={{ animation:"spin 0.7s linear infinite" }}/> …</>:<><Check size={13}/> Confirmer</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  FORMULAIRE CONGÉ
// ════════════════════════════════════════════════════════
const FormConge = ({ conge, personnel, onSave, onCancel, SS }) => {
  const [form, setForm] = useState(conge ? { personnel:conge.personnel, type_conge:conge.type_conge, date_debut:conge.date_debut, date_fin:conge.date_fin, motif:conge.motif||"" } : { personnel:"", type_conge:"annuel", date_debut:today(), date_fin:"", motif:"" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nbJours, setNbJours] = useState(0);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    if (form.date_debut&&form.date_fin) {
      const d = (new Date(form.date_fin)-new Date(form.date_debut))/86400000+1;
      setNbJours(Math.max(0,d));
    }
  }, [form.date_debut, form.date_fin]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.personnel||!form.date_debut||!form.date_fin) { setError("Personnel, date de début et date de fin sont obligatoires."); return; }
    setSaving(true); setError("");
    try {
      const url = conge ? CONFIG.API_RH_CONGE_DETAIL(conge.id) : CONFIG.API_RH_CONGES;
      const res = await fetch(url, { method:conge?"PATCH":"POST", headers:{...authHdr(),"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      onSave(data);
    } catch(err){ console.error(err); setError("Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:18 }}>
      {error&&<div style={{ background:"rgba(206,17,38,0.08)",border:"1px solid rgba(206,17,38,0.25)",borderRadius:10,padding:"12px 16px",color:"#CE1126",fontSize:13,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={14}/> {error}</div>}
      <div>
        <FLabel SS={SS}>Agent</FLabel>
        <FSelect SS={SS} value={form.personnel} onChange={e=>set("personnel",e.target.value)} required>
          <option value="">— Sélectionner un agent —</option>
          {personnel.map(a=>(<option key={a.id} value={a.id}>{a.nom_complet} ({a.matricule_interne})</option>))}
        </FSelect>
      </div>
      <div>
        <FLabel SS={SS}>Type de congé</FLabel>
        <FSelect SS={SS} value={form.type_conge} onChange={e=>set("type_conge",e.target.value)}>
          {Object.entries(TYPE_META).map(([k,m])=>(<option key={k} value={k}>{m.label}</option>))}
        </FSelect>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div><FLabel SS={SS}>Date de début</FLabel><FInput SS={SS} type="date" value={form.date_debut} onChange={e=>set("date_debut",e.target.value)} required/></div>
        <div><FLabel SS={SS}>Date de fin</FLabel><FInput SS={SS} type="date" value={form.date_fin} onChange={e=>set("date_fin",e.target.value)} required/></div>
      </div>
      {nbJours>0&&(
        <div style={{ padding:"10px 14px",background:SS.accentBg,border:`1px solid ${SS.accentBorder}`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontSize:12,fontWeight:700,color:SS.textSec }}>Durée calculée</span>
          <span style={{ fontSize:16,fontWeight:900,color:SS.accent }}>{nbJours} jour{nbJours>1?"s":""}</span>
        </div>
      )}
      <div><FLabel SS={SS}>Motif (facultatif)</FLabel><FArea SS={SS} placeholder="Motif de la demande…" value={form.motif} onChange={e=>set("motif",e.target.value)}/></div>
      <div style={{ display:"flex",gap:10,justifyContent:"flex-end",paddingTop:8,borderTop:`1px solid ${SS.border}` }}>
        <Btn SS={SS} variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn SS={SS} disabled={saving}>{saving?<><Loader2 size={13} style={{ animation:"spin 0.7s linear infinite" }}/> Enregistrement…</>:<><Check size={13}/> {conge?"Mettre à jour":"Enregistrer"}</>}</Btn>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════
//  DÉTAIL CONGÉ
// ════════════════════════════════════════════════════════
const DetailConge = ({ conge, onClose, onEdit, onDeleted, onToast, onRefresh, SS }) => {
  const [pdfLoad,  setPdfLoad]  = useState(false);
  const [valModal, setValModal] = useState(false);
  const [current,  setCurrent]  = useState(conge);

  const sm = STATUT_META[current.statut]||STATUT_META.en_attente;
  const tm = TYPE_META[current.type_conge]||TYPE_META.annuel;

  const handlePDF = async () => {
    setPdfLoad(true);
    try { await downloadPDF(CONFIG.API_RH_CONGE_AUTORISATION(current.id), `autorisation_${current.id}.pdf`, authHdr()); onToast("Autorisation téléchargée.","success"); }
    catch { onToast("PDF non disponible (validé DRH requis).","error"); }
    finally { setPdfLoad(false); }
  };

  const handleValidation = async (action, commentaire) => {
    try {
      const res = await fetch(CONFIG.API_RH_CONGE_VALIDER(current.id), {
        method:"POST", headers:{...authHdr(),"Content-Type":"application/json"},
        body:JSON.stringify({ action, commentaire }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Erreur");
      setCurrent(data.conge||current);
      onToast(data.detail||"Action effectuée.","success");
      setValModal(false);
      onRefresh();
    } catch(e) { onToast(e.message||"Erreur.","error"); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette demande ?")) return;
    try {
      const res = await fetch(CONFIG.API_RH_CONGE_DETAIL(current.id),{method:"DELETE",headers:authHdr()});
      if(res.ok||res.status===204){onToast("Demande supprimée.","success");onDeleted(current.id);onClose();}
    } catch { onToast("Erreur.","error"); }
  };

  const Info = ({l,v,c}) => (<div><div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:4 }}>{l}</div><div style={{ fontSize:13.5,fontWeight:700,color:c?SS.accent:SS.text }}>{v||"—"}</div></div>);

  return (
    <>
      {valModal&&<ValidationModal conge={current} onConfirm={handleValidation} onCancel={()=>setValModal(false)} SS={SS}/>}
      <div style={{ animation:"pageIn 0.25s ease" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <button onClick={onClose} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;}}><ArrowLeft size={15}/> Retour</button>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                <span style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em" }}>Demande de congé</span>
                <BadgeStatut statut={current.statut}/>
                <span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:6,background:`${tm.color}18`,color:tm.color }}>{tm.label}</span>
              </div>
              <div style={{ fontSize:20,fontWeight:900,color:SS.text }}>{current.personnel_nom}</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {current.statut==="validee_drh"&&(<Btn SS={SS} small variant="outline" onClick={handlePDF} disabled={pdfLoad}>{pdfLoad?<><Loader2 size={13} style={{ animation:"spin 0.7s linear infinite" }}/> …</>:<><FileDown size={13}/> Autorisation PDF</>}</Btn>)}
            {["en_attente","validee_sup"].includes(current.statut)&&(<Btn SS={SS} small variant="amber" onClick={()=>setValModal(true)}><CheckCircle2 size={13}/> Valider / Refuser</Btn>)}
            {current.statut==="en_attente"&&(<Btn SS={SS} small variant="blue" onClick={()=>onEdit(current)}><Pencil size={13}/> Modifier</Btn>)}
            <Btn SS={SS} small variant="danger" onClick={handleDelete}><Trash2 size={13}/> Supprimer</Btn>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
          <div style={{ background:SS.card,border:`1px solid ${SS.accentBorder}`,borderRadius:14,padding:"20px 22px",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,width:"100%",height:"3px",background:"linear-gradient(90deg,#CE1126,#FCD116,#009A44)" }}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:6 }}>
              <Info l="Agent" v={current.personnel_nom} c/>
              <Info l="Type" v={tm.label}/>
              <Info l="Date de début" v={fmt(current.date_debut)}/>
              <Info l="Date de fin" v={fmt(current.date_fin)}/>
              <div style={{ gridColumn:"1/-1",padding:"10px 14px",background:SS.accentBg,border:`1px solid ${SS.accentBorder}`,borderRadius:9,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:12,fontWeight:700,color:SS.textSec }}>Durée</span>
                <span style={{ fontSize:18,fontWeight:900,color:SS.accent }}>{current.nombre_jours} jour{current.nombre_jours>1?"s":""}</span>
              </div>
            </div>
            {current.motif&&(<div style={{ marginTop:14 }}><div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:6 }}>Motif</div><div style={{ fontSize:13,color:SS.text,lineHeight:1.6 }}>{current.motif}</div></div>)}
          </div>

          {/* Flux validation */}
          <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:14,padding:"20px 22px" }}>
            <div style={{ fontSize:11,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16 }}>Flux de validation</div>
            {[
              { step:1,label:"Demande soumise",    done:true,         date:current.created_at,       by:current.personnel_nom },
              { step:2,label:"Validation supérieur",done:!!current.date_valid_sup, date:current.date_valid_sup, by:current.valide_par_sup_nom },
              { step:3,label:"Validation DRH",      done:!!current.date_valid_drh, date:current.date_valid_drh, by:current.valide_par_drh_nom },
            ].map(({step,label,done,date,by})=>(
              <div key={step} style={{ display:"flex",gap:12,marginBottom:16 }}>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
                  <div style={{ width:28,height:28,borderRadius:"50%",background:done?SS.accentBg:"rgba(122,143,166,0.1)",border:`2px solid ${done?SS.accent:"rgba(122,143,166,0.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    {done?<Check size={13} color={SS.accent}/>:<span style={{ fontSize:11,fontWeight:800,color:SS.textDim }}>{step}</span>}
                  </div>
                  {step<3&&<div style={{ width:2,height:14,background:done?SS.accentBorder:SS.border,marginTop:3 }}/>}
                </div>
                <div>
                  <div style={{ fontSize:12,fontWeight:700,color:done?SS.text:SS.textDim }}>{label}</div>
                  {done&&by&&<div style={{ fontSize:11,color:SS.textSec }}>{by}</div>}
                  {done&&date&&<div style={{ fontSize:10,color:SS.textDim }}>{fmt(date?.split("T")[0])}</div>}
                </div>
              </div>
            ))}
            {current.commentaire_rh&&(
              <div style={{ marginTop:8,padding:"10px 12px",background:SS.surface,borderRadius:8,fontSize:12,color:SS.textSec,lineHeight:1.5 }}>
                <strong style={{ color:SS.text }}>Note DRH :</strong> {current.commentaire_rh}
              </div>
            )}
            {["refusee","annulee"].includes(current.statut)&&(
              <div style={{ marginTop:8,padding:"10px 12px",background:"rgba(206,17,38,0.06)",borderRadius:8,color:"#CE1126",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6 }}>
                <XCircle size={13}/> {current.statut==="refusee"?"Demande refusée":"Demande annulée"}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
const Conges = () => {
  const navigate = useNavigate();
  const { tokens, isLight } = useTheme();
  const SS = mkSS(tokens, isLight);

  const [view,       setView]       = useState("list");
  const [conges,     setConges]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [formMode,   setFormMode]   = useState("create");
  const [toast,      setToast]      = useState(null);
  const [personnel,  setPersonnel]  = useState([]);
  const [filterStat, setFilterStat] = useState("");
  const PAGE_SIZE = 20;

  const showToast = (msg, type="success") => setToast({msg,type});

  useEffect(() => {
    fetch(`${CONFIG.API_RH_PERSONNEL}?page_size=200`, { headers:authHdr() })
      .then(r=>r.json()).then(d=>setPersonnel(Array.isArray(d)?d:(d.results||[]))).catch(()=>{});
  }, []);

  const load = useCallback(async (p=1, q="", stat="") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, page_size:PAGE_SIZE });
      if (q.trim()) params.append("search", q.trim());
      if (stat) params.append("statut", stat);
      const res  = await fetch(`${CONFIG.API_RH_CONGES}?${params}`, { headers:authHdr() });
      const data = await res.json();
      setConges(Array.isArray(data)?data:(data.results||[]));
      setTotal(data.count||0);
    } catch { showToast("Erreur de chargement.","error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(page,search,filterStat); },[page]);
  useEffect(()=>{ const t=setTimeout(()=>{setPage(1);load(1,search,filterStat);},400); return()=>clearTimeout(t); },[search,filterStat]);

  const openDetail = async (c) => {
    try { const res=await fetch(CONFIG.API_RH_CONGE_DETAIL(c.id),{headers:authHdr()}); const data=await res.json(); setSelected(data); setView("detail"); }
    catch { showToast("Erreur.","error"); }
  };
  const openForm = (c=null) => { setSelected(c); setFormMode(c?"edit":"create"); setView("form"); };
  const handleSaved = (data) => {
    if (formMode==="create"){setConges(prev=>[data,...prev]);showToast("Demande créée.");}
    else{setConges(prev=>prev.map(c=>c.id===data.id?data:c));showToast("Demande mise à jour.");}
    setSelected(data); setView("detail");
  };
  const handleDeleted = (id) => { setConges(prev=>prev.filter(c=>c.id!==id)); setView("list"); };
  const totalPages = Math.ceil(total/PAGE_SIZE);

  const crumbs = [
    {l:"RH",a:()=>navigate("/personnel")},{l:"Congés",a:()=>{setView("list");setSelected(null);}},
    ...(view==="detail"&&selected?[{l:selected.personnel_nom,a:null}]:[]),
    ...(view==="form"?[{l:formMode==="create"?"Nouvelle demande":"Modifier",a:null}]:[]),
  ];

  return (
    <div style={{ fontFamily:"inherit",color:SS.text }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes rowIn{from{opacity:0}to{opacity:1}}input[type="date"]::-webkit-calendar-picker-indicator{filter:${isLight?"none":"invert(1)"}}select option{background:${SS.card};color:${SS.text}}`}</style>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:20,fontSize:12,color:SS.textDim,flexWrap:"wrap" }}>
        {crumbs.map((bc,i)=>(<span key={i} style={{ display:"flex",alignItems:"center",gap:6 }}>{i>0&&<ChevronRight size={11} color={SS.textDim}/>}<span onClick={bc.a||undefined} style={{ cursor:bc.a?"pointer":"default",color:i===crumbs.length-1?SS.accent:SS.textSec,fontWeight:i===crumbs.length-1?700:500 }} onMouseEnter={e=>{if(bc.a)e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{if(bc.a)e.currentTarget.style.color=i===crumbs.length-1?SS.accent:SS.textSec;}}>{bc.l}</span></span>))}
      </div>

      {/* LISTE */}
      {view==="list"&&(
        <div style={{ animation:"pageIn 0.2s ease" }}>
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:24 }}>
            <div><h1 style={{ fontSize:28,fontWeight:900,color:SS.text,margin:"0 0 6px",letterSpacing:"-0.02em" }}>Congés</h1><div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:6,height:6,borderRadius:"50%",background:SS.accent,boxShadow:`0 0 8px ${SS.accent}` }}/><span style={{ fontSize:13,color:SS.textSec }}><span style={{ color:SS.accent,fontWeight:700 }}>{total}</span> demande{total>1?"s":""}</span></div></div>
            <button onClick={()=>openForm(null)} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:10,border:"none",background:SS.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:`0 6px 24px ${SS.accentGlow}` }} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}><Plus size={15} strokeWidth={2.5}/> Nouvelle demande</button>
          </div>
          <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
            <div style={{ flex:1,minWidth:200,position:"relative" }}>
              <Search size={14} color={SS.textDim} style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
              <input type="text" placeholder="Recherche par agent…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:"100%",padding:"11px 13px 11px 38px",background:SS.card,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.boxShadow="none";}}/>
            </div>
            <select value={filterStat} onChange={e=>setFilterStat(e.target.value)} style={{ padding:"11px 14px",background:SS.card,border:`1px solid ${filterStat?SS.accentBorder:SS.border}`,borderRadius:10,outline:"none",color:filterStat?SS.accent:SS.textSec,fontSize:13,fontFamily:"inherit",cursor:"pointer",minWidth:170 }}>
              <option value="">Tous les statuts</option>
              {Object.entries(STATUT_META).map(([k,m])=>(<option key={k} value={k}>{m.label}</option>))}
            </select>
            {(search||filterStat)&&<button onClick={()=>{setSearch("");setFilterStat("");}} style={{ padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600 }}><X size={13}/> Réinitialiser</button>}
          </div>

          {loading&&!search&&!filterStat?(<div style={{ textAlign:"center",padding:"80px 0" }}><Loader2 size={32} color={SS.accent} style={{ animation:"spin 0.8s linear infinite",marginBottom:16 }}/><div style={{ fontSize:13,color:SS.textDim }}>Chargement…</div></div>)
          :conges.length===0?(<div style={{ textAlign:"center",padding:"80px 0",background:SS.card,borderRadius:16,border:`1px solid ${SS.border}` }}><Calendar size={40} color={SS.textDim} style={{ marginBottom:16 }}/><div style={{ fontSize:15,fontWeight:700,color:SS.textSec,marginBottom:8 }}>{search?"Aucun résultat":"Aucune demande"}</div></div>)
          :(<>
            <div style={{ border:`1px solid ${SS.border}`,borderRadius:14,overflow:"hidden",opacity:loading?0.5:1 }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead><tr style={{ background:SS.surface,borderBottom:`1px solid ${SS.border}` }}>{["Agent","Type","Début","Fin","Durée","Statut","Actions"].map(h=>(<th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:9.5,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap" }}>{h}</th>))}</tr></thead>
                <tbody>
                  {conges.map((c,i)=>{
                    const tm=TYPE_META[c.type_conge]||TYPE_META.annuel;
                    return (
                      <tr key={c.id} onClick={()=>openDetail(c)} style={{ background:i%2===0?SS.card:SS.surface,borderBottom:`1px solid ${SS.border}`,cursor:"pointer",transition:"background 0.12s",animation:`rowIn 0.3s ease ${i*0.03}s both` }} onMouseEnter={e=>e.currentTarget.style.background=SS.hover} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?SS.card:SS.surface}>
                        <td style={{ padding:"12px 14px" }}><div style={{ fontWeight:700,color:SS.text,fontSize:13 }}>{c.personnel_nom}</div><div style={{ fontSize:10,color:SS.textDim }}>{c.personnel_type}</div></td>
                        <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:6,background:`${tm.color}18`,color:tm.color }}>{tm.label}</span></td>
                        <td style={{ padding:"12px 14px",color:SS.textSec,fontSize:12,whiteSpace:"nowrap" }}>{fmt(c.date_debut)}</td>
                        <td style={{ padding:"12px 14px",color:SS.textSec,fontSize:12,whiteSpace:"nowrap" }}>{fmt(c.date_fin)}</td>
                        <td style={{ padding:"12px 14px",color:SS.accent,fontWeight:700,fontSize:12 }}>{c.nombre_jours}j</td>
                        <td style={{ padding:"12px 14px" }}><BadgeStatut statut={c.statut}/></td>
                        <td style={{ padding:"12px 10px" }} onClick={e=>e.stopPropagation()}>
                          <button onClick={()=>openDetail(c)} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:SS.textSec,transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;e.currentTarget.style.background=SS.accentBg;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;e.currentTarget.style.background="transparent";}}><Eye size={12}/></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages>1&&(<div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:20 }}><button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1px solid ${SS.border}`,background:"transparent",color:page===1?SS.textDim:SS.textSec,cursor:page===1?"not-allowed":"pointer",fontSize:12,fontWeight:600 }}><ChevronLeft size={14}/> Précédent</button><span style={{ fontSize:12,color:SS.textDim }}>Page <span style={{ color:SS.accent,fontWeight:800 }}>{page}</span> / {totalPages}</span><button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1px solid ${SS.border}`,background:"transparent",color:page===totalPages?SS.textDim:SS.textSec,cursor:page===totalPages?"not-allowed":"pointer",fontSize:12,fontWeight:600 }}>Suivant <ChevronRight size={14}/></button></div>)}
          </>)}
        </div>
      )}

      {view==="detail"&&selected&&(<DetailConge conge={selected} onClose={()=>{setView("list");setSelected(null);}} onEdit={openForm} onDeleted={handleDeleted} onToast={showToast} onRefresh={()=>load(page,search,filterStat)} SS={SS}/>)}

      {view==="form"&&(
        <div style={{ animation:"pageIn 0.2s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:28 }}>
            <button onClick={()=>setView(selected?"detail":"list")} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;}}><ArrowLeft size={15}/> Retour</button>
            <div><div style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3 }}>{formMode==="create"?"Nouvelle demande":"Modifier"}</div><h2 style={{ fontSize:20,fontWeight:800,color:SS.text,margin:0 }}>{formMode==="create"?"Demande de congé":"Modifier la demande"}</h2></div>
          </div>
          <div style={{ maxWidth:640,background:SS.card,border:`1px solid ${SS.border}`,borderRadius:16,padding:32,boxShadow:isLight?"0 4px 24px rgba(0,0,0,0.06)":"0 4px 24px rgba(0,0,0,0.3)" }}>
            <FormConge conge={formMode==="edit"?selected:null} personnel={personnel} onSave={handleSaved} onCancel={()=>setView(selected&&formMode==="edit"?"detail":"list")} SS={SS}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conges;