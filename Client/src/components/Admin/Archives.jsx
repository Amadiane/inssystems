// Archives.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive, Plus, Search, Eye, Pencil, Trash2,
  Printer, Download, X, Upload, ChevronRight, ChevronLeft,
  FileText, Check, AlertCircle, Loader2,
  Calendar, Building2, AlignLeft, Paperclip, User,
  ZoomIn, ExternalLink, ArrowLeft, Inbox,
  Mail, Send, FolderOpen, BarChart3, Filter,
  BookMarked, Clock, CheckCircle2,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTheme } from "../../context/ThemeContext";

// ── Helpers ───────────────────────────────────────────────
const token   = () => localStorage.getItem("access");
const authHdr = () => ({ Authorization: `Bearer ${token()}` });
const fmt     = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const today   = () => new Date().toISOString().split("T")[0];

const TYPE_OPTIONS = [
  { value:"",        label:"Tous les types"    },
  { value:"arrive",  label:"Courriers Arrivés"  },
  { value:"sortant", label:"Courriers Sortants" },
  { value:"interne", label:"Documents Internes" },
];

const STATUT_OPTIONS = [
  { value:"",        label:"Tous les statuts" },
  { value:"actif",   label:"Actif"            },
  { value:"archive", label:"Archivé"          },
  { value:"detruit", label:"Détruit"          },
];

const TYPE_META = {
  arrive:  { color:"#009A44", bg:"rgba(0,154,68,0.1)",  border:"rgba(0,154,68,0.3)",  label:"Arrivé",  Icon:Mail   },
  sortant: { color:"#2563EB", bg:"rgba(37,99,235,0.1)", border:"rgba(37,99,235,0.3)", label:"Sortant", Icon:Send   },
  interne: { color:"#C9A000", bg:"rgba(201,160,0,0.1)", border:"rgba(201,160,0,0.3)", label:"Interne", Icon:FileText },
};

const STATUT_META = {
  actif:   { color:"#009A44", bg:"rgba(0,154,68,0.1)",  label:"Actif"    },
  archive: { color:"#7A8FA6", bg:"rgba(122,143,166,0.1)", label:"Archivé" },
  detruit: { color:"#CE1126", bg:"rgba(206,17,38,0.1)", label:"Détruit"  },
};

const isPdfUrl = (url) => url && (/\.pdf(\?|$)/i.test(url) || url.includes("/raw/upload/"));

// ════════════════════════════════════════════════════════
//  VISIONNEUSES (réutilisées)
// ════════════════════════════════════════════════════════
const ImageViewer = ({ url, nom, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [err,  setErr]  = useState(false);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const download = async () => {
    try { const res=await fetch(url); const blob=await res.blob(); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=nom||"scan"; a.click(); URL.revokeObjectURL(a.href); } catch { window.open(url,"_blank"); }
  };
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.94)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:"fixed",top:20,right:20,display:"flex",gap:8 }}>
        {[{l:"Zoom +",f:()=>setZoom(z=>Math.min(z+0.25,4))},{l:"Zoom −",f:()=>setZoom(z=>Math.max(z-0.25,0.25))},{l:"Télécharger",f:download,g:true},{l:"Ouvrir",f:()=>window.open(url,"_blank")},{l:"×",f:onClose,r:true}].map((b,i)=>(
          <button key={i} onClick={b.f} style={{ padding:"8px 14px",borderRadius:8,border:`1px solid ${b.g?"rgba(0,154,68,0.4)":b.r?"rgba(206,17,38,0.4)":"rgba(255,255,255,0.15)"}`,background:b.g?"rgba(0,154,68,0.15)":b.r?"rgba(206,17,38,0.15)":"rgba(255,255,255,0.05)",color:b.g?"#00C457":b.r?"#FF4466":"rgba(255,255,255,0.7)",fontSize:12,fontWeight:600,cursor:"pointer" }}>{b.l}</button>
        ))}
      </div>
      <div onClick={e=>e.stopPropagation()} style={{ overflow:"auto",maxWidth:"90vw",maxHeight:"82vh",marginTop:70 }}>
        {err ? <div style={{ color:"rgba(255,255,255,0.5)",textAlign:"center",padding:48 }}><AlertCircle size={40} style={{ marginBottom:16 }}/><div>Impossible d'afficher le fichier</div></div>
             : <img src={url} alt="scan" onError={()=>setErr(true)} style={{ transform:`scale(${zoom})`,transformOrigin:"top left",borderRadius:12,display:"block",maxWidth:"88vw" }}/>}
      </div>
    </div>
  );
};

const PDFViewer = ({ url, nom, onClose }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.94)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(10px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:940,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <span style={{ color:"rgba(255,255,255,0.8)",fontWeight:700,fontSize:14 }}>{nom||"Document"}</span>
        <div style={{ display:"flex",gap:8 }}>
          {[{l:"Télécharger",f:()=>{const a=document.createElement("a");a.href=url;a.download=nom||"doc.pdf";document.body.appendChild(a);a.click();document.body.removeChild(a);},g:true},{l:"Onglet",f:()=>window.open(url,"_blank")},{l:"Fermer",f:onClose,r:true}].map((b,i)=>(
            <button key={i} onClick={b.f} style={{ padding:"8px 16px",borderRadius:8,border:`1px solid ${b.g?"rgba(0,154,68,0.4)":b.r?"rgba(206,17,38,0.4)":"rgba(255,255,255,0.15)"}`,background:b.g?"rgba(0,154,68,0.15)":b.r?"rgba(206,17,38,0.15)":"rgba(255,255,255,0.05)",color:b.g?"#00C457":b.r?"#FF4466":"rgba(255,255,255,0.7)",fontSize:12,fontWeight:600,cursor:"pointer" }}>{b.l}</button>
          ))}
        </div>
      </div>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:940,borderRadius:12,overflow:"hidden" }}>
        <iframe src={`${url}#toolbar=1`} style={{ width:"100%",height:"78vh",border:"none",display:"block" }} title="Document"/>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  SCAN BLOCK
// ════════════════════════════════════════════════════════
const ScanBlock = ({ scanUrl, SS }) => {
  const [viewer,  setViewer]  = useState(null);
  const [imgFail, setImgFail] = useState(false);

  if (!scanUrl) return (
    <div style={{ background:SS.card,border:`1px dashed ${SS.border}`,borderRadius:12,padding:24,textAlign:"center" }}>
      <Paperclip size={22} color={SS.textDim} style={{ display:"block",margin:"0 auto 8px" }}/>
      <div style={{ color:SS.textDim,fontSize:13 }}>Aucun document numérisé</div>
    </div>
  );

  const nom = (() => { try { return decodeURIComponent(scanUrl.split("/").pop().split("?")[0])||"fichier"; } catch { return "fichier"; } })();
  const looksLikeP = isPdfUrl(scanUrl);
  const downloadFile = async () => {
    try { const res=await fetch(scanUrl,{mode:"cors"}); const blob=await res.blob(); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=nom; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href); } catch { window.open(scanUrl,"_blank"); }
  };

  const btns = (vt) => (
    <div style={{ display:"flex",gap:8,marginTop:12,flexWrap:"wrap" }}>
      {[{l:"Visualiser",i:<Eye size={13}/>,f:()=>setViewer(vt),p:true},{l:"Télécharger",i:<Download size={13}/>,f:downloadFile},{l:"Ouvrir",i:<ExternalLink size={13}/>,f:()=>window.open(scanUrl,"_blank")}].map((b,i)=>(
        <button key={i} onClick={b.f} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,border:`1px solid ${b.p?SS.accentBorder:SS.border}`,background:b.p?SS.accentBg:"transparent",color:b.p?SS.accent:SS.textSec,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accent; e.currentTarget.style.color=SS.accent; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=b.p?SS.accentBorder:SS.border; e.currentTarget.style.color=b.p?SS.accent:SS.textSec; }}
        >{b.i}{b.l}</button>
      ))}
    </div>
  );

  if (looksLikeP) return (
    <>
      {viewer==="pdf" && <PDFViewer url={scanUrl} nom={nom} onClose={()=>setViewer(null)}/>}
      <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:12,padding:"18px 20px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:48,height:48,borderRadius:10,background:"rgba(206,17,38,0.08)",border:"1px solid rgba(206,17,38,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><FileText size={22} color="#CE1126"/></div>
          <div><div style={{ fontSize:13,fontWeight:700,color:SS.text,marginBottom:2 }}>{nom}</div><div style={{ fontSize:11,color:SS.textDim }}>Document PDF</div></div>
        </div>
        {btns("pdf")}
      </div>
    </>
  );

  return (
    <>
      {viewer==="image" && <ImageViewer url={scanUrl} nom={nom} onClose={()=>setViewer(null)}/>}
      {viewer==="pdf"   && <PDFViewer   url={scanUrl} nom={nom} onClose={()=>setViewer(null)}/>}
      <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:12,overflow:"hidden" }}>
        {!imgFail ? (
          <>
            <div onClick={()=>setViewer("image")} style={{ cursor:"zoom-in",background:SS.surface,display:"flex",alignItems:"center",justifyContent:"center",minHeight:160,position:"relative",overflow:"hidden" }}>
              <img src={scanUrl} alt="doc" onError={()=>setImgFail(true)} style={{ maxWidth:"100%",maxHeight:240,objectFit:"contain",display:"block" }}/>
              <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0)",transition:"background 0.2s",display:"flex",alignItems:"center",justifyContent:"center" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(0,154,68,0.1)"; e.currentTarget.querySelector(".hint").style.opacity="1"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(0,0,0,0)"; e.currentTarget.querySelector(".hint").style.opacity="0"; }}
              ><div className="hint" style={{ background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,opacity:0,transition:"opacity 0.2s",pointerEvents:"none" }}><ZoomIn size={13}/> Agrandir</div></div>
            </div>
            <div style={{ padding:"10px 16px",borderTop:`1px solid ${SS.border}`,display:"flex",gap:8 }}>
              {[{l:"Visualiser",i:<Eye size={13}/>,f:()=>setViewer("image"),p:true},{l:"Télécharger",i:<Download size={13}/>,f:downloadFile},{l:"Ouvrir",i:<ExternalLink size={13}/>,f:()=>window.open(scanUrl,"_blank")}].map((b,i)=>(
                <button key={i} onClick={b.f} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${b.p?SS.accentBorder:SS.border}`,background:b.p?SS.accentBg:"transparent",color:b.p?SS.accent:SS.textSec,fontSize:12,fontWeight:600,cursor:"pointer" }}>{b.i}{b.l}</button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
              <div style={{ width:48,height:48,borderRadius:10,background:SS.accentBg,border:`1px solid ${SS.accentBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Paperclip size={22} color={SS.accent}/></div>
              <div><div style={{ fontSize:13,fontWeight:700,color:SS.text }}>{nom}</div><div style={{ fontSize:11,color:SS.textDim,wordBreak:"break-all" }}>{scanUrl.slice(0,55)}…</div></div>
            </div>
            {btns("pdf")}
          </div>
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════
//  UI COMPONENTS
// ════════════════════════════════════════════════════════
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const isOk = type === "success";
  return (
    <div style={{ position:"fixed",bottom:28,right:28,zIndex:8000,display:"flex",alignItems:"center",gap:10,padding:"13px 20px",borderRadius:12,border:`1px solid ${isOk?"rgba(0,154,68,0.35)":"rgba(206,17,38,0.35)"}`,background:isOk?"rgba(0,154,68,0.1)":"rgba(206,17,38,0.1)",color:isOk?"#009A44":"#CE1126",fontSize:13.5,fontWeight:700,animation:"toastIn 0.3s ease",backdropFilter:"blur(12px)" }}>
      {isOk?<Check size={15}/>:<AlertCircle size={15}/>} {msg}
    </div>
  );
};

const FieldLabel = ({ children, icon: Icon, SS }) => (
  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
    {Icon && <Icon size={11} color={SS.accent}/>}
    <span style={{ fontSize:10,fontWeight:800,color:SS.textDim,textTransform:"uppercase",letterSpacing:"0.12em" }}>{children}</span>
  </div>
);

const Input = ({ SS, style, ...props }) => (
  <input {...props} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",...style }}
    onFocus={e=>{ e.target.style.borderColor=SS.accentBorder; e.target.style.background=SS.card; e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`; }}
    onBlur={e=>{ e.target.style.borderColor=SS.border; e.target.style.background=SS.surface; e.target.style.boxShadow="none"; }}
  />
);

const Textarea = ({ SS, style, ...props }) => (
  <textarea {...props} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,resize:"vertical",minHeight:80,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",...style }}
    onFocus={e=>{ e.target.style.borderColor=SS.accentBorder; e.target.style.background=SS.card; e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`; }}
    onBlur={e=>{ e.target.style.borderColor=SS.border; e.target.style.background=SS.surface; e.target.style.boxShadow="none"; }}
  />
);

const Select = ({ SS, style, children, ...props }) => (
  <select {...props} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",cursor:"pointer",...style }}
    onFocus={e=>{ e.target.style.borderColor=SS.accentBorder; e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`; }}
    onBlur={e=>{ e.target.style.borderColor=SS.border; e.target.style.boxShadow="none"; }}
  >{children}</select>
);

const Btn = ({ SS, children, variant="primary", small=false, disabled=false, style={}, ...props }) => {
  const v = {
    primary: { bg:SS.accent,              border:SS.accent,              color:SS.isLight?"#fff":"#080C10" },
    outline: { bg:SS.accentBg,            border:SS.accentBorder,        color:SS.accent                  },
    ghost:   { bg:"transparent",          border:SS.border,              color:SS.textSec                 },
    danger:  { bg:"rgba(206,17,38,0.08)", border:"rgba(206,17,38,0.3)",  color:"#CE1126"                  },
    blue:    { bg:"rgba(37,99,235,0.08)", border:"rgba(37,99,235,0.3)",  color:"#2563EB"                  },
  };
  const s = v[variant]||v.primary;
  return (
    <button {...props} disabled={disabled} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:small?"7px 14px":"10px 20px",borderRadius:9,border:`1px solid ${s.border}`,background:s.bg,color:s.color,fontSize:small?12:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,transition:"all 0.15s",fontFamily:"inherit",...style }}
      onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.opacity="0.8"; e.currentTarget.style.transform="translateY(-1px)"; }}}
      onMouseLeave={e=>{ e.currentTarget.style.opacity=disabled?"0.45":"1"; e.currentTarget.style.transform="none"; }}
    >{children}</button>
  );
};

// ════════════════════════════════════════════════════════
//  FORMULAIRE ARCHIVE
// ════════════════════════════════════════════════════════
const FormArchive = ({ archive, onSave, onCancel, SS }) => {
  const [form, setForm] = useState(archive ? {
    type_courrier:      archive.type_courrier      || "arrive",
    objet:              archive.objet              || "",
    origine:            archive.origine            || "",
    destinataire:       archive.destinataire       || "",
    date_document:      archive.date_document      || today(),
    date_archivage:     archive.date_archivage     || today(),
    reference_courrier: archive.reference_courrier || "",
    statut:             archive.statut             || "archive",
    observations:       archive.observations       || "",
    scan:               null,
  } : {
    type_courrier:"arrive", objet:"", origine:"", destinataire:"",
    date_document:today(), date_archivage:today(),
    reference_courrier:"", statut:"archive", observations:"", scan:null,
  });
  const [preview, setPreview] = useState(archive?.scan_url || archive?.scan || null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const fileRef = useRef();
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    set("scan", f);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview("pdf:"+f.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.objet||!form.origine) { setError("Objet et Origine sont obligatoires."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (k!=="scan"&&v!==null&&v!==undefined) fd.append(k,v); });
      if (form.scan) fd.append("scan", form.scan);
      const url    = archive ? CONFIG.API_ARCHIVE_DETAIL(archive.id) : CONFIG.API_ARCHIVES;
      const method = archive ? "PATCH" : "POST";
      const res    = await fetch(url, { method, headers:authHdr(), body:fd });
      const data   = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      onSave(data);
    } catch(err) { console.error(err); setError("Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  const showDest = form.type_courrier === "sortant";

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:18 }}>
      {error && <div style={{ background:"rgba(206,17,38,0.08)",border:"1px solid rgba(206,17,38,0.25)",borderRadius:10,padding:"12px 16px",color:"#CE1126",fontSize:13,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={14}/> {error}</div>}

      {/* Type + Statut */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <div>
          <FieldLabel SS={SS}>Type de courrier</FieldLabel>
          <Select SS={SS} value={form.type_courrier} onChange={e=>set("type_courrier",e.target.value)}>
            <option value="arrive">Courrier Arrivé</option>
            <option value="sortant">Courrier Sortant</option>
            <option value="interne">Document Interne</option>
          </Select>
        </div>
        <div>
          <FieldLabel SS={SS}>Statut</FieldLabel>
          <Select SS={SS} value={form.statut} onChange={e=>set("statut",e.target.value)}>
            <option value="actif">Actif</option>
            <option value="archive">Archivé</option>
            <option value="detruit">Détruit</option>
          </Select>
        </div>
      </div>

      {/* Dates */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <div><FieldLabel icon={Calendar} SS={SS}>Date du document</FieldLabel><Input SS={SS} type="date" value={form.date_document} onChange={e=>set("date_document",e.target.value)}/></div>
        <div><FieldLabel icon={Calendar} SS={SS}>Date d'archivage</FieldLabel><Input SS={SS} type="date" value={form.date_archivage} onChange={e=>set("date_archivage",e.target.value)}/></div>
      </div>

      {/* Origine + Référence */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <div><FieldLabel icon={Building2} SS={SS}>Origine / Émetteur</FieldLabel><Input SS={SS} type="text" placeholder="Ex: BCRG, Direction..." value={form.origine} onChange={e=>set("origine",e.target.value)} required/></div>
        <div><FieldLabel SS={SS}>Référence courrier</FieldLabel><Input SS={SS} type="text" placeholder="Ex: MPCID/INS/0001" value={form.reference_courrier} onChange={e=>set("reference_courrier",e.target.value)}/></div>
      </div>

      {/* Destinataire (si sortant) */}
      {showDest && (
        <div><FieldLabel icon={User} SS={SS}>Destinataire</FieldLabel><Input SS={SS} type="text" placeholder="Nom du destinataire" value={form.destinataire} onChange={e=>set("destinataire",e.target.value)}/></div>
      )}

      {/* Objet */}
      <div><FieldLabel icon={AlignLeft} SS={SS}>Objet / Description</FieldLabel><Textarea SS={SS} placeholder="Objet ou description du document..." value={form.objet} onChange={e=>set("objet",e.target.value)} required/></div>

      {/* Observations */}
      <div><FieldLabel SS={SS}>Observations</FieldLabel><Textarea SS={SS} placeholder="Notes, annotations..." value={form.observations} onChange={e=>set("observations",e.target.value)} style={{ minHeight:60 }}/></div>

      {/* Scan */}
      <div>
        <FieldLabel icon={Paperclip} SS={SS}>Document numérisé</FieldLabel>
        <div onClick={()=>fileRef.current.click()}
          style={{ border:`1.5px dashed ${preview?SS.accentBorder:SS.border}`,borderRadius:12,padding:20,textAlign:"center",cursor:"pointer",background:preview?SS.accentBg:SS.surface,transition:"all 0.2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.background=SS.accentBg; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=preview?SS.accentBorder:SS.border; e.currentTarget.style.background=preview?SS.accentBg:SS.surface; }}
        >
          {preview && typeof preview==="string" && preview.startsWith("blob:") && (
            <div style={{ position:"relative",display:"inline-block" }}>
              <img src={preview} alt="doc" style={{ maxHeight:120,borderRadius:8,objectFit:"contain" }}/>
              <button type="button" onClick={e=>{e.stopPropagation();setPreview(null);set("scan",null);}} style={{ position:"absolute",top:-8,right:-8,width:22,height:22,borderRadius:"50%",background:"#CE1126",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><X size={11}/></button>
            </div>
          )}
          {preview && typeof preview==="string" && preview.startsWith("http") && (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:SS.accent }}>
              <Check size={18}/><span style={{ fontSize:13,fontWeight:700 }}>Document conservé</span>
              <button type="button" onClick={e=>{e.stopPropagation();setPreview(null);set("scan",null);}} style={{ background:"none",border:"none",cursor:"pointer",color:"#CE1126" }}><X size={14}/></button>
            </div>
          )}
          {preview && typeof preview==="string" && preview.startsWith("pdf:") && (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:SS.accent }}>
              <FileText size={22}/><span style={{ fontWeight:700,fontSize:13 }}>{preview.replace("pdf:","")}</span>
              <button type="button" onClick={e=>{e.stopPropagation();setPreview(null);set("scan",null);}} style={{ background:"none",border:"none",cursor:"pointer",color:"#CE1126" }}><X size={14}/></button>
            </div>
          )}
          {!preview && (
            <><Upload size={26} color={SS.textDim} style={{ marginBottom:10 }}/><div style={{ fontSize:13,color:SS.textSec,fontWeight:600,marginBottom:4 }}>Cliquer pour ajouter un document</div><div style={{ fontSize:11,color:SS.textDim }}>JPG · PNG · PDF · max 10 Mo</div></>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display:"none" }}/>
      </div>

      <div style={{ display:"flex",gap:10,justifyContent:"flex-end",paddingTop:8,borderTop:`1px solid ${SS.border}` }}>
        <Btn SS={SS} variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn SS={SS} disabled={saving}>
          {saving?<><Loader2 size={13} style={{ animation:"spin 0.7s linear infinite" }}/> Enregistrement…</>:<><Check size={13}/> {archive?"Mettre à jour":"Enregistrer"}</>}
        </Btn>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════
//  VUE DÉTAIL
// ════════════════════════════════════════════════════════
const DetailArchive = ({ archive, onClose, onEdit, onDeleted, onToast, SS }) => {
  const scanUrl  = archive.scan_url || archive.scan || null;
  const typeMeta = TYPE_META[archive.type_courrier]   || TYPE_META.interne;
  const statMeta = STATUT_META[archive.statut]        || STATUT_META.archive;

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer ${archive.numero_archive} ?`)) return;
    try {
      const res = await fetch(CONFIG.API_ARCHIVE_DETAIL(archive.id), { method:"DELETE",headers:authHdr() });
      if (res.ok||res.status===204) { onToast("Archive supprimée.","success"); onDeleted(archive.id); onClose(); }
    } catch { onToast("Erreur suppression.","error"); }
  };

  const handlePrint = () => {
    const w = window.open("","_blank","width=900,height=700");
    w.document.write(buildPrintHTML(archive));
    w.document.close(); w.focus();
    setTimeout(()=>w.print(), 600);
  };

  return (
    <div style={{ animation:"pageIn 0.25s ease" }}>

      {/* Topbar */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <button onClick={onClose} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.color=SS.accent; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; }}
          ><ArrowLeft size={15}/> Retour aux archives</button>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
              <span style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em" }}>Fiche archive</span>
              <span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20,background:typeMeta.bg,color:typeMeta.color,border:`1px solid ${typeMeta.border}` }}>{typeMeta.label}</span>
              <span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20,background:statMeta.bg,color:statMeta.color }}>{statMeta.label}</span>
            </div>
            <div style={{ fontSize:22,fontWeight:900,color:SS.accent,letterSpacing:"0.04em" }}>{archive.numero_archive}</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <Btn SS={SS} small variant="outline" onClick={handlePrint}><Printer size={13}/> Imprimer</Btn>
          <Btn SS={SS} small variant="blue"    onClick={()=>onEdit(archive)}><Pencil size={13}/> Modifier</Btn>
          <Btn SS={SS} small variant="danger"  onClick={handleDelete}><Trash2 size={13}/> Supprimer</Btn>
        </div>
      </div>

      {/* Grille 2 colonnes */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24 }}>

        {/* Colonne gauche */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

          {/* Infos principales */}
          <div style={{ background:SS.card,border:`1px solid ${SS.accentBorder}`,borderRadius:14,padding:"20px 22px",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,width:"100%",height:"3px",background:`linear-gradient(90deg, #CE1126, #FCD116, #009A44)` }}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:6 }}>
              {[
                { label:"Date du document",  value:fmt(archive.date_document)  },
                { label:"Date d'archivage",  value:fmt(archive.date_archivage) },
                { label:"Origine",           value:archive.origine,             hi:true  },
                { label:"Référence courrier", value:archive.reference_courrier || "—" },
                ...(archive.destinataire ? [{ label:"Destinataire", value:archive.destinataire, hi:true }] : []),
              ].map(({label,value,hi})=>(
                <div key={label}>
                  <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:5 }}>{label}</div>
                  <div style={{ fontSize:13.5,fontWeight:700,color:hi?SS.accent:SS.text }}>{value||"—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Objet */}
          <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:14,padding:"16px 18px" }}>
            <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:8 }}>Objet</div>
            <div style={{ fontSize:14,color:SS.text,lineHeight:1.7 }}>{archive.objet}</div>
          </div>

          {/* Observations */}
          {archive.observations && (
            <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:14,padding:"16px 18px" }}>
              <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:8 }}>Observations</div>
              <div style={{ fontSize:13,color:SS.textSec,lineHeight:1.6 }}>{archive.observations}</div>
            </div>
          )}
        </div>

        {/* Colonne droite : document */}
        <div>
          <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:10,display:"flex",alignItems:"center",gap:8 }}>
            Document numérisé
            {scanUrl && <span style={{ background:SS.accentBg,color:SS.accent,fontSize:9,fontWeight:800,borderRadius:20,padding:"3px 10px",border:`1px solid ${SS.accentBorder}` }}>✓ Disponible</span>}
          </div>
          <ScanBlock scanUrl={scanUrl} SS={SS}/>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  HTML IMPRESSION
// ════════════════════════════════════════════════════════
const buildPrintHTML = (a) => `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Archive ${a.numero_archive}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111;padding:20px 28px}.bandeau{display:flex;height:4px;margin-bottom:10px}.b1{flex:1;background:#CE1126}.b2{flex:1;background:#FCD116}.b3{flex:1;background:#009A44}.entete{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #009A44;padding-bottom:14px;margin-bottom:18px}.titre{font-size:15px;font-weight:900;text-transform:uppercase;color:#0F2137}.sous-titre{font-size:11px;color:#4A6780}.numero{font-size:18px;font-weight:900;color:#009A44}.grille{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}.champ{background:#F5F7FA;border:1px solid #DDE4ED;border-radius:6px;padding:10px 12px}.cl{font-size:9px;font-weight:800;text-transform:uppercase;color:#8FA8C0;margin-bottom:3px}.cv{font-size:13px;font-weight:700}.objet{background:#F5F7FA;border:1px solid #DDE4ED;border-radius:6px;padding:12px;margin-bottom:12px}.footer{margin-top:28px;font-size:10px;color:#8FA8C0;text-align:center;border-top:1px solid #DDE4ED;padding-top:10px}@media print{@page{margin:15mm}}</style>
</head><body>
<div class="bandeau"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div>
<div class="entete">
  <div><div class="titre">MPCID — Institut National de la Statistique</div><div class="sous-titre">République de Guinée · Fiche d'Archive</div></div>
  <div style="text-align:right"><div class="numero">${a.numero_archive}</div><div class="sous-titre">Archivé le ${fmt(a.date_archivage)}</div></div>
</div>
<div class="grille">
  <div class="champ"><div class="cl">Type</div><div class="cv">${a.type_display||a.type_courrier}</div></div>
  <div class="champ"><div class="cl">Statut</div><div class="cv">${a.statut_display||a.statut}</div></div>
  <div class="champ"><div class="cl">Date du document</div><div class="cv">${fmt(a.date_document)}</div></div>
  <div class="champ"><div class="cl">Date d'archivage</div><div class="cv">${fmt(a.date_archivage)}</div></div>
  <div class="champ"><div class="cl">Origine</div><div class="cv">${a.origine}</div></div>
  <div class="champ"><div class="cl">Référence</div><div class="cv">${a.reference_courrier||"—"}</div></div>
  ${a.destinataire?`<div class="champ"><div class="cl">Destinataire</div><div class="cv">${a.destinataire}</div></div>`:""}
</div>
<div class="objet"><div class="cl">Objet</div><div style="margin-top:4px">${a.objet}</div></div>
${a.observations?`<div class="objet"><div class="cl">Observations</div><div style="margin-top:4px">${a.observations}</div></div>`:""}
${(a.scan_url||a.scan)?`<div style="margin-bottom:18px"><div class="cl" style="margin-bottom:6px">Document numérisé</div><div style="font-size:11px;color:#4A6780">${a.scan_url||a.scan}</div></div>`:""}
<div class="footer">Document généré par le Système de Gestion des Archives — INS Guinée</div>
</body></html>`;

// ════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
const Archives = () => {
  const navigate = useNavigate();
  const { tokens, isLight } = useTheme();

  const SS = {
    bg:           tokens.bg,
    surface:      tokens.surface || (isLight ? "#F5F7FA" : "#111820"),
    card:         tokens.card    || (isLight ? "#FFFFFF"  : "#161E28"),
    hover:        isLight ? "#F0F4F8" : "#1A2535",
    text:         tokens.text    || (isLight ? "#0F2137"  : "#F0F4F8"),
    textSec:      tokens.textSec || (isLight ? "#4A6780"  : "#7A8FA6"),
    textDim:      tokens.textDim || (isLight ? "#8FA8C0"  : "#3D5166"),
    border:       tokens.border  || (isLight ? "#E2E8F0"  : "rgba(255,255,255,0.07)"),
    accent:       "#009A44",
    accentBg:     isLight ? "#E8FFF3" : "rgba(0,154,68,0.1)",
    accentBorder: isLight ? "rgba(0,154,68,0.35)" : "rgba(0,154,68,0.3)",
    accentGlow:   "rgba(0,154,68,0.12)",
    isLight,
  };

  const [view,      setView]      = useState("list");
  const [archives,  setArchives]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [stats,     setStats]     = useState(null);
  const PAGE_SIZE = 15;

  // Filtres
  const [filterType,   setFilterType]   = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showFilters,  setShowFilters]  = useState(false);

  const [selected,  setSelected]  = useState(null);
  const [formMode,  setFormMode]  = useState("create");
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type="success") => setToast({msg,type});

  // ── Chargement stats ─────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const res  = await fetch(CONFIG.API_ARCHIVE_STATS, { headers:authHdr() });
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  // ── Chargement liste ──────────────────────────────────
  const load = useCallback(async (p=1, q="", type="", statut="") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, page_size:PAGE_SIZE });
      if (q.trim())  params.append("search",        q.trim());
      if (type)      params.append("type_courrier",  type);
      if (statut)    params.append("statut",         statut);
      const res  = await fetch(`${CONFIG.API_ARCHIVES}?${params}`, { headers:authHdr() });
      const data = await res.json();
      setArchives(Array.isArray(data)?data:(data.results||[]));
      setTotal(data.count||0);
    } catch { showToast("Erreur de chargement.","error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(page, search, filterType, filterStatut); loadStats(); }, [page]);
  useEffect(()=>{
    const t = setTimeout(()=>{ setPage(1); load(1, search, filterType, filterStatut); }, 400);
    return ()=>clearTimeout(t);
  }, [search, filterType, filterStatut]);

  const openDetail = async (archive) => {
    try {
      const res  = await fetch(CONFIG.API_ARCHIVE_DETAIL(archive.id), { headers:authHdr() });
      const data = await res.json();
      setSelected(data); setView("detail");
    } catch { showToast("Erreur de chargement du détail.","error"); }
  };

  const openForm = (archive=null) => {
    setSelected(archive);
    setFormMode(archive ? "edit" : "create");
    setView("form");
  };

  const handleSaved = (data) => {
    if (formMode==="create") { setArchives(prev=>[data,...prev]); showToast(`Archive ${data.numero_archive} créée.`); }
    else { setArchives(prev=>prev.map(a=>a.id===data.id?data:a)); showToast("Archive mise à jour."); }
    setSelected(data); setView("detail");
    loadStats();
  };

  const handleDeleted = (id) => {
    setArchives(prev=>prev.filter(a=>a.id!==id));
    setView("list"); loadStats();
  };

  const totalPages = Math.ceil(total/PAGE_SIZE);

  const breadcrumbs = [
    { label:"Secrétariat DG", action:null },
    { label:"Courriers", action:()=>navigate("/secretariat/courriers") },
    { label:"Archives", action:()=>{ setView("list"); setSelected(null); } },
    ...(view==="detail"&&selected ? [{ label:selected.numero_archive, action:null }] : []),
    ...(view==="form" ? [{ label:formMode==="create"?"Nouvelle":"Modifier", action:null }] : []),
  ];

  return (
    <div style={{ fontFamily:"inherit",color:SS.text,position:"relative" }}>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pageIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rowIn   { from { opacity:0; } to { opacity:1; } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${isLight?"none":"invert(1)"}; }
        select option { background:${SS.card}; color:${SS.text}; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* Fil d'ariane */}
      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:20,fontSize:12,color:SS.textDim,flexWrap:"wrap" }}>
        {breadcrumbs.map((bc,i)=>(
          <span key={i} style={{ display:"flex",alignItems:"center",gap:6 }}>
            {i>0 && <ChevronRight size={11} color={SS.textDim}/>}
            <span onClick={bc.action||undefined}
              style={{ cursor:bc.action?"pointer":"default",color:i===breadcrumbs.length-1?SS.accent:SS.textSec,fontWeight:i===breadcrumbs.length-1?700:500,transition:"color 0.15s" }}
              onMouseEnter={e=>{ if(bc.action) e.currentTarget.style.color=SS.accent; }}
              onMouseLeave={e=>{ if(bc.action) e.currentTarget.style.color=i===breadcrumbs.length-1?SS.accent:SS.textSec; }}
            >{bc.label}</span>
          </span>
        ))}
      </div>

      {/* ════ VUE LISTE ════ */}
      {view === "list" && (
        <div style={{ animation:"pageIn 0.2s ease" }}>

          {/* Header */}
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:24 }}>
            <div>
              <h1 style={{ fontSize:28,fontWeight:900,color:SS.text,margin:"0 0 6px",letterSpacing:"-0.02em" }}>Archives</h1>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:SS.accent,boxShadow:`0 0 8px ${SS.accent}` }}/>
                <span style={{ fontSize:13,color:SS.textSec }}><span style={{ color:SS.accent,fontWeight:700 }}>{total}</span> document{total>1?"s":""} archivé{total>1?"s":""}</span>
              </div>
            </div>
            <button onClick={()=>openForm(null)} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:10,border:"none",background:SS.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:`0 6px 24px ${SS.accentGlow}` }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 10px 32px ${SS.accent}35`; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 6px 24px ${SS.accentGlow}`; }}
            ><Plus size={15} strokeWidth={2.5}/> Nouvelle archive</button>
          </div>

          {/* Compteurs */}
          {stats && (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,marginBottom:22 }}>
              {[
                { label:"Total",    value:stats.total,    color:SS.accent, Icon:FolderOpen  },
                { label:"Arrivés",  value:stats.arrives,  color:"#009A44", Icon:Mail        },
                { label:"Sortants", value:stats.sortants, color:"#2563EB", Icon:Send        },
                { label:"Internes", value:stats.internes, color:"#C9A000", Icon:FileText    },
                { label:"Archivés", value:stats.archives, color:"#7A8FA6", Icon:BookMarked  },
                { label:"Actifs",   value:stats.actifs,   color:"#009A44", Icon:CheckCircle2 },
              ].map(({label,value,color,Icon})=>(
                <div key={label} style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:12,padding:"14px 16px",transition:"transform 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="none"}
                >
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                    <Icon size={14} color={color}/>
                    <span style={{ fontSize:10,fontWeight:700,color:SS.textDim,textTransform:"uppercase",letterSpacing:"0.1em" }}>{label}</span>
                  </div>
                  <div style={{ fontSize:22,fontWeight:900,color }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Barre recherche + filtres */}
          <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap" }}>
            <div style={{ flex:1,minWidth:240,position:"relative" }}>
              <Search size={14} color={SS.textDim} style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
              {loading && search && <Loader2 size={13} color={SS.accent} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",animation:"spin 0.7s linear infinite" }}/>}
              <input type="text" placeholder="Recherche automatique…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{ width:"100%",padding:"11px 13px 11px 38px",background:SS.card,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box" }}
                onFocus={e=>{ e.target.style.borderColor=SS.accentBorder; e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`; }}
                onBlur={e=>{ e.target.style.borderColor=SS.border; e.target.style.boxShadow="none"; }}
              />
            </div>

            {/* Filtre type */}
            <select value={filterType} onChange={e=>setFilterType(e.target.value)}
              style={{ padding:"11px 14px",background:SS.card,border:`1px solid ${filterType?SS.accentBorder:SS.border}`,borderRadius:10,outline:"none",color:filterType?SS.accent:SS.textSec,fontSize:13,fontFamily:"inherit",cursor:"pointer",minWidth:160 }}>
              {TYPE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Filtre statut */}
            <select value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}
              style={{ padding:"11px 14px",background:SS.card,border:`1px solid ${filterStatut?SS.accentBorder:SS.border}`,borderRadius:10,outline:"none",color:filterStatut?SS.accent:SS.textSec,fontSize:13,fontFamily:"inherit",cursor:"pointer",minWidth:160 }}>
              {STATUT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {(search||filterType||filterStatut) && (
              <button onClick={()=>{ setSearch(""); setFilterType(""); setFilterStatut(""); }} style={{ padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600 }}>
                <X size={13}/> Réinitialiser
              </button>
            )}
          </div>

          {/* Table */}
          {loading && !search && !filterType && !filterStatut ? (
            <div style={{ textAlign:"center",padding:"80px 0" }}>
              <Loader2 size={32} color={SS.accent} style={{ animation:"spin 0.8s linear infinite",marginBottom:16 }}/>
              <div style={{ fontSize:13,color:SS.textDim }}>Chargement…</div>
            </div>
          ) : archives.length===0 ? (
            <div style={{ textAlign:"center",padding:"80px 0",background:SS.card,borderRadius:16,border:`1px solid ${SS.border}` }}>
              <Archive size={40} color={SS.textDim} style={{ marginBottom:16 }}/>
              <div style={{ fontSize:15,fontWeight:700,color:SS.textSec,marginBottom:8 }}>
                {search?"Aucun résultat trouvé":"Aucune archive enregistrée"}
              </div>
              {!search && <div style={{ fontSize:12,color:SS.textDim }}>Cliquez sur "Nouvelle archive" pour commencer</div>}
            </div>
          ) : (
            <>
              <div style={{ border:`1px solid ${SS.border}`,borderRadius:14,overflow:"hidden",opacity:loading?0.5:1,transition:"opacity 0.2s" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ background:SS.surface,borderBottom:`1px solid ${SS.border}` }}>
                      {["N° Archive","Type","Date doc.","Origine","Référence","Objet","Statut","Doc.","Actions"].map(h=>(
                        <th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:9.5,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {archives.map((a,i)=>{
                      const tm = TYPE_META[a.type_courrier]   || TYPE_META.interne;
                      const sm = STATUT_META[a.statut]        || STATUT_META.archive;
                      return (
                        <tr key={a.id} onClick={()=>openDetail(a)}
                          style={{ background:i%2===0?SS.card:SS.surface,borderBottom:`1px solid ${SS.border}`,cursor:"pointer",transition:"background 0.12s",animation:`rowIn 0.3s ease ${i*0.03}s both` }}
                          onMouseEnter={e=>e.currentTarget.style.background=SS.hover}
                          onMouseLeave={e=>e.currentTarget.style.background=i%2===0?SS.card:SS.surface}
                        >
                          <td style={{ padding:"12px 14px",fontWeight:800,color:SS.accent,whiteSpace:"nowrap",fontSize:12 }}>{a.numero_archive}</td>
                          <td style={{ padding:"12px 14px" }}>
                            <span style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:6,background:tm.bg,color:tm.color,border:`1px solid ${tm.border}` }}>
                              <tm.Icon size={10}/>{tm.label}
                            </span>
                          </td>
                          <td style={{ padding:"12px 14px",color:SS.textSec,whiteSpace:"nowrap",fontSize:12 }}>{fmt(a.date_document)}</td>
                          <td style={{ padding:"12px 14px",fontWeight:600,color:SS.text,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.origine}</td>
                          <td style={{ padding:"12px 14px",color:SS.textSec,fontSize:11,fontFamily:"monospace" }}>{a.reference_courrier||"—"}</td>
                          <td style={{ padding:"12px 14px",color:SS.textSec,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:12 }}>{a.objet}</td>
                          <td style={{ padding:"12px 14px" }}>
                            <span style={{ display:"inline-block",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:6,background:sm.bg,color:sm.color }}>{sm.label}</span>
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            {(a.scan_url||a.scan)
                              ?<span style={{ display:"inline-flex",alignItems:"center",gap:4,background:SS.accentBg,color:SS.accent,fontSize:10,fontWeight:800,borderRadius:6,padding:"3px 9px",border:`1px solid ${SS.accentBorder}` }}><Paperclip size={10}/> Oui</span>
                              :<span style={{ color:SS.textDim,fontSize:11 }}>—</span>}
                          </td>
                          <td style={{ padding:"12px 10px" }} onClick={e=>e.stopPropagation()}>
                            <div style={{ display:"flex",gap:5 }}>
                              <button onClick={()=>openDetail(a)} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:SS.textSec,transition:"all 0.15s" }}
                                onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.color=SS.accent; e.currentTarget.style.background=SS.accentBg; }}
                                onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; e.currentTarget.style.background="transparent"; }}
                              ><Eye size={12}/></button>
                              <button onClick={()=>openForm(a)} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:SS.textSec,transition:"all 0.15s" }}
                                onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(37,99,235,0.35)"; e.currentTarget.style.color="#2563EB"; e.currentTarget.style.background="rgba(37,99,235,0.08)"; }}
                                onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; e.currentTarget.style.background="transparent"; }}
                              ><Pencil size={11}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages>1 && (
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:20 }}>
                  <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1px solid ${SS.border}`,background:"transparent",color:page===1?SS.textDim:SS.textSec,cursor:page===1?"not-allowed":"pointer",fontSize:12,fontWeight:600 }}>
                    <ChevronLeft size={14}/> Précédent
                  </button>
                  <span style={{ fontSize:12,color:SS.textDim }}>Page <span style={{ color:SS.accent,fontWeight:800 }}>{page}</span> / {totalPages}</span>
                  <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1px solid ${SS.border}`,background:"transparent",color:page===totalPages?SS.textDim:SS.textSec,cursor:page===totalPages?"not-allowed":"pointer",fontSize:12,fontWeight:600 }}>
                    Suivant <ChevronRight size={14}/>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ════ VUE DÉTAIL ════ */}
      {view==="detail" && selected && (
        <DetailArchive archive={selected} onClose={()=>{ setView("list"); setSelected(null); }} onEdit={openForm} onDeleted={handleDeleted} onToast={showToast} SS={SS}/>
      )}

      {/* ════ VUE FORMULAIRE ════ */}
      {view==="form" && (
        <div style={{ animation:"pageIn 0.2s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:28 }}>
            <button onClick={()=>setView(selected&&formMode==="edit"?"detail":"list")} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.color=SS.accent; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; }}
            ><ArrowLeft size={15}/> {selected&&formMode==="edit"?"Retour à la fiche":"Retour aux archives"}</button>
            <div>
              <div style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3 }}>
                {formMode==="create"?"Nouvelle archive":"Modifier l'archive"}
              </div>
              <h2 style={{ fontSize:20,fontWeight:800,color:SS.text,margin:0 }}>
                {formMode==="create"?"Fiche d'archivage":"Modifier — "+selected?.numero_archive}
              </h2>
            </div>
          </div>
          <div style={{ maxWidth:780,background:SS.card,border:`1px solid ${SS.border}`,borderRadius:16,padding:32,boxShadow:isLight?"0 4px 24px rgba(0,0,0,0.06)":"0 4px 24px rgba(0,0,0,0.3)" }}>
            <FormArchive archive={formMode==="edit"?selected:null} onSave={handleSaved} onCancel={()=>setView(selected&&formMode==="edit"?"detail":"list")} SS={SS}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archives;