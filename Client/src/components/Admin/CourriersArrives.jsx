// CourriersArrives.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail, Plus, Search, Eye, Pencil, Trash2,
  Printer, Download, X, Upload, ChevronRight, ChevronLeft,
  FileText, Check, AlertCircle, Loader2,
  Calendar, Building2, Hash, AlignLeft, Paperclip,
  ZoomIn, ZoomOut, ExternalLink, ArrowLeft, Inbox,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTheme } from "../../context/ThemeContext";

// ── Helpers ───────────────────────────────────────────────
const token   = () => localStorage.getItem("access");
const authHdr = () => ({ Authorization: `Bearer ${token()}` });
const fmt     = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const today   = () => new Date().toISOString().split("T")[0];

const FONCTIONS = [
  { code:"DG",  label:"Directeur Général"         },
  { code:"DGA", label:"Directeur Général Adjoint" },
  { code:"DIR", label:"Le Directeur"              },
  { code:"SD",  label:"Le Sous Directeur"         },
];

const isPdfUrl   = (url) => url && (/\.pdf(\?|$)/i.test(url) || url.includes("/raw/upload/"));
const isImageUrl = (url) => url && (
  /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) ||
  url.includes("/image/upload/") ||
  url.includes("cloudinary.com")
);

// ════════════════════════════════════════════════════════
//  VISIONNEUSE IMAGE
// ════════════════════════════════════════════════════════
const ImageViewer = ({ url, nom, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [err,  setErr]  = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const download = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nom || "scan";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { window.open(url, "_blank"); }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.94)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:"fixed",top:20,right:20,display:"flex",gap:8 }}>
        {[
          { label:"Zoom +", fn:()=>setZoom(z=>Math.min(z+0.25,4)) },
          { label:"Zoom −", fn:()=>setZoom(z=>Math.max(z-0.25,0.25)) },
          { label:"Télécharger", fn:download, green:true },
          { label:"Ouvrir", fn:()=>window.open(url,"_blank") },
          { label:"×", fn:onClose, red:true },
        ].map((b,i)=>(
          <button key={i} onClick={b.fn} style={{ padding:"8px 14px",borderRadius:8,border:`1px solid ${b.green?"rgba(0,154,68,0.4)":b.red?"rgba(206,17,38,0.4)":"rgba(255,255,255,0.15)"}`,background:b.green?"rgba(0,154,68,0.15)":b.red?"rgba(206,17,38,0.15)":"rgba(255,255,255,0.05)",color:b.green?"#00C457":b.red?"#FF4466":"rgba(255,255,255,0.7)",fontSize:12,fontWeight:600,cursor:"pointer" }}>
            {b.label}
          </button>
        ))}
      </div>
      <div onClick={e=>e.stopPropagation()} style={{ overflow:"auto",maxWidth:"90vw",maxHeight:"82vh",marginTop:70 }}>
        {err ? (
          <div style={{ color:"rgba(255,255,255,0.5)",textAlign:"center",padding:48 }}>
            <AlertCircle size={40} style={{ marginBottom:16 }}/>
            <div style={{ marginBottom:16 }}>Impossible d'afficher le fichier</div>
            <button onClick={()=>window.open(url,"_blank")} style={{ padding:"10px 20px",borderRadius:8,border:"1px solid rgba(0,154,68,0.4)",background:"rgba(0,154,68,0.1)",color:"#00C457",cursor:"pointer",fontSize:13 }}>Ouvrir dans un onglet</button>
          </div>
        ) : (
          <img src={url} alt="scan" onError={()=>setErr(true)}
            style={{ transform:`scale(${zoom})`,transformOrigin:"top left",borderRadius:12,display:"block",transition:"transform 0.2s",maxWidth:"88vw",boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}
          />
        )}
      </div>
      <div style={{ color:"rgba(255,255,255,0.25)",fontSize:11,marginTop:16,letterSpacing:"0.05em" }}>ESC · CLIC EXTÉRIEUR POUR FERMER</div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  VISIONNEUSE PDF
// ════════════════════════════════════════════════════════
const PDFViewer = ({ url, nom, onClose }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.94)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(10px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:940,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <span style={{ color:"rgba(255,255,255,0.8)",fontWeight:700,fontSize:14 }}>{nom||"Document PDF"}</span>
        <div style={{ display:"flex",gap:8 }}>
          {[
            { label:"Télécharger", fn:()=>{const a=document.createElement("a");a.href=url;a.download=nom||"doc.pdf";document.body.appendChild(a);a.click();document.body.removeChild(a);}, green:true },
            { label:"Nouvel onglet", fn:()=>window.open(url,"_blank") },
            { label:"Fermer", fn:onClose, red:true },
          ].map((b,i)=>(
            <button key={i} onClick={b.fn} style={{ padding:"8px 16px",borderRadius:8,border:`1px solid ${b.green?"rgba(0,154,68,0.4)":b.red?"rgba(206,17,38,0.4)":"rgba(255,255,255,0.15)"}`,background:b.green?"rgba(0,154,68,0.15)":b.red?"rgba(206,17,38,0.15)":"rgba(255,255,255,0.05)",color:b.green?"#00C457":b.red?"#FF4466":"rgba(255,255,255,0.7)",fontSize:12,fontWeight:600,cursor:"pointer" }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:940,borderRadius:12,overflow:"hidden" }}>
        <iframe src={`${url}#toolbar=1`} style={{ width:"100%",height:"78vh",border:"none",display:"block" }} title="PDF"/>
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

  useEffect(() => { console.log("[ScanBlock] scanUrl =", scanUrl); }, [scanUrl]);

  if (!scanUrl) return (
    <div style={{ background:SS.card,border:`1px dashed ${SS.border}`,borderRadius:12,padding:28,textAlign:"center" }}>
      <Paperclip size={22} color={SS.textDim} style={{ display:"block",margin:"0 auto 8px" }}/>
      <div style={{ color:SS.textDim,fontSize:13 }}>Aucune pièce jointe</div>
    </div>
  );

  const nom = (() => { try { return decodeURIComponent(scanUrl.split("/").pop().split("?")[0])||"fichier"; } catch { return "fichier"; } })();
  const looksLikeP = isPdfUrl(scanUrl);

  const downloadFile = async () => {
    try {
      const res = await fetch(scanUrl, { mode:"cors" });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nom;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch { window.open(scanUrl, "_blank"); }
  };

  const btnRow = (viewType) => (
    <div style={{ display:"flex",gap:8,marginTop:12,flexWrap:"wrap" }}>
      {[
        { label:"Visualiser", icon:<Eye size={13}/>, fn:()=>setViewer(viewType), primary:true },
        { label:"Télécharger", icon:<Download size={13}/>, fn:downloadFile },
        { label:"Ouvrir", icon:<ExternalLink size={13}/>, fn:()=>window.open(scanUrl,"_blank") },
      ].map((b,i)=>(
        <button key={i} onClick={b.fn} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,border:`1px solid ${b.primary?SS.accentBorder:SS.border}`,background:b.primary?SS.accentBg:"transparent",color:b.primary?SS.accent:SS.textSec,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=SS.accent;e.currentTarget.style.color=SS.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=b.primary?SS.accentBorder:SS.border;e.currentTarget.style.color=b.primary?SS.accent:SS.textSec;}}
        >{b.icon}{b.label}</button>
      ))}
    </div>
  );

  if (looksLikeP) return (
    <>
      {viewer==="pdf" && <PDFViewer url={scanUrl} nom={nom} onClose={()=>setViewer(null)}/>}
      <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:12,padding:"18px 20px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:48,height:48,borderRadius:10,background:"rgba(206,17,38,0.08)",border:"1px solid rgba(206,17,38,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <FileText size={22} color="#CE1126"/>
          </div>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:SS.text,marginBottom:2 }}>{nom}</div>
            <div style={{ fontSize:11,color:SS.textDim }}>Document PDF</div>
          </div>
        </div>
        {btnRow("pdf")}
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
            <div onClick={()=>setViewer("image")} style={{ cursor:"zoom-in",background:SS.surface,display:"flex",alignItems:"center",justifyContent:"center",minHeight:180,position:"relative",overflow:"hidden" }}>
              <img src={scanUrl} alt="scan" onError={()=>setImgFail(true)}
                style={{ maxWidth:"100%",maxHeight:280,objectFit:"contain",display:"block" }}
              />
              <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0)",transition:"background 0.2s",display:"flex",alignItems:"center",justifyContent:"center" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(0,154,68,0.1)"; e.currentTarget.querySelector(".hint").style.opacity="1"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(0,0,0,0)"; e.currentTarget.querySelector(".hint").style.opacity="0"; }}
              >
                <div className="hint" style={{ background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,opacity:0,transition:"opacity 0.2s",pointerEvents:"none" }}>
                  <ZoomIn size={13}/> Cliquer pour agrandir
                </div>
              </div>
            </div>
            <div style={{ padding:"12px 18px",borderTop:`1px solid ${SS.border}`,display:"flex",gap:8,flexWrap:"wrap" }}>
              <button onClick={()=>setViewer("image")} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${SS.accentBorder}`,background:SS.accentBg,color:SS.accent,fontSize:12,fontWeight:600,cursor:"pointer" }}>
                <Eye size={13}/> Visualiser
              </button>
              <button onClick={downloadFile} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:12,fontWeight:600,cursor:"pointer" }}>
                <Download size={13}/> Télécharger
              </button>
              <button onClick={()=>window.open(scanUrl,"_blank")} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:12,fontWeight:600,cursor:"pointer" }}>
                <ExternalLink size={13}/> Ouvrir
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
              <div style={{ width:48,height:48,borderRadius:10,background:SS.accentBg,border:`1px solid ${SS.accentBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <Paperclip size={22} color={SS.accent}/>
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:SS.text }}>{nom}</div>
                <div style={{ fontSize:11,color:SS.textDim,wordBreak:"break-all" }}>{scanUrl.slice(0,55)}…</div>
              </div>
            </div>
            {btnRow("pdf")}
          </div>
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════
//  COMPOSANTS UI — thémés
// ════════════════════════════════════════════════════════
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const isOk = type === "success";
  return (
    <div style={{ position:"fixed",bottom:28,right:28,zIndex:8000,display:"flex",alignItems:"center",gap:10,padding:"13px 20px",borderRadius:12,border:`1px solid ${isOk?"rgba(0,154,68,0.35)":"rgba(206,17,38,0.35)"}`,background:isOk?"rgba(0,154,68,0.1)":"rgba(206,17,38,0.1)",color:isOk?"#009A44":"#CE1126",fontSize:13.5,fontWeight:700,boxShadow:`0 8px 32px ${isOk?"rgba(0,154,68,0.15)":"rgba(206,17,38,0.15)"}`,animation:"toastIn 0.3s ease",backdropFilter:"blur(12px)" }}>
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
  <textarea {...props} style={{ width:"100%",padding:"11px 14px",background:SS.surface,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,resize:"vertical",minHeight:88,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",...style }}
    onFocus={e=>{ e.target.style.borderColor=SS.accentBorder; e.target.style.background=SS.card; e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`; }}
    onBlur={e=>{ e.target.style.borderColor=SS.border; e.target.style.background=SS.surface; e.target.style.boxShadow="none"; }}
  />
);

const Btn = ({ SS, children, variant="primary", small=false, disabled=false, style={}, ...props }) => {
  const v = {
    primary: { bg:SS.accent,         border:SS.accent,        color:SS.isLight?"#fff":"#080C10" },
    outline: { bg:SS.accentBg,       border:SS.accentBorder,  color:SS.accent                  },
    ghost:   { bg:"transparent",     border:SS.border,        color:SS.textSec                 },
    danger:  { bg:"rgba(206,17,38,0.08)", border:"rgba(206,17,38,0.3)", color:"#CE1126"        },
    blue:    { bg:"rgba(37,99,235,0.08)", border:"rgba(37,99,235,0.3)", color:"#2563EB"        },
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
//  FORMULAIRE
// ════════════════════════════════════════════════════════
const EMPTY_FORM = (t) => ({ date_arrivee:t(), origine:"", reference:"", date_envoi:"", objet:"", scan:null });

const FormCourrier = ({ courrier, onSave, onCancel, SS }) => {
  const [form,    setForm]    = useState(courrier ? { date_arrivee:courrier.date_arrivee||today(), origine:courrier.origine||"", reference:courrier.reference||"", date_envoi:courrier.date_envoi||"", objet:courrier.objet||"", scan:null } : EMPTY_FORM(today));
  const [preview, setPreview] = useState(courrier?.scan_url||courrier?.scan||null);
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
    if (!form.origine||!form.reference||!form.objet) { setError("Origine, Référence et Objet sont obligatoires."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (k!=="scan"&&v!==null&&v!==undefined) fd.append(k,v); });
      if (form.scan) fd.append("scan", form.scan);
      const url    = courrier ? CONFIG.API_COURRIER_ARRIVE_DETAIL(courrier.id) : CONFIG.API_COURRIERS_ARRIVES;
      const method = courrier ? "PATCH" : "POST";
      const res    = await fetch(url, { method, headers:authHdr(), body:fd });
      const data   = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      onSave(data);
    } catch(err) { console.error(err); setError("Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:20 }}>
      {error && (
        <div style={{ background:"rgba(206,17,38,0.08)",border:"1px solid rgba(206,17,38,0.25)",borderRadius:10,padding:"12px 16px",color:"#CE1126",fontSize:13,display:"flex",gap:8,alignItems:"center" }}>
          <AlertCircle size={14}/> {error}
        </div>
      )}

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <div><FieldLabel icon={Calendar} SS={SS}>Date d'arrivée</FieldLabel><Input SS={SS} type="date" value={form.date_arrivee} onChange={e=>set("date_arrivee",e.target.value)} required/></div>
        <div><FieldLabel icon={Building2} SS={SS}>Origine</FieldLabel><Input SS={SS} type="text" placeholder="Ex: BCRG" value={form.origine} onChange={e=>set("origine",e.target.value)} required/></div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <div><FieldLabel icon={Hash} SS={SS}>Référence</FieldLabel><Input SS={SS} type="text" placeholder="Référence du courrier" value={form.reference} onChange={e=>set("reference",e.target.value)} required/></div>
        <div><FieldLabel icon={Calendar} SS={SS}>Date d'envoi</FieldLabel><Input SS={SS} type="date" value={form.date_envoi} onChange={e=>set("date_envoi",e.target.value)}/></div>
      </div>
      <div><FieldLabel icon={AlignLeft} SS={SS}>Objet</FieldLabel><Textarea SS={SS} placeholder="Objet du courrier..." value={form.objet} onChange={e=>set("objet",e.target.value)} required/></div>

      {/* Zone scan */}
      <div>
        <FieldLabel icon={Paperclip} SS={SS}>Pièce jointe</FieldLabel>
        <div onClick={()=>fileRef.current.click()}
          style={{ border:`1.5px dashed ${preview?SS.accentBorder:SS.border}`,borderRadius:12,padding:24,textAlign:"center",cursor:"pointer",background:preview?SS.accentBg:SS.surface,transition:"all 0.2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.background=SS.accentBg; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=preview?SS.accentBorder:SS.border; e.currentTarget.style.background=preview?SS.accentBg:SS.surface; }}
        >
          {preview && typeof preview==="string" && preview.startsWith("blob:") && (
            <div style={{ position:"relative",display:"inline-block" }}>
              <img src={preview} alt="scan" style={{ maxHeight:130,borderRadius:8,objectFit:"contain" }}/>
              <button type="button" onClick={e=>{e.stopPropagation();setPreview(null);set("scan",null);}} style={{ position:"absolute",top:-8,right:-8,width:22,height:22,borderRadius:"50%",background:"#CE1126",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><X size={11}/></button>
            </div>
          )}
          {preview && typeof preview==="string" && preview.startsWith("http") && (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:SS.accent }}>
              <Check size={18}/><span style={{ fontSize:13,fontWeight:700 }}>Fichier conservé</span>
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
            <>
              <Upload size={26} color={SS.textDim} style={{ marginBottom:10 }}/>
              <div style={{ fontSize:13,color:SS.textSec,fontWeight:600,marginBottom:4 }}>Cliquer pour ajouter un fichier</div>
              <div style={{ fontSize:11,color:SS.textDim }}>JPG · PNG · PDF · max 10 Mo</div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display:"none" }}/>
      </div>

      <div style={{ display:"flex",gap:10,justifyContent:"flex-end",paddingTop:8,borderTop:`1px solid ${SS.border}` }}>
        <Btn SS={SS} variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn SS={SS} disabled={saving}>
          {saving?<><Loader2 size={13} style={{ animation:"spin 0.7s linear infinite" }}/> Enregistrement…</>:<><Check size={13}/> {courrier?"Mettre à jour":"Enregistrer"}</>}
        </Btn>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════
//  VUE DÉTAIL — page complète
// ════════════════════════════════════════════════════════
const DetailCourrier = ({ courrier, onClose, onEdit, onDeleted, onToast, SS }) => {
  const [lignes,  setLignes]  = useState(courrier.lignes_circulation || []);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);

  const scanUrl = courrier.scan_url || courrier.scan || null;

  useEffect(() => { console.log("[DetailCourrier] scanUrl:", scanUrl); }, [courrier]);

  const handleSignSave = async (ligne) => {
    setSaving(true);
    try {
      const res = await fetch(CONFIG.API_COURRIER_ARRIVE_CIRC(courrier.id, ligne.id), { method:"PATCH", headers:{...authHdr(),"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setLignes(prev=>prev.map(l=>l.id===updated.id?{...l,...updated}:l));
      setEditing(null); onToast("Ligne mise à jour.","success");
    } catch { onToast("Erreur mise à jour.","error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer ${courrier.numero_ordre} ?`)) return;
    try {
      const res = await fetch(CONFIG.API_COURRIER_ARRIVE_DETAIL(courrier.id), { method:"DELETE",headers:authHdr() });
      if (res.ok||res.status===204) { onToast("Courrier supprimé.","success"); onDeleted(courrier.id); onClose(); }
    } catch { onToast("Erreur suppression.","error"); }
  };

  const handlePrint = () => {
    const w = window.open("","_blank","width=900,height=700");
    w.document.write(buildPrintHTML(courrier, lignes));
    w.document.close(); w.focus();
    setTimeout(()=>w.print(), 600);
  };

  return (
    <div style={{ animation:"pageIn 0.25s ease" }}>

      {/* ── Topbar détail ── */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <button onClick={onClose} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.color=SS.accent; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; }}
          >
            <ArrowLeft size={15}/> Retour à la liste
          </button>
          <div>
            <div style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3 }}>Fiche courrier arrivé</div>
            <div style={{ fontSize:22,fontWeight:900,color:SS.accent,letterSpacing:"0.04em" }}>{courrier.numero_ordre}</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <Btn SS={SS} small variant="outline" onClick={handlePrint}><Printer size={13}/> Imprimer</Btn>
          <Btn SS={SS} small variant="blue" onClick={()=>onEdit(courrier)}><Pencil size={13}/> Modifier</Btn>
          <Btn SS={SS} small variant="danger" onClick={handleDelete}><Trash2 size={13}/> Supprimer</Btn>
        </div>
      </div>

      {/* ── Grille 2 colonnes ── */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24 }}>

        {/* Colonne gauche : infos */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

          {/* Numéro + dates */}
          <div style={{ background:SS.card,border:`1px solid ${SS.accentBorder}`,borderRadius:14,padding:"20px 22px",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,width:"100%",height:"3px",background:`linear-gradient(90deg, #CE1126, #FCD116, #009A44)` }}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:6 }}>
              {[
                { label:"Date d'arrivée", value:fmt(courrier.date_arrivee) },
                { label:"Origine",        value:courrier.origine,           hi:true },
                { label:"Référence",      value:courrier.reference          },
                { label:"Date d'envoi",   value:fmt(courrier.date_envoi)    },
              ].map(({label,value,hi})=>(
                <div key={label}>
                  <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:5 }}>{label}</div>
                  <div style={{ fontSize:14,fontWeight:700,color:hi?SS.accent:SS.text }}>{value||"—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Objet */}
          <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:14,padding:"18px 20px",flex:1 }}>
            <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:10 }}>Objet</div>
            <div style={{ fontSize:14,color:SS.text,lineHeight:1.7 }}>{courrier.objet}</div>
          </div>
        </div>

        {/* Colonne droite : scan */}
        <div>
          <div style={{ fontSize:9,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:10,display:"flex",alignItems:"center",gap:8 }}>
            Pièce jointe
            {scanUrl && <span style={{ background:SS.accentBg,color:SS.accent,fontSize:9,fontWeight:800,borderRadius:20,padding:"3px 10px",border:`1px solid ${SS.accentBorder}` }}>✓ Disponible</span>}
          </div>
          <ScanBlock scanUrl={scanUrl} SS={SS}/>
        </div>
      </div>

      {/* ── Tableau de circulation ── */}
      <div style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:14,overflow:"hidden" }}>
        <div style={{ padding:"16px 20px",borderBottom:`1px solid ${SS.border}`,display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:4,height:16,borderRadius:2,background:SS.accent }}/>
          <span style={{ fontSize:13,fontWeight:800,color:SS.text,textTransform:"uppercase",letterSpacing:"0.08em" }}>Tableau de Circulation</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead>
              <tr style={{ background:SS.surface }}>
                {["Fonction","Date","Annotation","Observation","Action"].map(h=>(
                  <th key={h} style={{ padding:"12px 16px",textAlign:"left",fontSize:9,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.12em",borderBottom:`1px solid ${SS.border}`,whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FONCTIONS.map((f,i)=>{
                const ligne  = lignes.find(l=>l.fonction===f.code)||{};
                const isEd   = editing===ligne.id;
                const signed = !!ligne.date_signature;
                return (
                  <tr key={f.code}
                    style={{ background:i%2===0?SS.card:SS.surface,borderBottom:`1px solid ${SS.border}`,transition:"background 0.1s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=SS.hover}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?SS.card:SS.surface}
                  >
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                        <div style={{ width:7,height:7,borderRadius:"50%",background:signed?SS.accent:SS.textDim,flexShrink:0,boxShadow:signed?`0 0 6px ${SS.accent}`:undefined }}/>
                        <span style={{ fontWeight:700,color:SS.text }}>{f.label}</span>
                      </div>
                    </td>
                    <td style={{ padding:"13px 16px",color:SS.textSec }}>
                      {isEd?<Input SS={SS} type="date" value={form.date_signature||""} onChange={e=>setForm(p=>({...p,date_signature:e.target.value}))} style={{ minWidth:130,fontSize:12 }}/>:(ligne.date_signature?fmt(ligne.date_signature):<span style={{ color:SS.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding:"13px 16px",color:SS.textSec,maxWidth:180 }}>
                      {isEd?<Input SS={SS} type="text" placeholder="Annotation" value={form.annotation||""} onChange={e=>setForm(p=>({...p,annotation:e.target.value}))} style={{ fontSize:12 }}/>:(ligne.annotation||<span style={{ color:SS.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding:"13px 16px",color:SS.textSec,maxWidth:180 }}>
                      {isEd?<Input SS={SS} type="text" placeholder="Observation" value={form.observation||""} onChange={e=>setForm(p=>({...p,observation:e.target.value}))} style={{ fontSize:12 }}/>:(ligne.observation||<span style={{ color:SS.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      {isEd?(
                        <div style={{ display:"flex",gap:6 }}>
                          <Btn SS={SS} small onClick={()=>handleSignSave(ligne)} disabled={saving}><Check size={12}/></Btn>
                          <Btn SS={SS} small variant="ghost" onClick={()=>setEditing(null)}><X size={12}/></Btn>
                        </div>
                      ):(
                        <button onClick={()=>{setEditing(ligne.id);setForm({date_signature:ligne.date_signature||"",annotation:ligne.annotation||"",observation:ligne.observation||""});}}
                          style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.15s" }}
                          onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.color=SS.accent; }}
                          onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; }}
                        >
                          <Pencil size={11}/> Signer
                        </button>
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
//  HTML IMPRESSION
// ════════════════════════════════════════════════════════
const buildPrintHTML = (c, lignes) => `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Fiche ${c.numero_ordre}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111;padding:20px 28px}.bandeau{display:flex;height:4px;margin-bottom:10px}.b1{flex:1;background:#CE1126}.b2{flex:1;background:#FCD116}.b3{flex:1;background:#009A44}.entete{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #009A44;padding-bottom:14px;margin-bottom:18px}.titre{font-size:15px;font-weight:900;text-transform:uppercase;color:#0F2137}.sous-titre{font-size:11px;color:#4A6780}.numero{font-size:18px;font-weight:900;color:#009A44}.grille{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}.champ{background:#F5F7FA;border:1px solid #DDE4ED;border-radius:6px;padding:10px 12px}.cl{font-size:9px;font-weight:800;text-transform:uppercase;color:#8FA8C0;margin-bottom:3px}.cv{font-size:13px;font-weight:700}.objet{background:#F5F7FA;border:1px solid #DDE4ED;border-radius:6px;padding:12px;margin-bottom:18px}table{width:100%;border-collapse:collapse}th{background:#E8FFF3;padding:9px 12px;font-size:9.5px;font-weight:800;text-transform:uppercase;color:#009A44;border:1px solid #DDE4ED}td{padding:10px 12px;border:1px solid #DDE4ED}.sz{height:40px}.footer{margin-top:28px;font-size:10px;color:#8FA8C0;text-align:center;border-top:1px solid #DDE4ED;padding-top:10px}@media print{@page{margin:15mm}}</style>
</head><body>
<div class="bandeau"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div>
<div class="entete"><div><div class="titre">MPCID — Institut National de la Statistique</div><div class="sous-titre">République de Guinée · Fiche de Circulation du Courrier Arrivé</div></div><div style="text-align:right"><div class="numero">${c.numero_ordre}</div><div class="sous-titre">Enregistré le ${fmt(c.date_arrivee)}</div></div></div>
<div class="grille"><div class="champ"><div class="cl">Date d'arrivée</div><div class="cv">${fmt(c.date_arrivee)}</div></div><div class="champ"><div class="cl">Origine</div><div class="cv">${c.origine}</div></div><div class="champ"><div class="cl">Référence</div><div class="cv">${c.reference}</div></div><div class="champ"><div class="cl">Date d'envoi</div><div class="cv">${fmt(c.date_envoi)}</div></div></div>
<div class="objet"><div class="cl">Objet</div><div style="margin-top:4px">${c.objet}</div></div>
${(c.scan_url||c.scan)?`<div style="margin-bottom:18px"><div class="cl" style="margin-bottom:6px">Pièce jointe</div><div style="font-size:11px;color:#4A6780">${c.scan_url||c.scan}</div></div>`:""}
<div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#009A44;margin-bottom:8px">Tableau de Circulation</div>
<table><thead><tr><th>Fonction</th><th>Date</th><th>Annotation</th><th>Observation</th><th>Signature</th></tr></thead><tbody>
${FONCTIONS.map(f=>{const l=lignes.find(x=>x.fonction===f.code)||{};return`<tr><td><strong>${f.label}</strong></td><td>${l.date_signature?fmt(l.date_signature):""}</td><td>${l.annotation||""}</td><td>${l.observation||""}</td><td class="sz"></td></tr>`;}).join("")}
</tbody></table>
<div class="footer">Document généré par le Système de Gestion des Courriers — INS Guinée</div></body></html>`;

// ════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
const CourriersArrives = () => {
  const navigate = useNavigate();
  const { tokens, isLight } = useTheme();

  // ── Tokens thème adaptés ──────────────────────────────
  const SS = {
    // Surfaces
    bg:          tokens.bg,
    surface:     tokens.surface || (isLight ? "#F5F7FA" : "#111820"),
    card:        tokens.card    || (isLight ? "#FFFFFF"  : "#161E28"),
    hover:       isLight ? "#F0F4F8" : "#1A2535",
    // Textes
    text:        tokens.text    || (isLight ? "#0F2137"  : "#F0F4F8"),
    textSec:     tokens.textSec || (isLight ? "#4A6780"  : "#7A8FA6"),
    textDim:     tokens.textDim || (isLight ? "#8FA8C0"  : "#3D5166"),
    // Bordures
    border:      tokens.border  || (isLight ? "#E2E8F0"  : "rgba(255,255,255,0.07)"),
    // Accent INS vert
    accent:      "#009A44",
    accentBg:    isLight ? "#E8FFF3" : "rgba(0,154,68,0.1)",
    accentBorder:isLight ? "rgba(0,154,68,0.35)" : "rgba(0,154,68,0.3)",
    accentGlow:  "rgba(0,154,68,0.12)",
    isLight,
  };

  const [view,      setView]      = useState("list"); // "list" | "detail" | "form"
  const [courriers, setCourriers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const PAGE_SIZE = 15;

  const [selected,  setSelected]  = useState(null);
  const [formMode,  setFormMode]  = useState("create"); // "create" | "edit"
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type="success") => setToast({msg,type});

  const load = useCallback(async (p=1, q="") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, page_size:PAGE_SIZE });
      if (q.trim()) params.append("search", q.trim());
      const res  = await fetch(`${CONFIG.API_COURRIERS_ARRIVES}?${params}`, { headers:authHdr() });
      const data = await res.json();
      setCourriers(Array.isArray(data)?data:(data.results||[]));
      setTotal(data.count||0);
    } catch { showToast("Erreur de chargement.","error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(page, search); }, [page]);
  useEffect(()=>{
    const t = setTimeout(()=>{ setPage(1); load(1, search); }, 400);
    return ()=>clearTimeout(t);
  }, [search]);

  const openDetail = async (courrier) => {
    try {
      const res  = await fetch(CONFIG.API_COURRIER_ARRIVE_DETAIL(courrier.id), { headers:authHdr() });
      const data = await res.json();
      console.log("[openDetail] réponse API:", JSON.stringify({ id:data.id, scan:data.scan, scan_url:data.scan_url }));
      setSelected(data); setView("detail");
    } catch { showToast("Erreur de chargement du détail.","error"); }
  };

  const openForm = (courrier=null) => {
    setSelected(courrier);
    setFormMode(courrier ? "edit" : "create");
    setView("form");
  };

  const handleSaved = (data) => {
    if (formMode==="create") {
      setCourriers(prev=>[data,...prev]);
      showToast(`Courrier ${data.numero_ordre} créé.`);
      setSelected(data); setView("detail");
    } else {
      setCourriers(prev=>prev.map(c=>c.id===data.id?data:c));
      setSelected(data); setView("detail");
      showToast("Courrier mis à jour.");
    }
  };

  const handleDeleted = (id) => {
    setCourriers(prev=>prev.filter(c=>c.id!==id));
    setView("list");
  };

  const totalPages = Math.ceil(total/PAGE_SIZE);

  // ── Fil d'ariane dynamique ────────────────────────────
  const breadcrumbs = [
    { label:"Secrétariat DG", action:null },
    { label:"Courriers", action:()=>navigate("/secretariat/courriers") },
    { label:"Arrivés", action:()=>{ setView("list"); setSelected(null); } },
    ...(view==="detail" && selected ? [{ label:selected.numero_ordre, action:null }] : []),
    ...(view==="form" ? [{ label:formMode==="create"?"Nouveau":"Modifier", action:null }] : []),
  ];

  return (
    <div style={{ fontFamily:"inherit",color:SS.text,position:"relative" }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pageIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rowIn   { from { opacity:0; } to { opacity:1; } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${isLight?"none":"invert(1)"}; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* ── Fil d'ariane ─────────────────────────────── */}
      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:20,fontSize:12,color:SS.textDim,flexWrap:"wrap" }}>
        {breadcrumbs.map((bc,i)=>(
          <span key={i} style={{ display:"flex",alignItems:"center",gap:6 }}>
            {i>0 && <ChevronRight size={11} color={SS.textDim}/>}
            <span
              onClick={bc.action||undefined}
              style={{ cursor:bc.action?"pointer":"default", color:i===breadcrumbs.length-1?SS.accent:SS.textSec, fontWeight:i===breadcrumbs.length-1?700:500, transition:"color 0.15s" }}
              onMouseEnter={e=>{ if(bc.action) e.currentTarget.style.color=SS.accent; }}
              onMouseLeave={e=>{ if(bc.action) e.currentTarget.style.color=i===breadcrumbs.length-1?SS.accent:SS.textSec; }}
            >{bc.label}</span>
          </span>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          VUE LISTE
      ════════════════════════════════════════════════ */}
      {view === "list" && (
        <div style={{ animation:"pageIn 0.2s ease" }}>

          {/* Header */}
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:24 }}>
            <div>
              <h1 style={{ fontSize:28,fontWeight:900,color:SS.text,margin:"0 0 6px",letterSpacing:"-0.02em" }}>Courriers Arrivés</h1>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:SS.accent,boxShadow:`0 0 8px ${SS.accent}` }}/>
                <span style={{ fontSize:13,color:SS.textSec }}><span style={{ color:SS.accent,fontWeight:700 }}>{total}</span> courrier{total>1?"s":""} enregistré{total>1?"s":""}</span>
              </div>
            </div>
            <button onClick={()=>openForm(null)} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:10,border:"none",background:SS.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:`0 6px 24px ${SS.accentGlow}` }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 10px 32px ${SS.accent}35`; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 6px 24px ${SS.accentGlow}`; }}
            >
              <Plus size={15} strokeWidth={2.5}/> Nouveau courrier
            </button>
          </div>

          {/* Barre recherche */}
          <div style={{ display:"flex",gap:10,marginBottom:22,maxWidth:520 }}>
            <div style={{ flex:1,position:"relative" }}>
              <Search size={14} color={SS.textDim} style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
              {loading && search && <Loader2 size={13} color={SS.accent} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",animation:"spin 0.7s linear infinite" }}/>}
              <input type="text" placeholder="Recherche automatique…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{ width:"100%",padding:"11px 13px 11px 38px",background:SS.card,border:`1px solid ${SS.border}`,borderRadius:10,outline:"none",color:SS.text,fontSize:13.5,fontFamily:"inherit",transition:"all 0.15s",boxSizing:"border-box",paddingRight:search?"38px":"13px" }}
                onFocus={e=>{ e.target.style.borderColor=SS.accentBorder; e.target.style.boxShadow=`0 0 0 3px ${SS.accentGlow}`; }}
                onBlur={e=>{ e.target.style.borderColor=SS.border; e.target.style.boxShadow="none"; }}
              />
            </div>
            {search && (
              <button onClick={()=>setSearch("")} style={{ padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,transition:"all 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=SS.border}
              >
                <X size={13}/> Effacer
              </button>
            )}
          </div>

          {/* Table */}
          {loading && !search ? (
            <div style={{ textAlign:"center",padding:"80px 0" }}>
              <Loader2 size={32} color={SS.accent} style={{ animation:"spin 0.8s linear infinite",marginBottom:16 }}/>
              <div style={{ fontSize:13,color:SS.textDim }}>Chargement…</div>
            </div>
          ) : courriers.length===0 ? (
            <div style={{ textAlign:"center",padding:"80px 0",background:SS.card,borderRadius:16,border:`1px solid ${SS.border}` }}>
              <Inbox size={40} color={SS.textDim} style={{ marginBottom:16 }}/>
              <div style={{ fontSize:15,fontWeight:700,color:SS.textSec,marginBottom:8 }}>
                {search?`Aucun résultat pour "${search}"`:"Aucun courrier enregistré"}
              </div>
              {!search && <div style={{ fontSize:12,color:SS.textDim }}>Cliquez sur "Nouveau courrier" pour commencer</div>}
            </div>
          ) : (
            <>
              <div style={{ border:`1px solid ${SS.border}`,borderRadius:14,overflow:"hidden",opacity:loading?0.5:1,transition:"opacity 0.2s" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ background:SS.surface,borderBottom:`1px solid ${SS.border}` }}>
                      {["N° d'ordre","Date arrivée","Origine","Référence","Objet","Scan","Actions"].map(h=>(
                        <th key={h} style={{ padding:"12px 16px",textAlign:"left",fontSize:9.5,fontWeight:800,color:SS.accent,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courriers.map((c,i)=>(
                      <tr key={c.id} onClick={()=>openDetail(c)}
                        style={{ background:i%2===0?SS.card:SS.surface,borderBottom:`1px solid ${SS.border}`,cursor:"pointer",transition:"background 0.12s",animation:`rowIn 0.3s ease ${i*0.03}s both` }}
                        onMouseEnter={e=>e.currentTarget.style.background=SS.hover}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?SS.card:SS.surface}
                      >
                        <td style={{ padding:"13px 16px",fontWeight:800,color:SS.accent,whiteSpace:"nowrap",fontSize:13 }}>{c.numero_ordre}</td>
                        <td style={{ padding:"13px 16px",color:SS.textSec,whiteSpace:"nowrap",fontSize:12 }}>{fmt(c.date_arrivee)}</td>
                        <td style={{ padding:"13px 16px",fontWeight:600,color:SS.text }}>{c.origine}</td>
                        <td style={{ padding:"13px 16px",color:SS.textSec,fontSize:12 }}>{c.reference}</td>
                        <td style={{ padding:"13px 16px",color:SS.textSec,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:12 }}>{c.objet}</td>
                        <td style={{ padding:"13px 16px" }}>
                          {(c.scan_url||c.scan)
                            ?<span style={{ display:"inline-flex",alignItems:"center",gap:4,background:SS.accentBg,color:SS.accent,fontSize:10,fontWeight:800,borderRadius:6,padding:"3px 10px",border:`1px solid ${SS.accentBorder}` }}><Paperclip size={10}/> Oui</span>
                            :<span style={{ color:SS.textDim,fontSize:12 }}>—</span>}
                        </td>
                        <td style={{ padding:"13px 12px" }} onClick={e=>e.stopPropagation()}>
                          <div style={{ display:"flex",gap:5 }}>
                            <button onClick={()=>openDetail(c)} title="Consulter" style={{ width:30,height:30,borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:SS.textSec,transition:"all 0.15s" }}
                              onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.color=SS.accent; e.currentTarget.style.background=SS.accentBg; }}
                              onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; e.currentTarget.style.background="transparent"; }}
                            ><Eye size={13}/></button>
                            <button onClick={()=>openForm(c)} title="Modifier" style={{ width:30,height:30,borderRadius:7,border:`1px solid ${SS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:SS.textSec,transition:"all 0.15s" }}
                              onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(37,99,235,0.35)"; e.currentTarget.style.color="#2563EB"; e.currentTarget.style.background="rgba(37,99,235,0.08)"; }}
                              onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; e.currentTarget.style.background="transparent"; }}
                            ><Pencil size={12}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages>1 && (
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:20 }}>
                  <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1px solid ${page===1?SS.border:SS.borderBri||SS.border}`,background:"transparent",color:page===1?SS.textDim:SS.textSec,cursor:page===1?"not-allowed":"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s" }}>
                    <ChevronLeft size={14}/> Précédent
                  </button>
                  <span style={{ fontSize:12,color:SS.textDim }}>
                    Page <span style={{ color:SS.accent,fontWeight:800 }}>{page}</span> / {totalPages}
                  </span>
                  <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1px solid ${page===totalPages?SS.border:SS.borderBri||SS.border}`,background:"transparent",color:page===totalPages?SS.textDim:SS.textSec,cursor:page===totalPages?"not-allowed":"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s" }}>
                    Suivant <ChevronRight size={14}/>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          VUE DÉTAIL — pleine page
      ════════════════════════════════════════════════ */}
      {view === "detail" && selected && (
        <DetailCourrier
          courrier={selected}
          onClose={()=>{ setView("list"); setSelected(null); }}
          onEdit={(c)=>openForm(c)}
          onDeleted={handleDeleted}
          onToast={showToast}
          SS={SS}
        />
      )}

      {/* ════════════════════════════════════════════════
          VUE FORMULAIRE — pleine page
      ════════════════════════════════════════════════ */}
      {view === "form" && (
        <div style={{ animation:"pageIn 0.2s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:28 }}>
            <button onClick={()=>setView(selected?"detail":"list")} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:`1px solid ${SS.border}`,background:"transparent",color:SS.textSec,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=SS.accentBorder; e.currentTarget.style.color=SS.accent; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=SS.border; e.currentTarget.style.color=SS.textSec; }}
            >
              <ArrowLeft size={15}/> {selected?"Retour à la fiche":"Retour à la liste"}
            </button>
            <div>
              <div style={{ fontSize:10,color:SS.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3 }}>
                {formMode==="create"?"Nouveau courrier":"Modifier le courrier"}
              </div>
              <h2 style={{ fontSize:20,fontWeight:800,color:SS.text,margin:0 }}>
                {formMode==="create"?"Fiche de circulation":"Modifier — "+selected?.numero_ordre}
              </h2>
            </div>
          </div>

          {/* Formulaire centré avec largeur max */}
          <div style={{ maxWidth:720,background:SS.card,border:`1px solid ${SS.border}`,borderRadius:16,padding:32,boxShadow:isLight?"0 4px 24px rgba(0,0,0,0.06)":"0 4px 24px rgba(0,0,0,0.3)" }}>
            <FormCourrier
              courrier={formMode==="edit"?selected:null}
              onSave={handleSaved}
              onCancel={()=>setView(selected&&formMode==="edit"?"detail":"list")}
              SS={SS}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourriersArrives;