// CourriersArrives.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail, Plus, Search, Eye, Pencil, Trash2,
  Printer, Download, X, Upload, ChevronRight,
  FileText, Check, AlertCircle, Loader2, ChevronLeft,
  Calendar, Building2, Hash, AlignLeft, Paperclip,
  ZoomIn, ZoomOut, ExternalLink, Image as ImageIcon,
} from "lucide-react";
import CONFIG from "../../config/config.js";

const C = {
  rouge:"#CE1126", jaune:"#FCD116", vert:"#009A44", vertLight:"#00C457",
  vertPale:"#E8FFF3", vertGlow:"#009A4420", dark:"#0F2137",
  textSec:"#4A6780", textDim:"#8FA8C0", border:"#DDE4ED",
  surface:"#F5F7FA", white:"#FFFFFF", danger:"#CE1126", dangerPale:"#FFF0F2",
};

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

// ── Détecte si l'URL est une image ou un PDF ─────────────
const isPdfUrl   = (url) => url && (/\.pdf(\?|$)/i.test(url) || url.includes("/raw/upload/"));
const isImageUrl = (url) => url && (
  /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) ||
  url.includes("/image/upload/")
);

// ════════════════════════════════════════════════════════
//  VISIONNEUSE IMAGE (modale plein écran)
// ════════════════════════════════════════════════════════
const ImageViewer = ({ url, nom, onClose }) => {
  const [zoom, setZoom]   = useState(1);
  const [err,  setErr]    = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const download = async () => {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(blob);
      a.download = nom || "scan";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { window.open(url, "_blank"); }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
      {/* Barre outils */}
      <div onClick={e=>e.stopPropagation()} style={{ position:"fixed",top:16,right:16,display:"flex",gap:8,zIndex:10000 }}>
        <TBtn onClick={()=>setZoom(z=>Math.min(z+0.25,4))}><ZoomIn size={14}/> +</TBtn>
        <TBtn onClick={()=>setZoom(z=>Math.max(z-0.25,0.25))}><ZoomOut size={14}/> −</TBtn>
        <TBtn bg={C.vert} onClick={download}><Download size={14}/> Télécharger</TBtn>
        <TBtn onClick={()=>window.open(url,"_blank")}><ExternalLink size={14}/> Ouvrir</TBtn>
        <TBtn bg={C.rouge} onClick={onClose}><X size={14}/></TBtn>
      </div>
      {/* Image */}
      <div onClick={e=>e.stopPropagation()} style={{ overflow:"auto",maxWidth:"92vw",maxHeight:"85vh",marginTop:64 }}>
        {err ? (
          <div style={{ color:"#fff",textAlign:"center",padding:40 }}>
            <AlertCircle size={40} style={{ marginBottom:12 }}/>
            <div style={{ marginBottom:16 }}>Impossible d'afficher l'image.</div>
            <TBtn bg={C.vert} onClick={()=>window.open(url,"_blank")}><ExternalLink size={14}/> Ouvrir dans un onglet</TBtn>
          </div>
        ) : (
          <img src={url} alt="scan" onError={()=>setErr(true)}
            style={{ transform:`scale(${zoom})`,transformOrigin:"top left",borderRadius:8,display:"block",transition:"transform 0.2s",maxWidth:"90vw" }}
          />
        )}
      </div>
      <div style={{ color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:12 }}>Clic extérieur ou Échap pour fermer</div>
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

  const download = () => {
    const a    = document.createElement("a");
    a.href     = url;
    a.download = nom || "document.pdf";
    a.target   = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:920,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
        <span style={{ color:"#fff",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
          <FileText size={15}/> {nom||"Document PDF"}
        </span>
        <div style={{ display:"flex",gap:8 }}>
          <TBtn bg={C.vert} onClick={download}><Download size={14}/> Télécharger</TBtn>
          <TBtn onClick={()=>window.open(url,"_blank")}><ExternalLink size={14}/> Onglet</TBtn>
          <TBtn bg={C.rouge} onClick={onClose}><X size={14}/></TBtn>
        </div>
      </div>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:920,flex:1 }}>
        <iframe src={`${url}#toolbar=1`} style={{ width:"100%",height:"80vh",border:"none",borderRadius:10 }} title="PDF"/>
      </div>
    </div>
  );
};

const TBtn = ({ children, bg="rgba(255,255,255,0.15)", onClick }) => (
  <button onClick={onClick} style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:8,border:"none",background:bg,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600 }}>
    {children}
  </button>
);

// ════════════════════════════════════════════════════════
//  SCAN BLOCK — logique robuste
// ════════════════════════════════════════════════════════
const ScanBlock = ({ scanUrl }) => {
  const [viewer,  setViewer]  = useState(null); // "image" | "pdf" | null
  const [imgFail, setImgFail] = useState(false);
  const [imgMode, setImgMode] = useState(true);  // tente image en premier

  useEffect(() => {
    // Debug : voir exactement l'URL reçue
    console.log("[ScanBlock] scanUrl =", scanUrl);
  }, [scanUrl]);

  if (!scanUrl) {
    return (
      <div style={{ background:C.surface,border:`1px dashed ${C.border}`,borderRadius:10,padding:24,textAlign:"center",color:C.textDim,fontSize:13 }}>
        <Paperclip size={22} color={C.textDim} style={{ display:"block",margin:"0 auto 8px" }}/>
        Aucune pièce jointe
      </div>
    );
  }

  const nom = (() => {
    try { return decodeURIComponent(scanUrl.split("/").pop().split("?")[0]) || "fichier"; }
    catch { return "fichier"; }
  })();

  // Détecter si c'est un PDF
  const looksLikePdf = isPdfUrl(scanUrl);
  // Détecter si c'est une image
  const looksLikeImg = isImageUrl(scanUrl) || (!looksLikePdf && scanUrl.includes("cloudinary.com"));

  // Téléchargement
  const downloadFile = async () => {
    try {
      const res  = await fetch(scanUrl, { mode:"cors" });
      const blob = await res.blob();
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(blob);
      a.download = nom;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch { window.open(scanUrl, "_blank"); }
  };

  // ── Rendu PDF ─────────────────────────────────────────
  if (looksLikePdf) {
    return (
      <>
        {viewer==="pdf" && <PDFViewer url={scanUrl} nom={nom} onClose={()=>setViewer(null)}/>}
        <div style={{ border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
          <div style={{ padding:"18px 20px",background:C.white }}>
            <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
              <div style={{ width:52,height:52,borderRadius:10,background:"#FFF0F2",border:`1px solid ${C.rouge}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <FileText size={26} color={C.rouge}/>
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:700,color:C.dark,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{nom}</div>
                <div style={{ fontSize:11,color:C.textDim }}>Document PDF</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              <Btn small color={C.vert} onClick={()=>setViewer("pdf")}><Eye size={13}/> Visualiser</Btn>
              <Btn small outline color="#2563EB" onClick={downloadFile}><Download size={13}/> Télécharger</Btn>
              <Btn small outline color={C.textSec} onClick={()=>window.open(scanUrl,"_blank")}><ExternalLink size={13}/> Ouvrir</Btn>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Rendu IMAGE (ou URL inconnue → on essaie l'image) ──
  return (
    <>
      {viewer==="image" && <ImageViewer url={scanUrl} nom={nom} onClose={()=>setViewer(null)}/>}
      {viewer==="pdf"   && <PDFViewer   url={scanUrl} nom={nom} onClose={()=>setViewer(null)}/>}

      <div style={{ border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>

        {/* Tentative d'affichage image */}
        {!imgFail ? (
          <div>
            <div onClick={()=>setViewer("image")} style={{ cursor:"zoom-in",background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",minHeight:180,position:"relative",overflow:"hidden" }}>
              <img
                src={scanUrl} alt="scan"
                onLoad={()=>setImgMode(true)}
                onError={()=>setImgFail(true)}
                style={{ maxWidth:"100%",maxHeight:280,objectFit:"contain",display:"block" }}
              />
              <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0)",transition:"background 0.2s",display:"flex",alignItems:"center",justifyContent:"center" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(0,0,0,0.18)"; e.currentTarget.querySelector("span").style.opacity="1"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(0,0,0,0)"; e.currentTarget.querySelector("span").style.opacity="0"; }}
              >
                <span style={{ background:"rgba(0,0,0,0.6)",borderRadius:8,padding:"8px 14px",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,opacity:0,transition:"opacity 0.2s",pointerEvents:"none" }}>
                  <ZoomIn size={13}/> Cliquer pour agrandir
                </span>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,padding:"10px 14px",background:C.white,borderTop:`1px solid ${C.border}` }}>
              <Btn small color={C.vert} onClick={()=>setViewer("image")}><Eye size={13}/> Visualiser</Btn>
              <Btn small outline color="#2563EB" onClick={downloadFile}><Download size={13}/> Télécharger</Btn>
              <Btn small outline color={C.textSec} onClick={()=>window.open(scanUrl,"_blank")}><ExternalLink size={13}/> Ouvrir</Btn>
            </div>
          </div>
        ) : (
          /* Image a échoué → fallback fichier */
          <div style={{ padding:"18px 20px",background:C.white }}>
            <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
              <div style={{ width:52,height:52,borderRadius:10,background:C.vertPale,border:`1px solid ${C.vert}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <Paperclip size={24} color={C.vert}/>
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:700,color:C.dark,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{nom}</div>
                <div style={{ fontSize:11,color:C.textDim,wordBreak:"break-all",marginTop:2 }}>{scanUrl}</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              <Btn small color={C.vert} onClick={()=>setViewer("pdf")}><Eye size={13}/> Visualiser</Btn>
              <Btn small outline color="#2563EB" onClick={downloadFile}><Download size={13}/> Télécharger</Btn>
              <Btn small outline color={C.textSec} onClick={()=>window.open(scanUrl,"_blank")}><ExternalLink size={13}/> Ouvrir</Btn>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════
//  COMPOSANTS UI COMMUNS
// ════════════════════════════════════════════════════════
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = type === "success" ? C.vert : C.rouge;
  return (
    <div style={{ position:"fixed",bottom:24,right:24,zIndex:8000,background:bg,color:"#fff",borderRadius:12,padding:"13px 18px",fontSize:13.5,fontWeight:600,display:"flex",alignItems:"center",gap:9,boxShadow:`0 8px 24px ${bg}40`,animation:"slideIn 0.3s ease" }}>
      {type==="success"?<Check size={16}/>:<AlertCircle size={16}/>} {msg}
    </div>
  );
};

const FieldLabel = ({ children, icon: Icon }) => (
  <label style={{ fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.09em",display:"flex",alignItems:"center",gap:5,marginBottom:6 }}>
    {Icon && <Icon size={12} color={C.vert}/>} {children}
  </label>
);

const Input = ({ style, ...props }) => (
  <input {...props} style={{ width:"100%",padding:"10px 13px",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:10,outline:"none",color:C.dark,fontSize:13.5,fontFamily:"'Segoe UI',sans-serif",transition:"border-color 0.15s,box-shadow 0.15s",boxSizing:"border-box",...style }}
    onFocus={e=>{e.target.style.borderColor=C.vert;e.target.style.boxShadow=`0 0 0 3px ${C.vertGlow}`;}}
    onBlur={e=>{e.target.style.borderColor=C.border;e.target.style.boxShadow="none";}}
  />
);

const Textarea = ({ style, ...props }) => (
  <textarea {...props} style={{ width:"100%",padding:"10px 13px",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:10,outline:"none",color:C.dark,fontSize:13.5,resize:"vertical",minHeight:80,fontFamily:"'Segoe UI',sans-serif",transition:"border-color 0.15s",boxSizing:"border-box",...style }}
    onFocus={e=>{e.target.style.borderColor=C.vert;e.target.style.boxShadow=`0 0 0 3px ${C.vertGlow}`;}}
    onBlur={e=>{e.target.style.borderColor=C.border;e.target.style.boxShadow="none";}}
  />
);

const Btn = ({ children, color=C.vert, outline=false, small=false, disabled=false, style={}, ...props }) => (
  <button {...props} disabled={disabled} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:small?"7px 14px":"10px 18px",borderRadius:10,border:`1.5px solid ${outline?color:"transparent"}`,background:outline?"transparent":color,color:outline?color:"#fff",fontSize:small?12:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.55:1,transition:"all 0.15s",fontFamily:"'Segoe UI',sans-serif",...style }}
    onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity="0.85";}}
    onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}
  >{children}</button>
);

// ════════════════════════════════════════════════════════
//  FORMULAIRE COURRIER
// ════════════════════════════════════════════════════════
const EMPTY = { date_arrivee:today(), origine:"", reference:"", date_envoi:"", objet:"", scan:null };

const FormCourrier = ({ courrier, onSave, onCancel }) => {
  const [form,    setForm]    = useState(courrier ? { date_arrivee:courrier.date_arrivee||today(), origine:courrier.origine||"", reference:courrier.reference||"", date_envoi:courrier.date_envoi||"", objet:courrier.objet||"", scan:null } : EMPTY);
  const [preview, setPreview] = useState(courrier?.scan_url || courrier?.scan || null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const fileRef = useRef();

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
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
      console.log("[FormCourrier] Réponse après save:", data);
      onSave(data);
    } catch(err) { console.error(err); setError("Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:18 }}>
      {error && <div style={{ background:C.dangerPale,border:`1px solid ${C.rouge}40`,borderRadius:10,padding:"11px 14px",color:C.rouge,fontSize:13,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={15}/> {error}</div>}

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div><FieldLabel icon={Calendar}>Date d'arrivée</FieldLabel><Input type="date" value={form.date_arrivee} onChange={e=>set("date_arrivee",e.target.value)} required/></div>
        <div><FieldLabel icon={Building2}>Origine</FieldLabel><Input type="text" placeholder="Ex: BCRG" value={form.origine} onChange={e=>set("origine",e.target.value)} required/></div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div><FieldLabel icon={Hash}>Référence</FieldLabel><Input type="text" placeholder="Référence du courrier" value={form.reference} onChange={e=>set("reference",e.target.value)} required/></div>
        <div><FieldLabel icon={Calendar}>Date d'envoi (Du)</FieldLabel><Input type="date" value={form.date_envoi} onChange={e=>set("date_envoi",e.target.value)}/></div>
      </div>
      <div><FieldLabel icon={AlignLeft}>Objet</FieldLabel><Textarea placeholder="Objet du courrier..." value={form.objet} onChange={e=>set("objet",e.target.value)} required/></div>

      <div>
        <FieldLabel icon={Paperclip}>Scan / Pièce jointe</FieldLabel>
        <div onClick={()=>fileRef.current.click()} style={{ border:`2px dashed ${preview?C.vert:C.border}`,borderRadius:12,padding:20,textAlign:"center",cursor:"pointer",background:preview?C.vertPale:C.surface,transition:"all 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.vert}
          onMouseLeave={e=>e.currentTarget.style.borderColor=preview?C.vert:C.border}
        >
          {preview && typeof preview==="string" && preview.startsWith("blob:") && (
            <div style={{ position:"relative",display:"inline-block" }}>
              <img src={preview} alt="scan" style={{ maxHeight:140,borderRadius:8,objectFit:"contain" }}/>
              <button type="button" onClick={e=>{e.stopPropagation();setPreview(null);set("scan",null);}} style={{ position:"absolute",top:-8,right:-8,width:22,height:22,borderRadius:"50%",background:C.rouge,border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><X size={12}/></button>
            </div>
          )}
          {preview && typeof preview==="string" && preview.startsWith("http") && (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:C.vert }}>
              <Check size={20}/><span style={{ fontSize:13,fontWeight:700 }}>Fichier actuel conservé</span>
              <button type="button" onClick={e=>{e.stopPropagation();setPreview(null);set("scan",null);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.rouge }}><X size={15}/></button>
            </div>
          )}
          {preview && typeof preview==="string" && preview.startsWith("pdf:") && (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:C.vert }}>
              <FileText size={24}/><span style={{ fontWeight:600,fontSize:14 }}>{preview.replace("pdf:","")}</span>
              <button type="button" onClick={e=>{e.stopPropagation();setPreview(null);set("scan",null);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.rouge }}><X size={15}/></button>
            </div>
          )}
          {!preview && (
            <><Upload size={28} color={C.textDim} style={{ marginBottom:8 }}/><div style={{ fontSize:13,color:C.textSec,fontWeight:600 }}>Cliquez pour uploader</div><div style={{ fontSize:11,color:C.textDim,marginTop:4 }}>Image (JPG, PNG) ou PDF</div></>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display:"none" }}/>
      </div>

      <div style={{ display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4 }}>
        <Btn type="button" outline color={C.textSec} onClick={onCancel}>Annuler</Btn>
        <Btn type="submit" disabled={saving}>
          {saving?<><Loader2 size={14} style={{ animation:"spin 0.7s linear infinite" }}/> Enregistrement…</>:<><Check size={14}/> {courrier?"Mettre à jour":"Enregistrer"}</>}
        </Btn>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════
//  VUE DÉTAIL
// ════════════════════════════════════════════════════════
const DetailCourrier = ({ courrier, onClose, onEdit, onDeleted, onToast }) => {
  const [lignes,  setLignes]  = useState(courrier.lignes_circulation || []);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);

  // Récupère l'URL du scan depuis n'importe quel champ possible
  const scanUrl = courrier.scan_url || courrier.scan || null;

  useEffect(() => {
    console.log("[DetailCourrier] courrier complet:", courrier);
    console.log("[DetailCourrier] scanUrl résolu:", scanUrl);
  }, [courrier]);

  const handleSignSave = async (ligne) => {
    setSaving(true);
    try {
      const res = await fetch(CONFIG.API_COURRIER_ARRIVE_CIRC(courrier.id, ligne.id), {
        method:"PATCH", headers:{...authHdr(),"Content-Type":"application/json"}, body:JSON.stringify(form),
      });
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
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>

      {/* Entête */}
      <div style={{ background:C.vertPale,border:`1px solid ${C.vert}30`,borderRadius:12,padding:"18px 20px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12 }}>
          <div>
            <div style={{ fontSize:11,color:C.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4 }}>Numéro d'ordre</div>
            <div style={{ fontSize:20,fontWeight:900,color:C.vert }}>{courrier.numero_ordre}</div>
          </div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            <Btn small outline color={C.vert} onClick={handlePrint}><Printer size={13}/> Imprimer</Btn>
            <Btn small outline color="#2563EB" onClick={()=>onEdit(courrier)}><Pencil size={13}/> Modifier</Btn>
            <Btn small outline color={C.rouge} onClick={handleDelete}><Trash2 size={13}/> Supprimer</Btn>
          </div>
        </div>
      </div>

      {/* Infos */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12 }}>
        {[
          { label:"Date d'arrivée", value:fmt(courrier.date_arrivee) },
          { label:"Origine",        value:courrier.origine           },
          { label:"Référence",      value:courrier.reference         },
          { label:"Date d'envoi",   value:fmt(courrier.date_envoi)   },
        ].map(({label,value})=>(
          <div key={label} style={{ background:C.surface,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10,color:C.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:13.5,fontWeight:700,color:C.dark }}>{value||"—"}</div>
          </div>
        ))}
      </div>

      {/* Objet */}
      <div style={{ background:C.surface,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10,color:C.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6 }}>Objet</div>
        <div style={{ fontSize:14,color:C.dark,lineHeight:1.6 }}>{courrier.objet}</div>
      </div>

      {/* ── Pièce jointe ────────────────────────────── */}
      <div>
        <div style={{ fontSize:11,color:C.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10,display:"flex",alignItems:"center",gap:6 }}>
          Pièce jointe
          {scanUrl && <span style={{ background:C.vertPale,color:C.vert,fontSize:10,fontWeight:800,borderRadius:20,padding:"2px 8px",border:`1px solid ${C.vert}30` }}>✓ Disponible</span>}
        </div>
        <ScanBlock scanUrl={scanUrl}/>
      </div>

      {/* Tableau de circulation */}
      <div>
        <div style={{ fontSize:13,fontWeight:800,color:C.dark,marginBottom:12,display:"flex",alignItems:"center",gap:7 }}>
          <div style={{ width:4,height:16,borderRadius:2,background:C.vert }}/> Tableau de Circulation
        </div>
        <div style={{ border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead>
              <tr style={{ background:C.vertPale }}>
                {["Fonction","Date","Annotation","Observation","Action"].map(h=>(
                  <th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:10,fontWeight:800,color:C.vert,textTransform:"uppercase",letterSpacing:"0.09em",borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FONCTIONS.map((f,i)=>{
                const ligne = lignes.find(l=>l.fonction===f.code)||{};
                const isEd  = editing===ligne.id;
                return (
                  <tr key={f.code} style={{ background:i%2===0?C.white:C.surface,borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"12px 14px",fontWeight:700,color:C.dark,whiteSpace:"nowrap" }}>{f.label}</td>
                    <td style={{ padding:"12px 14px",color:C.textSec }}>
                      {isEd?<Input type="date" value={form.date_signature||""} onChange={e=>setForm(p=>({...p,date_signature:e.target.value}))} style={{ minWidth:130 }}/>:(ligne.date_signature?fmt(ligne.date_signature):<span style={{ color:C.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding:"12px 14px",color:C.textSec,maxWidth:160 }}>
                      {isEd?<Input type="text" placeholder="Annotation" value={form.annotation||""} onChange={e=>setForm(p=>({...p,annotation:e.target.value}))}/>:(ligne.annotation||<span style={{ color:C.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding:"12px 14px",color:C.textSec,maxWidth:160 }}>
                      {isEd?<Input type="text" placeholder="Observation" value={form.observation||""} onChange={e=>setForm(p=>({...p,observation:e.target.value}))}/>:(ligne.observation||<span style={{ color:C.textDim }}>—</span>)}
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      {isEd?(
                        <div style={{ display:"flex",gap:6 }}>
                          <Btn small onClick={()=>handleSignSave(ligne)} disabled={saving}><Check size={12}/></Btn>
                          <Btn small outline color={C.textSec} onClick={()=>setEditing(null)}><X size={12}/></Btn>
                        </div>
                      ):(
                        <Btn small outline color={C.vert} onClick={()=>{setEditing(ligne.id);setForm({date_signature:ligne.date_signature||"",annotation:ligne.annotation||"",observation:ligne.observation||""});}}>
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
//  HTML IMPRESSION
// ════════════════════════════════════════════════════════
const buildPrintHTML = (c, lignes) => `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Fiche ${c.numero_ordre}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111;padding:20px 28px}.bandeau{display:flex;height:4px;margin-bottom:10px}.b1{flex:1;background:#CE1126}.b2{flex:1;background:#FCD116}.b3{flex:1;background:#009A44}.entete{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #009A44;padding-bottom:14px;margin-bottom:18px}.titre{font-size:15px;font-weight:900;text-transform:uppercase;color:#0F2137}.sous-titre{font-size:11px;color:#4A6780}.numero{font-size:18px;font-weight:900;color:#009A44}.grille{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}.champ{background:#F5F7FA;border:1px solid #DDE4ED;border-radius:6px;padding:10px 12px}.cl{font-size:9px;font-weight:800;text-transform:uppercase;color:#8FA8C0;margin-bottom:3px}.cv{font-size:13px;font-weight:700}.objet{background:#F5F7FA;border:1px solid #DDE4ED;border-radius:6px;padding:12px;margin-bottom:18px}table{width:100%;border-collapse:collapse}th{background:#E8FFF3;padding:9px 12px;font-size:9.5px;font-weight:800;text-transform:uppercase;color:#009A44;border:1px solid #DDE4ED}td{padding:10px 12px;border:1px solid #DDE4ED}.sz{height:40px}.footer{margin-top:28px;font-size:10px;color:#8FA8C0;text-align:center;border-top:1px solid #DDE4ED;padding-top:10px}@media print{@page{margin:15mm}}</style>
</head><body>
<div class="bandeau"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div>
<div class="entete"><div><div class="titre">MPCID — Institut National de la Statistique</div><div class="sous-titre">République de Guinée · Fiche de Circulation du Courrier Arrivé</div></div><div style="text-align:right"><div class="numero">${c.numero_ordre}</div><div class="sous-titre">Enregistré le ${fmt(c.date_arrivee)}</div></div></div>
<div class="grille">
  <div class="champ"><div class="cl">Date d'arrivée</div><div class="cv">${fmt(c.date_arrivee)}</div></div>
  <div class="champ"><div class="cl">Origine</div><div class="cv">${c.origine}</div></div>
  <div class="champ"><div class="cl">Référence</div><div class="cv">${c.reference}</div></div>
  <div class="champ"><div class="cl">Date d'envoi</div><div class="cv">${fmt(c.date_envoi)}</div></div>
</div>
<div class="objet"><div class="cl">Objet</div><div style="margin-top:4px">${c.objet}</div></div>
${(c.scan_url||c.scan)?`<div style="margin-bottom:18px"><div class="cl" style="margin-bottom:6px">Pièce jointe</div><div style="font-size:11px;color:#4A6780">${c.scan_url||c.scan}</div></div>`:""}
<div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#009A44;margin-bottom:8px">Tableau de Circulation</div>
<table><thead><tr><th>Fonction</th><th>Date</th><th>Annotation</th><th>Observation</th><th>Signature</th></tr></thead><tbody>
${FONCTIONS.map(f=>{const l=lignes.find(x=>x.fonction===f.code)||{};return`<tr><td><strong>${f.label}</strong></td><td>${l.date_signature?fmt(l.date_signature):""}</td><td>${l.annotation||""}</td><td>${l.observation||""}</td><td class="sz"></td></tr>`;}).join("")}
</tbody></table>
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

  const [panel,    setPanel]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState(null);

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

  const handleSaved = (data) => {
    if (panel==="form-create") { setCourriers(prev=>[data,...prev]); showToast(`Courrier ${data.numero_ordre} créé.`); }
    else { setCourriers(prev=>prev.map(c=>c.id===data.id?data:c)); setSelected(data); showToast("Courrier mis à jour."); }
    setPanel("detail");
  };

  const handleDeleted = (id) => setCourriers(prev=>prev.filter(c=>c.id!==id));

  const openDetail = async (courrier) => {
    try {
      const res  = await fetch(CONFIG.API_COURRIER_ARRIVE_DETAIL(courrier.id), { headers:authHdr() });
      const data = await res.json();
      console.log("[openDetail] réponse API:", JSON.stringify({ id:data.id, scan:data.scan, scan_url:data.scan_url }));
      setSelected(data); setPanel("detail");
    } catch { showToast("Erreur de chargement du détail.","error"); }
  };

  const totalPages = Math.ceil(total/PAGE_SIZE);

  return (
    <div style={{ fontFamily:"'Segoe UI','Calibri',sans-serif",color:C.dark,position:"relative" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* En-tête */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.textDim,marginBottom:8 }}>
          <FileText size={12}/> Secrétariat DG <ChevronRight size={11}/>
          <span onClick={()=>navigate("/secretariat/courriers")} style={{ cursor:"pointer",color:C.textSec }}>Courriers</span>
          <ChevronRight size={11}/>
          <span style={{ color:C.vert,fontWeight:700 }}>Courriers Arrivés</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
          <div>
            <h1 style={{ fontSize:24,fontWeight:900,color:C.dark,margin:"0 0 4px",letterSpacing:"-0.02em" }}>Courriers Arrivés</h1>
            <p style={{ fontSize:13,color:C.textSec,margin:0 }}>{total} courrier{total>1?"s":""} enregistré{total>1?"s":""}</p>
          </div>
          <Btn onClick={()=>{setSelected(null);setPanel("form-create");}}><Plus size={15}/> Nouveau courrier</Btn>
        </div>
        <div style={{ display:"flex",gap:5,marginTop:12 }}>
          <div style={{ width:24,height:3,borderRadius:2,background:C.rouge }}/>
          <div style={{ width:24,height:3,borderRadius:2,background:C.jaune }}/>
          <div style={{ width:24,height:3,borderRadius:2,background:C.vert  }}/>
        </div>
      </div>

      {/* Recherche */}
      <div style={{ display:"flex",gap:10,marginBottom:20,maxWidth:480 }}>
        <div style={{ flex:1,position:"relative" }}>
          <Search size={15} color={C.textDim} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
          {loading && search && <Loader2 size={14} color={C.vert} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",animation:"spin 0.7s linear infinite" }}/>}
          <Input type="text" placeholder="Recherche automatique…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:36,paddingRight:search?36:13 }}/>
        </div>
        {search && <Btn outline color={C.textSec} small onClick={()=>setSearch("")}><X size={14}/></Btn>}
      </div>

      {/* Corps */}
      <div style={{ display:"flex",gap:20,alignItems:"flex-start" }}>
        <div style={{ flex:1,minWidth:0 }}>
          {loading && !search ? (
            <div style={{ textAlign:"center",padding:"60px 0" }}>
              <Loader2 size={28} color={C.vert} style={{ animation:"spin 0.8s linear infinite",marginBottom:12 }}/>
              <div style={{ fontSize:13,color:C.textDim }}>Chargement…</div>
            </div>
          ) : courriers.length===0 ? (
            <div style={{ textAlign:"center",padding:"60px 0",background:C.surface,borderRadius:14,border:`1px dashed ${C.border}` }}>
              <Mail size={36} color={C.textDim} style={{ marginBottom:12 }}/>
              <div style={{ fontSize:14,fontWeight:700,color:C.textSec,marginBottom:6 }}>{search?`Aucun résultat pour "${search}"`:"Aucun courrier trouvé"}</div>
              {!search && <div style={{ fontSize:12,color:C.textDim }}>Cliquez sur "Nouveau courrier" pour commencer</div>}
            </div>
          ) : (
            <>
              <div style={{ border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",opacity:loading?0.6:1,transition:"opacity 0.2s" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ background:C.vertPale }}>
                      {["N° d'ordre","Date arrivée","Origine","Référence","Objet","Scan","Actions"].map(h=>(
                        <th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:10,fontWeight:800,color:C.vert,textTransform:"uppercase",letterSpacing:"0.09em",borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courriers.map((c,i)=>(
                      <tr key={c.id} onClick={()=>openDetail(c)}
                        style={{ background:i%2===0?C.white:C.surface,borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background 0.12s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.vertPale}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.white:C.surface}
                      >
                        <td style={{ padding:"11px 14px",fontWeight:800,color:C.vert,whiteSpace:"nowrap" }}>{c.numero_ordre}</td>
                        <td style={{ padding:"11px 14px",color:C.textSec,whiteSpace:"nowrap" }}>{fmt(c.date_arrivee)}</td>
                        <td style={{ padding:"11px 14px",fontWeight:600 }}>{c.origine}</td>
                        <td style={{ padding:"11px 14px",color:C.textSec }}>{c.reference}</td>
                        <td style={{ padding:"11px 14px",color:C.textSec,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.objet}</td>
                        <td style={{ padding:"11px 14px" }}>
                          {(c.scan_url||c.scan)
                            ?<span style={{ display:"inline-flex",alignItems:"center",gap:4,color:C.vert,fontWeight:700,fontSize:11 }}><Paperclip size={12}/> Oui</span>
                            :<span style={{ color:C.textDim,fontSize:11 }}>—</span>}
                        </td>
                        <td style={{ padding:"11px 14px" }} onClick={e=>e.stopPropagation()}>
                          <div style={{ display:"flex",gap:5 }}>
                            <button onClick={()=>openDetail(c)} title="Consulter" style={{ background:C.vertPale,border:"none",borderRadius:7,padding:"5px 8px",cursor:"pointer",color:C.vert }}><Eye size={13}/></button>
                            <button onClick={()=>{setSelected(c);setPanel("form-edit");}} title="Modifier" style={{ background:"#EFF6FF",border:"none",borderRadius:7,padding:"5px 8px",cursor:"pointer",color:"#2563EB" }}><Pencil size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages>1 && (
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:16 }}>
                  <Btn small outline color={C.vert} disabled={page===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={13}/></Btn>
                  <span style={{ fontSize:13,color:C.textSec,fontWeight:600 }}>Page {page} / {totalPages}</span>
                  <Btn small outline color={C.vert} disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={13}/></Btn>
                </div>
              )}
            </>
          )}
        </div>

        {/* Panel latéral */}
        {panel && (
          <div style={{ width:520,flexShrink:0,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:24,position:"sticky",top:20,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,0.08)",animation:"slidePanel 0.25s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h3 style={{ fontSize:15,fontWeight:800,color:C.dark,margin:0 }}>
                {panel==="form-create"?"Nouveau courrier arrivé":panel==="form-edit"?"Modifier le courrier":`Fiche — ${selected?.numero_ordre}`}
              </h3>
              <button onClick={()=>setPanel(null)} style={{ background:C.surface,border:"none",borderRadius:8,padding:6,cursor:"pointer",display:"flex",alignItems:"center" }}><X size={16} color={C.textSec}/></button>
            </div>
            {(panel==="form-create"||panel==="form-edit") && (
              <FormCourrier courrier={panel==="form-edit"?selected:null} onSave={handleSaved} onCancel={()=>setPanel(panel==="form-edit"&&selected?"detail":null)}/>
            )}
            {panel==="detail" && selected && (
              <DetailCourrier courrier={selected} onClose={()=>setPanel(null)} onEdit={c=>{setSelected(c);setPanel("form-edit");}} onDeleted={handleDeleted} onToast={showToast}/>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slidePanel{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
    </div>
  );
};

export default CourriersArrives;