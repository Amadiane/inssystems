// Assurances.jsx — Assurance maladie COMPLET
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Search, Eye, Pencil, X, Check, AlertCircle, Loader2,
  ChevronRight, ChevronLeft, ArrowLeft, Calendar, Building2,
  User, AlertTriangle, CheckCircle2,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTheme } from "../../context/ThemeContext";

const token   = () => localStorage.getItem("access");
const authHdr = () => ({ Authorization: `Bearer ${token()}` });
const fmt     = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const today   = () => new Date().toISOString().split("T")[0];

const mkSS = (tokens, isLight) => ({
  bg:tokens.bg||(isLight?"#F5F7FA":"#080C10"), surface:tokens.surface||(isLight?"#F5F7FA":"#111820"),
  card:tokens.card||(isLight?"#FFFFFF":"#161E28"), hover:isLight?"#F0F4F8":"#1A2535",
  text:tokens.text||(isLight?"#0F2137":"#F0F4F8"), textSec:tokens.textSec||(isLight?"#4A6780":"#7A8FA6"),
  textDim:tokens.textDim||(isLight?"#8FA8C0":"#3D5166"), border:tokens.border||(isLight?"#E2E8F0":"rgba(255,255,255,0.07)"),
  accent:"#009A44", accentBg:isLight?"#E8FFF3":"rgba(0,154,68,0.1)",
  accentBorder:isLight?"rgba(0,154,68,0.35)":"rgba(0,154,68,0.3)", accentGlow:"rgba(0,154,68,0.12)", isLight,
});

const Toast = ({ msg, type, onClose }) => { useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[]);const ok=type==="success";return(<div style={{position:"fixed",bottom:28,right:28,zIndex:8000,display:"flex",alignItems:"center",gap:10,padding:"13px 20px",borderRadius:12,border:`1px solid ${ok?"rgba(0,154,68,0.35)":"rgba(206,17,38,0.35)"}`,background:ok?"rgba(0,154,68,0.1)":"rgba(206,17,38,0.1)",color:ok?"#009A44":"#CE1126",fontSize:13.5,fontWeight:700,animation:"toastIn 0.3s ease",backdropFilter:"blur(12px)"}}>{ok?<Check size={15}/>:<AlertCircle size={15}/>} {msg}</div>); };
const FLabel = ({ children, SS }) => (<div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}><span style={{ fontSize:10,fontWeight:800,color:SS.textDim,textTransform:"uppercase",letterSpacing:"0.12em" }}>{children}</span></div>);
const FInput = ({ SS, style, ...p }) => (<input {...p} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",...style }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.background=SS.card;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.background=SS.surface;e.target.style.boxShadow="none";}}/>);
const FArea  = ({ SS, style, ...p }) => (<textarea {...p} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,resize:"vertical",minHeight:80,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",...style }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.background=SS.card;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.background=SS.surface;e.target.style.boxShadow="none";}}/>);
const Btn = ({ SS, children, variant="primary", small=false, disabled=false, style={}, ...p }) => {
  const V={primary:{bg:SS.accent,border:SS.accent,color:SS.isLight?"#fff":"#080C10"},outline:{bg:SS.accentBg,border:SS.accentBorder,color:SS.accent},ghost:{bg:"transparent",border:SS.border,color:SS.textSec},danger:{bg:"rgba(206,17,38,0.08)",border:"rgba(206,17,38,0.3)",color:"#CE1126"},blue:{bg:"rgba(37,99,235,0.08)",border:"rgba(37,99,235,0.3)",color:"#2563EB"}};
  const s=V[variant]||V.primary;
  return (<button {...p} disabled={disabled} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:small?"7px 14px":"10px 20px",borderRadius:9,border:`1px solid ${s.border}`,background:s.bg,color:s.color,fontSize:small?12:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,transition:"all 0.15s",fontFamily:"inherit",...style }} onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity="0.8";e.currentTarget.style.transform="translateY(-1px)";}}} onMouseLeave={e=>{e.currentTarget.style.opacity=disabled?"0.45":"1";e.currentTarget.style.transform="none";}}>{children}</button>);
};

// ── Statut assurance ─────────────────────────────────────────
const statutAssurance = (a) => {
  if (!a.actif) return { label:"Inactif", color:"#7A8FA6", bg:"rgba(122,143,166,0.1)" };
  if (!a.date_expiration) return { label:"En cours", color:"#009A44", bg:"rgba(0,154,68,0.1)" };
  const exp = new Date(a.date_expiration);
  const now = new Date();
  const diff = (exp-now)/86400000;
  if (diff < 0) return { label:"Expirée", color:"#CE1126", bg:"rgba(206,17,38,0.1)" };
  if (diff < 30) return { label:"Expire bientôt", color:"#F59E0B", bg:"rgba(245,158,11,0.1)" };
  return { label:"Valide", color:"#009A44", bg:"rgba(0,154,68,0.1)" };
};

// ════════════════════════════════════════════════════════
//  FORMULAIRE ÉDITION ASSURANCE
// ════════════════════════════════════════════════════════
const FormAssurance = ({ assurance, onSave, onCancel, SS }) => {
  const [form, setForm] = useState({
    numero_carte:    assurance.numero_carte    || "",
    date_adhesion:   assurance.date_adhesion   || "",
    date_expiration: assurance.date_expiration || "",
    actif:           assurance.actif !== false,
    notes:           assurance.notes           || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const res = await fetch(CONFIG.API_RH_ASSURANCE_AGENT(assurance.personnel), {
        method:"PATCH", headers:{...authHdr(),"Content-Type":"application/json"}, body:JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      onSave(data);
    } catch(err) { console.error(err); setError("Erreur lors de la mise à jour."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {error&&<div style={{ background:"rgba(206,17,38,0.08)",border:"1px solid rgba(206,17,38,0.25)",borderRadius:10,padding:"12px 16px",color:"#CE1126",fontSize:13,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={14}/> {error}</div>}
      <div style={{ padding:"12px 16px",background:SS.surface,borderRadius:10,border:`1px solid ${SS.border}` }}>
        <div style={{ fontSize:12,fontWeight:700,color:SS.text }}>{assurance.personnel_nom}</div>
        <div style={{ fontSize:11,color:SS.textSec }}>{assurance.personnel_direction} · {assurance.personnel_type}</div>
      </div>
      <div><FLabel SS={SS}>Numéro de carte assurance</FLabel><FInput SS={SS} type="text" placeholder="Ex: ASS-2025-001" value={form.numero_carte} onChange={e=>set("numero_carte",e.target.value)}/></div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div><FLabel SS={SS}>Date d'adhésion</FLabel><FInput SS={SS} type="date" value={form.date_adhesion} onChange={e=>set("date_adhesion",e.target.value)}/></div>
        <div><FLabel SS={SS}>Date d'expiration</FLabel><FInput SS={SS} type="date" value={form.date_expiration} onChange={e=>set("date_expiration",e.target.value)}/></div>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <input type="checkbox" id="actif_check" checked={form.actif} onChange={e=>set("actif",e.target.checked)} style={{ width:16,height:16,cursor:"pointer",accentColor:SS.accent }}/>
        <label htmlFor="actif_check" style={{ fontSize:13,fontWeight:600,color:SS.text,cursor:"pointer" }}>Assurance active</label>
      </div>
      <div><FLabel SS={SS}>Notes / Observations</FLabel><FArea SS={SS} placeholder="Informations complémentaires…" value={form.notes} onChange={e=>set("notes",e.target.value)}/></div>
      <div style={{ display:"flex",gap:10,justifyContent:"flex-end",paddingTop:8,borderTop:`1px solid ${SS.border}` }}>
        <Btn SS={SS} variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn SS={SS} disabled={saving}>{saving?<><Loader2 size={13} style={{ animation:"spin 0.7s linear infinite" }}/> Enregistrement…</>:<><Check size={13}/> Mettre à jour</>}</Btn>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════
//  DÉTAIL ASSURANCE
// ════════════════════════════════════════════════════════
const DetailAssurance = ({ assurance, onClose, onEdit, onToast, SS }) => {
  const st = statutAssurance(assurance);
  const Info = ({l,v,c}) => (<div><div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:4 }}>{l}</div><div style={{ fontSize:13.5,fontWeight:700,color:c?SS.accent:SS.text }}>{v||"—"}</div></div>);
  return (
    <div style={{ animation:"pageIn 0.25s ease" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:14 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <button onClick={onClose} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;}}><ArrowLeft size={15}/> Retour</button>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}>
              <span style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em" }}>Assurance Maladie</span>
              <span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:6,background:st.bg,color:st.color }}>{st.label}</span>
            </div>
            <div style={{ fontSize:20,fontWeight:900,color:SS.text }}>{assurance.personnel_nom}</div>
            <div style={{ fontSize:12,color:SS.textSec }}>{assurance.personnel_direction} · {assurance.personnel_fonction}</div>
          </div>
        </div>
        <Btn SS={SS} small variant="blue" onClick={()=>onEdit(assurance)}><Pencil size={13}/> Modifier</Btn>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
        <div style={{ background:SS.card,border:`1px solid ${SS.accentBorder}`,borderRadius:14,padding:"20px 22px",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:0,left:0,width:"100%",height:"3px",background:"linear-gradient(90deg,#CE1126,#FCD116,#009A44)" }}/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:6 }}>
            <Info l="N° carte" v={assurance.numero_carte}/>
            <Info l="Type d'employé" v={assurance.personnel_type}/>
            <Info l="Date d'adhésion" v={fmt(assurance.date_adhesion)}/>
            <Info l="Date d'expiration" v={fmt(assurance.date_expiration)}/>
          </div>
        </div>
        <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:14,padding:"20px 22px" }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:8 }}>Statut couverture</div>
            <div style={{ padding:"12px 16px",background:st.bg,borderRadius:9,display:"flex",alignItems:"center",gap:10 }}>
              {assurance.actif&&st.color==="rgba(206,17,38,0.1)"?<AlertTriangle size={18} color={st.color}/>:<CheckCircle2 size={18} color={st.color}/>}
              <span style={{ fontSize:15,fontWeight:800,color:st.color }}>{st.label}</span>
            </div>
          </div>
          {assurance.notes&&(
            <div>
              <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:6 }}>Notes</div>
              <div style={{ fontSize:13,color:SS.textSec,lineHeight:1.6 }}>{assurance.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
const Assurances = () => {
  const navigate = useNavigate();
  const { tokens, isLight } = useTheme();
  const SS = mkSS(tokens, isLight);

  const [view,       setView]       = useState("list");
  const [assurances, setAssurances] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [toast,      setToast]      = useState(null);
  const PAGE_SIZE = 20;

  const showToast = (msg, type="success") => setToast({msg,type});

  const load = useCallback(async (p=1, q="") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, page_size:PAGE_SIZE });
      if (q.trim()) params.append("search", q.trim());
      const res  = await fetch(`${CONFIG.API_RH_ASSURANCES}?${params}`, { headers:authHdr() });
      const data = await res.json();
      setAssurances(Array.isArray(data)?data:(data.results||[]));
      setTotal(data.count||0);
    } catch { showToast("Erreur de chargement.","error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(page,search); },[page]);
  useEffect(()=>{ const t=setTimeout(()=>{setPage(1);load(1,search);},400); return()=>clearTimeout(t); },[search]);

  const openDetail = async (a) => {
    try { const res=await fetch(CONFIG.API_RH_ASSURANCE_AGENT(a.personnel),{headers:authHdr()}); const data=await res.json(); setSelected(data); setEditMode(false); setView("detail"); }
    catch { showToast("Erreur.","error"); }
  };

  const handleSaved = (data) => {
    setAssurances(prev=>prev.map(a=>a.personnel===data.personnel?data:a));
    showToast("Assurance mise à jour.");
    setSelected(data); setEditMode(false); setView("detail");
  };

  const totalPages = Math.ceil(total/PAGE_SIZE);
  const crumbs = [
    {l:"RH",a:()=>navigate("/rh/agents")},{l:"Assurances",a:()=>{setView("list");setSelected(null);}},
    ...(view==="detail"&&selected?[{l:selected.personnel_nom,a:null}]:[]),
  ];

  return (
    <div style={{ fontFamily:"inherit",color:SS.text }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes rowIn{from{opacity:0}to{opacity:1}}input[type="date"]::-webkit-calendar-picker-indicator{filter:${isLight?"none":"invert(1)"}}`}</style>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:20,fontSize:12,color:SS.textDim,flexWrap:"wrap" }}>
        {crumbs.map((bc,i)=>(<span key={i} style={{ display:"flex",alignItems:"center",gap:6 }}>{i>0&&<ChevronRight size={11} color={SS.textDim}/>}<span onClick={bc.a||undefined} style={{ cursor:bc.a?"pointer":"default",color:i===crumbs.length-1?SS.accent:SS.textSec,fontWeight:i===crumbs.length-1?700:500 }} onMouseEnter={e=>{if(bc.a)e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{if(bc.a)e.currentTarget.style.color=i===crumbs.length-1?SS.accent:SS.textSec;}}>{bc.l}</span></span>))}
      </div>

      {view==="list"&&(
        <div style={{ animation:"pageIn 0.2s ease" }}>
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:24 }}>
            <div><h1 style={{ fontSize:28,fontWeight:900,color:SS.text,margin:"0 0 6px",letterSpacing:"-0.02em" }}>Assurance Maladie</h1><div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:6,height:6,borderRadius:"50%",background:SS.accent,boxShadow:`0 0 8px ${SS.accent}` }}/><span style={{ fontSize:13,color:SS.textSec }}><span style={{ color:SS.accent,fontWeight:700 }}>{total}</span> agent{total>1?"s":""} affilié{total>1?"s":""}</span></div></div>
          </div>
          <div style={{ display:"flex",gap:10,marginBottom:20 }}>
            <div style={{ flex:1,maxWidth:480,position:"relative" }}>
              <Search size={14} color={SS.textDim} style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
              <input type="text" placeholder="Recherche par agent ou numéro de carte…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:"100%",padding:"11px 13px 11px 38px",background:SS.card,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=SS.accentBorder;e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`;}} onBlur={e=>{e.target.style.borderColor=SS.border;e.target.style.boxShadow="none";}}/>
            </div>
            {search&&<button onClick={()=>setSearch("")} style={{ padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600 }}><X size={13}/> Effacer</button>}
          </div>

          {loading&&!search?(<div style={{ textAlign:"center",padding:"80px 0" }}><Loader2 size={32} color={SS.accent} style={{ animation:"spin 0.8s linear infinite",marginBottom:16 }}/><div style={{ fontSize:13,color:SS.textDim }}>Chargement…</div></div>)
          :assurances.length===0?(<div style={{ textAlign:"center",padding:"80px 0",background:SS.card,borderRadius:16,border:`1px solid ${SS.border}` }}><Shield size={40} color={SS.textDim} style={{ marginBottom:16 }}/><div style={{ fontSize:15,fontWeight:700,color:SS.textSec,marginBottom:8 }}>{search?"Aucun résultat":"Aucune assurance enregistrée"}</div></div>)
          :(<>
            <div style={{ border:`1px solid ${SS.border}`,borderRadius:14,overflow:"hidden",opacity:loading?0.5:1 }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead><tr style={{ background:SS.surface,borderBottom:`1px solid ${SS.border}` }}>{["Agent","Direction","Type","N° Carte","Adhésion","Expiration","Statut","Actions"].map(h=>(<th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:9.5,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap" }}>{h}</th>))}</tr></thead>
                <tbody>
                  {assurances.map((a,i)=>{
                    const st=statutAssurance(a);
                    return (
                      <tr key={a.id} onClick={()=>openDetail(a)} style={{ background:i%2===0?SS.card:SS.surface,borderBottom:`1px solid ${SS.border}`,cursor:"pointer",transition:"background 0.12s",animation:`rowIn 0.3s ease ${i*0.03}s both` }} onMouseEnter={e=>e.currentTarget.style.background=SS.hover} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?SS.card:SS.surface}>
                        <td style={{ padding:"12px 14px" }}><div style={{ fontWeight:700,color:SS.text,fontSize:13 }}>{a.personnel_nom}</div></td>
                        <td style={{ padding:"12px 14px",color:SS.textSec,fontSize:12,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.personnel_direction||"—"}</td>
                        <td style={{ padding:"12px 14px" }}>
                          <span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:6,background:a.personnel_type==="fonctionnaire"?"rgba(37,99,235,0.1)":"rgba(201,160,0,0.1)",color:a.personnel_type==="fonctionnaire"?"#2563EB":"#C9A000" }}>
                            {a.personnel_type==="fonctionnaire"?"Fonct.":"Contract."}
                          </span>
                        </td>
                        <td style={{ padding:"12px 14px",fontFamily:"monospace",fontSize:11,color:SS.text }}>{a.numero_carte||"—"}</td>
                        <td style={{ padding:"12px 14px",color:SS.textSec,fontSize:12,whiteSpace:"nowrap" }}>{fmt(a.date_adhesion)}</td>
                        <td style={{ padding:"12px 14px",color:SS.textSec,fontSize:12,whiteSpace:"nowrap" }}>{fmt(a.date_expiration)}</td>
                        <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:6,background:st.bg,color:st.color }}>{st.label}</span></td>
                        <td style={{ padding:"12px 10px" }} onClick={e=>e.stopPropagation()}>
                          <button onClick={()=>openDetail(a)} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:SS.textSec,transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;e.currentTarget.style.background=SS.accentBg;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;e.currentTarget.style.background="transparent";}}><Eye size={12}/></button>
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

      {view==="detail"&&selected&&!editMode&&(<DetailAssurance assurance={selected} onClose={()=>{setView("list");setSelected(null);}} onEdit={()=>setEditMode(true)} onToast={showToast} SS={SS}/>)}

      {view==="detail"&&selected&&editMode&&(
        <div style={{ animation:"pageIn 0.2s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:28 }}>
            <button onClick={()=>setEditMode(false)} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accentBorder;e.currentTarget.style.color=SS.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=SS.border;e.currentTarget.style.color=SS.textSec;}}><ArrowLeft size={15}/> Retour</button>
            <div><div style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3 }}>Modifier</div><h2 style={{ fontSize:20,fontWeight:800,color:SS.text,margin:0 }}>Assurance — {selected.personnel_nom}</h2></div>
          </div>
          <div style={{ maxWidth:600,background:SS.card,border:`1px solid ${SS.border}`,borderRadius:16,padding:32,boxShadow:isLight?"0 4px 24px rgba(0,0,0,0.06)":"0 4px 24px rgba(0,0,0,0.3)" }}>
            <FormAssurance assurance={selected} onSave={handleSaved} onCancel={()=>setEditMode(false)} SS={SS}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assurances;